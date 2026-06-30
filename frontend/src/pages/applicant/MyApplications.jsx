import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
    { header: 'Date Applied', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
    { header: 'Amount', accessor: 'loanAmount', render: (row) => formatCurrency(row.loanAmount) },
    { header: 'Purpose', accessor: 'loanPurpose' },
    { header: 'Term (Months)', accessor: 'loanTermMonths' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Loan Applications</h1>
      <DataTable 
        columns={columns} 
        data={data.content} 
        emptyMessage="You haven't submitted any loan applications yet." 
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

export default MyApplications;
