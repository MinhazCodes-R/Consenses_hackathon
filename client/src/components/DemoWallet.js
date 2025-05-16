import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const DemoContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.medium};
  border: 1px solid rgba(138, 43, 226, 0.3);
  margin-bottom: ${props => props.theme.spacing.xl};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, 
      rgba(138, 43, 226, 0.3) 0%, 
      rgba(138, 43, 226, 0) 60%);
    pointer-events: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Subtitle = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: 1.25rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InfoGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Value = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-family: monospace;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  margin-left: ${props => props.theme.spacing.md};
  
  &:hover {
    color: ${props => props.theme.colors.primaryLight};
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
  margin-top: ${props => props.theme.spacing.md};
  width: 100%;
  transition: ${props => props.theme.transitions.default};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.primaryLight};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DemoWallet = () => {
  const [demoWallet, setDemoWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchDemoWallet = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/demo-wallet');
        setDemoWallet(response.data.demoWallet);
      } catch (error) {
        console.error('Error fetching demo wallet:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDemoWallet();
  }, []);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) {
    return <DemoContainer>Loading demo wallet information...</DemoContainer>;
  }
  
  if (!demoWallet) {
    return <DemoContainer>Failed to load demo wallet information.</DemoContainer>;
  }
  
  return (
    <DemoContainer>
      <Title>Demo Wallet</Title>
      <Card>
        <CardHeader>
          <Subtitle>Test Wallet Information</Subtitle>
        </CardHeader>
        
        <InfoGroup>
          <Label>Destination Address (for testing payments)</Label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Value>{demoWallet.publicKey}</Value>
            <CopyButton onClick={() => copyToClipboard(demoWallet.publicKey)}>
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </div>
        </InfoGroup>
        
        <InfoGroup>
          <Label>Email</Label>
          <Value>{demoWallet.loginCredentials.email}</Value>
        </InfoGroup>
        
        <InfoGroup>
          <Label>Password</Label>
          <Value>{demoWallet.loginCredentials.password}</Value>        </InfoGroup>
        
        <ActionButton onClick={() => window.location.href = '/login?demo=true'}>
          Login to Demo Account
        </ActionButton>
      </Card>
      
      <Card>
        <Subtitle>How to Use This Demo Wallet</Subtitle>
        <p>This is a pre-created wallet with real Stellar testnet tokens that you can use for demonstrating the application.</p>
        <br />
        <p>To send funds to this wallet:</p>
        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Login to your account</li>
          <li>Go to "Send" page</li>
          <li>Enter the destination address shown above</li>
          <li>Enter an amount (e.g. 10 XLM)</li>
          <li>Click "Send XLM"</li>
        </ol>
        <br />
        <p>To login as the demo wallet:</p>
        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Go to the Login page</li>
          <li>Enter the email and password shown above</li>
          <li>You can then see the balance and send funds from this wallet</li>
        </ol>
      </Card>
    </DemoContainer>
  );
};

export default DemoWallet;
