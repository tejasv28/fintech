import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';

const MyApplications = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, last: true });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get(`/loans/my-applications?page=${page}&size=10`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [page]);

  const columns = [
    { header: 'Date Applied', accessor: 'createdAt', render: (row) => <span className="font-mono text-sm">{formatDate(row.createdAt)}</span> },
    { header: 'Amount', accessor: 'loanAmount', render: (row) => <span className="font-mono text-sm font-semibold text-ink-900">{formatCurrency(row.loanAmount)}</span> },
    { header: 'Purpose', accessor: 'loanPurpose' },
    { header: 'Term (Months)', accessor: 'loanTermMonths', render: (row) => <span className="font-mono text-sm">{row.loanTermMonths}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">My Loan Applications</h1>
      <DataTable 
        columns={columns} 
        data={data.content} 
        emptyMessage="You haven't submitted any loan applications yet." 
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

export default MyApplications;
