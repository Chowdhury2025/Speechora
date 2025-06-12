/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/Input';
import { AuthButton } from '../components/Authbuttonx';
import { API_URL } from '../config';
import axios from 'axios'; // Import axios

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
    <div className="min-h-screen bg-duo-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-duo-green-600">
          Update your password
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-duo-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-duo-gray-700">
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
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-duo-gray-700">
                OTP
              </label>
              <div className="mt-1">
                <Input
                  icon={Lock}
                  type="text"
                  name="otp"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-duo-gray-700">
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
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-duo-gray-400" /> : <Eye className="h-5 w-5 text-duo-gray-400" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-duo-yellow-600 text-sm">{error}</div>
            )}
            <AuthButton loading={loading} className="bg-duo-green-500 hover:bg-duo-green-600 text-duo-white">
              {loading ? 'Updating...' : 'Update Password'}
            </AuthButton>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="/login"
                  className="font-medium text-duo-blue-500 hover:text-duo-blue-700"
                >
                  Remember your password? Login now
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default UpdatePassword