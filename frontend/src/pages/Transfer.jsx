import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAccounts, createTransaction } from '../services/api';

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getUserAccounts();
        setAccounts(res.data.accounts || []);
      } catch {
        setError('Failed to load accounts');
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.fromAccount === formData.toAccount) {
      setError('From and To accounts cannot be the same');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36);
      await createTransaction({
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount,
        amount: Number(formData.amount),
        idempotencyKey,
      });
      setSuccess('Transaction completed successfully!');
      setFormData({ fromAccount: '', toAccount: '', amount: '' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Ledger
        </div>
        <div className="nav-right">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="transfer-card">
          <h2>Transfer Funds</h2>
          <p className="transfer-subtitle">Send money between accounts securely</p>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fromAccount">From Account</label>
              <select
                id="fromAccount"
                name="fromAccount"
                value={formData.fromAccount}
                onChange={handleChange}
                required
              >
                <option value="">Select source account</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc._id.slice(-8).toUpperCase()} — {acc.currency} ({acc.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="toAccount">To Account ID</label>
              <input
                id="toAccount"
                name="toAccount"
                type="text"
                placeholder="Paste destination account ID"
                value={formData.toAccount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : '💸 Send Transfer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
