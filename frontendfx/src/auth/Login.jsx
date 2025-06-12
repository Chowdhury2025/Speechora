import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
      navigate('/app/');
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
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-primary">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600">
                Password
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <a href="/forgot-password" className="text-sm font-bold text-secondary hover:text-secondary-hover">
                Forgot your password?
              </a>
            </div>

            {error && (
              <div className="bg-error-bg text-error-text text-sm p-4 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl border-b-4 border-primary-dark hover:border-primary-pressed disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 active:mt-1 transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-600 font-bold">
                    New user?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/register"
                  className="w-full inline-flex justify-center py-3 px-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary-light transition-colors duration-200"
                >
                  Create an account
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
