import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AllActiveLoans = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, last: true });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await api.get(`/active-loans/all?page=${page}&size=10`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch loans', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, [page]);

  const columns = [
    { header: 'Loan ID', accessor: 'id', render: (row) => <span className="font-mono text-xs">{row.id.substring(0, 8)}...</span> },
    { header: 'Applicant', accessor: 'applicant', render: (row) => row.applicant?.fullName || 'N/A' },
    { header: 'Principal', accessor: 'principalAmount', render: (row) => formatCurrency(row.principalAmount) },
    { header: 'Balance', accessor: 'outstandingBalance', render: (row) => <span className="font-semibold text-finRed">{formatCurrency(row.outstandingBalance)}</span> },
    { header: 'Rate', accessor: 'interestRate', render: (row) => `${row.interestRate}%` },
    { header: 'Status', accessor: 'loanStatus', render: (row) => <StatusBadge status={row.loanStatus} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Active Loans</h1>
      <DataTable 
        columns={columns} 
        data={data.content} 
        emptyMessage="No active loans found in the system." 
      />
      
      {data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page + 1} of {data.totalPages}</span>
          <button 
            disabled={data.last}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllActiveLoans;
