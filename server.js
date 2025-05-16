// Added a Node.js server to serve the static files
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory database for development (replace with real DB in production)
const users = [];
const wallets = [];
const transactions = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
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
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }
  
  // Get user's wallet
  const wallet = wallets.find(w => w.userId === user.id);
  
  if (!wallet) {
    return res.status(500).json({ status: 'error', message: 'Wallet not found' });
  }
  
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
  const wallet = wallets.find(w => w.userId === userId);
  
  if (!wallet) {
    return res.status(404).json({ status: 'error', message: 'Wallet not found' });
  }
  
  res.json({
    status: 'success',
    publicKey: wallet.publicKey
  });
});

// Send payment
app.post('/api/send', async (req, res) => {
  try {
    const { userId, destinationKey, amount, memo } = req.body;
    
    // Get user's wallet
    const wallet = wallets.find(w => w.userId === userId);
    
    if (!wallet) {
      return res.status(404).json({ status: 'error', message: 'Wallet not found' });
    }
    
    // Prepare arguments
    let args = `--action=send --source=${wallet.privateKey} --destination=${destinationKey} --amount=${amount}`;
    
    if (memo) {
      args += ` --memo="${memo}"`;
    }
    
    // Execute transaction
    const result = await runPythonScript(args);
    res.json(result);
    
  } catch (error) {
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