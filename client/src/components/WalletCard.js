import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getWallet, checkBalance } from '../api';

const Card = styled.div`
  background: linear-gradient(135deg, #ede9fe, #fdf4ff);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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
  color: #6d28d9;
`;

const Refresh = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #7c3aed;
  transition: color 0.2s;
  &:hover { color: #a855f7; }
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

  .unit {
    font-size: 1rem;
    color: #6b7280;
    margin-left: 6px;
  }
`;

const AddressContainer = styled.div`
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddressText = styled.code`
  font-family: monospace;
  color: #4b5563;
  word-break: break-all;
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #7c3aed;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  &:hover { color: #a78bfa; }
`;

const Loading = styled.div`
  color: #6b7280;
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
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
      const { data } = await getWallet(userId);
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
      const { data } = await checkBalance(publicKey);
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
            {loading ? (
              <Loading>Loading…</Loading>
            ) : (
              <Balance>{balance}<span className="unit">XLM</span></Balance>
            )}
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
