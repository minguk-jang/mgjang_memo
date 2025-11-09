import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { githubMemoService } from '../services/github';
import config from '../config';

export interface User {
  id: number;
  email: string;
  timezone: string;
  telegram_chat_id?: string;
  github_login?: string;
  github_token?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token');
  });

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Initialize GitHub service with GitHub token
    if (newUser.github_token) {
      githubMemoService.initialize(
        newUser.github_token,
        config.githubMemoRepo.owner,
        config.githubMemoRepo.repo
      );
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Re-initialize GitHub service if token changed
    if (updatedUser.github_token) {
      githubMemoService.initialize(
        updatedUser.github_token,
        config.githubMemoRepo.owner,
        config.githubMemoRepo.repo
      );
    }
  }, []);

  // Initialize GitHub service on mount if user is already logged in
  useEffect(() => {
    if (user?.github_token) {
      githubMemoService.initialize(
        user.github_token,
        config.githubMemoRepo.owner,
        config.githubMemoRepo.repo
      );
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, setToken, setUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
