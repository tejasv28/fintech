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
    { header: 'ID', accessor: 'id', render: (row) => <span className="font-mono text-xs font-semibold text-ink-500">{row.id.substring(0,8)}</span> },
    { header: 'Date', accessor: 'createdAt', render: (row) => <span className="font-mono text-sm">{formatDate(row.createdAt)}</span> },
    { header: 'Applicant', accessor: 'applicant', render: (row) => row.applicant?.fullName || 'N/A' },
    { header: 'Amount', accessor: 'loanAmount', render: (row) => <span className="font-mono text-sm font-semibold">{formatCurrency(row.loanAmount)}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">All Loan Applications</h1>
      
      <div className="bg-surface-card p-5 rounded-card shadow-card border border-border mb-6">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Search</label>
            <input 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by ID or Name"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-ink-900 transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent placeholder:text-ink-300"
            />
          </div>
          <div className="w-48">
            <label className="block text-[13px] font-medium text-ink-700 mb-1.5">Status</label>
            <select 
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-ink-900 transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent bg-surface-card appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B92A3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <Button type="submit" variant="primary">Filter</Button>
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
            <div className="flex justify-between items-center bg-surface-card p-4 rounded-card shadow-card border border-border mt-4">
              <Button 
                variant="secondary"
                disabled={page === 0}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: page - 1 })}
              >
                Previous
              </Button>
              <span className="font-mono text-sm text-ink-500">Page {page + 1} of {data.totalPages}</span>
              <Button 
                variant="secondary"
                disabled={data.last}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllApplications;
