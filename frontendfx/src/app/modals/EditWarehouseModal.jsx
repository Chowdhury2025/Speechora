import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";

const EditWarehouseModal = ({ isOpen, onClose, warehouse, onWarehouseUpdated }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [error, setError] = useState(null);

  // Prefill fields when warehouse changes
  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name);
      setLocation(warehouse.location);
    }
  }, [warehouse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBackendResponse(null);
    try {
      const response = await axios.put(`${API_URL}/api/A/warehouse/${warehouse.id}`, {
        name,
        location,
      });
      setBackendResponse(response.data);
      onWarehouseUpdated && onWarehouseUpdated(response.data);
    } catch (err) {
      setError(err.response ? err.response.data : "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && warehouse && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <h2 className="text-xl font-bold mb-4">Edit Warehouse</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                  {backendResponse.message}
                </div>
              )}
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-300 rounded">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  Update
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditWarehouseModal;
