// Added a Node.js server to serve the static files
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory database for development (replace with real DB in production)
const users = [];
const wallets = [];
const transactions = [];

// Create a demo account for testing
const DEMO_USER_ID = 'demo-user-123';
users.push({
  id: DEMO_USER_ID,
  username: 'demo',
  email: 'demo@example.com',
  password: 'password123'
});

wallets.push({
  userId: DEMO_USER_ID,
  publicKey: 'GANCYPY7INQDS5XCSZLQ4TKEYJQ6IPH5CUZS2SMP3BKTAWZHAEQX3ZFO',
  privateKey: 'SDY453TNMIX3CISQH33RVGZMSO67VRM3KSBULAN5CQEVY4LVQLZNH3UJ'
});

console.log('Demo account created:', {
  email: 'demo@example.com',
  password: 'password123',
  publicKey: 'GANCYPY7INQDS5XCSZLQ4TKEYJQ6IPH5CUZS2SMP3BKTAWZHAEQX3ZFO'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Helper function to execute Python script
function runPythonScript(args) {
  return new Promise((resolve, reject) => {
    // Make sure to use double quotes around the path to handle spaces in paths
    const scriptPath = path.resolve(__dirname, 'stellar_friendbot.py');
    const command = `python "${scriptPath}" ${args}`;
    
    console.log('Executing command:', command);
    
    exec(command, (error, stdout, stderr) => {
      if (stderr) {
        console.error(`Python stderr:`, stderr);
      }
      
      if (error) {
        console.error(`Python execution error:`, error);
        return reject(error);
      }
      
      console.log('Python stdout:', stdout);
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        console.error('Failed to parse JSON from Python output:', e);
        console.error('Raw output:', stdout);
        reject(new Error(`Failed to parse JSON from Python: ${stdout}`));
      }
    });
  });
}

// Routes
// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Registration attempt:', { username, email });
    
    // Basic validation
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      console.log('User already exists:', email);
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    
    console.log('Calling Python script to create Stellar account...');
    
    try {
      // Create Stellar account
      const stellarAccount = await runPythonScript('--action=create');
      console.log('Python script response:', stellarAccount);
      
      if (stellarAccount.status !== 'success') {
        console.log('Python script error:', stellarAccount.message);
        return res.status(500).json({ status: 'error', message: stellarAccount.message });
      }
      
      // Create user and wallet records
      const userId = uuidv4();
      users.push({
        id: userId,
        username,
        email,
        password, // In a real app, this would be hashed
      });
      
      wallets.push({
        userId,
        publicKey: stellarAccount.public_key,
        privateKey: stellarAccount.secret_key
      });
      
      console.log('User created successfully:', { userId, username, publicKey: stellarAccount.public_key });
      
      res.json({ 
        status: 'success', 
        userId,
        username,
        publicKey: stellarAccount.public_key,
        balances: stellarAccount.balances
      });
    } catch (pythonError) {
      console.error('Error executing Python script:', pythonError);
      return res.status(500).json({ status: 'error', message: 'Failed to create Stellar account: ' + pythonError.message });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Test registration endpoint that doesn't use the Python script (for debugging)
app.post('/api/register-test', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Test registration attempt:', { username, email });
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    
    // Create mock Stellar account (for testing only)
    const mockStellarAccount = {
      public_key: "GDUMMYPUBLICKEYTHATISNOTREAL" + Math.random().toString(36).substring(2, 15),
      secret_key: "SDUMMYSECRETKEYTHATISNOTREAL" + Math.random().toString(36).substring(2, 15)
    };
    
    // Create user and wallet records
    const userId = uuidv4();
    users.push({
      id: userId,
      username,
      email,
      password, // In a real app, this would be hashed
    });
    
    wallets.push({
      userId,
      publicKey: mockStellarAccount.public_key,
      privateKey: mockStellarAccount.secret_key
    });
    
    console.log('Test user created successfully:', { userId, username });
    
    res.json({ 
      status: 'success', 
      userId,
      username,
      publicKey: mockStellarAccount.public_key,
      balances: { "native": "10000.0000000" }
    });
    
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  console.log('Available users:', users);
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    console.log('Invalid credentials for:', email);
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }
  
  console.log('User found:', { id: user.id, username: user.username });
  
  // Get user's wallet
  const wallet = wallets.find(w => w.userId === user.id);
  
  if (!wallet) {
    console.log('Wallet not found for user:', { id: user.id, username: user.username });
    return res.status(500).json({ status: 'error', message: 'Wallet not found' });
  }
  
  console.log('Login successful for:', { id: user.id, username: user.username });
  
  res.json({
    status: 'success',
    userId: user.id,
    username: user.username,
    publicKey: wallet.publicKey
  });
});

