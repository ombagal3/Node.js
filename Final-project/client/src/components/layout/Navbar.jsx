import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Shield, User as UserIcon } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:inline-block">
            SecureGuard <span className="text-indigo-400">Hub</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Info & Role Badge */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">{user?.name}</span>
            <span className="text-[10px] text-slate-400">{user?.email}</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>

            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                user?.role === 'admin'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
