import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  color: ${props => props.theme.colors.text};
`;

const LoadingText = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  font-size: 1.2rem;
`;

const ErrorContainer = styled.div`
  max-width: 500px;
  margin: ${props => props.theme.spacing.xxl} auto;
  padding: ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: ${props => props.theme.colors.error};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const BackButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
    transform: translateY(-2px);
  }
`;

const DirectDemoLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  useEffect(() => {
    const attemptLogin = async () => {
      try {
        console.log('Attempting direct demo login...');
        const response = await login('demo@example.com', 'password123');
        console.log('Login successful:', response.data);
        authLogin(response.data);
        navigate('/dashboard');
      } catch (err) {
        console.error('Demo login error:', err);
        setError(err.response?.data?.message || 'Failed to login with demo account');
        setLoading(false);
      }
    };
    
    attemptLogin();
  }, [authLogin, navigate]);
  
  if (loading) {
    return (
      <LoadingContainer>
        <div style={{ fontSize: '3rem' }}>🔄</div>
        <LoadingText>Logging in to demo account...</LoadingText>
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <ErrorTitle>Login Failed</ErrorTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => navigate('/demo')}>
          Back to Demo Page
        </BackButton>
      </ErrorContainer>
    );
  }
  
  return null;
};

export default DirectDemoLogin;
