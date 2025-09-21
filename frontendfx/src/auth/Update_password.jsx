/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';
import axios from 'axios';
import AuthLayout from './AuthLayout';

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/user/verify-email-and-otp-password`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Success → redirect
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="mt-6 text-center text-3xl font-bold text-primary">
        Update your password
      </h2>
      <div className="mt-8 w-full">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-600">
                Email
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
              </div>
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm font-bold text-slate-600">
                OTP Code
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  name="otp"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP code"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-600">
                New Password
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-error-bg text-error-text text-sm p-4 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl border-b-4 border-primary-dark hover:border-primary-pressed disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:mt-1 transition-all duration-200"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm font-bold text-secondary hover:text-secondary-hover"
              >
                Back to login
              </a>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UpdatePassword;
