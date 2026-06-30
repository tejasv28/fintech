import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AllApplications = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, last: true });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    status: status,
    search: search
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page,
        size: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      }).toString();
      const response = await api.get(`/loans/all?${query}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      page: 0,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const columns = [
    { header: 'ID', accessor: 'id', render: (row) => <span className="font-mono text-xs">{row.id.substring(0,8)}</span> },
    { header: 'Date', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
    { header: 'Applicant', accessor: 'applicant', render: (row) => row.applicant?.fullName || 'N/A' },
    { header: 'Amount', accessor: 'loanAmount', render: (row) => formatCurrency(row.loanAmount) },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Loan Applications</h1>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by ID or Name"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-finBlue focus:border-finBlue"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-finBlue focus:border-finBlue"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <Button type="submit">Filter</Button>
          <Button type="button" variant="outline" onClick={() => {
            setFilters({ status: '', search: '' });
            setSearchParams({ page: 0 });
          }}>Clear</Button>
        </form>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <DataTable 
            columns={columns} 
            data={data.content} 
            emptyMessage="No applications found in the system matching filters." 
            onRowClick={(row) => navigate(`/officer/applications/${row.id}`)}
          />
          
          {data.totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <button 
                disabled={page === 0}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: page - 1 })}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page + 1} of {data.totalPages}</span>
              <button 
                disabled={data.last}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: page + 1 })}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllApplications;
