import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserTransactions, getUserAccounts } from '../services/api';
import BankingLayout from '../components/BankingLayout';
import TransactionItem from '../components/TransactionItem';

const STATUS_FILTERS = ['All', 'COMPLETED', 'PENDING', 'FAILED'];

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions,   setTransactions]   = useState([]);
  const [accounts,       setAccounts]       = useState([]);
  const [userAccountIds, setUserAccountIds] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [page,           setPage]           = useState(1);
  const [pagination,     setPagination]     = useState({});
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [accountFilter,  setAccountFilter]  = useState('All');  // NEW: per-account filter
  const [search,         setSearch]         = useState('');

  // Load user accounts for direction detection & filter dropdown
  useEffect(() => {
    getUserAccounts()
      .then((res) => {
        const accs = res.data.accounts || [];
        setAccounts(accs);
        setUserAccountIds(accs.map((a) => a._id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const fetchTransactions = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getUserTransactions({ page: p, limit: 20 });
      setTransactions(res.data.transactions || []);
      setPagination(res.data.pagination || {});
      setPage(p);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // ── CLIENT-SIDE FILTERING ──────────────────────────────────────
  const filtered = transactions.filter((tx) => {
    // Status filter
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;

    // Search by TXN ID
    if (search && !tx._id.toLowerCase().includes(search.toLowerCase())) return false;

    // Per-account filter — show only txns involving this specific account
    if (accountFilter !== 'All') {
      const from = String(tx.fromAccount?._id || tx.fromAccount || '');
      const to   = String(tx.toAccount?._id   || tx.toAccount   || '');
      if (from !== accountFilter && to !== accountFilter) return false;
    }

    return true;
  });

  const getAccountLabel = (acc) => {
    const sym = CURRENCY_SYMBOLS[acc.currency] || '';
    return `${acc.currency} · ···${acc._id.slice(-6).toUpperCase()}`;
  };

  return (
    <BankingLayout>
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
            Transaction History
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {pagination.total ? `${pagination.total} total transactions across all accounts` : 'All your banking activity'}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/transfer')}>
          💸 New Transfer
        </button>
      </div>

      {/* ── FILTER BAR ──────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--r-xl)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Row 1: Account filter + Search */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Account Selector */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>
              Filter by Account
            </label>
            <select
              id="account-filter"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--r-md)', color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value="All">🏦 All Accounts (combined)</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.currency === 'INR' ? '🇮🇳' : acc.currency === 'USD' ? '🇺🇸' : '🇪🇺'} {getAccountLabel(acc)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>
              Search by TXN ID
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔍</span>
              <input
                type="text"
                className="has-icon"
                placeholder="Search transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="tx-search"
                style={{ padding: '10px 16px 10px 42px' }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Status filter pills */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px' }}>
            Filter by Status
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--r-full)',
                  border: '1px solid var(--glass-border)',
                  background: statusFilter === s ? 'var(--grad-brand)' : 'var(--glass-bg)',
                  color: statusFilter === s ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  fontFamily: 'var(--font-body)', transition: 'all var(--t-fast)',
                  boxShadow: statusFilter === s ? '0 2px 8px var(--blue-glow-sm)' : 'none',
                }}
              >
                {s}
              </button>
            ))}
            {(statusFilter !== 'All' || accountFilter !== 'All' || search) && (
              <button
                onClick={() => { setStatusFilter('All'); setAccountFilter('All'); setSearch(''); }}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--r-full)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  background: 'var(--danger-bg)', color: 'var(--danger-light)',
                  cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  fontFamily: 'var(--font-body)'
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active filter summary */}
        {accountFilter !== 'All' && (
          <div className="alert alert-info" style={{ margin: 0 }}>
            <span className="alert-icon">🔍</span>
            Showing transactions for account <strong>···{accountFilter.slice(-6).toUpperCase()}</strong> only.
            These are the transactions that <strong>directly involve this specific account</strong>.
          </div>
        )}
      </div>

      {/* ── RESULTS COUNT ───────────────────────────────────────── */}
      {!loading && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Showing <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong> transaction{filtered.length !== 1 ? 's' : ''}
          {accountFilter !== 'All' && ` for account ···${accountFilter.slice(-6).toUpperCase()}`}
        </div>
      )}

      {/* ── TRANSACTION LIST ─────────────────────────────────────── */}
      {error && (
        <div className="alert alert-error"><span className="alert-icon">⚠️</span>{error}</div>
      )}

      {loading ? (
        <div className="loading-spinner" style={{ padding: '80px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <div className="empty-state-title">
            {search || statusFilter !== 'All' || accountFilter !== 'All'
              ? 'No matching transactions'
              : 'No transactions yet'}
          </div>
          <p className="empty-state-desc">
            {search || statusFilter !== 'All' || accountFilter !== 'All'
              ? 'Try clearing your filters or selecting a different account.'
              : 'Add money to an account and make a transfer to see activity here.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(search || statusFilter !== 'All' || accountFilter !== 'All') && (
              <button className="btn btn-secondary" style={{ width: 'auto' }}
                onClick={() => { setStatusFilter('All'); setAccountFilter('All'); setSearch(''); }}>
                Clear Filters
              </button>
            )}
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/dashboard')}>
              💰 Add Money
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="transactions-list">
            {filtered.map((tx, i) => (
              <TransactionItem
                key={tx._id}
                transaction={tx}
                userAccountIds={userAccountIds}
                accounts={accounts}
                index={i}
              />
            ))}
          </div>

          {/* ── PAGINATION ── */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => fetchTransactions(page - 1)}>
                ← Previous
              </button>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Page {page} of {pagination.pages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => fetchTransactions(page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </BankingLayout>
  );
}
