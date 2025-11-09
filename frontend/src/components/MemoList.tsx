/**
 * MemoList component - Using GitHub Issues as storage
 */

import React, { useEffect, useState } from "react";
import { githubMemoService, GitHubMemo } from "../services/github";

interface MemoListProps {
  refreshTrigger?: number;
  onDelete?: () => void;
  onMemosLoaded?: (memos: GitHubMemo[]) => void;
}

const MemoList: React.FC<MemoListProps> = ({
  refreshTrigger,
  onDelete,
  onMemosLoaded,
}) => {
  const [memos, setMemos] = useState<GitHubMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMemos = async () => {
    setLoading(true);
    setError("");

    try {
      const memoList = await githubMemoService.listMemos('open');
      setMemos(memoList);

      if (onMemosLoaded) {
        onMemosLoaded(memoList);
      }
    } catch (err: any) {
      console.error("Failed to fetch memos:", err);
      setError(err.message || "Failed to fetch memos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, [refreshTrigger]);

  const handleDelete = async (issueNumber: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await githubMemoService.deleteMemo(issueNumber);
      fetchMemos();

      if (onDelete) {
        onDelete();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete memo");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && memos.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3" style={{ color: 'var(--muted)' }}>
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading memos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Your Memos ({memos.length})
        </h2>
        <a
          href={memos.length > 0 ? memos[0].url.replace(/\/\d+$/, '') : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80"
          style={{
            background: 'var(--card-hover)',
            color: 'var(--primary)',
          }}
        >
          View on GitHub →
        </a>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl mb-4" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {memos.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <p className="text-base mb-2">No memos yet. Create one!</p>
          <p className="text-sm">Memos are stored as GitHub Issues</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-2">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--ring)',
              }}
            >
              {/* Header: Title & Actions */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold truncate"
                    style={{ color: 'var(--text)' }}
                    title={memo.title}
                  >
                    {memo.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      #{memo.number}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      •
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {formatDate(memo.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* View on GitHub */}
                  <a
                    href={memo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{
                      background: 'var(--card-hover)',
                      color: 'var(--primary)',
                    }}
                  >
                    View
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(memo.number, memo.title)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                    }}
                    aria-label={`Delete ${memo.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Body/Description */}
              {memo.body && (
                <p className="text-sm mb-3 line-clamp-3 whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>
                  {memo.body}
                </p>
              )}

              {/* Labels */}
              {memo.labels && memo.labels.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {memo.labels
                    .filter(label => label.name !== 'memo')
                    .map((label) => (
                      <span
                        key={label.name}
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: `#${label.color}20`,
                          color: `#${label.color}`,
                          border: `1px solid #${label.color}40`,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoList;
