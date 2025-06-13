/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';
import axios from 'axios';
import { colorGuide, componentStyles } from '../theme/colors';
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
      // Make request using axios instead of fetch
      const response = await axios.post(`${API_URL}/api/user/verify-email-and-otp-password`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
   // Handle success response
      setError(''); // Clear any previous error
      navigate('/'); // Redirect to homepage or login page on success
    } catch (err) {
      // Handle error
      setError(err.response ? err.response.data : err.message);
    } finally {
      setLoading(false); // Reset loading state after request is complete
    }


  };

  return (
    <AuthLayout>
      <div className={`min-h-screen ${colorGuide.neutral.bgPage} flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${colorGuide.neutral.textPrimary}`}>
            Update your password
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`${colorGuide.neutral.bgCard} py-8 px-4 ${componentStyles.card.base} sm:px-10`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  Email
                </label>
                <div className="mt-1">
                  <Input
                    icon={Mail}
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={componentStyles.input.base}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  OTP Code
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    name="otp"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP code"
                    className={componentStyles.input.base}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}>
                  New Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className={componentStyles.input.base}
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${colorGuide.neutral.textTertiary}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={`${colorGuide.status.error.text} text-sm mt-2`}>
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${componentStyles.button.primary}`}
                >
                  {loading ? 'Updating password...' : 'Update Password'}
                </button>
              </div>

              <div className="text-center mt-4">
                <a href="/login" className={`text-sm font-medium ${colorGuide.primary.text} ${colorGuide.primary.hover}`}>
                  Back to login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};


export default UpdatePassword