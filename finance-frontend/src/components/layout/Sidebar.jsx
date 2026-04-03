import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BarChart2, Users,
  LogOut, TrendingUp, X, DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, roles: ['viewer','analyst','admin'] },
  { to: '/records',   label: 'Records',    icon: FileText,         roles: ['viewer','analyst','admin'] },
  { to: '/analytics', label: 'Analytics',  icon: BarChart2,        roles: ['analyst','admin'] },
  { to: '/users',     label: 'Users',      icon: Users,            roles: ['admin'] },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase() || 'viewer';

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 flex flex-col
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'var(--color-surface-900)',
          borderRight: '1px solid var(--color-surface-700)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-primary-600)' }}
            >
              <DollarSign size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--color-surface-50)' }}>
              FinanceAI
            </span>
          </div>
          <button className="btn btn-ghost p-1.5 lg:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div
          className="px-3 py-4 border-t"
          style={{ borderColor: 'var(--color-surface-700)' }}
        >
          <div className="flex items-center gap-3 px-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--color-primary-600)', color: 'white' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-surface-100)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-xs truncate capitalize" style={{ color: 'var(--color-surface-400)' }}>
                {user?.role || 'viewer'}
              </p>
            </div>
          </div>
          <button className="sidebar-link w-full" onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
