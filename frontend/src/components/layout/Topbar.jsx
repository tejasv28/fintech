import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, User } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 ml-64 sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.fullName}</h2>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString(undefined, dateOptions)}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-finBlue text-white flex items-center justify-center font-bold">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-gray-500 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
