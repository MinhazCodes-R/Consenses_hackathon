import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api';

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

const LoginLink = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.textSecondary};
  
  a {
    color: ${props => props.theme.colors.primary};
    margin-left: ${props => props.theme.spacing.xs};
  }
`;

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!publicKey || !privateKey) {
      return setError('Wallet keys are required');
    }

    setError('');
    setLoading(true);

    try {
      const response = await register(username, email, password, publicKey, privateKey);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>Create Account</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Username</Label>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </FormGroup>

        <FormGroup>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormGroup>

        <FormGroup>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </FormGroup>

        <FormGroup>
          <Label>Confirm Password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </FormGroup>

        <FormGroup>
          <Label>Public Key</Label>
          <Input type="text" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} required placeholder="G..." />
        </FormGroup>

        <FormGroup>
          <Label>Private Key</Label>
          <Input type="text" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} required placeholder="S..." />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </Button>
      </Form>

      <LoginLink>
        Already have an account?<Link to="/login">Login</Link>
      </LoginLink>
    </FormContainer>
  );
};

export default RegisterForm;
