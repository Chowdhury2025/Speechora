/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import AuthLayout from './AuthLayout';

const EmailVerification = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState(token || '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('pending'); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get from localStorage if not in URL
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo.email) {
        setEmail(userInfo.email);
      }
    }

    // Auto verify if we have both token and email
    if (token && emailParam) {
      handleVerifyEmail();
    }
  }, [location, token]);

  const handleVerifyEmail = async () => {
    if (!email || !verificationToken) {
      setMessage('Email and verification code are required');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/user/verify-email`, {
        email,
        token: verificationToken,
        frontendUrl: window.location.origin
      });

      setMessage('Email verified successfully! Redirecting to login...');
      setStatus('success');
      
      // Redirect to login after successful verification
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setMessage(
        error.response?.data || 
        'Verification failed. Please check your code and try again.'
      );
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Email is required to resend verification');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/user/resend-verification`, {
        email
      });

      setMessage('Verification email has been resent. Please check your inbox.');
      setStatus('success');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(
        error.response?.data || 
        'Failed to resend verification email. Please try again later.'
      );
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-duo-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-duo-gray-700">
            Email Verification
          </h2>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-duo-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-duo-gray-700 font-bold">{message}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-duo-green-500 hover:bg-duo-green-600 text-white font-bold py-3 px-4 rounded-xl border-b-4 border-duo-green-700 hover:border-duo-green-800 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:mt-1 active:border-t-4 transition-all duration-200"
                >
                  Go to Login
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-duo-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-duo-red-500 font-bold">{message}</p>
                <button
                  onClick={handleVerifyEmail}
                  disabled={isLoading}
                  className="w-full bg-duo-green-500 hover:bg-duo-green-600 text-white font-bold py-3 px-4 rounded-xl border-b-4 border-duo-green-700 hover:border-duo-green-800 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:mt-1 active:border-t-4 transition-all duration-200"
                >
                  {isLoading ? 'Verifying...' : 'Try Again'}
                </button>
              </div>
            )}

            {status === 'pending' && (
              <form onSubmit={handleVerifyEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-duo-gray-600">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-duo-gray-200 focus:border-duo-green-500 focus:ring-1 focus:ring-duo-green-500 font-medium text-duo-gray-700 placeholder-duo-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-duo-gray-600">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-duo-gray-200 focus:border-duo-green-500 focus:ring-1 focus:ring-duo-green-500 font-medium text-duo-gray-700 placeholder-duo-gray-400"
                      placeholder="Enter verification code"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-duo-green-500 hover:bg-duo-green-600 text-white font-bold py-3 px-4 rounded-xl border-b-4 border-duo-green-700 hover:border-duo-green-800 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:mt-1 active:border-t-4 transition-all duration-200"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="w-full text-duo-green-500 hover:text-duo-green-600 font-bold text-sm"
                  >
                    Resend verification email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;