// Check balance
app.get('/api/balance/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const result = await runPythonScript(`--action=check --destination=${publicKey}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get user's wallet
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  console.log('Fetching wallet for userId:', userId);
  console.log('Available wallets:', wallets);
  
  const wallet = wallets.find(w => w.userId === userId);
  
  if (!wallet) {
    console.log('Wallet not found for userId:', userId);
    return res.status(404).json({ status: 'error', message: 'Wallet not found' });
  }
  
  console.log('Wallet found:', { userId, publicKey: wallet.publicKey });
  res.json({
    status: 'success',
    publicKey: wallet.publicKey
  });
});

// Send payment
app.post('/api/send', async (req, res) => {
  try {
    const { userId, destinationKey, amount, memo } = req.body;
    
    console.log('Payment request received:', { userId, destinationKey, amount, memo });
    
    // Validate inputs
    if (!userId || !destinationKey || !amount) {
      console.log('Missing required payment fields');
      return res.status(400).json({ status: 'error', message: 'Missing required payment fields' });
    }
    
    // Validate destination address format (should start with G for public keys)
    if (!destinationKey.startsWith('G') || destinationKey.length !== 56) {
      console.log('Invalid destination address format');
      return res.status(400).json({ status: 'error', message: 'Invalid destination address format' });
    }
    
    // Parse and validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({ status: 'error', message: 'Amount must be a positive number' });
    }
    
    // Convert amount to string with 7 decimal places (XLM precision)
    const formattedAmount = amountNum.toFixed(7);
    
    // Get user's wallet
    const wallet = wallets.find(w => w.userId === userId);
    
    if (!wallet) {
      console.log('Wallet not found for userId:', userId);
      return res.status(404).json({ status: 'error', message: 'Wallet not found' });
    }
    
    // Prepare arguments
    let args = `--action=send --source=${wallet.privateKey} --destination=${destinationKey} --amount=${formattedAmount}`;
    
    if (memo) {
      args += ` --memo="${memo}"`;
    }
    
    console.log('Executing payment transaction...');
    
    // Execute transaction
    const result = await runPythonScript(args);
    
    if (result.status === 'error') {
      console.error('Payment error from Python script:', result.message);
    } else {
      console.log('Payment successful:', { hash: result.hash });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process payment: ' + error.message });  }
});

// Demo wallet endpoint (for easy testing)
app.get('/api/demo-wallet', (req, res) => {
  res.json({
    status: 'success',
    message: 'Use this wallet address for testing payments',
    demoWallet: {
      publicKey: 'GANCYPY7INQDS5XCSZLQ4TKEYJQ6IPH5CUZS2SMP3BKTAWZHAEQX3ZFO',
      loginCredentials: {
        email: 'demo@example.com',
        password: 'password123'
      }
    }
  });
});

// Create a temporary wallet for testing purposes
app.post('/api/create-temp-wallet', async (req, res) => {
  try {
    console.log('Creating temporary wallet for demo purposes...');
    
    // Create Stellar account
    const stellarAccount = await runPythonScript('--action=create');
    
    if (stellarAccount.status !== 'success') {
      return res.status(500).json({ status: 'error', message: stellarAccount.message });
    }
    
    // Create a temp ID for this wallet
    const tempId = `temp-${uuidv4()}`;
    
    // Add to our in-memory database
    users.push({
      id: tempId,
      username: 'Temporary User',
      email: `temp-${Date.now()}@example.com`,
      password: 'temp123'
    });
    
    wallets.push({
      userId: tempId,
      publicKey: stellarAccount.public_key,
      privateKey: stellarAccount.secret_key
    });
    
    console.log('Temporary wallet created:', {
      publicKey: stellarAccount.public_key,
      balance: stellarAccount.balances.native
    });
    
    res.json({
      status: 'success',
      message: 'Temporary wallet created successfully',
      publicKey: stellarAccount.public_key,
      balance: stellarAccount.balances.native,
      note: 'This wallet is for testing only and will be lost when the server restarts'
    });
    
  } catch (error) {
    console.error('Error creating temporary wallet:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Serve the React app for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// API catch-all
app.all('/api/*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'API endpoint not found' });
});

// React app routes catch-all - MUST be the last route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});