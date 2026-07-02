import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye } from 'lucide-react';
import Button from '../../components/common/Button';

const ApplicationQueue = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, last: true });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'ALL';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page,
          size: 10,
          ...(activeTab !== 'ALL' && { status: activeTab })
        }).toString();
        const response = await api.get(`/loans/all?${query}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [activeTab, page]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(0);
  };

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => <span className="font-mono text-sm">{formatDate(row.createdAt)}</span> },
    { header: 'Applicant', accessor: 'applicant', render: (row) => row.applicant?.fullName || 'N/A' },
    { header: 'Amount', accessor: 'loanAmount', render: (row) => <span className="font-mono text-sm font-semibold">{formatCurrency(row.loanAmount)}</span> },
    { header: 'Credit Score', accessor: 'creditScore', render: (row) => <span className={`font-mono text-sm font-bold ${row.creditScore < 650 ? 'text-danger' : 'text-success'}`}>{row.creditScore}</span> },
    { header: 'DTI %', accessor: 'debtToIncomeRatio', render: (row) => <span className="font-mono text-sm">{row.debtToIncomeRatio}%</span> },
    { header: 'Risk Score', accessor: 'riskScore', render: (row) => <span className="font-mono text-sm">{row.riskScore || 'N/A'}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Action', accessor: 'id', render: (row) => (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/officer/applications/${row.id}`);
        }}
        className="flex items-center text-[13px] font-semibold text-accent hover:text-accent-dark transition-colors"
      >
        <Eye className="h-4 w-4 mr-1.5" /> Review
      </button>
    )}
  ];

  const tabs = [
    { id: 'ALL', label: 'All Applications' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'MANUAL_REVIEW', label: 'Needs Manual Review' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Application Queue</h1>
      
      <div className="flex border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`py-3.5 px-6 font-semibold text-[13px] uppercase tracking-wider border-b-[3px] transition-colors duration-150 ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-500 hover:text-ink-700 hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <DataTable 
            columns={columns} 
            data={data.content} 
            onRowClick={(row) => navigate(`/officer/applications/${row.id}`)}
            emptyMessage={`No applications found for tab: ${activeTab.replace('_', ' ')}.`} 
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
        </>
      )}
    </div>
  );
};

export default ApplicationQueue;
