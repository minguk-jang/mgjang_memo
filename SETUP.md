# GitHub Memo App - Setup Guide

This is a simple memo application that stores your notes as GitHub Issues. No backend server required!

## Features

- ✅ Store memos as GitHub Issues
- ✅ Completely free (uses GitHub as database)
- ✅ No backend server needed
- ✅ Markdown support
- ✅ Labels/tags support
- ✅ GitHub authentication via Personal Access Token

## Prerequisites

- A GitHub account
- A GitHub repository (can be private or public)

## Setup Instructions

### 1. Create or Use a GitHub Repository

You can either:
- Use the existing `mgjang_memo` repository
- Create a new repository on GitHub for storing your memos

### 2. Generate GitHub Personal Access Token (PAT)

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Memo App")
4. Set expiration (recommended: No expiration for personal use, or 90 days)
5. **Select the following scope:**
   - ✅ `repo` (Full control of private repositories)
6. Click "Generate token"
7. **IMPORTANT:** Copy the token immediately (you won't see it again!)

**Direct link to create token:**
https://github.com/settings/tokens/new?scopes=repo&description=Memo%20App

### 3. Configure Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file:
   ```env
   VITE_GITHUB_REPO_OWNER=your-github-username
   VITE_GITHUB_REPO_NAME=mgjang_memo
   VITE_APP_NAME=GitHub Memo App
   ```

   Replace `your-github-username` with your actual GitHub username.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

**Development mode:**
```bash
npm run dev
```

The app will be available at http://localhost:5173

**Build for production:**
```bash
npm run build
```

### 6. Deploy to GitHub Pages

1. Update `vite.config.ts` with your repository name if different
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy to GitHub Pages (the repository already has GitHub Actions configured)

## Usage

### First Time Login

1. Open the application
2. You'll see a login screen asking for your GitHub Personal Access Token
3. Paste the token you created in Step 2
4. Click "Sign In"

The app will verify your token and check access to the repository.

### Creating Memos

1. Fill in the "Title" field (required)
2. Optionally add a "Description" (supports Markdown)
3. Optionally add "Labels" (comma-separated, e.g., `work, important`)
4. Click "Create Memo"

Your memo will be created as a GitHub Issue!

### Viewing Memos

- All your memos are displayed in the right column
- Click "View" to see the memo on GitHub
- Click "Delete" to close the issue (marks it as deleted)

### Managing Memos on GitHub

Since memos are stored as GitHub Issues, you can:
- View them at: `https://github.com/your-username/mgjang_memo/issues`
- Edit them directly on GitHub
- Add comments
- Use GitHub's search and filtering
- Share memos by sharing the issue link

## Architecture

```
Frontend (React + TypeScript)
    ↓
GitHub Personal Access Token
    ↓
GitHub REST API
    ↓
GitHub Issues (Data Storage)
```

### Why GitHub Issues?

- **Free:** No database costs
- **Reliable:** GitHub's infrastructure
- **Accessible:** View/edit from anywhere
- **Searchable:** GitHub's powerful search
- **Markdown:** Native support
- **Version Control:** Full history of changes
- **API:** Well-documented REST API

## Security Notes

- Your GitHub token is stored in browser's localStorage
- Never share your Personal Access Token
- The token has access to all your repositories (with `repo` scope)
- Consider using a fine-grained token for better security
- You can revoke the token anytime from GitHub settings

## Troubleshooting

### "Repository not found" error

- Check that `VITE_GITHUB_REPO_OWNER` and `VITE_GITHUB_REPO_NAME` are correct
- Ensure the repository exists on GitHub
- Verify your token has `repo` scope

### "Invalid token" error

- Check that you copied the entire token
- Verify the token hasn't expired
- Make sure you selected the `repo` scope when creating the token

### Memos not loading

- Check browser console for errors
- Verify the repository exists and you have access
- Try refreshing the page

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── GitHubTokenLogin.tsx
│   │   ├── MemoForm.tsx
│   │   └── MemoList.tsx
│   ├── services/
│   │   └── github.ts      # GitHub API service layer
│   ├── pages/
│   │   └── Dashboard.tsx  # Main dashboard page
│   ├── context/           # React context (auth, theme)
│   └── App.tsx           # Main app component
├── .env                  # Environment variables (create from .env.example)
└── package.json
```

### Tech Stack

- **React 18:** UI framework
- **TypeScript:** Type safety
- **Vite:** Build tool
- **TailwindCSS:** Styling
- **Octokit:** GitHub API client
- **Zustand:** State management (minimal usage)

## FAQ

**Q: Can I use this with a private repository?**
A: Yes! Just make sure your PAT has the `repo` scope.

**Q: Is there a limit on number of memos?**
A: GitHub allows 5000 issues per repository on free plan.

**Q: Can multiple people use the same repository?**
A: Yes, but each person needs their own PAT with access to the repository.

**Q: What happens if I delete a memo?**
A: It closes the GitHub issue and adds a "deleted" label. It doesn't permanently delete it.

**Q: Can I export my memos?**
A: Yes! Use GitHub's export features or the GitHub API to export all issues.

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!
