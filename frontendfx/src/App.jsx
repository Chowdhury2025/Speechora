import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { authState, userStates } from './atoms';
import { API_URL } from './config';
import axios from 'axios';

import Sidebar from './app/components/common/Sidebar.jsx';
import DocumentTitle from './components/DocumentTitle.jsx';

// Dashboard Pages
import DashboardPage from './app/pages/DashboardPage.jsx';
import UsersPage from './app/pages/UsersPage.jsx';
import TestsPage from './app/pages/TestsPage.jsx';
import ImagesPage from './app/pages/ImagesPage.jsx';
import PremiumSalesPage from './app/pages/PremiumSalesPage.jsx';
import AnalyticsPage from './app/pages/AnalyticsPage.jsx';
import SettingsPage from './app/pages/SettingsPage.jsx';
import ExpensesPage from './app/pages/ExpensesPage.jsx';
import Test from './app/Test.jsx';

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
  SUPERUSER: ['Dashboard', 'Users', 'Tests', 'Images', 'Premium', 'Analytics', 'Settings'],
  ADMIN: ['Dashboard', 'Users', 'Tests', 'Images', 'Premium', 'Analytics', 'Settings'],
  CONTENTMANAGER: ['Tests', 'Images'],
  SUPPORT: ['Users', 'Premium'],
};

// Define all app routes (must match ROLE_PERMISSIONS names)
const APP_ROUTES = [
  { name: 'Dashboard', path: '/',         element: DashboardPage },
  { name: 'Users',     path: 'users',     element: UsersPage },
  { name: 'Tests',     path: 'tests',     element: TestsPage },
  { name: 'Images',    path: 'images',    element: ImagesPage },
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

  const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
  if (!allowed.includes('Overview')) {
    return <Navigate to={getFirstAllowedRoute(user.role)} replace />;
  }

  return <OverviewPage />;
}

// AutoLogout component to handleLogout user after 3 minutes of inactivity
function AutoLogout() {
  const setAuth = useSetRecoilState(authState);
  const setUser = useSetRecoilState(userStates);
  const navigate = useNavigate();
  const [autoLogoutTime, setAutoLogoutTime] = useState(30); // Default to 30 minutes

  useEffect(() => {
    // Fetch system settings when component mounts
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/system/settings`);
        if (response.data && response.data.autoLogoutTime) {
          setAutoLogoutTime(response.data.autoLogoutTime);
        }
      } catch (error) {
        console.error('Failed to fetch auto logout time:', error);
      }
    };
    fetchSettings();
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Navigation Bar */}
        <header className='bg-white shadow-sm'>
          <div className='px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Kids Learning Platform Admin
            </h1>
            <div className='flex items-center space-x-4'>
              <span className='text-gray-600'>
                {user?.email}
              </span>
              <span className='px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto bg-gray-50 p-6'>
          <AutoLogout />
          <Outlet />
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
        <Routes>
          {/* Public routes */}
          <Route path='/quotation' element={<QuotationPage />} />
          <Route path='/test' element={<Test />} />
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
