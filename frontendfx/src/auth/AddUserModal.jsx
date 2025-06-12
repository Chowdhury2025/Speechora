/* eslint-disable react/prop-types */
import { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";
import { colorGuide, componentStyles } from '../theme/colors';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/user/register`, formData);
      onUserAdded(response.data);
      onClose();
      setFormData({ username: "", email: "", password: "", role: "USER" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center ${colorGuide.neutral.bgPage} bg-opacity-80`}
          style={{ zIndex: 99999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${colorGuide.neutral.bgCard} ${componentStyles.card.base} p-6 w-full max-w-md`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <h2 className={`text-xl font-bold mb-4 ${colorGuide.neutral.textPrimary}`}>Add New User</h2>
            
            {error && (
              <div className={`mb-4 p-3 rounded ${colorGuide.status.error.bg} ${colorGuide.status.error.text}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${colorGuide.neutral.textSecondary}`}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={componentStyles.input.base}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${colorGuide.neutral.textSecondary}`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={componentStyles.input.base}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${colorGuide.neutral.textSecondary}`}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={componentStyles.input.base}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${colorGuide.neutral.textSecondary}`}>
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={componentStyles.input.base}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded ${componentStyles.button.outline}`}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${componentStyles.button.primary}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add User"}
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

export default AddUserModal;
