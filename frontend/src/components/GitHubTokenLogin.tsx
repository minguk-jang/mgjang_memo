/**
 * GitHub Personal Access Token Login Component
 */

import React, { useState } from "react";
import config from "../config";
import { githubMemoService } from "../services/github";
import { Octokit } from "@octokit/rest";

interface GitHubTokenLoginProps {
  onSuccess: (token: string, username: string, email: string) => void;
  error?: string | null;
}

const GitHubTokenLogin: React.FC<GitHubTokenLoginProps> = ({ onSuccess, error }) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    try {
      // Validate token by fetching user info
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();

      console.log('Authenticated as:', user.login);

      // Check if user has access to the repository
      const repoOwner = config.githubMemoRepo.owner || user.login;
      const repoName = config.githubMemoRepo.repo;

      console.log('Checking repository access:', `${repoOwner}/${repoName}`);

      try {
        const repoResponse = await octokit.rest.repos.get({
          owner: repoOwner,
          repo: repoName,
        });

        console.log('Repository found:', repoResponse.data.full_name);
        console.log('Permissions:', repoResponse.data.permissions);

        // Check if token has necessary permissions
        if (!repoResponse.data.permissions?.push) {
          setLocalError(
            `Insufficient permissions. Your token needs write access to ${repoOwner}/${repoName}. Please use a Classic Token with 'repo' scope or Fine-grained Token with 'Issues: Read and write' permission.`
          );
          setLoading(false);
          return;
        }
      } catch (repoError: any) {
        console.error('Repository access error:', repoError);
        if (repoError.status === 404) {
          setLocalError(
            `Repository not found: ${repoOwner}/${repoName}. Please check the repository name or create it.`
          );
          setLoading(false);
          return;
        }
        if (repoError.status === 403) {
          setLocalError(
            `Access forbidden. Make sure your token has 'repo' scope (Classic) or 'Issues: Read and write' permission (Fine-grained).`
          );
          setLoading(false);
          return;
        }
        throw repoError;
      }

      // Initialize GitHub service
      githubMemoService.initialize(
        token,
        config.githubMemoRepo.owner || user.login,
        config.githubMemoRepo.repo
      );

      onSuccess(token, user.login, user.email || `${user.login}@github.com`);
    } catch (err: any) {
      console.error("GitHub authentication failed:", err);
      if (err.status === 401) {
        setLocalError("Invalid token. Please check your Personal Access Token.");
      } else {
        setLocalError(err.message || "Failed to authenticate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-solid, var(--bg))' }}>
      <div className="glass-card rounded-2xl p-8 max-w-md w-full space-y-6 animate-fade-in">
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
            Store your memos in GitHub Issues
          </p>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="p-4 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 animate-shake">
            <p className="text-sm text-red-500 text-center">{error || localError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                id="token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                required
                disabled={loading}
                className="w-full px-3 py-2.5 pr-10 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{
                  background: 'var(--card)',
                  color: 'var(--text)',
                  border: '1px solid var(--ring)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--muted)' }}
              >
                {showToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
              Required scopes: <code className="px-1 py-0.5 rounded bg-black bg-opacity-10">repo</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'var(--primary)',
              color: '#FFFFFF',
            }}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Instructions */}
        <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--ring)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
            How to create a Personal Access Token:
          </p>
          <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: 'var(--muted)' }}>
            <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
            <li>Click "Generate new token (classic)"</li>
            <li>Give it a name and select the <code className="px-1 py-0.5 rounded bg-black bg-opacity-10">repo</code> scope</li>
            <li>Click "Generate token" and copy it</li>
            <li>Paste the token above</li>
          </ol>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Memo%20App"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{
              background: 'var(--card-hover)',
              color: 'var(--primary)',
            }}
          >
            Create Token on GitHub →
          </a>
        </div>

        {/* Repository Info */}
        <div className="pt-2 text-center">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Memos will be stored in:{" "}
            <code className="px-1 py-0.5 rounded bg-black bg-opacity-10 font-mono">
              {config.githubMemoRepo.owner || "your-username"}/{config.githubMemoRepo.repo}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubTokenLogin;
