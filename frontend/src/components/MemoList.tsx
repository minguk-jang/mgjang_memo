/**
 * MemoList component for displaying user's memos.
 */

import React, { useEffect, useState } from "react";
import apiClient from "../services/api";
import { getTimeDisplay } from "../utils/timezone";

interface Memo {
  id: string;
  title: string;
  description: string | null;
  next_alarm_time: string | null;
  created_at: string;
}

interface MemoListProps {
  refreshTrigger?: number;
  userTimezone: string;
  onDelete?: () => void;
}

const MemoList: React.FC<MemoListProps> = ({
  refreshTrigger,
  userTimezone,
  onDelete,
}) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchMemos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/memos?skip=0&limit=50");
      setMemos(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch memos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, [refreshTrigger]);

  const handleDelete = async (memoId: string) => {
    if (!window.confirm("Are you sure you want to delete this memo?")) {
      return;
    }

    try {
      await apiClient.delete(`/memos/${memoId}`);
      fetchMemos();

      if (onDelete) {
        onDelete();
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete memo");
    }
  };

  if (loading && memos.length === 0) {
    return <div className="memo-list loading">Loading memos...</div>;
  }

  return (
    <div className="memo-list">
      <h3>Your Memos ({total})</h3>

      {error && <div className="error-message">{error}</div>}

      {memos.length === 0 ? (
        <p className="no-memos">No memos yet. Create one above!</p>
      ) : (
        <div className="memos-grid">
          {memos.map((memo) => (
            <div key={memo.id} className="memo-card">
              <h4>{memo.title}</h4>
              {memo.description && (
                <p className="description">{memo.description}</p>
              )}
              {memo.next_alarm_time && (
                <p className="alarm-time">
                  ⏰ Next alarm:{" "}
                  {getTimeDisplay(memo.next_alarm_time, userTimezone)}
                </p>
              )}
              <div className="memo-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(memo.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoList;
