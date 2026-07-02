import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PAGE_TITLES = {
  '/admin': 'Dashboard', '/admin/applications': 'All Applications',
  '/admin/loans': 'Active Loans', '/admin/officer-reports': 'Officer Reports',
  '/officer': 'Dashboard', '/officer/queue': 'Application Queue',
  '/applicant': 'Dashboard', '/applicant/eligibility-check': 'Eligibility Check',
  '/applicant/apply': 'Apply for Loan', '/applicant/applications': 'My Applications',
  '/applicant/loans': 'My Loans',
};

const getPageTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/officer/applications/')) return 'Application Detail';
  return 'Dashboard';
};

const Topbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return (
    <header className="h-16 bg-surface-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="font-display text-lg font-semibold text-ink-900">{getPageTitle(location.pathname)}</h2>
      <div className="text-right">
        <p className="text-sm text-ink-700">Welcome, <span className="font-medium">{user?.fullName}</span></p>
        <p className="text-xs text-ink-300">{new Date().toLocaleDateString(undefined, dateOptions)}</p>
      </div>
    </header>
  );
};

export default Topbar;
