import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 1500 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success'
    ? '#10B981'
    : type === 'error'
    ? '#EF4444'
    : 'var(--primary)';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 toast-enter"
      role="alert"
      aria-live="polite"
    >
      <div
        className="px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 min-w-[280px]"
        style={{
          background: bgColor,
          color: '#FFFFFF',
        }}
      >
        <span className="text-xl">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
