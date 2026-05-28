import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/api';

const PAGE_META = {
  '/dashboard':     { title: 'Dashboard',         subtitle: 'Your financial overview' },
  '/accounts':      { title: 'Accounts',           subtitle: 'Manage your bank accounts' },
  '/transfer':      { title: 'Transfer Funds',     subtitle: 'Send money securely' },
  '/transactions':  { title: 'Transactions',       subtitle: 'Your transaction history' },
};

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const meta = PAGE_META[location.pathname] || { title: 'NexaPay', subtitle: '' };

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{meta.title}</span>
        {meta.subtitle && <span className="topbar-subtitle">{meta.subtitle}</span>}
      </div>
      <div className="topbar-right">
        <button
          className="topbar-btn"
          onClick={() => navigate('/transfer')}
          style={{ display: location.pathname === '/transfer' ? 'none' : 'flex' }}
        >
          ✈️ New Transfer
        </button>
        <button className="icon-btn" title="Sign out" onClick={handleLogout}>🚪</button>
      </div>
    </header>
  );
}
