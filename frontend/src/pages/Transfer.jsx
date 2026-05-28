import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAccounts, getAccountBalance, createTransaction } from '../services/api';
import BankingLayout from '../components/BankingLayout';

function copyText(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
}

const STEPS = ['Select Account', 'Enter Details', 'Review', 'Processing', 'Done'];

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };

function formatBal(balance, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || '₹';
  if (balance === null || balance === undefined) return 'Loading...';
  return `${sym}${Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function maskId(id = '') {
  const s = id.slice(-8).toUpperCase();
  return `•••• ${s.slice(0, 4)} ${s.slice(4)}`;
}

const CARD_COLORS = [
  'linear-gradient(135deg, #1D4ED8, #7C3AED)',
  'linear-gradient(135deg, #0F766E, #0891B2)',
  'linear-gradient(135deg, #B45309, #DC2626)',
  'linear-gradient(135deg, #4F46E5, #EC4899)',
];

export default function Transfer() {
  const navigate = useNavigate();

  const [step,        setStep]        = useState(0);
  const [accounts,    setAccounts]    = useState([]);
  const [balances,    setBalances]    = useState({});
  const [fromAccount, setFromAccount] = useState('');
  const [copiedId,    setCopiedId]    = useState('');  

  const handleCopyId = (id) => {
    copyText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2500);
  };
  const [toAccount,   setToAccount]   = useState('');
  const [amount,      setAmount]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [txResult,    setTxResult]    = useState(null);
  const [progress,    setProgress]    = useState(0);
  const timerRef = useRef(null);

  // ── Load Accounts ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // ── Processing Timer ─────────────────────────────────────────
  useEffect(() => {
    if (step === 3) {
      setProgress(0);
      const start = Date.now();
      const duration = 15500; // slightly longer than backend 15s
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min((elapsed / duration) * 100, 95);
        setProgress(pct);
      }, 100);
      return () => clearInterval(timerRef.current);
    }
  }, [step]);

  // ── Validation: Step 0 → 1 ──────────────────────────────────
  const goStep1 = () => {
    if (!fromAccount) { setError('Please select a source account'); return; }
    setError('');
    setStep(1);
  };

  // ── Validation: Step 1 → 2 ──────────────────────────────────
  const goStep2 = () => {
    if (!toAccount.trim()) { setError('Please enter a destination account ID'); return; }
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    const fromAcc = accounts.find((a) => a._id === fromAccount);
    if (fromAccount === toAccount) { setError('Source and destination cannot be the same'); return; }
    const bal = balances[fromAccount] || 0;
    if (Number(amount) > bal) {
      setError(`Insufficient balance. Available: ${formatBal(bal, fromAcc?.currency)}`);
      return;
    }
    setError('');
    setStep(2);
  };

  // ── Submit Transfer ──────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setStep(3);

    try {
      const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const res = await createTransaction({
        fromAccount,
        toAccount,
        amount: Number(amount),
        idempotencyKey,
      });

      clearInterval(timerRef.current);
      setProgress(100);
      setTxResult(res.data.transaction || {});
      setStep(4);
    } catch (err) {
      clearInterval(timerRef.current);
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
      setStep(2);
    }
  };

  const selectedFromAcc = accounts.find((a) => a._id === fromAccount);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <BankingLayout>
      <div className="transfer-container">

        {/* ── WIZARD PROGRESS ───────────────────────────────── */}
        <div className="wizard-steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`wizard-step${i === step ? ' active' : ''}${i < step ? ' completed' : ''}`}
            >
              <div className="wizard-step-circle">
                {i < step ? '✓' : i + 1}
              </div>
              <span className="wizard-step-label">{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <span className="alert-icon">⚠️</span>{error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 0 — SELECT SOURCE ACCOUNT
           ══════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="wizard-card">
            <div className="wizard-card-title">Select Source Account</div>
            <div className="wizard-card-subtitle">
              Choose which account you want to send money from.
            </div>

            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : accounts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">💳</span>
                <div className="empty-state-title">No accounts found</div>
                <p className="empty-state-desc">Create an account first from the Dashboard.</p>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="account-selector-grid">
                {accounts.map((acc, i) => (
                  <div
                    key={acc._id}
                    className={`account-selector-card${fromAccount === acc._id ? ' selected' : ''}`}
                    onClick={() => setFromAccount(acc._id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className="account-selector-currency"
                      style={{ fontSize: '24px', marginBottom: '6px' }}
                    >
                      {acc.currency === 'INR' ? '🇮🇳' : acc.currency === 'USD' ? '🇺🇸' : '🇪🇺'}
                    </div>
                    <div className="account-selector-id">{maskId(acc._id)}</div>
                    <div className="account-selector-balance">
                      {formatBal(balances[acc._id], acc.currency)}
                    </div>
                    <div className="account-selector-status">{acc.currency} · {acc.status}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="wizard-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={goStep1}
                disabled={!fromAccount || loading}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 1 — ENTER DETAILS
           ══════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="wizard-card">
            <div className="wizard-card-title">Transfer Details</div>
            <div className="wizard-card-subtitle">
              Enter the destination account ID and the amount to send.
            </div>

            {/* Sending from summary */}
            {selectedFromAcc && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', borderRadius: 'var(--r-lg)',
                  background: 'var(--grad-brand-soft)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  marginBottom: '24px'
                }}
              >
                <div style={{ fontSize: '24px' }}>
                  {selectedFromAcc.currency === 'INR' ? '🇮🇳' : selectedFromAcc.currency === 'USD' ? '🇺🇸' : '🇪🇺'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>From Account</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {maskId(selectedFromAcc._id)} · {selectedFromAcc.currency}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--blue-300)' }}>
                    Balance: {formatBal(balances[selectedFromAcc._id], selectedFromAcc.currency)}
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="toAccount-input">Destination Account ID</label>
              <div className="input-wrapper">
                <span className="input-icon">🏦</span>
                <input
                  id="toAccount-input"
                  type="text"
                  className="has-icon"
                  placeholder="Paste the full Account ID here"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Your other accounts — quick-paste as destination */}
            {accounts.filter(a => a._id !== fromAccount).length > 0 && (
              <div
                style={{
                  background: 'rgba(37,99,235,0.05)',
                  border: '1px solid rgba(37,99,235,0.15)',
                  borderRadius: 'var(--r-lg)',
                  padding: '16px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  💡 Quick-fill — your other accounts
                </div>
                {accounts.filter(a => a._id !== fromAccount).map(acc => (
                  <div
                    key={acc._id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 'var(--r-sm)',
                      background: 'var(--glass-bg)', marginBottom: '6px',
                      cursor: 'pointer', gap: '10px'
                    }}
                    onClick={() => setToAccount(acc._id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{acc.currency} Account</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--blue-300)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {acc._id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        style={{ width: 'auto', fontSize: '11px' }}
                        onClick={(e) => { e.stopPropagation(); handleCopyId(acc._id); }}
                      >
                        {copiedId === acc._id ? '✅ Copied' : '📋 Copy'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        style={{ width: 'auto', fontSize: '11px' }}
                        onClick={(e) => { e.stopPropagation(); setToAccount(acc._id); }}
                      >
                        Use →
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Click <strong>Use</strong> to fill the destination, or share this ID with another user.
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="amount-input">Amount ({selectedFromAcc?.currency || 'INR'})</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  {CURRENCY_SYMBOLS[selectedFromAcc?.currency] || '₹'}
                </span>
                <input
                  id="amount-input"
                  type="number"
                  className="has-icon"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '20px', fontWeight: 600 }}
                />
              </div>
              {selectedFromAcc && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Available: {formatBal(balances[selectedFromAcc._id], selectedFromAcc.currency)}
                </p>
              )}
            </div>

            <div className="wizard-actions">
              <button className="btn btn-secondary" onClick={() => setStep(0)}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={goStep2}>
                Review →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2 — REVIEW & CONFIRM
           ══════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="wizard-card">
            <div className="wizard-card-title">Review Transfer</div>
            <div className="wizard-card-subtitle">
              Please confirm the details below before sending.
            </div>

            <div className="review-summary">
              <div className="review-row">
                <span className="review-row-label">From Account</span>
                <span className="review-row-value">{maskId(fromAccount)}</span>
              </div>
              <div className="review-row">
                <span className="review-row-label">Currency</span>
                <span className="review-row-value">{selectedFromAcc?.currency}</span>
              </div>
              <div className="review-row">
                <span className="review-row-label">To Account</span>
                <span className="review-row-value">{toAccount}</span>
              </div>
              <div className="review-row highlight">
                <span className="review-row-label">Amount to Send</span>
                <span className="review-row-value">
                  {CURRENCY_SYMBOLS[selectedFromAcc?.currency] || '₹'}{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="review-row">
                <span className="review-row-label">After Transfer Balance</span>
                <span className="review-row-value">
                  {formatBal((balances[fromAccount] || 0) - Number(amount), selectedFromAcc?.currency)}
                </span>
              </div>
            </div>

            <div
              className="alert alert-warning"
              style={{ marginTop: '20px' }}
            >
              <span className="alert-icon">⏱️</span>
              Transfers typically complete in about 15 seconds. Please don't close this window.
            </div>

            <div className="wizard-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Edit
              </button>
              <button className="btn btn-success" onClick={handleSubmit}>
                ✅ Confirm & Send
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3 — PROCESSING
           ══════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="wizard-card">
            <div className="processing-container">
              <div className="processing-icon">🔐</div>
              <div className="processing-title">Processing Transfer</div>
              <div className="processing-subtitle">
                Your transfer is being processed securely.<br />
                This may take up to 15 seconds — please wait.
              </div>

              <div className="processing-bar-track" style={{ width: '100%' }}>
                <div
                  className="processing-bar-fill"
                  style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                />
              </div>

              <div className="processing-timer">
                {Math.round(progress)}% complete · Please don't close this page
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>🔒 Encrypted</span>
                <span>•</span>
                <span>📋 Ledger-based</span>
                <span>•</span>
                <span>✅ Idempotent</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 4 — SUCCESS
           ══════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="wizard-card">
            <div className="success-container">
              <div className="success-icon">✅</div>
              <div className="success-title">Transfer Complete!</div>
              <div className="success-subtitle">
                Your money has been sent successfully.<br />
                Both accounts have been updated.
              </div>

              <div className="success-amount">
                {CURRENCY_SYMBOLS[selectedFromAcc?.currency] || '₹'}{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>

              {txResult?._id && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)',
                    background: 'var(--glass-bg)', padding: '10px 16px', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--glass-border)', marginBottom: '32px'
                  }}
                >
                  TXN ID: {txResult._id}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto' }}
                  onClick={() => {
                    setStep(0);
                    setFromAccount('');
                    setToAccount('');
                    setAmount('');
                    setTxResult(null);
                    setError('');
                  }}
                >
                  ↩ New Transfer
                </button>
                <button
                  className="btn btn-primary"
                  style={{ width: 'auto' }}
                  onClick={() => navigate('/dashboard')}
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BankingLayout>
  );
}
