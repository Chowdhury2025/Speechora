import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";

const AddWarehouseModal = ({ isOpen, onClose, onWarehouseAdded }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBackendResponse(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/A/warehouse`, { name, location });
      setBackendResponse(response.data);
      onWarehouseAdded && onWarehouseAdded(response.data);
      setName("");
      setLocation("");
    } catch (err) {
      setError(err.response ? err.response.data : "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 text-gray-100 rounded-2xl shadow-lg w-full max-w-md p-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-200">Add Warehouse</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-700 rounded-md bg-gray-800 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border border-gray-700 rounded-md bg-gray-800 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              {loading && (
                <div className="mb-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
                </div>
              )}
              {backendResponse && (
                <div className="mb-4 p-2 bg-green-800 text-green-200 rounded">
                  {backendResponse.message}
                </div>
              )}
              {error && (
                <div className="mb-4 p-2 bg-red-800 text-red-200 rounded">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                  disabled={loading}
                >
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddWarehouseModal;
