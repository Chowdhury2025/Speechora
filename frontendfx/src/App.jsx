import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { RecoilRoot, useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { authState, userStates, sidebarState } from './atoms';

import Sidebar from './app/components/common/Sidebar.jsx';

// Dashboard Pages
import DashboardPage from './app/pages/DashboardPage.jsx';
import ParentDashboard from './app/pages/ParentDashboard.jsx';
import UsersPage from './app/pages/UsersPage.jsx';
import TestsPage from './app/pages/TestsPage.jsx';
import ImagesPage from './app/pages/Images/ImagesPage.jsx'
import ImageUploadPage from './components/Images/ImageUpload.jsx';
import { QuizImagesPage, QuizImageUploadPage, QuizImageEditPage } from './app/pages/QuizImages/QuizImagesPage.jsx';

import PremiumSalesPage from './app/pages/PremiumSalesPage.jsx';
import AnalyticsPage from './app/pages/AnalyticsPage.jsx';
import SettingsPage from './app/pages/SettingsPage.jsx';
import VideoUploadPage from './app/pages/VideoUploadPage.jsx';
import VideoListPage from './app/pages/VideoListPage.jsx';
import UserManagementScreen from './auth/UserManagementScreen.jsx';

import Register from './auth/Register.jsx';
import { ForgotPassword } from './auth/Forgot_password.jsx';
import { Login } from './auth/Login.jsx';
import UpdatePassword from './auth/Update_password.jsx';
import EmailVerification from './auth/EmailVerification.jsx';
import NotFound from './auth/NotFound.jsx';
import NoRoleAssigned from './auth/NoRoleAssigned.jsx';
import ProfileUpdateModal from './app/modals/ProfileUpdateModal.jsx';
import LandingPage from './app/pages/LandigPage.jsx'; // Added import
import LessonsListPage from './app/pages/lessons/LessonsListPage.jsx';
import CreateLessonPage from './app/pages/lessons/CreateLessonPage.jsx';
import EditLessonPage from './app/pages/lessons/EditLessonPage.jsx';
import PromoCodesPage from './app/pages/PromoCodesPage.jsx';
import Presentation3List from './components/Presentation3List';
import Presentation3Form from './components/Presentation3Form';
import PaymentCallback from './components/PaymentCallback';

// Define which menu items are accessible to each role
const ROLE_PERMISSIONS = {
  SUPERUSER: ['Dashboard', 'Lessonscreate','Parent Dashboard', 'Users', 'Videos', 'Tests', 'Lessons', 'Images', 'Quiz Images', 'Premium', 'Analytics', 'Settings', 'IWantNeeds', 'Videos-Upload', 'Promo Codes', 'Presentation3'],
  ADMIN: ['Dashboard', 'Parent Dashboard', 'Users', 'Videos', 'Tests', 'Lessons', 'Images', 'Quiz Images', 'Premium', 'Analytics', 'Settings', 'IWantNeeds', 'Promo Codes', 'Presentation3'],
  CONTENTMANAGER: ['Parent Dashboard', 'Videos', 'Tests', 'Lessons', 'Images', 'Quiz Images', 'IWantNeeds', 'Presentation3'],
  SUPPORT: ['Users', 'Premium', 'IWantNeeds', 'Promo Codes'],
  GUARDIAN_PARENT: ['Parent Dashboard', 'Premium',],
  TEACHER: ['Parent Dashboard', 'Videos', 'Tests', 'Lessons', 'Quiz Images'],
};

// Define all app routes (must match ROLE_PERMISSIONS names)
const APP_ROUTES = [
  { name: 'Dashboard', path: 'dashboard', element: DashboardPage },
  { name: 'Parent Dashboard', path: 'parent-dashboard', element: ParentDashboard },
  { name: 'Users', path: 'users', element: UsersPage },
  { name: 'Tests', path: 'tests', element: TestsPage },
  { name: 'Lessons', path: 'lessonslist', element: LessonsListPage },
  { name: 'Images', path: 'images', element: ImagesPage },
  { name: 'Quiz Images', path: 'quiz-images', element: QuizImagesPage },
  { name: 'Premium', path: 'premium', element: PremiumSalesPage },
  { name: 'Analytics', path: 'analytics', element: AnalyticsPage },
  { name: 'Settings', path: 'settings', element: SettingsPage },
  { name: 'Videos', path: 'videos', element: VideoListPage },
  { name: 'Videos-Upload', path: 'videos/upload', element: VideoUploadPage },
  { name: 'Dashboard', path: 'dashboard', element: DashboardPage },
  { name: 'Users',     path: 'users',     element: UsersPage },
  { name: 'Videos',    path: 'videos',    element: VideoListPage },  
  { name: 'Lessonslist',   path: 'lessonslist',   element: LessonsListPage },
  { name: 'Lessonscreate',   path: 'lessons/create',   element: CreateLessonPage },
  { name: 'Lessonsedit',   path: 'lessons/edit/:id', element: EditLessonPage },
  { name: 'Videos-Upload', path: 'videos-upload', element: VideoUploadPage },
  { name: 'Tests',     path: 'tests',     element: TestsPage },
  { name: 'Images',    path: 'images',    element: ImagesPage },
  { name: 'Images',    path: 'images/upload', element: ImageUploadPage },
  { name: 'Quiz Images', path: 'quiz-images', element: QuizImagesPage },
  { name: 'Quiz Images', path: 'quiz-images/upload', element: QuizImageUploadPage },
  { name: 'Quiz Images', path: 'quiz-images/edit/:id', element: QuizImageEditPage },
  { name: 'Premium',   path: 'premium',   element: PremiumSalesPage },
  { name: 'Settings',  path: 'settings',  element: SettingsPage },
  { name: 'Promo Codes', path: 'promo-codes', element: PromoCodesPage },
  { name: 'Presentation3', path: 'presentation3', element: Presentation3List },
  { name: 'Presentation3', path: 'presentation3/new', element: Presentation3Form },
  
  // Sub-routes
  { name: 'Videos',    path: 'videos/upload', element: VideoUploadPage },
  { name: 'Images',    path: 'images/upload', element: ImageUploadPage }
];

// Find the first allowed route for a given user role
function getFirstAllowedRoute(role) {
  const allowedPages = ROLE_PERMISSIONS[role?.toUpperCase()] || [];
  // Only check main routes, not sub-routes
  const mainRoutes = APP_ROUTES.filter(route => !route.path.includes('/upload'));
  const firstAllowedPage = mainRoutes.find(route => allowedPages.includes(route.name));
  
  if (firstAllowedPage) {
    // Remove leading slash and format path
    const routePath = firstAllowedPage.path.replace(/^\//, '');
    return `/app/${routePath}`;
  }
}

// Protects a route based on `permission` string
function ProtectedRoute({ permission, children }) {
  const isAuthenticated = useRecoilValue(authState);
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

   

    const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
    if (!allowed.includes(permission)) {
      const firstRoute = getFirstAllowedRoute(user.role);
      navigate(firstRoute, { replace: true });
    }
  }, [isAuthenticated, user, permission, navigate]);


  // const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
  // if (!allowed.includes(permission)) {
  //   return null;
  // }

  return children;
}

