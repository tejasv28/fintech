import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, CheckSquare, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/officer-stats');
        setStats(response.data);
        setLastUpdated(new Date());
        setSecondsAgo(0);
      } catch (error) {
        console.error('Failed to fetch officer stats:', error);
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

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="text-sm text-ink-500">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Officer Dashboard</h1>
          <p className="text-[13px] text-ink-500 mt-1">Last updated: {secondsAgo}s ago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Applications in Queue" 
          value={stats.applicationsInQueue} 
          icon={Users} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Reviewed Today" 
          value={stats.reviewedToday} 
          icon={CheckSquare} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Pending Manual Review" 
          value={stats.pendingManualReview} 
          icon={AlertTriangle} 
          colorClass="bg-yellow-500" 
        />
        <StatCard 
          title="Approval Rate" 
          value={`${stats.approvalRate}%`} 
          icon={TrendingUp} 
          colorClass="bg-purple-500" 
        />
      </div>

      <div className="bg-surface-card rounded-card shadow-card border border-border p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-lg font-semibold text-ink-900">Priority Actions</h2>
          <Link to="/officer/queue" className="flex items-center text-sm text-accent font-semibold hover:text-accent-dark transition-colors">
            View Full Queue <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <p className="text-sm text-ink-700 mb-6">
          You have <span className="font-mono text-base font-semibold text-warning px-1">{stats.pendingManualReview}</span> applications requiring manual review.
        </p>
        <Link to="/officer/queue?tab=MANUAL_REVIEW" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-warning text-white hover:brightness-95 transition-all duration-150">
          Start Reviewing
        </Link>
      </div>
    </div>
  );
};

export default OfficerDashboard;
