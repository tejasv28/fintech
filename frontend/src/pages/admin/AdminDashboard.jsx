import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { LayoutDashboard, CheckCircle, XCircle, CreditCard, Play } from 'lucide-react';
import ApplicationStatusChart from '../../components/charts/ApplicationStatusChart';
import LoanVolumeChart from '../../components/charts/LoanVolumeChart';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/admin-stats');
        setStats(response.data);
        setLastUpdated(new Date());
        setSecondsAgo(0);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((new Date() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const handleTriggerEod = async () => {
    setTriggering(true);
    try {
      await api.post('/admin/trigger-eod');
      toast.success('EOD Batch Job triggered successfully!');
    } catch (error) {
      toast.error('Failed to trigger EOD job.');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="text-sm text-ink-500">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="text-[13px] text-ink-500 mt-1">Last updated: {secondsAgo}s ago</p>
        </div>
        <Button 
          variant="danger"
          onClick={handleTriggerEod}
          disabled={triggering}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {triggering ? 'Triggering...' : 'Trigger EOD Batch'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Applications" 
          value={stats.totalApplications} 
          icon={LayoutDashboard} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Total Approved" 
          value={stats.approvedThisMonth} 
          icon={CheckCircle} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Total Rejected" 
          value={stats.rejectedThisMonth} 
          icon={XCircle} 
          colorClass="bg-red-500" 
        />
        <StatCard 
          title="Total Active Loans" 
          value={stats.totalActiveLoans} 
          icon={CreditCard} 
          colorClass="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-card p-6 rounded-card shadow-card border border-border">
          <h2 className="font-display text-base font-semibold text-ink-900 mb-6">Application Status Overview</h2>
          <ApplicationStatusChart data={stats.applicationsByStatus} />
        </div>
        <div className="bg-surface-card p-6 rounded-card shadow-card border border-border">
          <h2 className="font-display text-base font-semibold text-ink-900 mb-6">Loan Volume (Last 6 Months)</h2>
          <LoanVolumeChart data={stats.loanVolumeOverTime} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
