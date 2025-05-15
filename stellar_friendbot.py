# stellar-sdk >= 2.0.0 required
# create a completely new and unique pair of keys
# see more about KeyPair objects: https://stellar-sdk.readthedocs.io/en/latest/api.html#keypair
from stellar_sdk import Keypair
import requests
from stellar_sdk import Server
from stellar_sdk import Asset, Keypair, Network, Server, TransactionBuilder
from stellar_sdk.exceptions import NotFoundError, BadResponseError, BadRequestError

#
# pair = Keypair.random()
# print(f"Secret: {pair.secret}")
# # Secret: SCTGUVGJUA65ERDWI7RRHPCK5KUXSUZ7FBLHG6FSWZC5U7PGSHSIHLII
# print(f"Public Key: {pair.public_key}")
# # Public Key: GCSZ5BMPJN3PX73CQGZG2ZWGYD6N6DXNIGKK6SIYGHNU7TDWJHVA2OK5





# -------------------------------------------------------------------------------------------------

# The SDK does not have tools for creating test accounts, so you'll have to
# make your own HTTP request.
my_public_key = 'GCSZ5BMPJN3PX73CQGZG2ZWGYD6N6DXNIGKK6SIYGHNU7TDWJHVA2OK5'
my_priv_key = 'SCTGUVGJUA65ERDWI7RRHPCK5KUXSUZ7FBLHG6FSWZC5U7PGSHSIHLII'
new_response = requests.get(f"https://friendbot.stellar.org?addr={my_public_key}")

# if you're trying this on Python, install the `requests` library.
public_key = "GCE64WCFXLH6FBU4GYXP7NMAIYJ265HVJVLYRUADI7APJAW5OOBHD6XJ"
response = requests.get(f"https://friendbot.stellar.org?addr={public_key}")

# check both accct bal
server = Server("https://horizon-testnet.stellar.org")
account = server.accounts().account_id(public_key).call()
for balance in account['balances']:
    print(f"minhaz acct\nType: {balance['asset_type']}, Balance: {balance['balance']}")

account2 = server.accounts().account_id(my_public_key).call()
for balance in account2['balances']:
    print(f"my acct\nType: {balance['asset_type']}, Balance: {balance['balance']}")

# transaction ---------------------

source_key = Keypair.from_secret(my_priv_key)
destination_id = public_key
try:
    server.load_account(destination_id)
except NotFoundError:
    # If the account is not found, surface an error message for logging.
    raise Exception("The destination account does not exist!")
source_account = server.load_account(source_key.public_key) # or my_public_key maybe?
base_fee = server.fetch_base_fee()
transaction = (TransactionBuilder(source_account=source_account, network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
                                  base_fee=base_fee)
               .append_payment_op(destination=destination_id, asset=Asset.native(), amount="2000")
               .add_text_memo('sending from taha to minhaz')
               .set_timeout(10)
               .build())
transaction.sign(source_key)
try:
    # And finally, send it off to Stellar!
    response = server.submit_transaction(transaction)
    print(f"Response: {response}")
except (BadRequestError, BadResponseError) as err:
    print(f"Something went wrong!\n{err}")

account = server.accounts().account_id(public_key).call()
for balance in account['balances']:
    print(f"minhaz acct\nType: {balance['asset_type']}, Balance: {balance['balance']}")

account2 = server.accounts().account_id(my_public_key).call()
for balance in account2['balances']:
    print(f"my acct\nType: {balance['asset_type']}, Balance: {balance['balance']}")
