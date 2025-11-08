/**
 * Authentication context for managing user state.
 */

import React, { createContext, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  timezone: string;
  telegram_linked: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const handleSetToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // Implementation in Phase 3
      throw new Error("Login not implemented yet");
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        setUser: handleSetUser,
        setToken: handleSetToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
