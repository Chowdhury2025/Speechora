import React from 'react';
import appLogo from '../assets/appIcon-removebg-preview.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <img className="h-24 w-auto" src={appLogo} alt="App Logo" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
