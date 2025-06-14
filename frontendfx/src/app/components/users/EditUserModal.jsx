/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../config";

const EditUserModal = ({ isOpen, onClose, onUserUpdated, user }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "STAFF",
    isEmailVerified: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        role: user.role || "STAFF",
        isEmailVerified: user.isEmailVerified || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.patch(`${API_URL}/api/user/profile/update`, {
        userId: user.id,
        ...formData,
      });

      setIsLoading(false);
      setSuccessMessage("User updated successfully!");
      onUserUpdated(response.data);
      setTimeout(onClose, 2000);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Failed to update user.");
    }
  };

  const resendVerificationEmail = async () => {
    if (!user || !user.email) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/user/resend-verification`, {
        email: user.email,
      });
      setSuccessMessage("Verification email sent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80"
          style={{ zIndex: 99999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 w-full max-w-md"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-100">Edit User</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-700 text-green-100 rounded">{successMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="INSPECTOR">INSPECTOR</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="isEmailVerified"
                  checked={formData.isEmailVerified}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-gray-300">Email Verified</label>
              </div>

              {!formData.isEmailVerified && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={resendVerificationEmail}
                    className="text-[#58cc02] hover:text-[#47b102] text-sm font-bold"
                    disabled={isLoading}
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="mb-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
                </div>
              )}

              <div className="flex justify-end space-x-2">                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 border-2 border-[#58cc02] rounded-xl text-[#58cc02] hover:bg-[#e5f5d5] font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#58cc02] hover:bg-[#47b102] active:bg-[#3c9202] text-white rounded-xl font-bold transition-colors border-b-2 border-[#3c9202] hover:border-[#2e7502] disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default EditUserModal;
