import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { FileText, CheckCircle, CreditCard, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApplicantDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/applicant-stats');
        setStats(response.data);
        setLastUpdated(new Date());
        setSecondsAgo(0);
      } catch (error) {
        console.error('Failed to fetch applicant stats:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Last updated: {secondsAgo} seconds ago</p>
        </div>
        <Link 
          to="/applicant/apply"
          className="bg-finBlue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Apply for a Loan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Applications Submitted" 
          value={stats.applicationsSubmitted} 
          icon={FileText} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Approved Loans" 
          value={stats.approvedLoans} 
          icon={CheckCircle} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Outstanding Balance" 
          value={formatCurrency(stats.outstandingBalance)} 
          icon={CreditCard} 
          colorClass="bg-red-500" 
        />
        <StatCard 
          title="Next EMI Due" 
          value={stats.nextEmiDue} 
          icon={Calendar} 
          colorClass="bg-purple-500" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link to="/applicant/applications" className="text-finBlue hover:underline">View my applications</Link>
          <Link to="/applicant/loans" className="text-finBlue hover:underline">View my active loans</Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
