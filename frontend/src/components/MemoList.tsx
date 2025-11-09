/**
 * MemoList component - with alarm toggle and enhanced UX
 */

import React, { useEffect, useState } from "react";
import apiClient from "../services/api";
import { getTimeDisplay } from "../utils/timezone";

interface Alarm {
  id: number;
  enabled: boolean;
  alarm_type?: string;
  channel?: string;
}

interface Memo {
  id: string;
  title: string;
  description: string | null;
  next_alarm_time: string | null;
  created_at: string;
  alarms?: Alarm[];
}

interface MemoListProps {
  refreshTrigger?: number;
  userTimezone: string;
  onDelete?: () => void;
  onMemosLoaded?: (memos: Memo[]) => void;
}

const MemoList: React.FC<MemoListProps> = ({
  refreshTrigger,
  userTimezone,
  onDelete,
  onMemosLoaded,
}) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [togglingAlarm, setTogglingAlarm] = useState<number | null>(null);

  const fetchMemos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get("/memos?skip=0&limit=50");
      const data = response.data;
      const memoItems = Array.isArray(data) ? data : data?.items || [];
      const totalCount = Array.isArray(data)
        ? data.length
        : data?.total ?? memoItems.length;

      setMemos(memoItems);
      setTotal(totalCount);

      if (onMemosLoaded) {
        onMemosLoaded(memoItems);
      }
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

  const handleToggleAlarm = async (alarmId: number, currentEnabled: boolean) => {
    setTogglingAlarm(alarmId);

    try {
      await apiClient.patch(`/alarms/${alarmId}`, {
        enabled: !currentEnabled,
      });
      // Refresh memo list to show updated alarm status
      fetchMemos();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to toggle alarm");
    } finally {
      setTogglingAlarm(null);
    }
  };

  const getAlarmStatusIcon = (alarm?: Alarm) => {
    if (!alarm) return null;
    if (!alarm.enabled) return '🔕';

    switch (alarm.channel) {
      case 'telegram':
        return '💬';
      case 'email':
        return '📧';
      default:
        return '🔔';
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
      <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text)' }}>
        Your Memos ({total})
      </h2>

      {error && (
        <div className="px-4 py-3 rounded-xl mb-4" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {memos.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <p className="text-base">No memos yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-2">
          {memos.map((memo) => {
            const alarm = memo.alarms && memo.alarms.length > 0 ? memo.alarms[0] : undefined;

            return (
              <div
                key={memo.id}
                className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--ring)',
                  opacity: alarm && !alarm.enabled ? 0.6 : 1,
                }}
              >
                {/* Title & Controls */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3
                    className="text-base font-semibold truncate flex-1"
                    style={{ color: 'var(--text)' }}
                    title={memo.title}
                  >
                    {memo.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Alarm Toggle */}
                    {alarm && (
                      <button
                        onClick={() => handleToggleAlarm(alarm.id, alarm.enabled)}
                        disabled={togglingAlarm === alarm.id}
                        className="p-1.5 rounded-lg transition-all duration-200 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
                        style={{
                          background: alarm.enabled ? 'var(--card-hover)' : 'transparent',
                          border: '1px solid var(--ring)',
                        }}
                        title={alarm.enabled ? '알람 비활성화' : '알람 활성화'}
                        aria-label={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                      >
                        <span className="text-lg">{getAlarmStatusIcon(alarm)}</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(memo.id)}
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

                {/* Description */}
                {memo.description && (
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {memo.description}
                  </p>
                )}

                {/* Alarm Time */}
                {memo.next_alarm_time && alarm?.enabled && (
                  <div
                    className="flex items-center justify-between text-xs py-2 px-3 rounded-lg"
                    style={{
                      background: 'var(--card-hover)',
                      color: 'var(--primary)',
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span role="img" aria-label="alarm">⏰</span>
                      <span className="font-medium">Next alarm</span>
                    </span>
                    <span className="font-semibold text-right">
                      {getTimeDisplay(memo.next_alarm_time, userTimezone)}
                    </span>
                  </div>
                )}

                {/* Disabled alarm indicator */}
                {alarm && !alarm.enabled && (
                  <div
                    className="text-xs py-2 px-3 rounded-lg text-center"
                    style={{
                      background: 'var(--card-hover)',
                      color: 'var(--muted)',
                    }}
                  >
                    알람이 비활성화되었습니다
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoList;
