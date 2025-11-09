import React, { useMemo } from 'react';
import { getTimeDisplay } from '../utils/timezone';

interface AlarmInfo {
  title: string;
  next_alarm_time: string;
}

interface TodayBannerProps {
  upcomingAlarms: AlarmInfo[];
  userTimezone: string;
}

const TodayBanner: React.FC<TodayBannerProps> = ({ upcomingAlarms, userTimezone }) => {
  const nextAlarm = useMemo(() => {
    if (!upcomingAlarms || upcomingAlarms.length === 0) return null;

    // Sort by next alarm time and get the earliest
    const sorted = [...upcomingAlarms]
      .filter(a => a.next_alarm_time)
      .sort((a, b) => new Date(a.next_alarm_time).getTime() - new Date(b.next_alarm_time).getTime());

    return sorted[0] || null;
  }, [upcomingAlarms]);

  const timeUntilAlarm = useMemo(() => {
    if (!nextAlarm?.next_alarm_time) return null;

    const now = new Date();
    const alarmTime = new Date(nextAlarm.next_alarm_time);
    const diff = alarmTime.getTime() - now.getTime();

    if (diff < 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [nextAlarm]);

  const progressPercentage = useMemo(() => {
    if (!nextAlarm?.next_alarm_time) return 0;

    const now = new Date();
    const alarmTime = new Date(nextAlarm.next_alarm_time);
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const totalDayMs = 24 * 60 * 60 * 1000;
    const elapsedMs = now.getTime() - dayStart.getTime();
    const alarmMs = alarmTime.getTime() - dayStart.getTime();

    if (alarmMs <= 0 || alarmMs > totalDayMs) return 0;

    const progress = (elapsedMs / alarmMs) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [nextAlarm]);

  if (!nextAlarm) return null;

  return (
    <div
      className="glass-card rounded-2xl p-6 mb-6"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)',
        opacity: 0.95,
        border: '1px solid var(--ring)',
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl" role="img" aria-label="alarm">⏰</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 mb-1">Next Alarm</p>
              <p className="text-lg font-semibold text-white truncate" title={nextAlarm.title}>
                {nextAlarm.title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">
                {getTimeDisplay(nextAlarm.next_alarm_time, userTimezone)}
              </p>
              {timeUntilAlarm && (
                <p className="text-xs text-white/70 mt-1">in {timeUntilAlarm}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayBanner;
