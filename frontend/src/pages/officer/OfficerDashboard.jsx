import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, CheckSquare, AlertTriangle, TrendingUp } from 'lucide-react';
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
  if (!stats) return <div>Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Last updated: {secondsAgo} seconds ago</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Priority Actions</h2>
          <Link to="/officer/queue" className="text-sm text-finBlue font-medium hover:underline">View Full Queue &rarr;</Link>
        </div>
        <p className="text-gray-600 mb-4">You have <span className="font-bold text-finNavy">{stats.pendingManualReview}</span> applications requiring manual review.</p>
        <Link to="/officer/queue?tab=MANUAL_REVIEW" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
          Start Reviewing
        </Link>
      </div>
    </div>
  );
};

export default OfficerDashboard;
