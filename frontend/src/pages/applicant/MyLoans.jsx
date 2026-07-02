import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const MyLoans = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, last: true });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchLoans();
  }, [page]);

  const handlePayEmi = async (id) => {
    try {
      await api.post(`/active-loans/${id}/pay-emi`);
      toast.success('EMI Paid Successfully!');
      const response = await api.get(`/active-loans/my-loans?page=${page}&size=10`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to pay EMI');
    }
  };

  const columns = [
    { header: 'Loan ID', accessor: 'id', render: (row) => <span className="font-mono text-xs font-semibold text-ink-500">{row.id.substring(0, 8)}...</span> },
    { header: 'Principal Amount', accessor: 'principalAmount', render: (row) => <span className="font-mono text-sm">{formatCurrency(row.principalAmount)}</span> },
    { header: 'Outstanding Balance', accessor: 'outstandingBalance', render: (row) => <span className="font-mono text-sm font-semibold text-danger">{formatCurrency(row.outstandingBalance)}</span> },
    { header: 'Interest Rate', accessor: 'interestRate', render: (row) => <span className="font-mono text-sm">{row.interestRate}%</span> },
    { header: 'Monthly EMI', accessor: 'emiAmount', render: (row) => <span className="font-mono text-sm font-medium">{formatCurrency(row.emiAmount)}</span> },
    { header: 'Next Due Date', accessor: 'nextDueDate', render: (row) => <span className="font-mono text-sm">{formatDate(row.nextDueDate)}</span> },
    { header: 'Status', accessor: 'loanStatus', render: (row) => <StatusBadge status={row.loanStatus} /> },
    { 
      header: 'Action', 
      accessor: 'action', 
      render: (row) => {
        if (row.loanStatus === 'CLOSED') {
          return <span className="text-[13px] font-semibold text-success">Closed 🎉</span>;
        }
        return (
          <Button 
            variant="primary"
            onClick={() => handlePayEmi(row.id)}
            className="!py-1.5 !px-4 !text-xs"
          >
            Pay EMI
          </Button>
        );
      }
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">My Active Loans</h1>
      <DataTable 
        columns={columns} 
        data={data.content} 
        emptyMessage="You don't have any active loans." 
      />
      
      {data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface-card p-4 rounded-card shadow-card border border-border mt-4">
          <Button 
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="font-mono text-sm text-ink-500">Page {page + 1} of {data.totalPages}</span>
          <Button 
            variant="secondary"
            disabled={data.last}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyLoans;
