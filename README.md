# StellarSphere - Secure Escrow Wallet on Stellar Blockchain

StellarSphere is a modern cryptocurrency wallet and escrow payment platform built on the Stellar blockchain network, designed with a sleek black and purple UI. The application enables secure peer-to-peer transactions using an escrow mechanism.

[Website](https://consenses-hackathon-zt67.vercel.app/login)
[Live Demo](https://www.linkedin.com/posts/minhazur-rakin_wow-this-post-was-long-overdue-had-activity-7336959400865079296-DX0D?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEL7kcsBdemOIbQqDztewRPwMQ30CKi8zIo) 

## Core Features

- **Secure Wallet Management**: Create and manage Stellar wallet accounts with public and private key pairs
- **Escrow Payment System**: Send funds that can only be claimed with a unique keyword
- **Intuitive UI**: Modern, responsive design with a dark theme featuring purple accents
- **User Authentication**: Secure login/registration system with password protection
- **Transaction History**: View your past transactions and escrow payments

## Technology Stack

### Frontend
- **React.js**: UI framework (v19)
- **styled-components**: Component-based styling
- **React Router**: Client-side routing
- **Axios**: API requests to backend services

### Backend
- **Node.js + Express**: Main server for user management and wallet operations
- **Python + Flask**: Stellar blockchain operations server
- **PostgreSQL**: Database for user accounts and transaction records
- **Docker + Docker Compose**: Containerization and deployment

### Blockchain
- **Stellar SDK**: Stellar blockchain integration for both JavaScript and Python
- **Testnet Integration**: Uses Stellar's testnet for development and testing

## System Architecture

The application uses a three-tier architecture:

1. **React Frontend**: User interface and interaction
2. **Node.js Backend**: User authentication, wallet management, and escrow initiation
3. **Python Flask Backend**: Blockchain operations and Stellar SDK integration
4. **PostgreSQL Database**: Data persistence

All components are containerized using Docker for easy deployment.

## Backend Infrastructure

### Node.js Server (Express)
The primary backend server runs on Node.js with Express framework, handling:

- **User Authentication**: Registration, login, and session management
- **Wallet Operations**: Creation and management of Stellar wallet keypairs
- **Escrow Logic**: Initiation, storage, and claiming of escrow transactions
- **Database Interaction**: PostgreSQL interactions via node-postgres (pg) library

The Node.js server acts as the central coordinator for the application, providing REST API endpoints for the frontend and delegating blockchain operations to the Python server when needed.

### Python Flask Server
A specialized Python server handles direct interaction with the Stellar blockchain:

- **Stellar SDK Integration**: Uses the stellar-sdk Python package for blockchain operations
- **Transaction Processing**: Creating, signing, and submitting transactions to the Stellar network
- **Balance Checking**: Querying account balances from the Stellar network
- **Testnet Funding**: Integration with Stellar's Friendbot service for testing

### PostgreSQL Database
The database stores all persistent data with a schema designed for blockchain operations:

- **Relational Design**: Tables for users, transactions, and escrow operations
- **Transaction Records**: Storing transaction history and statuses
- **Key Management**: Secure storage of public/private key pairs
- **Connection Pooling**: Efficient database connections via connection pooling

### Containerization Strategy
All backend services are containerized with Docker:

- **Docker Compose**: Orchestration of multiple services
- **Service Dependencies**: Proper startup order with health checks
- **Environment Variables**: Configuration via environment variables for flexibility
- **Volume Management**: Persistent data storage for the database

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Node.js (v16 or higher)
- npm or yarn
- Python 3.10+

### Local Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd Consenses_hackathon
```

2. **Install dependencies**

```bash
# Install server dependencies
npm install

# Install client dependencies
npm run install-client

# Install concurrently (if not already installed)
npm install concurrently --save-dev
```

3. **Set up environment variables**

Create a `.env` file in the root directory with:

```
DATABASE_URL=postgres://postgres:password@localhost:5432/txdb
FLASK_API=http://localhost:3001
PORT=5001
```

4. **Start the application**

```bash
# Option 1: Using Docker Compose (recommended for full stack)
docker-compose up -d

# Option 2: For development
# Terminal 1 - Start the database
docker-compose up postgres

# Terminal 2 - Start the Node.js server
npm start

# Terminal 3 - Start the React client
npm run client

# Terminal 4 - Start the Python Flask server
python stellar_friendbot.py
```

## UI Flow and Features

### Dashboard
The dashboard provides an overview of your wallet with:
- Wallet address information
- Current balance display
- Action buttons for sending and receiving funds
- Transaction history section

### Send and Receive
The application has a unique feature where:
- The "Send Funds" button takes you to the page for initiating an escrow payment
- The "Receive Funds" button takes you to the page for claiming funds using a keyword

### Escrow System
- Generate a secure keyword when sending funds
- Share the keyword with the recipient
- Recipient can claim the funds using the keyword

## API Endpoints

### Node.js Backend (port 5001)

#### Authentication
- `POST /api/register` - Create a new user account with Stellar wallet
- `POST /api/login` - Authenticate user and get user details

#### Wallet Management
- `GET /api/wallet/:userId` - Get user's wallet information (public/private keys)

#### Escrow System
- `POST /api/escrow/initiate` - Create an escrow transaction and generate a keyword
- `POST /api/escrow/claim` - Claim funds from an escrow using the keyword

### Python Flask Backend (port 3001)

- `POST /send` - Execute a Stellar transaction
- `POST /check` - Check balance of a Stellar account

## Server Configuration

### Node.js Server Details
- **Port**: 5001 (configurable via PORT environment variable)
- **Main File**: server_minimum copy.js
- **Key Dependencies**: 
  - express: Web server framework
  - pg: PostgreSQL client
  - axios: HTTP client for communicating with the Python server
  - uuid: For generating unique identifiers
  - cors: Cross-origin resource sharing support
  - dotenv: Environment variable management

### Python Server Details
- **Port**: 3001
- **Main File**: stellar_friendbot.py
- **Key Dependencies**:
  - Flask: Lightweight web framework
  - stellar-sdk: Stellar blockchain SDK
  - psycopg2: PostgreSQL adapter
  - requests: HTTP client

### CORS Configuration
The Node.js server is configured with CORS to allow requests from:
- http://localhost:3000 (local development)
- https://consenses-hackathon-zt67.vercel.app (production)

### Production Deployment
In production, the services communicate through a reverse proxy setup:
- **Node API**: https://ran-backend-domain.shop/api
- **Python API**: https://ran-backend-domain.shop/python

## Escrow Process Flow

1. **Sender** (wants to send funds):
   - Initiates an escrow transaction with an amount
   - Receives a unique keyword pair
   - Funds are locked in an escrow account

2. **Recipient** (wants to receive funds):
   - Gets the keyword from the sender
   - Enters the keyword in the application
   - Funds are released from escrow to the recipient's wallet

## Docker Deployment

The application is fully containerized and can be deployed using Docker Compose:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database container
- Node.js server container
- Python Flask server container

### Docker Compose Configuration
The `docker-compose.yaml` file defines three main services:

1. **postgres**:
   - Image: postgres:15
   - Environment variables for database credentials
   - Volume for data persistence
   - Health check to ensure database is ready before other services start

2. **node-server**:
   - Custom build using Dockerfile.node
   - Depends on postgres service
   - Exposes port 5001
   - Environment variables for database connection and Flask API URL

3. **flask-server**:
   - Custom build using Dockerfile.python
   - Depends on postgres service
   - Exposes port 3001
   - Environment variable for frontend URL

### Scaling Considerations
The containerized architecture supports horizontal scaling with load balancing for:
- Multiple Node.js server instances
- Multiple Python server instances
- Database replication (with additional configuration)

## Database Schema

The application uses the following database tables:

- **users** - User accounts and wallet information
- **escrow_transactions** - Escrow transaction details and status
- **transactions** - Record of completed transactions
- **accounts** - Account balances (for future extensions)

## Security Considerations

- Private keys are stored encrypted in the database
- Escrow mechanism ensures secure payments
- Authentication required for all sensitive operations

## License

MIT

## Contributors

Consenses Hackathon Team
