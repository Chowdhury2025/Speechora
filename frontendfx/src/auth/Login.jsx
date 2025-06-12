import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/Input';
import { AuthButton } from '../components/Authbuttonx';
import { API_URL } from '../config';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { userStates, authState } from '../atoms';
import axios from 'axios';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const setUser = useSetRecoilState(userStates);
  const setAuthStatus = useSetRecoilState(authState);
  const isAuthenticated = useRecoilValue(authState);
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const response = await axios.post(`${API_URL}/api/user/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const userData = response.data;
  
      setUser({
        userId: userData.userId,
        username: userData.username,
        lastName: userData.lastName,
        middleName: userData.middleName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        group: userData.group,
        token: userData.token,
        isEmailVerified: userData.isEmailVerified,
        bloodGroup: userData.bloodGroup,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        emergencyContact: userData.emergencyContact,
        nrc_card_id: userData.nrc_card_id,        storeIds: userData.storeIds,
        storeNames: userData.storeNames,
        warehouseIds: userData.warehouseIds
      });
  
      setAuthStatus(true);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || JSON.stringify(err.response.data));
      } else if (err.request) {
        setError('No response received from server. Please try again later.');
      } else {
        setError('Error: ' + err.message);
      }
      setAuthStatus(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-duo-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-duo-green-600">
          Sign in to your account
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-duo-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-duo-blue-500 hover:text-duo-blue-700">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <div className="text-duo-yellow-600 text-sm">{error}</div>
            )}

            <AuthButton loading={loading} className="bg-duo-green-500 hover:bg-duo-green-600 text-duo-white">
              Sign in
            </AuthButton>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="/register" className="font-medium text-duo-blue-500 hover:text-duo-blue-700">
                  Don&apos;t have an account? Register now
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
