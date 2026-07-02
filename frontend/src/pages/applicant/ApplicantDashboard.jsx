import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { FileText, CheckCircle, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

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
  if (!stats) return <div className="text-sm text-ink-500">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6 max-w-[1080px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard Overview</h1>
          <p className="text-[13px] text-ink-500 mt-1">Last updated: {secondsAgo}s ago</p>
        </div>
        <Link to="/applicant/apply" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent-dark hover:-translate-y-px transition-all duration-150 shadow-sm">
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
          value={stats.nextEmiDue || 'None'} 
          icon={Calendar} 
          colorClass="bg-purple-500" 
        />
      </div>

      <div className="bg-surface-card rounded-card shadow-card border border-border p-8 mt-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 mb-6">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/applicant/applications" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-border text-sm font-semibold text-ink-700 hover:bg-surface hover:text-ink-900 transition-colors">
            <FileText className="h-4 w-4" /> View My Applications
          </Link>
          <Link to="/applicant/loans" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-border text-sm font-semibold text-ink-700 hover:bg-surface hover:text-ink-900 transition-colors">
            <CreditCard className="h-4 w-4" /> View Active Loans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
