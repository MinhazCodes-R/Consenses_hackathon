import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.small};
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: none;
  }
`;

const LogoIcon = styled.span`
  margin-right: ${props => props.theme.spacing.sm};
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  padding: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.default};
  border-radius: ${props => props.theme.borderRadius.medium};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    background-color: rgba(138, 43, 226, 0.1);
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  transition: ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
    transform: translateY(-2px);
  }
`;

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Nav>
      <Logo to="/">
        <LogoIcon>💫</LogoIcon>
        StellarSphere
      </Logo>
      
      <NavLinks>
        {currentUser ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/send">Send</NavLink>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};

export default Navbar;
