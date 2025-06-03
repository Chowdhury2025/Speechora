/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please verify your email to continue
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{message}</p>
              </div>
            </div>
          </div>
        ) : null}

        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleVerifyEmail(); }}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || status === 'success'}
              />
            </div>
            <div>
              <label htmlFor="verification-code" className="sr-only">Verification Code</label>
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Verification Code"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                disabled={isLoading || status === 'success'}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={handleResendVerification}
                className="font-medium text-indigo-600 hover:text-indigo-500"
                disabled={isLoading || status === 'success'}
              >
                Resend verification email
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || status === 'success' 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
              disabled={isLoading || status === 'success'}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;