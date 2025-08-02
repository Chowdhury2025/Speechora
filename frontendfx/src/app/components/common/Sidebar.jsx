import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState, useResetRecoilState } from 'recoil';
import { sidebarState, userStates, authState, companyNameState } from '../../../atoms';
import appLogo from '../../../assets/appIcon-removebg-preview.png';
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
  const role = user?.role?.toUpperCase();

  const allNavItems = [
    // Admin Dashboard
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPERUSER', 'ADMIN',] },
    // Parent Dashboard
    { path: 'parent-dashboard', label: 'Parent Dashboard', icon: LayoutDashboard, roles: ['GUARDIAN_PARENT', 'SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'images', label: 'Presentation 1', icon: Image, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: 'lessons', label: 'Presentation 2', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'presentation3', label: 'Presentation 3', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: 'lessons', label: 'presentation 3', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'quiz-images', label: 'presentation 4,5', icon: ImagePlus, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: 'videos', label: 'presentation 6', icon: PlaySquare, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'premium', label: 'Premium', icon: Crown, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'users', label: 'Users', icon: Users, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'tests', label: 'Tests', icon: GraduationCap, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },

    { path: 'promo-codes', label: 'Promo Codes', icon: Crown, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
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
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 p-2 rounded-lg bg-[#58cc02] text-white md:hidden z-50
          hover:bg-[#47b102] active:bg-[#3c9202] transition-all duration-200
          border-b-2 border-[#3c9202] hover:border-[#2e7502]
          focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
      >
        {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
      </button>

      {/* Overlay - Only visible on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        ${isOpen ? 'w-[280px] translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'} 
        fixed left-0 h-screen bg-white
        flex flex-col shadow-lg transition-all duration-300 z-50
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-center p-3 sm:p-4 border-b border-gray-200">
          <img src={appLogo} alt="App Logo" className={`${isOpen ? 'w-28 sm:w-32' : 'w-0 sm:w-12'} transition-all duration-300`} />
        </div>
        <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b border-slate-200">
          <span className={`font-bold text-duo-gray-700 text-base sm:text-lg transition-all duration-300 ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
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
        </div>      {/* Navigation Items */}
        <nav className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] py-4 sm:py-6 px-2 sm:px-3">
          <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto custom-scrollbar max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-12rem)]">
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
                  flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-200
                  font-bold text-xs sm:text-sm
                  ${isActive
                      ? 'bg-[#58cc02] text-white border-b-2 border-[#3c9202]'
                      : 'text-duo-gray-600 hover:bg-[#e5f6ff] hover:text-[#1cb0f6]'}
                  ${!isOpen ? 'justify-center w-10 sm:w-12 h-10 sm:h-12' : 'h-9 sm:h-10'}
                  focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2
                `}
                >
                  <div className={`relative group flex items-center ${!isOpen ? 'justify-center' : ''}`}>
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
          <div className="sticky bottom-0 pt-4 mt-auto border-t border-slate-200 bg-white">
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
                    Logonbhjut
                  </div>
                )}
              </div>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
