import React from 'react';

export type AlarmType = 'none' | 'once' | 'repeat';
export type RepeatInterval = 'daily' | 'weekly' | 'monthly';
export type NotificationChannel = 'telegram' | 'email' | 'none';

export interface AlarmConfig {
  alarmType: AlarmType;
  alarmDateTime?: string; // ISO datetime string for 'once' type
  repeatInterval?: RepeatInterval;
  scheduledTime?: string; // HH:MM for 'repeat' type
  channel: NotificationChannel;
}

interface AlarmSettingsProps {
  value: AlarmConfig;
  onChange: (config: AlarmConfig) => void;
  disabled?: boolean;
}

const AlarmSettings: React.FC<AlarmSettingsProps> = ({ value, onChange, disabled = false }) => {
  const handleAlarmTypeChange = (type: AlarmType) => {
    const newConfig: AlarmConfig = {
      ...value,
      alarmType: type,
    };

    // Set defaults based on type
    if (type === 'none') {
      newConfig.channel = 'none';
    } else if (type === 'once') {
      newConfig.channel = value.channel === 'none' ? 'telegram' : value.channel;
      // Set default to tomorrow 9:00 AM KST
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      newConfig.alarmDateTime = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    } else if (type === 'repeat') {
      newConfig.channel = value.channel === 'none' ? 'telegram' : value.channel;
      newConfig.repeatInterval = value.repeatInterval || 'daily';
      newConfig.scheduledTime = value.scheduledTime || '09:00';
    }

    onChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="pb-3" style={{ borderBottom: '1px solid var(--ring)' }}>
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span role="img" aria-label="bell">🔔</span>
          알람 설정
        </h3>
      </div>

      {/* Alarm Type Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="alarmType"
            value="none"
            checked={value.alarmType === 'none'}
            onChange={() => handleAlarmTypeChange('none')}
            disabled={disabled}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: 'var(--primary)' }}
          />
          <span className="text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text)' }}>
            알림 안 함
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="alarmType"
            value="once"
            checked={value.alarmType === 'once'}
            onChange={() => handleAlarmTypeChange('once')}
            disabled={disabled}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: 'var(--primary)' }}
          />
          <span className="text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text)' }}>
            지정 시간에 한 번 보내기
          </span>
        </label>

        {value.alarmType === 'once' && (
          <div className="ml-7 mt-2">
            <input
              type="datetime-local"
              value={value.alarmDateTime || ''}
              onChange={(e) => onChange({ ...value, alarmDateTime: e.target.value })}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                background: 'var(--card)',
                color: 'var(--text)',
                border: '1px solid var(--ring)',
              }}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
              한국 시간(KST) 기준
            </p>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="alarmType"
            value="repeat"
            checked={value.alarmType === 'repeat'}
            onChange={() => handleAlarmTypeChange('repeat')}
            disabled={disabled}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: 'var(--primary)' }}
          />
          <span className="text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text)' }}>
            반복적으로 보내기
          </span>
        </label>

        {value.alarmType === 'repeat' && (
          <div className="ml-7 space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                반복 주기
              </label>
              <select
                value={value.repeatInterval || 'daily'}
                onChange={(e) => onChange({ ...value, repeatInterval: e.target.value as RepeatInterval })}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{
                  background: 'var(--card)',
                  color: 'var(--text)',
                  border: '1px solid var(--ring)',
                }}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                알람 시간
              </label>
              <input
                type="time"
                value={value.scheduledTime || '09:00'}
                onChange={(e) => onChange({ ...value, scheduledTime: e.target.value })}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                style={{
                  background: 'var(--card)',
                  color: 'var(--text)',
                  border: '1px solid var(--ring)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notification Channel (only if alarm is enabled) */}
      {value.alarmType !== 'none' && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
            송신 방식
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.channel === 'telegram'}
                onChange={(e) => onChange({ ...value, channel: e.target.checked ? 'telegram' : 'none' })}
                disabled={disabled}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: 'var(--primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text)' }}>Telegram</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50">
              <input
                type="checkbox"
                checked={value.channel === 'email'}
                disabled={true}
                className="w-4 h-4"
              />
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Email (준비중)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmSettings;
