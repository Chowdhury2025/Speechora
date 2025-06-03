import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../../config";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [afterSalePrice, setAfterSalePrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "");
      setBrand(product.brand || "");
      setStock(product.stock?.toString() || "");
      setPrice(product.price?.toString() || "");
      setAfterSalePrice(product.afterSalePrice?.toString() || "");
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.put(`${API_URL}/api/A/updateproductdetails`, {
        productId: product.id,
        name,
        category,
        brand,
        stock: parseInt(stock),
        price: parseFloat(price),
        afterSalePrice: parseFloat(afterSalePrice)
      });
      onProductUpdated(response.data.product);
      onClose();
    } catch (err) {
      console.error("Error updating product details:", err);
      setError(
        err.response ? err.response.data : "Failed to update product details. Please try again."
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
                Edit Product: {product?.name}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Cost Price (K)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                  value={afterSalePrice}
                  onChange={(e) => setAfterSalePrice(e.target.value)}
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
                  {isLoading ? "Updating..." : "Update Product"}
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

export default EditProductModal;