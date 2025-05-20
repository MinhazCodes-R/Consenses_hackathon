import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Styled components
const Card = styled.div`
  background: linear-gradient(135deg, #7c3aed20 0%, #e879f920 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #5b21b6;
`;

const Refresh = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #5b21b6;
  transition: color 0.2s;
  &:hover { color: #d946ef; }
`;

const BalanceSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

const Balance = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #7e22ce;
  display: flex;
  align-items: baseline;
  .unit { font-size: 1rem; color: #6b7280; margin-left: 4px; }
`;

const AddressContainer = styled.div`
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddressText = styled.code`
  font-family: monospace;
  color: #4b5563;
  overflow-wrap: anywhere;
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #7c3aed;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  transition: color 0.2s;
  &:hover { color: #a78bfa; }
`;

const Loading = styled.div`
  color: #6b7280;
`;

const ErrorMsg = styled.div`
  color: #e11d48;
  background-color: #fee2e2;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const WalletCard = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.userId;
  const [publicKey, setPublicKey] = useState('');
  const [balance, setBalance] = useState('--');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchWalletKeys = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`https://ran-backend-domain.shop/api/wallet/${userId}`);
      if (data.status === 'success') {
        setPublicKey(data.publicKey);
      } else {
        setError(data.message || 'No wallet linked to this user');
      }
    } catch (err) {
      console.error('Error fetching wallet keys:', err);
      setError('No wallet linked to this user');
    }
  };

  const fetchStellarBalance = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('https://ran-backend-domain.shop/flask/check', { public_key: publicKey });
      if (data.status === 'success') {
        setBalance(data.balances.native);
      } else {
        setError(data.message || 'Failed to fetch balance');
      }
    } catch (err) {
      console.error('Error fetching stellar balance:', err);
      setError('Unable to fetch on-chain balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWalletKeys(); }, [userId]);
  useEffect(() => { fetchStellarBalance(); }, [publicKey]);

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <Header>
        <Title>Stellar Wallet</Title>
        <Refresh onClick={fetchStellarBalance} aria-label="Refresh Balance">
          <FiRefreshCw size={20} />
        </Refresh>
      </Header>

      {!publicKey && <ErrorMsg>{error || 'No wallet linked to this user.'}</ErrorMsg>}

      {publicKey && (
        <>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <BalanceSection>
            <Label>Available Balance</Label>
            {loading ? (<Loading>Loading…</Loading>) : (<Balance>{balance}<span className="unit">XLM</span></Balance>)}
          </BalanceSection>

          <AddressContainer>
            <AddressText>{publicKey}</AddressText>
            <CopyBtn onClick={copyAddress} aria-label="Copy Address">
              {copied ? 'Copied!' : 'Copy'} <FiCopy style={{ marginLeft: '4px' }} />
            </CopyBtn>
          </AddressContainer>
        </>
      )}
    </Card>
  );
};

export default WalletCard;