import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAccounts, getAccountBalance, createAccount, logoutUser } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCurrency, setCreateCurrency] = useState('INR');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getUserAccounts();
      const accs = res.data.accounts || [];
      setAccounts(accs);

      // Fetch balances for each account
      const balancePromises = accs.map(async (acc) => {
        try {
          const balRes = await getAccountBalance(acc._id);
          return { id: acc._id, balance: balRes.data.balance };
        } catch {
          return { id: acc._id, balance: null };
        }
      });
      const balanceResults = await Promise.all(balancePromises);
      const balanceMap = {};
      balanceResults.forEach((b) => { balanceMap[b.id] = b.balance; });
      setBalances(balanceMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Still logout locally
    }
    logout();
    navigate('/login');
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      await createAccount({ currency: createCurrency });
      setShowCreateModal(false);
      setSuccess('Account created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreateLoading(false);
    }
  };

  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (b || 0), 0);

  const getCurrencySymbol = (currency) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€' };
    return symbols[currency] || currency;
  };

  const formatBalance = (balance, currency) => {
    if (balance === null || balance === undefined) return '...';
    return `${getCurrencySymbol(currency)}${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Ledger</div>
        <div className="nav-right">
          <span className="user-info">
            Hello, <strong>{user?.name || user?.email || 'User'}</strong>
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Accounts</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Accounts</div>
            <div className="stat-value positive">
              {accounts.filter((a) => a.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Combined Balance</div>
            <div className="stat-value">
              {loading ? '...' : `₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </div>
          </div>
        </div>

        {/* Accounts */}
        <div className="section-header">
          <h2>Your Accounts</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transfer')}>
              💸 Transfer
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              + New Account
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏦</div>
            <p>No accounts yet. Create your first account to get started.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              + Create Account
            </button>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((acc, i) => (
              <div className="account-card" key={acc._id} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="account-header">
                  <span className="account-id">{acc._id.slice(-8).toUpperCase()}</span>
                  <span className={`account-status ${acc.status.toLowerCase()}`}>
                    {acc.status}
                  </span>
                </div>
                <div className="account-balance">
                  {formatBalance(balances[acc._id], acc.currency)}
                </div>
                <div className="account-currency">
                  <span className="currency-badge">{acc.currency}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Account</h2>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={createCurrency}
                  onChange={(e) => setCreateCurrency(e.target.value)}
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
