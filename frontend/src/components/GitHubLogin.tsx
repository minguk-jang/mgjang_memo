import React from "react";
import config from "../config";
import { GITHUB_OAUTH_STATE_KEY } from "../constants/auth";

interface GitHubLoginProps {
  error?: string | null;
}

const GitHubLogin: React.FC<GitHubLoginProps> = ({ error }) => {
  const isConfigured = Boolean(
    config.githubClientId && config.githubRedirectUri
  );

  const handleLogin = () => {
    if (!isConfigured) {
      return;
    }

    const state =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2);

    sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: config.githubClientId as string,
      redirect_uri: config.githubRedirectUri,
      scope: config.githubScope,
      state,
      allow_signup: "false",
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-solid, var(--bg))' }}>
      <div className="glass-card rounded-2xl p-8 max-w-md w-full space-y-8 animate-fade-in">
        {/* Logo/Icon Section */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
               style={{ background: 'var(--primary)', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {config.appName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Smart memo management with Telegram alerts
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 animate-shake">
            <p className="text-sm text-red-500 text-center">{error}</p>
          </div>
        )}

        {/* Sign In Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Sign in to continue
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Secure authentication powered by GitHub
            </p>
          </div>

          {!isConfigured ? (
            <div className="p-4 rounded-lg bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2 font-semibold">
                Configuration Required
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                GitHub OAuth is not configured. Please set{" "}
                <code className="px-1 py-0.5 rounded bg-black bg-opacity-10">
                  VITE_GITHUB_CLIENT_ID
                </code>{" "}
                and{" "}
                <code className="px-1 py-0.5 rounded bg-black bg-opacity-10">
                  VITE_GITHUB_REDIRECT_URI
                </code>{" "}
                in your environment.
              </p>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
              style={{
                background: 'linear-gradient(135deg, #24292e 0%, #1a1e22 100%)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--ring)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
            By signing in, you'll be redirected to GitHub to authorize access.
            <br />
            We only access your basic profile information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubLogin;
