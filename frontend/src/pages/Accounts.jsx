import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAccounts, getAccountBalance, createAccount, deleteAccount } from '../services/api';
import BankingLayout from '../components/BankingLayout';
import AccountCard from '../components/AccountCard';

export default function Accounts() {
  const navigate = useNavigate();

  const [accounts,        setAccounts]        = useState([]);
  const [balances,        setBalances]        = useState({});
  const [loading,         setLoading]         = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCurrency,  setCreateCurrency]  = useState('INR');
  const [createLoading,   setCreateLoading]   = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res  = await getUserAccounts();
      const accs = res.data.accounts || [];
      setAccounts(accs);

      const bMap = {};
      await Promise.all(accs.map(async (acc) => {
        try {
          const r = await getAccountBalance(acc._id);
          bMap[acc._id] = r.data.balance;
        } catch { bMap[acc._id] = 0; }
      }));
      setBalances(bMap);
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleDelete = async (accountId) => {
    if (!window.confirm("⚠️ Are you sure you want to close and permanently delete this account?\n\nThis will remove all transaction history associated with it, and the account balance must be exactly ₹0.00.")) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await deleteAccount(accountId);
      setSuccess(`✅ ${res.data.message || 'Account deleted successfully!'}`);
      setTimeout(() => setSuccess(''), 4000);
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      await createAccount({ currency: createCurrency });
      setShowCreateModal(false);
      setSuccess('✅ Account created successfully!');
      setTimeout(() => setSuccess(''), 4000);
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreateLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <BankingLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
            Your Accounts
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} · Manage and monitor all your balances
          </p>
        </div>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowCreateModal(true)}>
          ＋ New Account
        </button>
      </div>

      {/* Alerts */}
      {error   && <div className="alert alert-error"  ><span className="alert-icon">⚠️</span>{error  }</div>}
      {success && <div className="alert alert-success"><span className="alert-icon">✅</span>{success}</div>}

      {/* Bank Cards Row */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">💳</span>
          <div className="empty-state-title">No accounts yet</div>
          <p className="empty-state-desc">Open your first bank account to get started with NexaPay.</p>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowCreateModal(true)}>
            ＋ Open First Account
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable Cards */}
          <div className="accounts-scroll" style={{ marginBottom: '32px' }}>
            {accounts.map((acc, i) => (
              <AccountCard
                key={acc._id}
                account={acc}
                balance={balances[acc._id]}
                index={i}
              />
            ))}
          </div>

          {/* Account Detail List */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden'
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                padding: '14px 24px',
                borderBottom: '1px solid var(--glass-border)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: 'var(--text-muted)'
              }}
            >
              <span>Account ID</span>
              <span>Currency</span>
              <span>Status</span>
              <span>Balance</span>
              <span>Actions</span>
            </div>

            {accounts.map((acc) => {
              const sym = acc.currency === 'INR' ? '₹' : acc.currency === 'USD' ? '$' : '€';
              const bal = balances[acc._id];
              const balStr = bal !== null && bal !== undefined
                ? `${sym}${bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '···';

              return (
                <div
                  key={acc._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                    padding: '18px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    alignItems: 'center',
                    transition: 'background var(--t-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onClick={() => copyToClipboard(acc._id)}
                    title="Click to copy full ID"
                  >
                    ···{acc._id.slice(-8).toUpperCase()} 📋
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{acc.currency}</span>
                  <span>
                    <span
                      className={`transaction-status-badge ${
                        acc.status === 'ACTIVE' ? 'badge-completed' :
                        acc.status === 'FROZEN' ? 'badge-pending' : 'badge-failed'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {balStr}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => navigate('/transfer')}
                      title="Send from this account"
                    >
                      💸 Send
                    </button>
                    <button
                      className="btn btn-danger btn-xs"
                      style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleDelete(acc._id)}
                      title="Close Account"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── CREATE ACCOUNT MODAL ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Open New Account</span>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Select a currency for your new account. Each account has its own separate balance.
            </p>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="new-currency">Currency</label>
                <select
                  id="new-currency"
                  value={createCurrency}
                  onChange={(e) => setCreateCurrency(e.target.value)}
                >
                  <option value="INR">🇮🇳 INR — Indian Rupee</option>
                  <option value="USD">🇺🇸 USD — US Dollar</option>
                  <option value="EUR">🇪🇺 EUR — Euro</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : '✅ Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BankingLayout>
  );
}
