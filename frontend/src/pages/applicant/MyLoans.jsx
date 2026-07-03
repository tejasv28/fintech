import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import { CreditCard, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const LEDGER_TYPE = {
  LOAN_DISBURSED:   { cls: 'bg-info-soft text-info',        label: 'Disbursed' },
  INTEREST_ACCRUAL: { cls: 'bg-warning-soft text-warning',  label: 'Interest' },
  EMI_PAYMENT:      { cls: 'bg-success-soft text-success',  label: 'EMI Paid' },
  LOAN_CLOSED:      { cls: 'bg-ink-300/10 text-ink-500',    label: 'Closed' },
};

const LoanCard = ({ loan, onPayEmi }) => {
  const [showLedger, setShowLedger]     = useState(false);
  const [ledger, setLedger]             = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [payingEmi, setPayingEmi]       = useState(false);

  const repaidPct = loan.principalAmount > 0
    ? Math.max(0, Math.min(100,
        ((loan.principalAmount - loan.outstandingBalance) / loan.principalAmount) * 100
      ))
    : 0;

  const handleToggleLedger = async () => {
    if (!showLedger && ledger.length === 0) {
      setLoadingLedger(true);
      try {
        const res = await api.get(`/active-loans/${loan.id}/ledger?page=0&size=20`);
        // backend may return Page<> or plain list — handle both
        const entries = res.data.content ?? res.data;
        setLedger(entries);
      } catch {
        toast.error('Failed to load transaction history');
      } finally {
        setLoadingLedger(false);
      }
    }
    setShowLedger((s) => !s);
  };

  const handlePay = async () => {
    setPayingEmi(true);
    try {
      await onPayEmi(loan.id);
    } finally {
      setPayingEmi(false);
    }
  };

  return (
    <div className="bg-surface-card rounded-card shadow-card border border-border overflow-hidden">
      <div className="p-6">

        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-ink-300">#{loan.id?.substring(0, 8)}</span>
            <StatusBadge status={loan.loanStatus} />
          </div>
          <span className="font-mono text-sm font-medium text-ink-500">
            {loan.interestRate}% p.a.
          </span>
        </div>

        {/* Financial grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Principal',      value: formatCurrency(loan.principalAmount) },
            { label: 'Outstanding',    value: formatCurrency(loan.outstandingBalance), danger: true },
            { label: 'Monthly EMI',    value: formatCurrency(loan.emiAmount) },
            { label: 'Interest Rate',  value: `${loan.interestRate}%` },
            { label: 'Next Due Date',  value: formatDate(loan.nextDueDate) },
            { label: 'Loan Since',     value: formatDate(loan.createdAt) },
          ].map(({ label, value, danger }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-300 mb-0.5">
                {label}
              </p>
              <p className={`font-mono text-sm font-medium ${danger ? 'text-danger font-semibold' : 'text-ink-900'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Repayment progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[11px] text-ink-300 mb-1.5">
            <span>{repaidPct.toFixed(1)}% Repaid</span>
            <span>{formatCurrency(loan.outstandingBalance)} remaining</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-700"
              style={{ width: `${repaidPct}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {loan.loanStatus === 'CLOSED' ? (
            <span className="text-sm font-semibold text-success">
              🎉 Loan fully repaid
            </span>
          ) : (
            <button
              onClick={handlePay}
              disabled={payingEmi}
              className="flex items-center gap-2 bg-success text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:brightness-95 transition-all disabled:opacity-50"
            >
              {payingEmi
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CreditCard className="h-4 w-4" />
              }
              Pay EMI — {formatCurrency(loan.emiAmount)}
            </button>
          )}

          <button
            onClick={handleToggleLedger}
            className="flex items-center gap-1.5 border border-border text-ink-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-all"
          >
            Transaction History
            {showLedger
              ? <ChevronUp className="h-4 w-4" />
              : <ChevronDown className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Collapsible ledger */}
      {showLedger && (
        <div className="border-t border-border p-6">
          <h3 className="font-display text-sm font-semibold text-ink-900 mb-4">
            Transaction History
          </h3>

          {loadingLedger ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-ink-300" />
            </div>
          ) : ledger.length === 0 ? (
            <p className="text-[13px] text-ink-300">No transactions recorded yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-[1.5px] border-ink-900">
                  {['Date', 'Type', 'Amount', 'Balance After', 'Description'].map((h) => (
                    <th
                      key={h}
                      className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Show newest first */}
                {[...ledger].reverse().map((entry, i) => {
                  const cfg = LEDGER_TYPE[entry.transactionType] || {
                    cls: 'bg-ink-300/10 text-ink-500',
                    label: entry.transactionType,
                  };
                  return (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 font-mono text-xs text-ink-300">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-3">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-sm text-ink-900">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3 font-mono text-sm text-ink-900">
                        {formatCurrency(entry.balanceAfter)}
                      </td>
                      <td className="py-3 text-[13px] text-ink-500 max-w-[200px] truncate">
                        {entry.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const MyLoans = () => {
  const [data, setData]     = useState({ content: [], totalPages: 0, last: true });
  const [page, setPage]     = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const response = await api.get(`/active-loans/my-loans?page=${page}&size=10`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch loans', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [page]);

  const handlePayEmi = async (loanId) => {
    try {
      await api.post(`/active-loans/${loanId}/pay-emi`);
      toast.success('EMI Paid Successfully!');
      await fetchLoans();
    } catch (error) {
      toast.error('Failed to pay EMI');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">My Active Loans</h1>

      {data.content.length === 0 ? (
        <div className="bg-surface-card rounded-card shadow-card border border-border p-12 text-center">
          <CreditCard className="h-10 w-10 text-ink-300 mx-auto mb-3" />
          <p className="font-display text-sm font-semibold text-ink-900">No active loans</p>
          <p className="text-[13px] text-ink-500 mt-1">
            Your approved loans will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {data.content.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onPayEmi={handlePayEmi} />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface-card p-4 rounded-card shadow-card border border-border">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="font-mono text-sm text-ink-500">
            Page {page + 1} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
