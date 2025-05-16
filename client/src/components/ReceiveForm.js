import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const ReceiveContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.medium};
  border: 1px solid rgba(138, 43, 226, 0.3);
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

const AddressContainer = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AddressBox = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.medium};
  word-break: break-all;
  font-family: monospace;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const CopyButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  width: 100%;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
    transform: translateY(-2px);
  }
`;

const Instructions = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const QRCodeArea = styled.div`
  margin: ${props => props.theme.spacing.xl} auto;
  width: 200px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.medium};
`;

const ReceiveForm = () => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = React.useState(false);
  
  if (!currentUser) {
    return null;
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUser.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <ReceiveContainer>
      <Title>Receive XLM</Title>
      
      <Card>
        <Label>Your wallet address</Label>
        <AddressBox>
          {currentUser.publicKey}
        </AddressBox>
        
        <QRCodeArea>
          {/* Placeholder for QR code */}
          <div>QR Code of your address</div>
        </QRCodeArea>
        
        <CopyButton onClick={copyToClipboard}>
          {copied ? 'Address Copied!' : 'Copy Address'}
        </CopyButton>
        
        <Instructions>
          <p>Share your wallet address with anyone who wants to send you XLM. Make sure the sender is sending XLM on the Stellar network.</p>
          <p>All incoming transactions will automatically be added to your wallet balance.</p>
        </Instructions>
      </Card>
    </ReceiveContainer>
  );
};

export default ReceiveForm;
