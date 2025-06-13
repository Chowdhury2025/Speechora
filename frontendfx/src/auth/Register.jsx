/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { colorGuide, componentStyles } from '../theme/colors';
import AuthLayout from './AuthLayout';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'STAFF' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
   
  

     // Basic validation
     if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const { username, email, password, phoneNumber, role } = formData;      const response = await axios.post(`${API_URL}/api/user/register`, {
        username,
        email,
        password,
        phoneNumber,
        role,
        frontendUrl: window.location.origin
      });
  
      setSuccess(response.data?.message); 
      setTimeout(() => {
        navigate(`/login`);
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message||
        'Registration failed. Please try again later.'); 
    } finally {
      setIsLoading(false);
    }
  };
  


  return (
    <AuthLayout>
      <div className={`min-h-screen ${colorGuide.neutral.bgPage} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${colorGuide.neutral.textPrimary}`}>
            Create your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`${colorGuide.neutral.bgCard} py-8 px-4 ${componentStyles.card.base} sm:px-10`}>
            {error && (
              <div className={`${colorGuide.status.error.bg} ${colorGuide.status.error.text} p-4 rounded-md mb-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className={`${colorGuide.status.success.bg} ${colorGuide.status.success.text} p-4 rounded-md mb-4`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={componentStyles.input.base}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-address" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={componentStyles.input.base}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={componentStyles.input.base}
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={componentStyles.input.base}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={componentStyles.input.base}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${componentStyles.button.primary}`}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${colorGuide.neutral.border}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${colorGuide.neutral.bgCard} ${colorGuide.neutral.textSecondary}`}>
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <Link
                  to="/login"
                  className={`font-medium ${colorGuide.primary.text} ${colorGuide.primary.hover}`}
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;