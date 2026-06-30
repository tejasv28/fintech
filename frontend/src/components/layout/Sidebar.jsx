import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'All Applications', path: '/admin/applications', icon: FileText },
          { name: 'Active Loans', path: '/admin/loans', icon: CreditCard },
        ];
      case 'LOAN_OFFICER':
        return [
          { name: 'Dashboard', path: '/officer', icon: LayoutDashboard },
          { name: 'Application Queue', path: '/officer/queue', icon: FileText },
        ];
      case 'APPLICANT':
        return [
          { name: 'Dashboard', path: '/applicant', icon: LayoutDashboard },
          { name: 'Apply for Loan', path: '/applicant/apply', icon: FileText },
          { name: 'My Applications', path: '/applicant/applications', icon: FileText },
          { name: 'My Loans', path: '/applicant/loans', icon: CreditCard },
        ];
      default:
        return [];
    }
  };

  const items = getNavItems();

  return (
    <div className="flex flex-col w-64 bg-finNavy text-white h-screen fixed">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <Shield className="h-8 w-8 text-finBlue mr-2" />
        <h1 className="text-2xl font-bold">FinShield</h1>
      </div>
      
      <div className="flex flex-col flex-grow p-4 space-y-2 mt-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-finBlue text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-gray-300 hover:bg-finRed hover:text-white rounded-lg w-full transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
