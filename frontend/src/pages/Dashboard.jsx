import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAccounts, getAccountBalance, createAccount, depositFunds, deleteAccount } from '../services/api';
import { getUserTransactions } from '../services/api';
import BankingLayout from '../components/BankingLayout';
import AccountCard from '../components/AccountCard';
import TransactionItem from '../components/TransactionItem';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts,        setAccounts]        = useState([]);
  const [balances,        setBalances]        = useState({});
  const [transactions,    setTransactions]    = useState([]);
  const [activeCardId,    setActiveCardId]    = useState(null); // Selected card filter
  const [loading,         setLoading]         = useState(true);
  const [txLoading,       setTxLoading]       = useState(true);

  // Modals
  const [showCreateModal,  setShowCreateModal]  = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showIdModal,      setShowIdModal]      = useState(false);
  const [selectedAccount,  setSelectedAccount]  = useState(null);

  // Form state
  const [createCurrency,  setCreateCurrency]  = useState('INR');
  const [depositAmount,   setDepositAmount]   = useState('');
  const [depositAccountId, setDepositAccountId] = useState('');

  // Loading/feedback
  const [createLoading,  setCreateLoading]  = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [copied,  setCopied]  = useState('');

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
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
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await getUserTransactions({ limit: 5 });
      setTransactions(res.data.transactions || []);
    } catch {
      /* non-critical */
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  // ── Derived Stats ──────────────────────────────────────────────
  const totalBalance   = Object.values(balances).reduce((s, b) => s + (b || 0), 0);
  const activeCount    = accounts.filter((a) => a.status === 'ACTIVE').length;
  const userAccountIds = accounts.map((a) => a._id);

  // ── Handlers ──────────────────────────────────────────────────
  const handleCopy = (text, label) => {
    copyText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const openDepositModal = (acc) => {
    setSelectedAccount(acc);
    setDepositAccountId(acc._id);
    setDepositAmount('');
    setError('');
    setShowDepositModal(true);
  };

  const openIdModal = (acc) => {
    setSelectedAccount(acc);
    setShowIdModal(true);
  };

  const handleCreateAccount = async (e) => {
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

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setDepositLoading(true);
    setError('');
    try {
      const res = await depositFunds({ accountId: depositAccountId, amount: Number(depositAmount) });
      setShowDepositModal(false);
      setSuccess(`✅ ₹${Number(depositAmount).toLocaleString('en-IN')} deposited successfully!`);
      setTimeout(() => setSuccess(''), 4000);
      await fetchAccounts();
      await fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
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
      await fetchTransactions();
      if (activeCardId === accountId) {
        setActiveCardId(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <BankingLayout>
      {/* Alerts */}
      {error   && <div className="alert alert-error"  ><span className="alert-icon">⚠️</span>{error  }</div>}
      {success && <div className="alert alert-success"><span className="alert-icon">✅</span>{success}</div>}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-greeting">{getGreeting()},</div>
        <div className="dashboard-hero-name">{user?.name || user?.email || 'User'} 👋</div>

        <div className="dashboard-hero-balance-label">Total Balance (All Accounts)</div>
        <div className="dashboard-hero-balance">
          <span className="dashboard-hero-currency">₹</span>
          {loading
            ? '···'
            : totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-hero-actions">
          <button id="qa-add-money"    className="quick-action-btn" onClick={() => {
            if (accounts.length > 0) openDepositModal(accounts[0]);
            else { setError('Create an account first!'); }
          }}>
            <span className="quick-action-icon">💰</span>Add Money
          </button>
          <button id="qa-transfer"     className="quick-action-btn" onClick={() => navigate('/transfer')}>
            <span className="quick-action-icon">💸</span>Transfer
          </button>
          <button id="qa-my-id"        className="quick-action-btn" onClick={() => {
            if (accounts.length > 0) openIdModal(accounts[0]);
            else { setError('Create an account first!'); }
          }}>
            <span className="quick-action-icon">🪪</span>My Account ID
          </button>
          <button id="qa-transactions" className="quick-action-btn" onClick={() => navigate('/transactions')}>
            <span className="quick-action-icon">📋</span>History
          </button>
          <button id="qa-add-account"  className="quick-action-btn" onClick={() => setShowCreateModal(true)}>
            <span className="quick-action-icon">➕</span>New Account
          </button>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card" style={{ animationDelay: '0s' }}>
          <div className="stat-card-icon">🏦</div>
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value accent">{accounts.length}</div>
          <div className="stat-change">Across all currencies</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '0.08s' }}>
          <div className="stat-card-icon">✅</div>
          <div className="stat-label">Active Accounts</div>
          <div className="stat-value positive">{activeCount}</div>
          <div className="stat-change">{accounts.length - activeCount > 0 ? `${accounts.length - activeCount} inactive` : 'All active'}</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '0.16s' }}>
          <div className="stat-card-icon">📋</div>
          <div className="stat-label">Recent Transactions</div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-change">Last 5 shown</div>
        </div>
      </div>

      {/* ── ACCOUNT CARDS ────────────────────────────────────── */}
      <div className="accounts-section">
        <div className="section-header">
          <span className="section-title">Your Accounts</span>
          <div className="section-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/accounts')}>View All</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>＋ New Account</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🏦</span>
            <div className="empty-state-title">No accounts yet</div>
            <p className="empty-state-desc">Create your first bank account to get started.</p>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowCreateModal(true)}>
              ＋ Create First Account
            </button>
          </div>
        ) : (
          <>
            {/* Card Carousel */}
            <div className="accounts-scroll" style={{ marginBottom: '16px' }}>
              {accounts.map((acc, i) => (
                <AccountCard
                  key={acc._id}
                  account={acc}
                  balance={balances[acc._id]}
                  index={i}
                  selected={activeCardId === acc._id}
                  onClick={(clickedAcc) => {
                    setActiveCardId(prev => prev === clickedAcc._id ? null : clickedAcc._id);
                  }}
                />
              ))}
            </div>

            {/* Account Action Rows */}
            {accounts.map((acc) => {
              const sym = CURRENCY_SYMBOLS[acc.currency] || '₹';
              const bal = balances[acc._id];
              return (
                <div
                  key={acc._id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', marginBottom: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--r-lg)',
                    gap: '16px', flexWrap: 'wrap'
                  }}
                >
                  {/* Left: ID + currency */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ fontSize: '22px' }}>
                      {acc.currency === 'INR' ? '🇮🇳' : acc.currency === 'USD' ? '🇺🇸' : '🇪🇺'}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                        Account ID (click to copy)
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '13px',
                          color: 'var(--blue-300)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                        onClick={() => handleCopy(acc._id, acc._id)}
                        title="Click to copy full Account ID"
                      >
                        {acc._id}
                        <span style={{ fontSize: '14px' }}>
                          {copied === acc._id ? '✅' : '📋'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Balance */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Balance</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
                      {bal !== null && bal !== undefined
                        ? `${sym}${bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : '···'}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success btn-sm"
                      style={{ width: 'auto' }}
                      onClick={() => openDepositModal(acc)}
                    >
                      💰 Add Money
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: 'auto' }}
                      onClick={() => navigate('/transfer')}
                    >
                      💸 Send
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: 'auto' }}
                      onClick={() => openIdModal(acc)}
                      title="Show & Copy Account ID"
                    >
                      🪪 My ID
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ width: 'auto' }}
                      onClick={() => handleDeleteAccount(acc._id)}
                      title="Close Account"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── RECENT TRANSACTIONS ──────────────────────────────── */}
      {(() => {
        const filteredTransactions = transactions.filter((tx) => {
          if (!activeCardId) return true;
          const from = String(tx.fromAccount?._id || tx.fromAccount || '');
          const to   = String(tx.toAccount?._id   || tx.toAccount   || '');
          return from === activeCardId || to === activeCardId;
        });

        return (
          <div className="transactions-section" style={{ marginTop: '32px' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span className="section-title">
                {activeCardId
                  ? `Recent Transactions (···${activeCardId.slice(-6).toUpperCase()})`
                  : 'Recent Transactions (All Accounts)'}
              </span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {activeCardId && (
                  <button
                    className="btn btn-secondary btn-xs"
                    style={{ width: 'auto', background: 'var(--danger-bg)', color: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => setActiveCardId(null)}
                  >
                    ✕ Clear Filter
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>View All →</button>
              </div>
            </div>

            {activeCardId && (
              <div className="alert alert-info" style={{ marginBottom: '16px', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="alert-icon" style={{ fontSize: '14px' }}>🔍</span>
                <span>Showing recent transactions for this account only. Click another card or "Clear Filter" to reset.</span>
              </div>
            )}

            {txLoading ? (
              <div className="loading-spinner" style={{ padding: '32px' }}><div className="spinner" /></div>
            ) : transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 24px' }}>
                <span className="empty-state-icon">📭</span>
                <div className="empty-state-title">No transactions yet</div>
                <p className="empty-state-desc">
                  First <strong>add money</strong> to an account, then <strong>transfer</strong> to another account ID.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-success" style={{ width: 'auto' }} onClick={() => accounts.length > 0 ? openDepositModal(accounts[0]) : setShowCreateModal(true)}>
                    💰 Add Money First
                  </button>
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/transfer')}>
                    💸 Go to Transfer
                  </button>
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="empty-state" style={{ padding: '36px 20px' }}>
                <span className="empty-state-icon">📭</span>
                <div className="empty-state-title">No transactions for this account</div>
                <p className="empty-state-desc">
                  There are no recent transactions associated with this specific account.
                </p>
                <button className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setActiveCardId(null)}>
                  Show All Accounts
                </button>
              </div>
            ) : (
              <div className="transactions-list">
                {filteredTransactions.map((tx, i) => (
                  <TransactionItem
                    key={tx._id}
                    transaction={tx}
                    userAccountIds={userAccountIds}
                    accounts={accounts}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════
          MODAL: CREATE ACCOUNT
         ══════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Open New Account</span>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Choose a currency. Each account has its own separate balance and ID.
            </p>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label htmlFor="create-currency">Currency</label>
                <select id="create-currency" value={createCurrency} onChange={(e) => setCreateCurrency(e.target.value)}>
                  <option value="INR">🇮🇳 INR — Indian Rupee</option>
                  <option value="USD">🇺🇸 USD — US Dollar</option>
                  <option value="EUR">🇪🇺 EUR — Euro</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : '✅ Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL: ADD MONEY (DEPOSIT)
         ══════════════════════════════════════════════════════ */}
      {showDepositModal && selectedAccount && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">💰 Add Money</span>
              <button className="modal-close" onClick={() => setShowDepositModal(false)}>✕</button>
            </div>

            {/* Account picker if multiple accounts */}
            {accounts.length > 1 && (
              <div className="form-group">
                <label htmlFor="deposit-account-select">Select Account</label>
                <select
                  id="deposit-account-select"
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.currency} · ···{acc._id.slice(-8).toUpperCase()} · Balance: {
                        CURRENCY_SYMBOLS[acc.currency]}{(balances[acc._id] || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              This simulates depositing money into your account (like an ATM deposit).
              Enter the amount you want to add.
            </p>

            {error && <div className="alert alert-error"><span className="alert-icon">⚠️</span>{error}</div>}

            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label htmlFor="deposit-amount">Amount to Deposit</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    {CURRENCY_SYMBOLS[accounts.find(a => a._id === depositAccountId)?.currency] || '₹'}
                  </span>
                  <input
                    id="deposit-amount"
                    type="number"
                    className="has-icon"
                    placeholder="e.g. 10000"
                    min="1"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => { setDepositAmount(e.target.value); setError(''); }}
                    autoFocus
                    style={{ fontSize: '22px', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[1000, 5000, 10000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="btn btn-secondary btn-xs"
                    style={{ width: 'auto' }}
                    onClick={() => setDepositAmount(String(amt))}
                  >
                    +{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowDepositModal(false); setError(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={depositLoading}>
                  {depositLoading ? 'Depositing...' : '💰 Deposit Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL: SHOW ACCOUNT ID
         ══════════════════════════════════════════════════════ */}
      {showIdModal && selectedAccount && (
        <div className="modal-overlay" onClick={() => setShowIdModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🪪 Your Account ID</span>
              <button className="modal-close" onClick={() => setShowIdModal(false)}>✕</button>
            </div>

            {/* Account picker */}
            {accounts.length > 1 && (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Select Account</label>
                <select
                  value={selectedAccount._id}
                  onChange={(e) => setSelectedAccount(accounts.find(a => a._id === e.target.value))}
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.currency} · ···{acc._id.slice(-8).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
              Share this Account ID with anyone who wants to send you money.
              They need to paste it in the <strong>"To Account ID"</strong> field during transfer.
            </p>

            {/* Big ID display */}
            <div
              style={{
                background: 'var(--navy-800)',
                border: '2px solid var(--glass-border)',
                borderRadius: 'var(--r-lg)',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'border-color var(--t-fast)'
              }}
              onClick={() => handleCopy(selectedAccount._id, 'modal')}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--blue-500)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              title="Click to copy"
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {selectedAccount.currency} Account ID
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '15px',
                color: 'var(--blue-300)', wordBreak: 'break-all', lineHeight: '1.7'
              }}>
                {selectedAccount._id}
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: copied === 'modal' ? 'var(--success-light)' : 'var(--text-muted)' }}>
                {copied === 'modal' ? '✅ Copied to clipboard!' : '📋 Click anywhere to copy'}
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              <span className="alert-icon">💡</span>
              <span>
                <strong>How to send money to me:</strong><br />
                Go to Transfer → paste this ID in the "To Account ID" field → enter amount → confirm.
              </span>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => handleCopy(selectedAccount._id, 'modal')}
            >
              {copied === 'modal' ? '✅ Copied!' : '📋 Copy Account ID'}
            </button>
          </div>
        </div>
      )}
    </BankingLayout>
  );
}
