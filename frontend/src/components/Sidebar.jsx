import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/api';

const NAV_ITEMS = [
  { path: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { path: '/accounts',      icon: '💳', label: 'Accounts' },
  { path: '/transfer',      icon: '💸', label: 'Transfer' },
  { path: '/transactions',  icon: '📋', label: 'Transactions' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💎</div>
          <span className="sidebar-brand-name">NexaPay</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`sidebar-link${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} title="Logout">
          <span className="sidebar-link-icon">🚪</span>
          <span className="sidebar-link-text">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
