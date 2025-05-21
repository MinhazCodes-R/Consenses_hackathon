import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// 🔧 Base URLs
const API_BASE = 'https://ran-backend-domain.shop/api';
const FLASK_BASE = 'https://ran-backend-domain.shop/python';

// Styled components (unchanged)
const Card = styled.div`...`;            // ← your original styles
const Header = styled.div`...`;
const Title = styled.h2`...`;
const Refresh = styled.button`...`;
const BalanceSection = styled.div`...`;
const Label = styled.div`...`;
const Balance = styled.div`...`;
const AddressContainer = styled.div`...`;
const AddressText = styled.code`...`;
const CopyBtn = styled.button`...`;
const Loading = styled.div`...`;
const ErrorMsg = styled.div`...`;

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
      const { data } = await axios.get(`${API_BASE}/wallet/${userId}`);  // 🔧 Node route
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
      const { data } = await axios.post(`${FLASK_BASE}/check`, { public_key: publicKey });  // 🔧 Flask route
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
