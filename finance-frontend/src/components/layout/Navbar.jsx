import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-surface-700)',
      }}
    >
      <button
        className="btn btn-ghost p-2 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="btn btn-ghost p-2 rounded-lg"
          aria-label="Toggle theme"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="btn btn-ghost p-2 rounded-lg relative" aria-label="Notifications">
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-primary-500)' }}
          />
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ml-1 cursor-pointer"
          style={{ background: 'var(--color-primary-600)', color: 'white' }}
          title={user?.email}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
