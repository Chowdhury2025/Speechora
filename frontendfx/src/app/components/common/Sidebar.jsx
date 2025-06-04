import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { sidebarState, userStates } from '../../../atoms';
import { 
  Home, 
  Users, 
  BookOpen, 
  Image, 
  Crown, 
  BarChart2, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useRecoilState(sidebarState);
  const location = useLocation();
  const user = useRecoilValue(userStates);
  const role = user?.role?.toUpperCase();

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: Home, roles: ['SUPERUSER', 'ADMIN', 'PARENT_GUARDIAN'] },
    { path: '/users', label: 'Users', icon: Users, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: '/tests', label: 'Tests', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'PARENT_GUARDIAN'] },
    { path: '/images', label: 'Images', icon: Image, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: '/premium', label: 'Premium', icon: Crown, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: '/analytics', label: 'Analytics', icon: BarChart2, roles: ['SUPERUSER', 'ADMIN'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['SUPERUSER', 'ADMIN'] }
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (    <div className={`
      ${isOpen ? 'w-64' : 'w-16'} 
      fixed left-0 h-screen bg-gradient-to-b from-sky_blue-400 to-sky_blue-500
      flex flex-col shadow-xl transition-all duration-300 z-50
    `}>
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sky_blue-300">
        <span className={`font-bold text-white text-lg transition-opacity duration-300 ${!isOpen && 'opacity-0 w-0'}`}>
          Book8 Admin
        </span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-sky_blue-300 text-white transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`                flex items-center px-3 py-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-kelly-500 text-white' 
                  : 'text-white hover:bg-sky_blue-300 hover:text-white'}
                ${!isOpen && 'justify-center'}
              `}
            >
              <Icon size={20} />
              <span className={`ml-3 transition-opacity duration-300 ${!isOpen && 'opacity-0 w-0 hidden'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
