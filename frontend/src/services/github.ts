/**
 * GitHub API service for managing memos as GitHub Issues
 */

import { Octokit } from '@octokit/rest';

export interface GitHubMemo {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string; color: string }>;
  url: string;
}

export interface CreateMemoInput {
  title: string;
  description?: string;
  labels?: string[];
}

export interface UpdateMemoInput {
  title?: string;
  description?: string;
  state?: 'open' | 'closed';
  labels?: string[];
}

class GitHubMemoService {
  private octokit: Octokit | null = null;
  private owner: string = '';
  private repo: string = '';

  /**
   * Initialize GitHub API client with access token
   */
  initialize(accessToken: string, owner: string, repo: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Check if service is initialized
   */
  private ensureInitialized() {
    if (!this.octokit || !this.owner || !this.repo) {
      throw new Error('GitHub service not initialized. Call initialize() first.');
    }
  }

  /**
   * Get repository info
   */
  async getRepository() {
    this.ensureInitialized();

    const response = await this.octokit!.rest.repos.get({
      owner: this.owner,
      repo: this.repo,
    });

    return response.data;
  }

  /**
   * List all memos (GitHub Issues)
   */
  async listMemos(state: 'open' | 'closed' | 'all' = 'all'): Promise<GitHubMemo[]> {
    this.ensureInitialized();

    const response = await this.octokit!.rest.issues.listForRepo({
      owner: this.owner,
      repo: this.repo,
      state,
      labels: 'memo', // Filter by 'memo' label
      sort: 'created',
      direction: 'desc',
      per_page: 100,
    });

    return response.data.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || null,
      state: issue.state as 'open' | 'closed',
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map((label) => ({
        name: typeof label === 'string' ? label : label.name || '',
        color: typeof label === 'string' ? '' : label.color || '',
      })),
      url: issue.html_url,
    }));
  }

  /**
   * Get a single memo by issue number
   */
  async getMemo(issueNumber: number): Promise<GitHubMemo> {
    this.ensureInitialized();

    const response = await this.octokit!.rest.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });

    const issue = response.data;

    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || null,
      state: issue.state as 'open' | 'closed',
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map((label) => ({
        name: typeof label === 'string' ? label : label.name || '',
        color: typeof label === 'string' ? '' : label.color || '',
      })),
      url: issue.html_url,
    };
  }

  /**
   * Create a new memo (GitHub Issue)
   */
  async createMemo(input: CreateMemoInput): Promise<GitHubMemo> {
    this.ensureInitialized();

    const labels = ['memo', ...(input.labels || [])];

    const response = await this.octokit!.rest.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: input.title,
      body: input.description || '',
      labels,
    });

    const issue = response.data;

    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || null,
      state: issue.state as 'open' | 'closed',
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map((label) => ({
        name: typeof label === 'string' ? label : label.name || '',
        color: typeof label === 'string' ? '' : label.color || '',
      })),
      url: issue.html_url,
    };
  }

  /**
   * Update a memo
   */
  async updateMemo(issueNumber: number, input: UpdateMemoInput): Promise<GitHubMemo> {
    this.ensureInitialized();

    const updateData: any = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.body = input.description;
    }

    if (input.state !== undefined) {
      updateData.state = input.state;
    }

    if (input.labels !== undefined) {
      updateData.labels = ['memo', ...input.labels];
    }

    const response = await this.octokit!.rest.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      ...updateData,
    });

    const issue = response.data;

    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || null,
      state: issue.state as 'open' | 'closed',
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map((label) => ({
        name: typeof label === 'string' ? label : label.name || '',
        color: typeof label === 'string' ? '' : label.color || '',
      })),
      url: issue.html_url,
    };
  }

  /**
   * Delete a memo (close and label as deleted)
   */
  async deleteMemo(issueNumber: number): Promise<void> {
    this.ensureInitialized();

    // Close the issue instead of deleting (GitHub API doesn't support deleting issues)
    await this.octokit!.rest.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      state: 'closed',
      labels: ['memo', 'deleted'],
    });
  }

  /**
   * Add a comment to a memo
   */
  async addComment(issueNumber: number, comment: string): Promise<void> {
    this.ensureInitialized();

    await this.octokit!.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body: comment,
    });
  }
}

// Export singleton instance
export const githubMemoService = new GitHubMemoService();
