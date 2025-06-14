import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState, useResetRecoilState } from 'recoil';
import { sidebarState, userStates, authState, companyNameState } from '../../../atoms';
import appLogo from '../../../assets/appIcon-removebg-preview.png';
import { 
  Home, 
  Users, 
  BookOpen, 
  Image, 
  Crown, 
  BarChart2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userStates);
  const resetUser = useResetRecoilState(userStates);
  const resetSidebar = useResetRecoilState(sidebarState);
  const resetAuth = useResetRecoilState(authState);
  const resetCompanyName = useResetRecoilState(companyNameState);
  const [isOpen, setIsOpen] = useRecoilState(sidebarState);
  const location = useLocation();
  const user = useRecoilValue(userStates);
  const role = user?.role?.toUpperCase();  const allNavItems = [
    { path: 'dashboard', label: 'Dashboard', icon: Home, roles: ['SUPERUSER', 'ADMIN', 'PARENT_GUARDIAN'] },
    { path: 'users', label: 'Users', icon: Users, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'videos', label: 'Videos', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'tests', label: 'Tests', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'PARENT_GUARDIAN', 'TEACHER'] },
    { path: 'images', label: 'Images', icon: Image, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: 'premium', label: 'Premium', icon: Crown, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'analytics', label: 'Analytics', icon: BarChart2, roles: ['SUPERUSER', 'ADMIN'] },
    { path: 'settings', label: 'Settings', icon: Settings, roles: ['SUPERUSER', 'ADMIN'] }
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(role));
  
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Reset all atoms to their default values
    resetUser();
    resetSidebar();
    resetAuth();
    resetCompanyName();
    
    // Navigate to login
    navigate("/login");
  };

  return (
    <div className={`
      ${isOpen ? 'w-64' : 'w-16'} 
      fixed left-0 h-screen bg-white
      flex flex-col shadow-lg transition-all duration-300 z-50
    `}>
      {/* Logo Section */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200">
        <img src={appLogo} alt="App Logo" className={`${isOpen ? 'w-32' : 'w-12'} transition-all duration-300`} />
      </div>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <span className={`font-bold text-duo-gray-700 text-lg transition-all duration-300 ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
          Book8 Admin
        </span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white 
            transition-all duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502]
            focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
        >
          {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col h-full py-6 px-3">
        <div className="flex-1 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const fullPath = `/app/${item.path}`;
            const isActive = location.pathname === fullPath || 
              (fullPath !== '/app/dashboard' && location.pathname.startsWith(fullPath));
            
            return (
              <Link
                key={item.path}
                to={fullPath}
                className={`
                  flex items-center px-3 py-3 rounded-xl transition-all duration-200
                  font-bold text-sm
                  ${isActive 
                    ? 'bg-[#58cc02] text-white border-b-2 border-[#3c9202]' 
                    : 'text-duo-gray-600 hover:bg-[#e5f6ff] hover:text-[#1cb0f6]'}
                  ${!isOpen ? 'justify-center h-12' : 'h-10'}
                  focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2
                `}
              >
                <div className="relative group flex items-center">
                  <Icon 
                    size={24} 
                    className={`
                      ${isActive ? 'text-white' : 'text-duo-gray-600'} 
                      ${!isOpen && 'transition-transform duration-200 group-hover:scale-110'}
                    `} 
                  />
                  <span 
                    className={`
                      ml-4 transition-all duration-300 font-semibold
                      ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
                    `}
                  >
                    {item.label}
                  </span>
                  {/* Tooltip */}
                  {!isOpen && (
                    <div className="absolute left-full   ml-2 px-2 py-1 bg-duo-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-3 rounded-xl
              text-duo-gray-600 hover:bg-[#ffd4d4] hover:text-[#ff4b4b]
              transition-all duration-200 font-bold text-sm
              focus:outline-none focus:ring-2 focus:ring-[#ff4b4b] focus:ring-offset-2
              ${!isOpen ? 'justify-center h-12' : 'h-10'}
            `}
          >
            <div className="relative group">
              <LogOut 
                size={24} 
                className="text-duo-gray-600 group-hover:text-[#ff4b4b] transition-colors duration-200"
              />
              <span 
                className={`
                  ml-3 transition-all duration-300
                  ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
                `}
              >
                Logout
              </span>
              {!isOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-duo-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