// Handle the special case for the index route (now for /app)
function IndexRouteHandler() {
  const isAuthenticated = useRecoilValue(authState);
  const user = useRecoilValue(userStates);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

   

    const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
    if (!allowed.includes('Dashboard')) {
      const firstAllowedRoute = getFirstAllowedRoute(user.role);
      navigate(firstAllowedRoute, { replace: true });
    } else {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return null;
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
  const setAuth = useSetRecoilState(authState);
  const setUser = useSetRecoilState(userStates);
  const navigate = useNavigate();  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // if (!user?.role || user.role === 'STAFF') {
    //   navigate('/no-role', { replace: true });
    //   return;
    // }

    // If we're at /app exactly, redirect to the proper route
    if (window.location.pathname === '/app') {
      const allowed = ROLE_PERMISSIONS[user.role.toUpperCase()] || [];
      if (allowed.includes('Dashboard')) {
        navigate('/app/dashboard', { replace: true });
      } else {
        const firstRoute = getFirstAllowedRoute(user.role);
        navigate(firstRoute, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setAuth(false);
    navigate("/login");
  };
  return (    <div className='flex h-screen bg-gradient-to-br from-azure-500 to-azure-400 overflow-hidden'>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Navigation Bar */}
        <header className='bg-white border-b-2 border-[#e5f5d5] shadow-sm'>
          <div className='px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
            <h1 className='text-xl font-bold text-[#3c9202] transition-all duration-300'>
              Kids Learning Platform Admin
            </h1>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-3'>
                <div className='h-9 w-9 rounded-xl bg-[#58cc02] border-b-2 border-[#3c9202] flex items-center justify-center shadow-sm'>
                  <span className='text-white text-sm font-bold'>
                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-bold text-[#3c9202]'>
                    {user?.email}
                  </span>
                  <span className='text-xs font-medium text-[#58cc02]'>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>{/* Main Content Area */}
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
      {/* <DocumentTitle /> */}
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/update/password' element={<UpdatePassword />} />
         <Route path='/verify-email' element={<EmailVerification />} />
          <Route path='/verify/email/:token' element={<EmailVerification />} />
          <Route path='/payment-callback' element={<PaymentCallback />} />
          {/* <Route path='/no-role' element={<NoRoleAssigned />} /> */}
          <Route path='/test' element={<UserManagementScreen />} />          
              {/* Authenticated app routes under /app */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<IndexRouteHandler />} />
                {/* Map all protected routes */}
            {APP_ROUTES.map(({ name, path, element: Component }) => (
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
            
            {/* Fallback for unknown paths under /app */}
            <Route path='*' element={<NotFound />} />
          </Route>
          
          {/* Fallback for any other unknown top-level paths */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
