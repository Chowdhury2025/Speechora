import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../../config';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { X } from 'lucide-react';

// Popup Notification Component
const Notification = ({ type, message, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 min-w-[300px] p-4 rounded-lg shadow-lg flex items-center justify-between
        ${type === 'error' ? 'bg-red-800 border-red-700 text-red-100' : 'bg-green-800 border-green-700 text-green-100'}`}
    >
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className={`ml-4 hover:${type === 'error' ? 'text-red-200' : 'text-green-200'}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const DamageReportModal = ({ isOpen, onClose, storeId, productId, productName, onDamageReported }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const user = useRecoilValue(userStates);

  const clearNotifications = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearNotifications();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/stores/${storeId}/damages`, {
        productId,
        quantity: parseInt(quantity),
        reason,
      });

      // Check if we got a valid response
      if (!response || !response.data) {
        throw new Error('No response received from server');
      }

      setSuccessMessage('Damage report submitted successfully');
      
      // Call the parent component's callback to trigger refresh after a short delay
      setTimeout(() => {
        onDamageReported(response.data);
        onClose();
        
        // Reset form
        setQuantity('');
        setReason('');
      }, 1500); // Give user time to see success message
      
    } catch (err) {
      if (err.message === 'Network Error') {
        setError('Network error: Please check your internet connection');
      } else if (!err.response) {
        setError('Server not responding. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to report damage. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Report Damage - {productName}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Reason:</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Reporting...' : 'Report Damage'}
                </button>
              </div>
            </form>
            
            {/* Popup notifications */}
            <AnimatePresence>
              {error && (
                <Notification 
                  type="error" 
                  message={error} 
                  onClose={clearNotifications} 
                />
              )}
              {successMessage && (
                <Notification 
                  type="success" 
                  message={successMessage} 
                  onClose={clearNotifications} 
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DamageReportModal;