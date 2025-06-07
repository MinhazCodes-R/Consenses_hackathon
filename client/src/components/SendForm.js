import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { claimEscrow } from '../api';

// Styled Components (same as before)
const SendContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const FormCard = styled.div`
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

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid rgba(138, 43, 226, 0.3);
  background-color: rgba(255, 255, 255, 0.05);
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
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

const ErrorMessage = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background-color: rgba(244, 67, 54, 0.1);
  color: ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.borderRadius.medium};
  text-align: center;
`;

const SuccessCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.medium};
  border: 1px solid rgba(76, 175, 80, 0.3);
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: ${props => props.theme.colors.success};
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SuccessTitle = styled.h2`
  color: ${props => props.theme.colors.success};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SuccessMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const BackButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
    transform: translateY(-2px);
  }
`;

const SendForm = () => {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await claimEscrow(currentUser.userId, keyword);
      if (response.data.status === 'success') {
        setSuccess(true);
        setTxHash(response.data.hash);
      } else {
        setError(response.data.message || 'Transaction failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim escrow');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SendContainer>
        <SuccessCard>
          <SuccessIcon>✅</SuccessIcon>
          <SuccessTitle>Escrow Claimed!</SuccessTitle>
          <SuccessMessage>
            Funds have been successfully claimed to your wallet.
          </SuccessMessage>
          {txHash && (
            <div style={{ marginBottom: '1.5rem', wordBreak: 'break-all' }}>
              <Label>Transaction Hash</Label>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {txHash}
              </div>
            </div>
          )}
          <BackButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </BackButton>
        </SuccessCard>
      </SendContainer>
    );
  }
  return (
    <SendContainer>
      <Title>Receive Funds</Title>
      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Enter Keyword</Label>
            <Input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. drum-carrot"
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Claiming...' : 'Claim Escrow'}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
      </FormCard>
    </SendContainer>
  );
};

export default SendForm;
