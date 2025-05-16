# Check and install required Python packages
import sys
import subprocess
import pkg_resources

required_packages = {'stellar-sdk', 'requests'}
installed = {pkg.key for pkg in pkg_resources.working_set}
missing = required_packages - installed

if missing:
    print(f"Installing missing packages: {missing}")
    subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
    print("Installation complete!")
else:
    print("All required packages are already installed!")

# Test importing the required modules
try:
    from stellar_sdk import Keypair, Server, Asset, Network, TransactionBuilder
    from stellar_sdk.exceptions import NotFoundError, BadResponseError, BadRequestError
    import requests
    import json
    import argparse
    
    print("All imports successful!")
    
    # Test creating a keypair
    pair = Keypair.random()
    print(f"Test keypair created: {pair.public_key}")
    
    print("Stellar SDK is working correctly!")
except Exception as e:
    print(f"Error testing dependencies: {str(e)}")
    sys.exit(1)
