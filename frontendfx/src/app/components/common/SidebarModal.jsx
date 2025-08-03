import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PlaySquare,
  GraduationCap,
  BookOpen,
  ImagePlus,
  Image,
  Crown,
  BarChart2,
  Settings,
  ChevronLeft,
  X
} from 'lucide-react';

const SidebarModal = ({ isOpen, onClose, user, navItems, handleLogout }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 left-0 max-w-[280px] w-full bg-white shadow-xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Book8 Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const fullPath = `/app/${item.path}`;
              const isActive = location.pathname === fullPath ||
                (fullPath !== '/app/dashboard' && location.pathname.startsWith(fullPath));

              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-[#58cc02] text-white border-b-2 border-[#3c9202]'
                      : 'text-slate-600 hover:bg-[#e5f6ff] hover:text-[#1cb0f6]'
                    }
                  `}
                >
                  <Icon size={24} className={isActive ? 'text-white' : ''} />
                  <span className="ml-3 font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="border-t border-slate-200 p-3">
            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="w-full flex items-center px-3 py-3 rounded-xl
                text-slate-600 hover:bg-[#ffd4d4] hover:text-[#ff4b4b]
                transition-all duration-200 font-semibold"
            >
              <ChevronLeft size={24} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarModal;
