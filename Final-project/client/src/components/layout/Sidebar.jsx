import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderLock,
  FilePlus,
  Globe,
  FolderGit2,
  PlusCircle,
  UserCheck,
  X,
  ShieldAlert,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const adminNavItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', to: '/admin/users', icon: Users },
    { label: 'Register New User', to: '/admin/users/create', icon: UserPlus },
    { label: 'System Records', to: '/admin/records', icon: FolderLock },
    { label: 'Create New Record', to: '/admin/records/create', icon: FilePlus },
  ];

  const userNavItems = [
    { label: 'Overview', to: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Available Records', to: '/user/available-records', icon: Globe },
    { label: 'My Records', to: '/user/my-records', icon: FolderGit2 },
    { label: 'Create Record', to: '/user/my-records/create', icon: PlusCircle },
    { label: 'Account Profile', to: '/user/profile', icon: UserCheck },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">SECURE CORE</h2>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                {isAdmin ? 'Admin Console' : 'User Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-300">Signed in as</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="font-mono text-[11px] text-indigo-400 truncate">{user?.email}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
