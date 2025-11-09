/**
 * MemoForm component - Using GitHub Issues as storage
 */

import React, { useState } from "react";
import { githubMemoService } from "../services/github";

interface MemoFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ onSuccess, onError }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Parse labels (comma-separated)
      const labelArray = labels
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      await githubMemoService.createMemo({
        title,
        description: description || undefined,
        labels: labelArray.length > 0 ? labelArray : undefined,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setLabels("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Failed to create memo:", err);
      const errorMsg = err.message || "Failed to create memo";
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text)' }}>
        Create New Memo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter memo title"
            required
            maxLength={255}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--ring)',
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter memo description (optional, supports Markdown)"
            maxLength={5000}
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--ring)',
            }}
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
            Markdown formatting is supported
          </p>
        </div>

        {/* Labels/Tags */}
        <div>
          <label
            htmlFor="labels"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text)' }}
          >
            Labels
          </label>
          <input
            id="labels"
            type="text"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            placeholder="work, personal, important (comma-separated)"
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--ring)',
            }}
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
            Optional. Separate multiple labels with commas.
          </p>
        </div>

        {/* Info Box */}
        <div
          className="p-3 rounded-lg text-xs"
          style={{
            background: 'var(--card-hover)',
            color: 'var(--muted)',
            border: '1px solid var(--ring)',
          }}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm">ℹ️</span>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>
                Stored as GitHub Issue
              </p>
              <p>
                Your memo will be created as a GitHub Issue in your repository. You can view, edit, and manage it directly on GitHub.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          {loading ? "Creating..." : "Create Memo"}
        </button>
      </form>
    </div>
  );
};

export default MemoForm;
