import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, LogOut, Shield, Users, CheckSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN': return [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'All Applications', path: '/admin/applications', icon: FileText },
        { name: 'Active Loans', path: '/admin/loans', icon: CreditCard },
        { name: 'Officer Reports', path: '/admin/officer-reports', icon: Users },
      ];
      case 'LOAN_OFFICER': return [
        { name: 'Dashboard', path: '/officer', icon: LayoutDashboard },
        { name: 'Application Queue', path: '/officer/queue', icon: FileText },
      ];
      case 'APPLICANT': return [
        { name: 'Dashboard', path: '/applicant', icon: LayoutDashboard },
        { name: 'Eligibility Check', path: '/applicant/eligibility-check', icon: CheckSquare },
        { name: 'Apply for Loan', path: '/applicant/apply', icon: FileText },
        { name: 'My Applications', path: '/applicant/applications', icon: FileText },
        { name: 'My Loans', path: '/applicant/loans', icon: CreditCard },
      ];
      default: return [];
    }
  };

  const items = getNavItems();
  const initials = user?.fullName ? user.fullName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div className="flex flex-col w-64 bg-ink-700 text-white h-screen fixed">
      <div className="flex flex-col items-start px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
            <Shield className="h-4 w-4 text-accent" />
          </span>
          <h1 className="font-display text-lg font-bold text-white">FinShield</h1>
        </div>
        <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-300">
          Underwriting Engine
        </span>
      </div>

      <div className="flex flex-col flex-grow px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.name} to={item.path}
              end={item.path === '/admin' || item.path === '/officer' || item.path === '/applicant'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-accent text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`
              }>
              {({ isActive }) => isActive ? (
                <>
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-white" />
                  <Icon className="h-[18px] w-[18px]" />{item.name}
                </>
              ) : (
                <><Icon className="h-[18px] w-[18px]" />{item.name}</>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="px-3 pb-4">
        <div className="my-2 border-t border-white/[0.08]" />
        <div className="flex items-center gap-3 px-2 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.fullName || 'User'}</p>
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-300">{role?.replace('_', ' ')}</span>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-danger/20 transition-all duration-150">
          <LogOut className="h-[18px] w-[18px]" />Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
