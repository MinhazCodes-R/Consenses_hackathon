from flask import Flask, request, jsonify
from flask_cors import CORS
from stellar_sdk import Keypair, Server, Asset, Network, TransactionBuilder
from stellar_sdk.exceptions import NotFoundError
import requests
import os
from dotenv import load_dotenv

# ───── Load environment variables ─────
load_dotenv()
FRONTENDIP = os.getenv("FRONTENDIP", "http://localhost:3000")

# ───── Flask setup ─────
app = Flask(__name__)
CORS(app,
     resources={r"/*": {"origins": [FRONTENDIP, "http://localhost:3000", "https://consenses-hackathon-zt67.vercel.app"]}},
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"])

# ───── Stellar SDK setup ─────
server = Server("https://horizon-testnet.stellar.org")

# ───── Utility functions ─────
def check_balance(public_key):
    try:
        account = server.accounts().account_id(public_key).call()
        balances = {bal['asset_type']: bal['balance'] for bal in account['balances']}
        return {"status": "success", "balances": balances}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def send_payment(source_secret, destination_public_key, amount, memo="Transaction via StellarSphere"):
    try:
        source_key = Keypair.from_secret(source_secret)

        # Validate destination
        try:
            server.load_account(destination_public_key)
        except NotFoundError:
            return {"status": "error", "message": "Destination account does not exist"}

        source_account = server.load_account(source_key.public_key)
        base_fee = server.fetch_base_fee()

        tx = (
            TransactionBuilder(
                source_account=source_account,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
                base_fee=base_fee
            )
            .append_payment_op(destination_public_key, Asset.native(), amount)
            .add_text_memo(memo)
            .set_timeout(30)
            .build()
        )

        tx.sign(source_key)
        resp = server.submit_transaction(tx)

        return {
            "status": "success",
            "hash": resp['hash'],
            "source_balance": check_balance(source_key.public_key).get('balances', {}),
            "destination_balance": check_balance(destination_public_key).get('balances', {})
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def create_account():
    try:
        pair = Keypair.random()
        resp = requests.get(f"https://friendbot.stellar.org?addr={pair.public_key}")
        resp.raise_for_status()
        balances = check_balance(pair.public_key)
        return {
            "status": "success",
            "public_key": pair.public_key,
            "secret_key": pair.secret,
            "balances": balances.get('balances', {})
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ───── Routes ─────
@app.route('/check', methods=['POST'])
def api_check():
    data = request.get_json() or {}
    public_key = data.get('public_key')
    if not public_key:
        return jsonify({"status": "error", "message": "public_key is required"}), 400
    return jsonify(check_balance(public_key))

@app.route('/send', methods=['POST'])
def api_send():
    data = request.get_json() or {}
    source = data.get('source_secret')
    destination = data.get('destination_public_key')
    amount = data.get('amount')
    memo = data.get('memo', "Transaction via StellarSphere")

    missing = [param for param in ('source_secret', 'destination_public_key', 'amount') if not data.get(param)]
    if missing:
        return jsonify({"status": "error", "message": f"Missing parameters: {', '.join(missing)}"}), 400

    return jsonify(send_payment(source, destination, amount, memo))

@app.route('/create', methods=['POST'])
def api_create():
    return jsonify(create_account())

# ───── Nginx passthrough mirror routes ─────
@app.route('/python/check', methods=['POST'])
def api_check_passthrough():
    return api_check()

@app.route('/python/send', methods=['POST'])
def api_send_passthrough():
    return api_send()

@app.route('/python/create', methods=['POST'])
def api_create_passthrough():
    return api_create()

# ───── Start Server ─────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)