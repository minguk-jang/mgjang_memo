/**
 * Dashboard page - GitHub Issues based memo system
 */

import React, { useState } from "react";
import MemoForm from "../components/MemoForm";
import MemoList from "../components/MemoList";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import config from "../config";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleMemoCreated = () => {
    console.log('handleMemoCreated called');
    setToast({ message: 'Memo created successfully!', type: 'success' });

    // Add a small delay to allow GitHub to process the new issue
    setTimeout(() => {
      setRefreshTrigger((prev) => {
        console.log('Updating refreshTrigger from', prev, 'to', prev + 1);
        return prev + 1;
      });
    }, 500); // 500ms delay
  };

  const handleMemoDeleted = () => {
    setToast({ message: 'Memo deleted', type: 'info' });
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header userEmail={user?.email} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--ring)',
          }}
        >
          <span className="text-xl">📝</span>
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>
              GitHub-powered Memos
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Your memos are stored as GitHub Issues in{" "}
              <code className="px-1 py-0.5 rounded bg-black bg-opacity-10 font-mono text-xs">
                {config.githubMemoRepo.owner || user?.github_login}/{config.githubMemoRepo.repo}
              </code>
            </p>
          </div>
        </div>

        {/* 2-Column Layout: Mobile 1-col, Desktop 2-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Memo Form */}
          <div>
            <MemoForm
              onSuccess={handleMemoCreated}
              onError={handleError}
            />
          </div>

          {/* Right Column: Memo List */}
          <div>
            <MemoList
              refreshTrigger={refreshTrigger}
              onDelete={handleMemoDeleted}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
