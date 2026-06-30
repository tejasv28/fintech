import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
      // Refresh current page
      const response = await api.get(`/active-loans/my-loans?page=${page}&size=10`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to pay EMI');
    }
  };

  const columns = [
    { header: 'Loan ID', accessor: 'id', render: (row) => <span className="font-mono text-xs">{row.id.substring(0, 8)}...</span> },
    { header: 'Principal Amount', accessor: 'principalAmount', render: (row) => formatCurrency(row.principalAmount) },
    { header: 'Outstanding Balance', accessor: 'outstandingBalance', render: (row) => <span className="font-semibold text-finRed">{formatCurrency(row.outstandingBalance)}</span> },
    { header: 'Interest Rate', accessor: 'interestRate', render: (row) => `${row.interestRate}%` },
    { header: 'Monthly EMI', accessor: 'emiAmount', render: (row) => formatCurrency(row.emiAmount) },
    { header: 'Next Due Date', accessor: 'nextDueDate', render: (row) => formatDate(row.nextDueDate) },
    { header: 'Status', accessor: 'loanStatus', render: (row) => <StatusBadge status={row.loanStatus} /> },
    { 
      header: 'Action', 
      accessor: 'action', 
      render: (row) => {
        if (row.loanStatus === 'CLOSED') {
          return <span className="text-green-600 font-bold">Loan Closed — Congratulations!</span>;
        }
        return (
          <button 
            onClick={() => handlePayEmi(row.id)}
            className="bg-finNavy text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
          >
            Pay EMI
          </button>
        );
      }
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Active Loans</h1>
      <DataTable 
        columns={columns} 
        data={data.content} 
        emptyMessage="You don't have any active loans." 
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

export default MyLoans;
