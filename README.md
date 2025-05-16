# StellarSphere - Stellar Blockchain Wallet

A modern cryptocurrency wallet built on the Stellar blockchain network, designed with a sleek black and purple UI.

## Demo


*Click the image above to watch the demo video with audio explanation*

## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Main dashboard showing wallet balance and transaction history*

### Receive XLM
![Receive XLM](./screenshots/receive_xlm.png)
*Screen for receiving XLM with QR code and wallet address*

### Send XLM
![Send XLM](./screenshots/send_xlm.png)
*Interface for sending XLM to other users*

## Stellar Blockchain Integration

StellarSphere leverages the Stellar blockchain network to provide a seamless cryptocurrency wallet experience. Here's how our application interacts with the Stellar blockchain:

### Account Creation
When a user registers, our application:
1. Generates a new Stellar keypair (public and private keys)
2. Creates a new account on the Stellar testnet using the Friendbot service
3. Securely stores the keys in our database (encrypted in a production environment)

### Balance Checking
The wallet maintains real-time balance information by:
1. Querying the Stellar Horizon API for the latest account details
2. Parsing the XLM balance from the account's assets
3. Displaying the updated balance in the UI

### Transactions
When sending XLM:
1. The application builds a Stellar transaction with specified amount and destination
2. Signs the transaction with the user's secret key
3. Submits the transaction to the Stellar network
4. Monitors the transaction status and updates the UI accordingly

All operations are performed using the official Stellar SDK, ensuring compatibility with the Stellar protocol.

## Features

- Create a Stellar wallet account
- Send and receive XLM (Stellar's native cryptocurrency)
- View real-time balance updates
- User authentication and secure wallet storage
- Modern, responsive UI with a black and purple theme

## Technology Stack

- **Frontend**: React.js with styled-components
- **Backend**: Node.js with Express.js
- **Blockchain**: Stellar SDK
- **Authentication**: JWT-based auth with secure local storage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python (for the Stellar script)
- Stellar SDK (`pip install stellar-sdk`)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd stellar-sphere