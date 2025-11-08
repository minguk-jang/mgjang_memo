/**
 * MemoForm component for creating/editing memos with daily alarms.
 */

import React, { useState } from "react";
import apiClient from "../services/api";

interface MemoFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ onSuccess, onError }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alarmTime, setAlarmTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create memo
      const memoResponse = await apiClient.post("/memos", {
        title,
        description,
      });

      const memoId = memoResponse.data.id;

      // Create daily alarm
      await apiClient.post("/alarms", {
        memo_id: memoId,
        scheduled_time: alarmTime,
        recurrence_type: "daily",
      });

      // Clear form
      setTitle("");
      setDescription("");
      setAlarmTime("09:00");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to create memo";
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="memo-form">
      <h3>Create New Memo</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter memo title"
          required
          maxLength={255}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter memo description (optional)"
          maxLength={2000}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="alarmTime">Daily Alarm Time *</label>
        <input
          id="alarmTime"
          type="time"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Memo with Daily Alarm"}
      </button>
    </form>
  );
};

export default MemoForm;
