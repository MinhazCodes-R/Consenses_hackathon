import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api';

const FormContainer = styled.div`
  max-width: 400px;
  margin: ${props => props.theme.spacing.xxl} auto;
  padding: ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  box-shadow: ${props => props.theme.shadows.medium};
  border: 1px solid rgba(138, 43, 226, 0.3);
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: ${props => props.theme.borderRadius.medium};
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  transition: ${props => props.theme.transitions.default};
  margin-top: ${props => props.theme.spacing.md};
  
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
  color: ${props => props.theme.colors.error};
  background-color: rgba(244, 67, 54, 0.1);
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  text-align: center;
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.textSecondary};
  
  a {
    color: ${props => props.theme.colors.primary};
    margin-left: ${props => props.theme.spacing.xs};
  }
`;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
    // Check for URL parameters that might indicate auto-login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoEmail = params.get('email');
    const autoPassword = params.get('password');
    
    if (autoEmail && autoPassword) {
      setEmail(autoEmail);
      setPassword(autoPassword);
      // Automatically submit the form
      handleLogin(autoEmail, autoPassword);
    }
    
    // Check if coming from demo page
    const isDemoLogin = params.get('demo') === 'true';
    if (isDemoLogin) {
      setEmail('demo@example.com');
      setPassword('password123');
      // Auto-login for demo account
      handleLogin('demo@example.com', 'password123');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleLogin = async (emailToUse, passwordToUse) => {
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting login with:', { email: emailToUse });
      const response = await login(emailToUse, passwordToUse);
      console.log('Login response:', response.data);
      authLogin(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to login';
      setError(errorMsg);
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(email, password);
  };
  
  return (
    <FormContainer>
      <Title>Login</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Email</Label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Password</Label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
      
      <RegisterLink>
        Don't have an account?<Link to="/register">Register</Link>
      </RegisterLink>
    </FormContainer>
  );
};

export default LoginForm;
