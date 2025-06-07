import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import WalletCard from './WalletCard';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const DashboardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.$primary ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$primary ? 'white' : props.theme.colors.primary};
  border: ${props => props.$primary ? 'none' : `1px solid ${props.theme.colors.primary}`};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.medium};
  text-decoration: none;
  font-weight: 600;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    background-color: ${props => props.$primary ? props.theme.colors.primaryLight : 'rgba(138, 43, 226, 0.1)'};
    transform: translateY(-2px);
    text-decoration: none;
  }

  .icon {
    font-size: 1.2rem;
  }
`;

const TransactionsSection = styled.div`
  margin-top: ${props => props.theme.spacing.xxl};
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: 1.25rem;
`;

const TransactionsList = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
  border: 1px solid rgba(138, 43, 226, 0.3);
`;

const NoTransactions = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const Dashboard = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading dashboard...</div>;
  }

  if (!currentUser) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Please log in to access your dashboard.</div>;
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Welcome back, {currentUser.username}!</Title>
        <Subtitle>Manage your Stellar assets and transactions</Subtitle>
      </DashboardHeader>

      <WalletCard publicKey={currentUser.publicKey} />      <ActionButtons>
        <ActionButton to="/receive" $primary>
          <span className="icon">📤</span> Send Funds
        </ActionButton>
        <ActionButton to="/send">
          <span className="icon">📥</span> Receive Funds
        </ActionButton>
      </ActionButtons>

      <TransactionsSection>
        <SectionTitle>Recent Transactions</SectionTitle>
        <TransactionsList>
          <NoTransactions>
            No transactions yet. Send or receive funds to see your transaction history.
          </NoTransactions>
        </TransactionsList>
      </TransactionsSection>
    </DashboardContainer>
  );
};

export default Dashboard;
