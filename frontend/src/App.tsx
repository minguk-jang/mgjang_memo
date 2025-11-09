import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import GitHubTokenLogin from "./components/GitHubTokenLogin";

const LoadingScreen = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-4"
    style={{ background: 'var(--bg-solid, var(--bg))' }}
  >
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
         style={{ background: 'var(--primary)', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)' }}>
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: '300ms' }}></div>
    </div>
    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Loading...</p>
  </div>
);

const AppContent = () => {
  const { user, token, login } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginSuccess = (githubToken: string, username: string, email: string) => {
    // Create a user object compatible with the existing AuthContext
    const newUser = {
      id: Date.now(), // Use timestamp as ID
      email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      github_login: username,
      github_token: githubToken,
    };

    // Use github token as the app token
    login(githubToken, newUser);
    setAuthError(null);
  };

  if (!token || !user) {
    return <GitHubTokenLogin onSuccess={handleLoginSuccess} error={authError} />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
