import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { initiateEscrow } from '../api';

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
    background: radial-gradient(circle at top right, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0) 60%);
    pointer-events: none;
  }
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid #ccc;
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: 1rem;
`;

const SubmitButton = styled.button`
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

const InfoBox = styled.div`
  background-color: #ffffff;
  color: #1f2937;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  margin-top: ${props => props.theme.spacing.lg};
  text-align: center;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const Error = styled.div`
  color: red;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ReceiveForm = () => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = React.useState('');
  const [keywordPair, setKeywordPair] = React.useState('');
  const [escrowKey, setEscrowKey] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!currentUser) return null;

  const handleRequest = async () => {
    setError('');
    setKeywordPair('');
    setEscrowKey('');
    if (!amount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await initiateEscrow(currentUser.userId, amount);
      if (res.data.status === 'success') {
        setKeywordPair(res.data.keywordPair);
        setEscrowKey(res.data.escrowPublicKey);
      } else {
        setError(res.data.message || 'Failed to initiate escrow');
      }
    } catch (err) {
      console.error('Request error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReceiveContainer>
      <Title>Send Funds</Title>

      <Card>
        {error && <Error>{error}</Error>}

        <Label>Enter Amount (XLM)</Label>
        <Input
          type="number"
          placeholder="e.g. 5.0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <SubmitButton onClick={handleRequest} disabled={loading}>
          {loading ? 'Requesting...' : 'Generate Escrow Keyword'}
        </SubmitButton>

        {keywordPair && (
          <>
            <InfoBox>
              <strong>Keyword:</strong><br />{keywordPair}
            </InfoBox>
            <InfoBox>
              <strong>Escrow Wallet:</strong><br />{escrowKey}
            </InfoBox>
            <InfoBox>
              Share the above keyword with the sender. When they enter it, funds will be released to your account.
            </InfoBox>
          </>
        )}
      </Card>
    </ReceiveContainer>
  );
};

export default ReceiveForm;
