import apiClient from "./api";
import type { User } from "../context/AuthContext";

export interface GitHubAuthResult {
  access_token: string;
  token_type: string;
  user: User;
}

export const exchangeGitHubCode = async (
  code: string
): Promise<GitHubAuthResult> => {
  const response = await apiClient.post("/auth/github", { code });
  return response.data;
};
