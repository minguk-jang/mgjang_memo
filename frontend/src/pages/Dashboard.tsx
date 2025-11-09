/**
 * Dashboard page - with UpcomingAlarms summary and enhanced UX
 */

import React, { useState } from "react";
import MemoForm from "../components/MemoForm";
import MemoList from "../components/MemoList";
import Header from "../components/Header";
import UpcomingAlarms from "../components/UpcomingAlarms";
import Toast from "../components/Toast";
import { detectUserTimezone } from "../utils/timezone";
import { useAuth } from "../context/AuthContext";

interface Memo {
  id: string;
  title: string;
  next_alarm_time: string | null;
  alarms?: any[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loadedMemos, setLoadedMemos] = useState<Memo[]>([]);
  const userTimezone = detectUserTimezone();

  const handleMemoCreated = () => {
    setToast({ message: 'Saved!', type: 'success' });
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMemoDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  const handleMemosLoaded = (memos: Memo[]) => {
    setLoadedMemos(memos);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header userEmail={user?.email} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Upcoming Alarms Summary Board */}
        <UpcomingAlarms memos={loadedMemos} userTimezone={userTimezone} />

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
              userTimezone={userTimezone}
              onDelete={handleMemoDeleted}
              onMemosLoaded={handleMemosLoaded}
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
