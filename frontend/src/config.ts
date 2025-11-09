/**
 * Frontend runtime configuration.
 * Loads environment variables from Vite.
 */

interface Config {
  apiBaseUrl: string;
  appName: string;
  enableLogs: boolean;
  githubClientId?: string;
  githubRedirectUri: string;
  githubScope: string;
  githubMemoRepo: {
    owner: string;
    repo: string;
  };
}

const defaultOrigin =
  typeof window !== "undefined" ? window.location.origin : "";

const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  appName: import.meta.env.VITE_APP_NAME || "Telegram Memo Alerts",
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === "true",
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
  githubRedirectUri:
    import.meta.env.VITE_GITHUB_REDIRECT_URI || defaultOrigin || "",
  githubScope:
    import.meta.env.VITE_GITHUB_OAUTH_SCOPE || "read:user user:email repo",
  githubMemoRepo: {
    owner: import.meta.env.VITE_GITHUB_REPO_OWNER || "",
    repo: import.meta.env.VITE_GITHUB_REPO_NAME || "mgjang_memo",
  },
};

export default config;
