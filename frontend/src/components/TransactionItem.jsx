function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortId(id) {
  return id ? `···${String(id).slice(-6).toUpperCase()}` : '';
}

const STATUS_CONFIG = {
  COMPLETED: { badgeClass: 'badge-completed', label: 'Completed' },
  PENDING:   { badgeClass: 'badge-pending',   label: 'Pending'   },
  FAILED:    { badgeClass: 'badge-failed',     label: 'Failed'    },
  REVERSED:  { badgeClass: 'badge-reversed',   label: 'Reversed'  },
};

/**
 * Determine the EXACT type of transaction from THIS user's perspective:
 *  - "deposit"   : fromAccount === toAccount (self-deposit)
 *  - "sent"      : fromAccount belongs to this user, toAccount does NOT
 *  - "received"  : toAccount belongs to this user, fromAccount does NOT
 *  - "internal"  : both fromAccount and toAccount belong to this user (own-to-own transfer)
 */
function getTxType(transaction, userAccountIds) {
  const from = String(transaction.fromAccount?._id || transaction.fromAccount || '');
  const to   = String(transaction.toAccount?._id   || transaction.toAccount   || '');

  const fromIsOwn = userAccountIds.some((id) => String(id) === from);
  const toIsOwn   = userAccountIds.some((id) => String(id) === to);

  if (from === to) return 'deposit';       // self-deposit
  if (fromIsOwn && toIsOwn) return 'internal'; // transfer between own accounts
  if (fromIsOwn) return 'sent';            // money went out
  if (toIsOwn)   return 'received';        // money came in
  return 'unknown';
}

const TX_META = {
  deposit:  { icon: '💰', label: 'Deposit',          iconClass: 'credit', amtPrefix: '+', amtClass: 'credit'  },
  received: { icon: '⬇️',  label: 'Money Received',   iconClass: 'credit', amtPrefix: '+', amtClass: 'credit'  },
  sent:     { icon: '⬆️',  label: 'Money Sent',       iconClass: 'debit',  amtPrefix: '−', amtClass: 'debit'   },
  internal: { icon: '🔄',  label: 'Own Transfer',     iconClass: 'pending', amtPrefix: '↔', amtClass: 'pending' },
  unknown:  { icon: '❓',  label: 'Transaction',      iconClass: 'pending', amtPrefix: '',  amtClass: 'pending' },
};

export default function TransactionItem({ transaction, userAccountIds = [], accounts = [], index = 0 }) {
  const { fromAccount, toAccount, amount, status, createdAt, _id } = transaction;

  const type    = getTxType(transaction, userAccountIds);
  const meta    = TX_META[type];
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const txShort = String(_id || '').slice(-8).toUpperCase();

  const fromId = String(fromAccount?._id || fromAccount || '');
  const toId   = String(toAccount?._id   || toAccount   || '');

  const getAccountLabel = (id) => {
    const acc = accounts.find((a) => String(a._id || a) === String(id));
    if (acc) {
      return `${acc.currency} account (···${String(id).slice(-4).toUpperCase()})`;
    }
    return `account ···${String(id).slice(-4).toUpperCase()}`;
  };

  // Sub-label: tell user exactly which account was involved
  let subLabel = '';
  if (type === 'deposit')  subLabel = `To your ${getAccountLabel(toId)}`;
  if (type === 'received') subLabel = `To your ${getAccountLabel(toId)} · From ${shortId(fromId)}`;
  if (type === 'sent')     subLabel = `From your ${getAccountLabel(fromId)} · To ${shortId(toId)}`;
  if (type === 'internal') subLabel = `From ${getAccountLabel(fromId)} → ${getAccountLabel(toId)}`;


  const amtClass = status === 'PENDING' ? 'pending' : meta.amtClass;

  return (
    <div className="transaction-item" style={{ animationDelay: `${index * 0.05}s` }}>
      {/* Icon */}
      <div className={`transaction-icon ${meta.iconClass}`}>{meta.icon}</div>

      {/* Info */}
      <div className="transaction-info">
        <div className="transaction-title">{meta.label}</div>
        <div className="transaction-id" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{subLabel}</div>
        <div className="transaction-id" style={{ marginTop: '2px' }}>TXN #{txShort}</div>
      </div>

      {/* Date + Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(createdAt)}</span>
        <span className={`transaction-status-badge ${statusCfg.badgeClass}`}>{statusCfg.label}</span>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', minWidth: '110px', flexShrink: 0 }}>
        <div className={`transaction-amount ${amtClass}`}>
          {meta.amtPrefix} {formatAmount(amount)}
        </div>
      </div>
    </div>
  );
}
