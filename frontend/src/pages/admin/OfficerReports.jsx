import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';

const OfficerReports = () => {
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'approvalRate', direction: 'desc' });

    useEffect(() => {
        fetchPerformance();
        const interval = setInterval(fetchPerformance, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPerformance = async () => {
        try {
            const res = await api.get('/dashboard/officer-performance');
            setPerformance(res.data);
        } catch (error) {
            console.error("Failed to fetch performance", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
      let direction = 'desc';
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
      }
      setSortConfig({ key, direction });
    };

    const sortedPerformance = React.useMemo(() => {
      let sortableItems = [...performance];
      if (sortConfig.key !== null) {
        sortableItems.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return sortableItems;
    }, [performance, sortConfig]);

    const renderSortableHeader = (label, key) => (
      <div 
        className="flex items-center gap-1 cursor-pointer hover:text-ink-500 transition-colors"
        onClick={() => handleSort(key)}
      >
        {label}
        {sortConfig.key === key && (
          <span className="text-accent">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    );

    const columns = [
        { header: renderSortableHeader('Officer Name', 'officerName'), accessor: 'officerName', render: (row) => <span className="font-medium text-ink-900">{row.officerName}</span> },
        { header: renderSortableHeader('Total Processed', 'totalApplicationsProcessed'), accessor: 'totalApplicationsProcessed', render: (row) => <span className="font-mono text-sm">{row.totalApplicationsProcessed}</span> },
        { header: renderSortableHeader('Approved', 'approvedApplications'), accessor: 'approvedApplications', render: (row) => <span className="font-mono text-sm text-success">{row.approvedApplications}</span> },
        { header: renderSortableHeader('Rejected', 'rejectedApplications'), accessor: 'rejectedApplications', render: (row) => <span className="font-mono text-sm text-danger">{row.rejectedApplications}</span> },
        { 
          header: renderSortableHeader('Approval Rate', 'approvalRate'), 
          accessor: 'approvalRate', 
          render: (row) => {
            const val = row.approvalRate;
            let color = 'bg-accent';
            let textColor = 'text-accent';
            if (val < 20) { color = 'bg-danger'; textColor = 'text-danger'; }
            else if (val > 80) { color = 'bg-success'; textColor = 'text-success'; }

            return (
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm font-semibold w-12 text-right ${textColor}`}>{val.toFixed(1)}%</span>
                <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
                </div>
              </div>
            );
          } 
        }
    ];

    if (loading) return <div className="text-sm text-ink-500">Loading reports...</div>;

    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold text-ink-900">Officer Performance Reports</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={sortedPerformance}
                        keyField="officerId"
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default OfficerReports;
