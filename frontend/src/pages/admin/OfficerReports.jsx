import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';

const OfficerReports = () => {
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const columns = [
        { header: 'Officer Name', accessor: 'officerName' },
        { header: 'Total Processed', accessor: 'totalApplicationsProcessed' },
        { header: 'Approved', accessor: 'approvedApplications' },
        { header: 'Rejected', accessor: 'rejectedApplications' },
        { header: 'Approval Rate (%)', accessor: 'approvalRate', render: (val) => `${val}%` }
    ];

    if (loading) return <div>Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Officer Performance Reports</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={performance}
                        keyExtractor={(item) => item.officerId}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default OfficerReports;
