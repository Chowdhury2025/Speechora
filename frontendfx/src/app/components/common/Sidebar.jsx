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
  LogOut,
  Shield
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

  React.useEffect(() => {
    // Auto-collapse sidebar on mobile and tablet, keep open on desktop
    const handleResize = () => {
      const isMobileOrTablet = window.innerWidth < 1024; // lg breakpoint
      if (isMobileOrTablet && isOpen) {
        setIsOpen(false);
      } else if (!isMobileOrTablet && !isOpen) {
        setIsOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const allNavItems = [
    // Admin Dashboard
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPERUSER', 'ADMIN',] },
    // Parent Dashboard
    { path: 'parent-dashboard', label: 'Parent Dashboard', icon: LayoutDashboard, roles: ['GUARDIAN_PARENT', 'SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'images', label: 'Presentation 1', icon: Image, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: 'Lessonslist', label: 'Presentation 2', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'presentation3', label: 'Presentation 3', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    // { path: 'lessons', label: 'presentation 3', icon: BookOpen, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'quiz-images', label: 'presentation 4,5', icon: ImagePlus, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER'] },
    { path: 'videos', label: 'presentation 6', icon: PlaySquare, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },
    { path: 'premium', label: 'Premium', icon: Crown, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'users', label: 'Users', icon: Users, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'tests', label: 'Tests', icon: GraduationCap, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'TEACHER'] },

    { path: 'promo-codes', label: 'Promo Codes', icon: Crown, roles: ['SUPERUSER', 'ADMIN', 'SUPPORT'] },
    { path: 'analytics', label: 'Analytics', icon: BarChart2, roles: ['SUPERUSER', 'ADMIN'] },
    { path: 'settings', label: 'Settings', icon: Settings, roles: ['SUPERUSER', 'ADMIN'] },
    { path: 'privacy', label: 'Privacy Policy', icon: Shield, roles: ['SUPERUSER', 'ADMIN', 'CONTENTMANAGER', 'SUPPORT', 'GUARDIAN_PARENT', 'TEACHER'], external: true }
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(role));

  // Content management subgroup (collapsible)
  const contentKeys = ['images', 'Lessonslist', 'presentation3', 'quiz-images', 'videos'];
  // Show content management links to everyone (not role-filtered) so the folder is visible to all users
  const contentNavItems = allNavItems.filter(item => contentKeys.includes(item.path));
  const otherNavItems = navItems.filter(item => !contentKeys.includes(item.path));
  // default open so users can see the folder; auto-open when on a content route
  const [contentOpen, setContentOpen] = React.useState(true);

  // Auto-expand content group when the current path matches one of the content routes
  React.useEffect(() => {
    try {
      const current = location.pathname || '';
      const isContentPath = contentKeys.some(key => current.startsWith(`/app/${key}`));
      if (isContentPath) setContentOpen(true);
    } catch (e) {
      // ignore
    }
  }, [location.pathname]);

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
      {/* Mobile Menu Button - Only visible on mobile and tablet */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 p-2 rounded-lg bg-[#58cc02] text-white lg:hidden z-50
          hover:bg-[#47b102] active:bg-[#3c9202] transition-all duration-200
          border-b-2 border-[#3c9202] hover:border-[#2e7502]
          focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
      >
        {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
      </button>

      {/* Overlay - Only visible on mobile/tablet when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed left-0 h-screen bg-white shadow-lg transition-all duration-300 z-50
        ${isOpen ? 'w-[280px] translate-x-0' : 'w-16 lg:w-16 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-center p-3 sm:p-4 border-b border-gray-200">
          <img src={appLogo} alt="App Logo" className={`transition-all duration-300 ${
            isOpen ? 'w-28 sm:w-32' : 'w-8 sm:w-10'
          }`} />
        </div>
        <div className={`h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 border-b border-slate-200 ${
          !isOpen ? 'px-2' : ''
        }`}>
          <span className={`font-bold text-duo-gray-700 transition-all duration-300 ${
            !isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto text-base sm:text-lg'
          }`}>
            Speechora Admin
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white 
            transition-all duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502]
            focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2
            hidden lg:block"
          >
            {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        </div>      {/* Navigation Items */}
        <nav className={`flex flex-col py-4 sm:py-6 px-2 sm:px-3 transition-all duration-300 ${
          isOpen ? 'h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]' : 'h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]'
        }`}>
          <div className={`flex-1 space-y-2 sm:space-y-3 overflow-y-auto custom-scrollbar ${
            isOpen ? 'max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-12rem)]' : 'max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-12rem)]'
          }`}>
            {otherNavItems.map((item) => {
              const Icon = item.icon;
              const fullPath = item.external ? `/${item.path}` : `/app/${item.path}`;
              const isActive = item.external ? false : (location.pathname === fullPath ||
                (fullPath !== '/app/dashboard' && location.pathname.startsWith(fullPath)));

              return item.external ? (
                <a
                  key={item.path}
                  href={fullPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                  flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-200
                  font-bold text-xs sm:text-sm
                  text-duo-gray-600 hover:bg-[#e5f5d5] hover:text-[#3c9202]
                  ${!isOpen ? 'justify-center w-full h-10 sm:h-12' : 'h-9 sm:h-10'}
                  focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2
                `}
                >
                  <div className={`relative group flex items-center ${!isOpen ? 'justify-center' : ''}`}>
                    <Icon
                      size={24}
                      className="text-duo-gray-600 transition-transform duration-200 group-hover:scale-110"
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
                      <div className="absolute left-full ml-2 px-2 py-1 bg-duo-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={fullPath}
                  className={`
                  flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-200
                  font-bold text-xs sm:text-sm
                  ${isActive
                      ? 'bg-[#58cc02] text-white border-b-2 border-[#3c9202]'
                      : 'text-duo-gray-600 hover:bg-[#e5f6ff] hover:text-[#1cb0f6]'}
                  ${!isOpen ? 'justify-center w-full h-10 sm:h-12' : 'h-9 sm:h-10'}
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
                      <div className="absolute left-full ml-2 px-2 py-1 bg-duo-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Content Management collapsible group (always shown) */}
            <div className={`transition-all duration-200 ${!isOpen ? 'flex justify-center' : ''}`}>
              <div className={`w-full ${!isOpen ? 'text-center' : ''}`}>
                <button
                  onClick={() => setContentOpen(!contentOpen)}
                  className={`w-full flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-200 font-bold text-xs sm:text-sm ${
                    !isOpen ? 'justify-center h-10 sm:h-12' : 'h-9 sm:h-10'
                  }`}
                >
                  <div className={`relative group flex items-center ${!isOpen ? 'justify-center' : ''}`}>
                    <BookOpen size={24} className={`${!isOpen ? 'text-duo-gray-600' : 'text-duo-gray-600'}`} />
                    <span className={`ml-4 transition-all duration-300 font-semibold ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>Content Management</span>
                    <span className={`ml-auto mr-2 ${!isOpen ? 'opacity-0' : ''}`}>{contentOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</span>
                  </div>
                </button>

                {/* Collapsible links */}
                {contentOpen && (
                  <div className="mt-2 space-y-2 px-1">
                    {contentNavItems.length > 0 ? (
                      contentNavItems.map((item) => {
                        const Icon = item.icon;
                        const fullPath = `/app/${item.path}`;
                        const isActive = location.pathname === fullPath || (fullPath !== '/app/dashboard' && location.pathname.startsWith(fullPath));
                        return (
                          <Link
                            key={item.path}
                            to={fullPath}
                            className={`flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-200 font-bold text-xs sm:text-sm ${isActive ? 'bg-[#e8fff0] text-[#2c7b10]' : 'text-duo-gray-600 hover:bg-[#f0fff4]'} `}
                          >
                            <Icon size={18} className={`${isActive ? 'text-[#2c7b10]' : 'text-duo-gray-600'}`} />
                            <span className="ml-3">{item.label}</span>
                          </Link> 
                          
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 px-3">No content access</div>
                    )}

                    <div className="sticky bottom-4 pt-3 mb-4 border-t border-slate-200 bg-white">
                <Link
                  to="/request-data-deletion"
                  className={`flex items-center px-3 py-3 rounded-xl mb-2 text-duo-gray-600 hover:bg-[#fff4e6] hover:text-[#c76e00] transition-all duration-200 font-bold text-sm ${!isOpen ? 'justify-center h-12 px-2' : 'h-10'}`}
                >
                  <div className="relative group mx-auto flex items-center">
                    <Shield size={20} className="text-duo-gray-600 group-hover:text-[#c76e00] transition-colors duration-200" />
                    <span className={`ml-3 transition-all duration-300 ${!isOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
                      Request data deletion
                    </span>
                    {!isOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-duo-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 mb-8 ">
                        Request data deletion
                      </div>
                    )}
                  </div>
                </Link>
                <button
              onClick={handleLogout}
              className={`
              w-full flex items-center px-3 py-3 rounded-xl
              text-duo-gray-600 hover:bg-[#ffd4d4] hover:text-[#ff4b4b]
              transition-all duration-200 font-bold text-sm
              focus:outline-none focus:ring-2 focus:ring-[#ff4b4b] focus:ring-offset-2
              ${!isOpen ? 'justify-center h-12 px-2' : 'h-10'}
            `}
            >
              <div className="relative group mx-auto flex items-center">
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
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-duo-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 mb-8 ">
                    Logout
                  </div>
                )}
              </div>
            </button>
          </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
         
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
