import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../../config";

const UpdatePriceModal = ({ isOpen, onClose, product, onPriceUpdated }) => {
  const [newPrice, setNewPrice] = useState("");
  const [newAfterSalePrice, setNewAfterSalePrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setNewPrice(product.price.toString());
      setNewAfterSalePrice(product.afterSalePrice.toString());
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.put(`${API_URL}/api/A/updateproductprice`, {
        productId: product.id,
        newPrice: parseFloat(newPrice),
        newAfterSalePrice: parseFloat(newAfterSalePrice),
      });
      onPriceUpdated(response.data.product);
      onClose();
    } catch (err) {
      console.error("Error updating product prices:", err);
      setError(
        err.response ? err.response.data : "Failed to update prices. Please try again."
      );
    } finally {
      setIsLoading(false);
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-100">
                Update Prices: {product?.name}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Cost Price (K)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Selling Price (K)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newAfterSalePrice}
                  onChange={(e) => setNewAfterSalePrice(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                  {typeof error === "object"
                    ? error.message || JSON.stringify(error)
                    : error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isLoading ? "Updating..." : "Update Prices"}
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

export default UpdatePriceModal;
