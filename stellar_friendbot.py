from stellar_sdk import Keypair
import requests
from stellar_sdk import Server
from stellar_sdk import Asset, Keypair, Network, Server, TransactionBuilder
from stellar_sdk.exceptions import NotFoundError, BadResponseError, BadRequestError
import argparse
import json
import sys

def check_balance(public_key):
    server = Server("https://horizon-testnet.stellar.org")
    try:
        account = server.accounts().account_id(public_key).call()
        balances = {}
        for balance in account['balances']:
            balances[balance['asset_type']] = balance['balance']
        return {"status": "success", "balances": balances}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def send_payment(source_private_key, destination_public_key, amount, memo="Transaction via StellarSphere"):
    server = Server("https://horizon-testnet.stellar.org")
    try:
        source_key = Keypair.from_secret(source_private_key)
        
        # Verify destination account exists
        try:
            server.load_account(destination_public_key)
        except NotFoundError:
            return {"status": "error", "message": "The destination account does not exist!"}
        
        # Load source account
        source_account = server.load_account(source_key.public_key)
        base_fee = server.fetch_base_fee()
        
        # Build transaction
        transaction = (TransactionBuilder(
            source_account=source_account, 
            network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
            base_fee=base_fee)
            .append_payment_op(
                destination=destination_public_key, 
                asset=Asset.native(), 
                amount=amount)
            .add_text_memo(memo)
            .set_timeout(30)
            .build())
        
        # Sign and submit
        transaction.sign(source_key)
        response = server.submit_transaction(transaction)
        
        # Get updated balances
        source_updated = check_balance(source_key.public_key)
        dest_updated = check_balance(destination_public_key)
        
        return {
            "status": "success",
            "hash": response['hash'],
            "source_balance": source_updated["balances"],
            "destination_balance": dest_updated["balances"]
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

def create_account():
    try:
        pair = Keypair.random()
        print(f"Generated new keypair: {pair.public_key}", file=sys.stderr)
        
        # Fund the account using friendbot (testnet only)
        try:
            print(f"Requesting funds from Friendbot for: {pair.public_key}", file=sys.stderr)
            response = requests.get(f"https://friendbot.stellar.org?addr={pair.public_key}")
            print(f"Friendbot response status: {response.status_code}", file=sys.stderr)
            response.raise_for_status()  # Raises an exception for HTTP errors
            
            # Check the new account balance
            print("Getting account balance...", file=sys.stderr)
            balances = check_balance(pair.public_key)
            
            return {
                "status": "success",
                "public_key": pair.public_key,
                "secret_key": pair.secret,
                "balances": balances["balances"]
            }
        except requests.exceptions.RequestException as e:
            print(f"Friendbot request error: {str(e)}", file=sys.stderr)
            return {"status": "error", "message": f"Friendbot error: {str(e)}"}
    except Exception as e:
        print(f"Create account error: {str(e)}", file=sys.stderr)
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Stellar operations')
    parser.add_argument('--action', required=True, choices=['check', 'send', 'create'], help='Action to perform')
    parser.add_argument('--source', help='Source private key (for send)')
    parser.add_argument('--destination', help='Destination public key (for send/check)')
    parser.add_argument('--amount', help='Amount to send (for send)')
    parser.add_argument('--memo', help='Transaction memo (for send)')
    
    args = parser.parse_args()
    
    result = {}
    
    if args.action == 'check':
        if not args.destination:
            result = {"status": "error", "message": "Destination public key required"}
        else:
            result = check_balance(args.destination)
    
    elif args.action == 'send':
        if not args.source or not args.destination or not args.amount:
            result = {"status": "error", "message": "Missing required parameters for send action"}
        else:
            memo = args.memo if args.memo else "Transaction via StellarSphere"
            result = send_payment(args.source, args.destination, args.amount, memo)
    
    elif args.action == 'create':
        result = create_account()
    
    # Print result as JSON for the calling process to parse
    print(json.dumps(result))