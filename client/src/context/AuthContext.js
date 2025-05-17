import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('🗄️ Loaded from storage:', userData);
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Log in user and persist to localStorage
  const login = (data) => {
    const user = {
      userId: data.userId,
      username: data.username,
      publicKey: data.publicKey,
    };
    console.log('🔑 Logged-in user:', user);
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Log out user and clear localStorage
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
