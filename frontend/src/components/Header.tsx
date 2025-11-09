import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  userEmail?: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 glass-card" style={{ background: 'var(--card)', borderBottom: '1px solid var(--ring)' }}>
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="memo icon">📋</span>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              Telegram Memo Alert System
            </h1>
          </div>

          {/* Right: User Info, Theme Toggle & Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:inline" style={{ color: 'var(--muted)' }}>
              {userEmail || 'User'}
            </span>
            <div className="h-6 w-px hidden sm:block" style={{ background: 'var(--ring)' }} />
            <ThemeToggle />
            <div className="h-6 w-px hidden sm:block" style={{ background: 'var(--ring)' }} />
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
              }}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
