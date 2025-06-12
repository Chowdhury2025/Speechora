import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { RecoilRoot, useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { authState, userStates, sidebarState } from './atoms';
import { API_URL } from './config';
import api from './utils/api';

import Sidebar from './app/components/common/Sidebar.jsx';
import DocumentTitle from './components/DocumentTitle.jsx';
// import IWantNeedsPage from './app/pages/IWantNeedsPage.jsx';

// Dashboard Pages
import DashboardPage from './app/pages/DashboardPage.jsx';
import UsersPage from './app/pages/UsersPage.jsx';
import TestsPage from './app/pages/TestsPage.jsx';
import ImagesPage from './app/pages/ImagesPage.jsx';
import ImageUploadPage from './components/Images/ImageUpload.jsx';

import PremiumSalesPage from './app/pages/PremiumSalesPage.jsx';
import AnalyticsPage from './app/pages/AnalyticsPage.jsx';
import SettingsPage from './app/pages/SettingsPage.jsx';
import VideoUploadPage from './app/pages/VideoUploadPage.jsx';
import VideoListPage from './app/pages/VideoListPage.jsx';

import Register from './auth/Register.jsx';
import { ForgotPassword } from './auth/Forgot_password.jsx';
import { Login } from './auth/Login.jsx';
import UpdatePassword from './auth/Update_password.jsx';
import EmailVerification from './auth/EmailVerification.jsx';
import NotFound from './auth/NotFound.jsx';
import NoRoleAssigned from './auth/NoRoleAssigned.jsx';
import ProfileUpdateModal from './app/modals/ProfileUpdateModal.jsx';

// Define which menu items are accessible to each role
const ROLE_PERMISSIONS = {
  SUPERUSER: ['Dashboard', 'Users', 'Videos', 'Tests', 'Images', 'Premium', 'Analytics', 'Settings', 'IWantNeeds'],
  ADMIN: ['Dashboard', 'Users', 'Videos', 'Tests', 'Images', 'Premium', 'Analytics', 'Settings', 'IWantNeeds'],
  CONTENTMANAGER: ['Videos', 'Tests', 'Images', 'IWantNeeds'],
  SUPPORT: ['Users', 'Premium', 'IWantNeeds'],
  PARENT_GUARDIAN: ['Dashboard', 'Tests', 'Images', 'IWantNeeds'],
  TEACHER: ['Videos', 'Tests'],
};

// Define all app routes (must match ROLE_PERMISSIONS names)
const APP_ROUTES = [
  { name: 'Dashboard', path: '/',         element: DashboardPage },
  { name: 'Users',     path: 'users',     element: UsersPage },
  { name: 'Videos',    path: 'videos',    element: VideoListPage },
  { name: 'Videos',    path: 'videos/upload',    element: VideoUploadPage },  { name: 'Tests',     path: 'tests',     element: TestsPage },
  { name: 'Images',    path: 'images',    element: ImagesPage },
  { name: 'Images',    path: 'images/upload',    element: ImageUploadPage },
  { name: 'Premium',   path: 'premium',   element: PremiumSalesPage },
  { name: 'Analytics', path: 'analytics', element: AnalyticsPage },
  { name: 'Settings',  path: 'settings',  element: SettingsPage },
 
];

// Find the first allowed route for a given user role
function getFirstAllowedRoute(role) {
  const allowedPages = ROLE_PERMISSIONS[role?.toUpperCase()] || [];
  const firstAllowedPage = APP_ROUTES.find(route => allowedPages.includes(route.name));
  return firstAllowedPage ? `/${firstAllowedPage.path}` : '/no-role'; 
}

// Protects a route based on `permission` string
function ProtectedRoute({ permission, children }) {
  const isAuthenticated = useRecoilValue(authState);
  const user = useRecoilValue(userStates);

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Redirect both no role and STAFF role to no-role screen
  if (!user?.role || user.role === 'STAFF') {
    return <Navigate to='/no-role' replace />;
  }

  const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
  if (!allowed.includes(permission)) {
    return <Navigate to={getFirstAllowedRoute(user.role)} replace />;
  }

  return children;
}

// Handle the special case for the index route
function IndexRouteHandler() {
  const isAuthenticated = useRecoilValue(authState);
  const user = useRecoilValue(userStates);

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Redirect both no role and STAFF role to no-role screen
  if (!user?.role || user.role === 'STAFF') {
    return <Navigate to='/no-role' replace />;
  }

  const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];  if (!allowed.includes('Dashboard')) {
    return <Navigate to={getFirstAllowedRoute(user.role)} replace />;
  }

  return <DashboardPage />;
}

// AutoLogout component to handleLogout user after 3 minutes of inactivity
function AutoLogout() {
  const setAuth = useSetRecoilState(authState);
  const setUser = useSetRecoilState(userStates);
  const navigate = useNavigate();
  const [autoLogoutTime, setAutoLogoutTime] = useState(30); // Default to 30 minutes
  useEffect(() => {
    // Using default auto logout time since system settings API is not ready
    const defaultAutoLogoutTime = 30; // 30 minutes
    setAutoLogoutTime(defaultAutoLogoutTime);
  }, []);

  useEffect(() => {
    let timer;
   
    const handleLogout = () => {
      localStorage.removeItem("user");
      setUser(null);
      setAuth(false);
      navigate("/login");
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, autoLogoutTime * 60 * 1000); // Convert minutes to milliseconds
    };

    // List of events that reset the inactivity timer
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Initialize timer
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timer) clearTimeout(timer);
    };
  }, [setAuth, setUser, navigate, autoLogoutTime]);

  return null;
}

function Layout() {
  const isAuthenticated = useRecoilValue(authState);
  const user = useRecoilValue(userStates);
  const [isSidebarOpen] = useRecoilState(sidebarState);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return (    <div className='flex h-screen bg-gradient-to-br from-azure-500 to-azure-400 overflow-hidden'>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Navigation Bar */}
        <header className='bg-white border-b border-azure-300'>
          <div className='px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
            <h1 className='text-xl font-semibold text-sky_blue-400 transition-all duration-300'>
              Kids Learning Platform Admin
            </h1>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-3'>
                <div className='h-8 w-8 rounded-full bg-sky_blue-500 flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>
                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium text-gray-700'>
                    {user?.email}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>        {/* Main Content Area */}
        <main className='flex-1 overflow-auto bg-azure-500 bg-opacity-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <AutoLogout />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <RecoilRoot>
      <DocumentTitle />
      <BrowserRouter>
        <Routes>          {/* Public routes */}
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/update/password' element={<UpdatePassword />} />
          <Route path='/verify/email/:token' element={<EmailVerification />} />
          <Route path='/no-role' element={<NoRoleAssigned />} />

          {/* Dashboard with protected routes */}
          <Route path='/' element={<Layout />}>
            {/* Special case for index route */}
            <Route index element={<IndexRouteHandler />} />

            {/* All other routes */}
            {APP_ROUTES.filter(route => route.path !== '/').map(({ name, path, element: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute permission={name}>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Fallback for unknown paths */}
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
