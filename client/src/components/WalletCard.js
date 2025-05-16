import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getBalance } from '../api';

const CardContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const WalletTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.25rem;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    color: ${props => props.theme.colors.primaryLight};
    transform: rotate(45deg);
  }
`;

const BalanceContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const BalanceLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const BalanceAmount = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};

  .currency {
    font-size: 1rem;
    color: ${props => props.theme.colors.textSecondary};
    margin-left: ${props => props.theme.spacing.xs};
  }
`;

const WalletAddress = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  margin-top: ${props => props.theme.spacing.lg};
`;

const AddressLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const AddressValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.colors.text};
  font-family: monospace;
  font-size: 0.9rem;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: ${props => props.theme.colors.textSecondary};
`;

const WalletCard = ({ publicKey }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await getBalance(publicKey);
      if (response.data.status === 'success') {
        setBalance(response.data.balances['native'] || '0');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <CardContainer>
      <CardHeader>
        <WalletTitle>Stellar Wallet</WalletTitle>
        <RefreshButton onClick={fetchBalance}>
          <span role="img" aria-label="refresh">🔄</span>
        </RefreshButton>
      </CardHeader>

      {loading ? (
        <LoadingContainer>Loading balance...</LoadingContainer>
      ) : (
        <BalanceContainer>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>
            {balance} <span className="currency">XLM</span>
          </BalanceAmount>
        </BalanceContainer>
      )}

      <WalletAddress>
        <AddressLabel>Wallet Address</AddressLabel>
        <AddressValue>
          {publicKey
            ? `${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 4)}`
            : 'No address available'}
          {publicKey && (
            <CopyButton onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          )}
        </AddressValue>
      </WalletAddress>
    </CardContainer>
  );
};

export default WalletCard;
