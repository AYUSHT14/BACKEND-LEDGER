const CARD_GRADIENTS = ['bank-card-1', 'bank-card-2', 'bank-card-3', 'bank-card-4'];

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };
const CURRENCY_FLAGS   = { INR: '🇮🇳', USD: '🇺🇸', EUR: '🇪🇺' };

function maskAccountId(id = '') {
  const last8 = id.slice(-8).toUpperCase();
  return `•••• •••• ${last8.slice(0, 4)} ${last8.slice(4)}`;
}

function formatBalance(balance, currency) {
  if (balance === null || balance === undefined) return '···';
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AccountCard({ account, balance, index = 0, selected = false, onClick }) {
  const gradientClass = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const flag = CURRENCY_FLAGS[account.currency] || '💱';

  return (
    <div
      className={`bank-card ${gradientClass} ${selected ? 'selected' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => onClick && onClick(account)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className="bank-card-header">
        <span className="bank-card-brand">NexaPay</span>
        <span className="bank-card-status">{account.status}</span>
      </div>

      {/* Chip */}
      <div className="bank-card-chip">💳 {flag}</div>

      {/* Masked Account Number */}
      <div className="bank-card-number">{maskAccountId(account._id)}</div>

      {/* Footer */}
      <div className="bank-card-footer">
        <div>
          <div className="bank-card-balance-label">Balance</div>
          <div className="bank-card-balance">{formatBalance(balance, account.currency)}</div>
        </div>
        <div className="bank-card-currency">{account.currency}</div>
      </div>
    </div>
  );
}
