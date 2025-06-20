/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { colorGuide, componentStyles } from '../theme/colors';

const EditUserModal = ({ isOpen, onClose, onUserUpdated, user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'USER',
    isEmailVerified: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'USER',
        isEmailVerified: user.isEmailVerified || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.patch(`${API_URL}/api/profile/update`, {
        userId: user.id,
        ...formData
      });
      
      setIsLoading(false);
      onUserUpdated(response.data);
      onClose();
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.message || 'Failed to update user');
    }
  };

  const resendVerificationEmail = async () => {
    if (!user || !user.email) return;
    
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/user/resend-verification`, {
        email: user.email
      });
      setIsLoading(false);
      alert('Verification email sent successfully');
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className={`absolute inset-0 ${colorGuide.neutral.bgPage} opacity-75`}></div>
        </div>

        <div className={`inline-block align-bottom ${colorGuide.neutral.bgCard} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${componentStyles.card.base}`}>
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className={`text-lg leading-6 font-medium ${colorGuide.neutral.textPrimary} mb-4`}>
                Edit User
              </h3>

              {error && (
                <div className={`p-4 mb-4 rounded-md ${colorGuide.status.error.bg} ${colorGuide.status.error.text}`}>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="username" 
                    className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={componentStyles.input.base}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={componentStyles.input.base}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="role" 
                    className={`block text-sm font-medium ${colorGuide.neutral.textSecondary}`}
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={componentStyles.input.base}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isEmailVerified"
                    id="isEmailVerified"
                    checked={formData.isEmailVerified}
                    onChange={handleChange}
                    className={`mr-2 ${componentStyles.input.base}`}
                  />
                  <label 
                    htmlFor="isEmailVerified" 
                    className={`text-sm ${colorGuide.neutral.textSecondary}`}
                  >
                    Email Verified
                  </label>
                </div>
              </div>
            </div>

            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${colorGuide.neutral.bgCard}`}>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex justify-center rounded-md sm:ml-3 sm:w-auto sm:text-sm ${componentStyles.button.primary}`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`mt-3 w-full inline-flex justify-center rounded-md sm:mt-0 sm:w-auto sm:text-sm ${componentStyles.button.outline}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;