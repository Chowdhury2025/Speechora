import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { authState, userStates, companyNameState } from './atoms';
import { API_URL } from './config';
import axios from 'axios';
import QuotationFab from './components/common/QuotationFab';

import Sidebar from './app/components/common/Sidebar.jsx';
import MobileWarningPopup from './app/components/common/mboileView.jsx';
import DocumentTitle from './components/DocumentTitle.jsx';
import QuotationPage from './components/quotation/QuotationPage.jsx';

import OverviewPage from './app/pages/OverviewPage.jsx';
import ProductsPage from './app/pages/ProductsPage.jsx';
import UsersPage from './app/pages/UsersPage.jsx';
import SalesPage from './app/pages/SalesPage.jsx';
import OrdersPage from './app/pages/OrdersPage.jsx';
import SettingsPage from './app/pages/SettingsPage.jsx';
import WarehousesStoresPage from './app/pages/WarehousesStoresPage.jsx';
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
  SUPERUSER: ['Overview', 'Products', 'Sales', 'Orders', 'Settings', 'Users', 'Add Warehouse', 'Profile', 'Expenses'],
  ADMIN:     ['Overview', 'Products', 'Sales', 'Orders', 'Settings', 'Users', 'Add Warehouse', 'Profile', 'Expenses'],
  INSPECTOR: ['Overview', 'Products', 'Sales', 'Orders', 'Settings', 'Users', 'Add Warehouse', 'Profile', 'Expenses'],
  STOREMANAGER: ['Sales', 'Orders', 'Expenses'],
};

// Define all app routes (must match ROLE_PERMISSIONS names)
const APP_ROUTES = [
  { name: 'Overview',      path: '/',             element: OverviewPage },
  { name: 'Products',      path: 'products',      element: ProductsPage },
  { name: 'Sales',         path: 'sales',         element: SalesPage },
  { name: 'Expenses',      path: 'expenses',      element: ExpensesPage },
  { name: 'Orders',        path: 'orders',        element: OrdersPage },
  { name: 'Settings',      path: 'settings',      element: SettingsPage },
  { name: 'Users',         path: 'users',         element: UsersPage },
  { name: 'Add Warehouse', path: 'add-warehouse', element: WarehousesStoresPage },
  { name: 'Profile',       path: 'profile',       element: ProfileUpdateModal },
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
  const setCompanyName = useSetRecoilState(companyNameState);


  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return (
    <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
      {/* Background */}
      <div className='fixed inset-0 -z-50'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
        <div className='absolute inset-0 backdrop-blur-sm' />
      </div>

      {/* Sidebar & Mobile Popup */}
      <MobileWarningPopup />
      <Sidebar />      {/* Content */}
      <div className='flex-1 overflow-auto p-4'>
        {/* AutoLogout component to handle inactivity-based handleLogout */}
        <AutoLogout />
        <Outlet />
        <QuotationFab />
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
