import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye } from 'lucide-react';

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
    { header: 'Date', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
    { header: 'Applicant', accessor: 'applicant', render: (row) => row.applicant?.fullName || 'N/A' },
    { header: 'Amount', accessor: 'loanAmount', render: (row) => formatCurrency(row.loanAmount) },
    { header: 'Credit Score', accessor: 'creditScore', render: (row) => <span className={`font-bold ${row.creditScore < 650 ? 'text-red-500' : 'text-green-500'}`}>{row.creditScore}</span> },
    { header: 'DTI %', accessor: 'debtToIncomeRatio', render: (row) => `${row.debtToIncomeRatio}%` },
    { header: 'Risk Score', accessor: 'riskScore', render: (row) => row.riskScore || 'N/A' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Action', accessor: 'id', render: (row) => (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/officer/applications/${row.id}`);
        }}
        className="flex items-center text-finBlue hover:text-blue-700"
      >
        <Eye className="h-4 w-4 mr-1" /> Review
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
      <h1 className="text-2xl font-bold text-gray-900">Application Queue</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-finBlue text-finBlue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        </>
      )}
    </div>
  );
};

export default ApplicationQueue;
