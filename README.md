# StellarSphere - Stellar Blockchain Wallet

A modern cryptocurrency wallet built on the Stellar blockchain network, designed with a sleek black and purple UI.

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
```

### 2. Install dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
npm run install-client
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
```

### 4. Run the application

**Development mode**:

```bash
# Run both client and server concurrently
npm run dev

# Or run them separately:
# Start the server
npm start

# Start the client
npm run client
```

The client will run on `http://localhost:3000` and the server on `http://localhost:5000`.

## Usage

1. Create an account using the registration form
2. Log in with your credentials
3. View your wallet dashboard with your XLM balance
4. Send XLM to other Stellar addresses
5. Share your wallet address to receive XLM

## API Endpoints

- `POST /api/register` - Create a new user account with Stellar wallet
- `POST /api/login` - Authenticate user
- `GET /api/balance/:publicKey` - Get wallet balance
- `GET /api/wallet/:userId` - Get user's wallet information
- `POST /api/send` - Send XLM to another account

## License

MIT
