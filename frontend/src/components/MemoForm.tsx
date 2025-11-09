/**
 * MemoForm component - Refactored with flexible alarm scheduling
 */

import React, { useState } from "react";
import apiClient from "../services/api";
import AlarmSettings, { AlarmConfig } from "./AlarmSettings";

interface MemoFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MemoForm: React.FC<MemoFormProps> = ({ onSuccess, onError }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig>({
    alarmType: 'repeat',
    repeatInterval: 'daily',
    scheduledTime: '09:00',
    channel: 'telegram',
  });
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

      // Create alarm if not 'none'
      if (alarmConfig.alarmType !== 'none') {
        const alarmData: any = {
          memo_id: memoId,
          alarm_type: alarmConfig.alarmType,
          channel: alarmConfig.channel,
          user_timezone: 'Asia/Seoul',
        };

        if (alarmConfig.alarmType === 'once' && alarmConfig.alarmDateTime) {
          alarmData.alarm_time = new Date(alarmConfig.alarmDateTime).toISOString();
        } else if (alarmConfig.alarmType === 'repeat') {
          alarmData.repeat_interval = alarmConfig.repeatInterval;
          alarmData.scheduled_time = alarmConfig.scheduledTime;
          // For backward compatibility with existing API
          alarmData.recurrence_type = alarmConfig.repeatInterval;
        }

        await apiClient.post("/alarms", alarmData);
      }

      // Clear form
      setTitle("");
      setDescription("");
      setAlarmConfig({
        alarmType: 'repeat',
        repeatInterval: 'daily',
        scheduledTime: '09:00',
        channel: 'telegram',
      });

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
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text)' }}>
        Create New Memo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-xl" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

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
            placeholder="Enter memo description (optional)"
            maxLength={2000}
            rows={3}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            style={{
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--ring)',
            }}
          />
        </div>

        {/* Alarm Settings */}
        <AlarmSettings
          value={alarmConfig}
          onChange={setAlarmConfig}
          disabled={loading}
        />

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
