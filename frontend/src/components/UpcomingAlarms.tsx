import React, { useMemo } from 'react';
import { getTimeDisplay } from '../utils/timezone';

interface AlarmInfo {
  id: string;
  title: string;
  next_alarm_time: string | null;
  alarm_type?: string;
  channel?: string;
}

interface UpcomingAlarmsProps {
  memos: AlarmInfo[];
  userTimezone: string;
}

const UpcomingAlarms: React.FC<UpcomingAlarmsProps> = ({ memos, userTimezone }) => {
  const upcomingAlarms = useMemo(() => {
    const now = new Date();

    return memos
      .filter(m => m.next_alarm_time)
      .map(m => ({
        ...m,
        timestamp: new Date(m.next_alarm_time!).getTime(),
      }))
      .filter(m => m.timestamp > now.getTime())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 3);
  }, [memos]);

  if (upcomingAlarms.length === 0) {
    return null;
  }

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case 'telegram':
        return '💬';
      case 'email':
        return '📧';
      default:
        return '🔔';
    }
  };

  const getTimeUntil = (timestamp: number) => {
    const now = new Date().getTime();
    const diff = timestamp - now;

    if (diff < 0) return null;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 후`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분 후`;
    } else {
      return `${minutes}분 후`;
    }
  };

  return (
    <div
      className="glass-card rounded-2xl p-5 mb-6"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, rgba(var(--primary-rgb, 59, 130, 246), 0.8) 100%)',
        border: '1px solid var(--ring)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⏰</span>
        <h3 className="text-base font-semibold text-white">다음 알림</h3>
      </div>

      <div className="space-y-2.5">
        {upcomingAlarms.map((alarm, index) => (
          <div
            key={alarm.id}
            className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{getChannelIcon(alarm.channel)}</span>
                <span className="font-medium text-white truncate" title={alarm.title}>
                  {alarm.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>{getTimeDisplay(alarm.next_alarm_time!, userTimezone)}</span>
                <span>•</span>
                <span>{getTimeUntil(alarm.timestamp)}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white/60 shrink-0">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {memos.filter(m => m.next_alarm_time).length > 3 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-white/70">
            +{memos.filter(m => m.next_alarm_time).length - 3}개 더 있음
          </span>
        </div>
      )}
    </div>
  );
};

export default UpcomingAlarms;
