import React from 'react';
import { LayoutDashboard, BookOpen, Users, BookUp, LogOut, X, UserCircle } from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  onLogout, 
  userRole,
  isOpen,
  onClose
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowed: ['admin', 'user'] },
    { id: 'books', label: 'Books', icon: BookOpen, allowed: ['admin', 'user'] },
    { id: 'students', label: 'Students', icon: Users, allowed: ['admin'] }, 
    { id: 'issue_book', label: 'Issue Book', icon: BookUp, allowed: ['admin'] },
    { id: 'profile', label: 'My Profile', icon: UserCircle, allowed: ['admin', 'user'] },
  ];

  return (
    <>
      {/* Mobile Overlay (Only visible on mobile when open) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container 
          - Mobile: Fixed, full height, slides in from left, high z-index
          - Desktop: Relative/Block, positioned in flow, persistent, glass effect
      */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 
        bg-white/90 backdrop-blur-2xl border-r border-white/60 shadow-2xl
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:inset-auto md:h-[96vh] md:my-auto md:ml-4 md:rounded-3xl md:border md:shadow-xl md:glass
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="h-24 md:h-32 flex flex-col items-center justify-center border-b border-slate-900/5 gap-2 relative">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-400 text-white font-bold text-xl font-serif">
            L
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Library System</h1>
          
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-8 space-y-2 overflow-y-auto">
          <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</div>
          {navItems
            .filter(item => item.allowed.includes(userRole))
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id as ViewState);
                    onClose(); // Close sidebar on selection (mobile)
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 font-medium text-sm group ${
                    isActive
                      ? 'bg-slate-900 shadow-lg shadow-gray-300 text-white scale-[1.02]'
                      : 'text-gray-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon size={20} className={`transition-transform duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:scale-110"}`} />
                  <span>{item.label}</span>
                </button>
              );
          })}
        </nav>

        <div className="p-6 border-t border-slate-900/5 mt-auto">
          <div className="mb-4 px-2">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Logged in as</div>
            <div className="text-sm font-bold capitalize text-slate-900 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${userRole === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
              {userRole}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-all text-sm font-medium group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};