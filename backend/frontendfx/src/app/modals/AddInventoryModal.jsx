import { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";

const AddInventoryModal = ({ isOpen, onClose, onInventoryAdded }) => {
  const [warehouseId, setWarehouseId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [afterSalePrice, setAfterSalePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBackendResponse(null);
    try {
      const response = await axios.post(`${API_URL}/api/A/inventory`, {
        warehouseId,
        name,
        category,
        brand,
        stock: Number(stock),
        price: Number(price),
        afterSalePrice: Number(afterSalePrice),
      });
      setBackendResponse(response.data);
      onInventoryAdded && onInventoryAdded(response.data);
      setWarehouseId("");
      setName("");
      setCategory("");
      setBrand("");
      setStock("");
      setPrice("");
      setAfterSalePrice("");
    } catch (err) {
      setError(err.response ? err.response.data : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
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
            <h2 className="text-xl font-bold text-gray-100 mb-4">Add Inventory</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Warehouse ID</label>
                <input
                  type="number"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Brand</label>
                <input
                  type="text"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 mb-1">Stock</label>
                  <input
                    type="number"
                    className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">After Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100"
                  value={afterSalePrice}
                  onChange={(e) => setAfterSalePrice(e.target.value)}
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
                  {typeof error === "object"
                    ? (error.message || JSON.stringify(error))
                    : error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
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

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AddInventoryModal;
