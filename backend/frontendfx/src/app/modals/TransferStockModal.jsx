/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";

const TransferStockModal = ({ isOpen, onClose, onTransferCompleted, orderData }) => {
  const [warehouseId, setWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [storeDetails, setStoreDetails] = useState(null);
  const [warehouseDetails, setWarehouseDetails] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState("");
  const [selectedWarehouseStock, setSelectedWarehouseStock] = useState(null);

  useEffect(() => {
    if (isOpen && orderData) {
      setWarehouseId("");
      setLoading(false);
      setLoadingMessage("");
      setError("");
      setSelectedWarehouseStock(null);
      
      const fetchData = async () => {
        try {
          setLoading(true);
          setLoadingMessage("Fetching details...");
          
          // Fetch all required data in parallel
          const [storeResponse, productResponse, warehousesResponse] = await Promise.all([
            axios.get(`${API_URL}/wareHousestore/store`),
            axios.get(`${API_URL}/api/A/listproducts`),
            axios.get(`${API_URL}/wareHousestore/warehouse`)
          ]);

          const store = storeResponse.data.stores.find(s => s.id === orderData.storeId);
          setStoreDetails(store);

          const product = productResponse.data.products.find(p => p.id === orderData.productId);
          setProductDetails(product);

          setWarehouses(warehousesResponse.data.warehouses || []);

          // Set default warehouse if product has one assigned
          if (product?.warehouse) {
            setWarehouseId(product.warehouse.id);
            setWarehouseDetails(product.warehouse);
            setSelectedWarehouseStock(product.stock);
          }

          setLoading(false);
          setLoadingMessage("");
        } catch (error) {
          console.error("Error fetching details:", error);
          setError("Failed to load necessary details. Please try again.");
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, orderData]);

  // Update selected warehouse stock when warehouse changes
  useEffect(() => {
    if (warehouseId && productDetails) {
      const isProductWarehouse = productDetails.warehouse?.id === parseInt(warehouseId);
      setSelectedWarehouseStock(isProductWarehouse ? productDetails.stock : 0);
    }
  }, [warehouseId, productDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!warehouseId) {
      setError("Please select a warehouse");
      return;
    }

    // Validate stock availability
    const selectedWarehouse = warehouses.find(w => w.id === parseInt(warehouseId));
    const productInWarehouse = productDetails?.warehouse?.id === parseInt(warehouseId);
    
    if (!productInWarehouse) {
      setError("Selected product is not available in this warehouse");
      return;
    }

    if (productDetails?.stock < orderData.quantity) {
      setError(`Insufficient stock. Available: ${productDetails.stock}, Requested: ${orderData.quantity}`);
      return;
    }

    setLoading(true);
    setLoadingMessage("Processing transfer request...");
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/A/transfer`, {
        warehouseId: parseInt(warehouseId, 10),
        storeId: parseInt(orderData.storeId, 10),
        productId: parseInt(orderData.productId, 10),
        quantity: parseInt(orderData.quantity, 10),
      });

      setLoadingMessage(response.data.message);
      onTransferCompleted && onTransferCompleted(response.data);

      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Transfer error:", err);
      let errorMessage = "Server error";

      if (err.response?.status === 404) {
        errorMessage = "No response from backend";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = typeof err.response.data.error === 'string'
            ? err.response.data.error
            : "Database validation error";
        }
      }
      
      setError(errorMessage);
      setLoadingMessage("");
      setLoading(false);
    }
  };

  if (!orderData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 text-gray-100 rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-700"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transfer Stock</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Store</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100"
                  value={storeDetails?.name || 'Loading...'}
                  disabled
                />
                <p className="text-sm text-gray-400 mt-1">{storeDetails?.location}</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Product</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100"
                  value={productDetails?.name || 'Loading...'}
                  disabled
                />
                <div className="flex justify-between text-sm mt-1">
                  <span className={`${selectedWarehouseStock === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    Available in Selected Warehouse: {selectedWarehouseStock || 0} units
                  </span>
                  <span className="text-blue-400">
                    Requested: {orderData.quantity} units
                  </span>
                </div>
                {selectedWarehouseStock > 0 && selectedWarehouseStock < orderData.quantity && (
                  <p className="text-sm text-red-400 mt-1">
                    Warning: Insufficient stock in selected warehouse
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100"
                  value={orderData.quantity}
                  disabled
                />
                {selectedWarehouseStock !== null && (
                  <p className="text-sm mt-1">
                    <span className={selectedWarehouseStock >= orderData.quantity ? 'text-green-400' : 'text-red-400'}>
                      {selectedWarehouseStock >= orderData.quantity 
                        ? `Sufficient stock available (${selectedWarehouseStock - orderData.quantity} units will remain)`
                        : `Insufficient stock (${orderData.quantity - selectedWarehouseStock} units short)`}
                    </span>
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Select Warehouse</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100"
                  value={warehouseId}
                  onChange={(e) => {
                    setWarehouseId(e.target.value);
                    const warehouse = warehouses.find(w => w.id === parseInt(e.target.value));
                    setWarehouseDetails(warehouse);
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">Select a warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}
                      disabled={productDetails?.warehouse?.id !== warehouse.id}>
                      {warehouse.name} - {warehouse.location}
                      {productDetails?.warehouse?.id !== warehouse.id ? " (No stock)" : ""}
                    </option>
                  ))}
                </select>
                {warehouseDetails && (
                  <p className="text-sm text-gray-400 mt-1">
                    {warehouseDetails.location}
                  </p>
                )}
              </div>

              {/* Loading Area with Message */}
              {loading && (
                <div className="mb-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-2"></div>
                    <div className="text-sm text-blue-300">
                      {loadingMessage}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-gray-300 rounded hover:bg-gray-500 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (selectedWarehouseStock !== null && selectedWarehouseStock < orderData.quantity)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all disabled:opacity-50"
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

export default TransferStockModal;
