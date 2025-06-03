import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";
import { userStates } from "../../atoms";

// Standalone Modal Component
const RequestOrderModal = ({ isOpen, onClose, onOrderRequested }) => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendResponse, setBackendResponse] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Added for search
  const [showProductList, setShowProductList] = useState(false); // Added for search

  // Get store id and username from Recoil state
  const userState = useRecoilValue(userStates);

  // Fetch the product list from the API
  useEffect(() => {
    if (isOpen) { // Only fetch when modal is open
      const fetchProducts = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/A/listproducts`);
          const warehouseProducts = response.data.products?.filter(p => p.stock > 0) || [];
          setProducts(warehouseProducts);
        } catch (err) {
          console.error("Failed to fetch products", err);
          setError("Failed to load products. Please try again.");
        }
      };
      fetchProducts();
      // Reset search term and selection when modal opens
      setSearchTerm("");
      setProductId("");
      setShowProductList(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBackendResponse("");
    
    try {
      // Make sure we're using the correct storeId format
      const storeId = Array.isArray(userState.storeIds) 
        ? userState.storeIds[0] 
        : userState.storeIds;
      
      const response = await axios.post(`${API_URL}/api/A/order/request`, {
        storeId: Number(storeId),
        productId: Number(productId),
        quantity: Number(quantity),
        requestedBy: userState.email,
      });

      setBackendResponse(response.data.message || "Order requested successfully");

      if (onOrderRequested && response.data.order) {
        onOrderRequested(response.data.order);
      }

      // Clear the form fields after successful submission
      setTimeout(() => {
        setProductId("");
        setQuantity("");
        
        // Close modal after success (optional - remove if you prefer to keep it open)
        setTimeout(() => {
          onClose();
        }, 1500);
      }, 1000);
      
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to request order";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)) && product.stock > 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" // Darker overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 text-gray-100" // Dark background, light text
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-green-300">Request Order</h2> {/* Accent color for heading */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4 grid grid-cols-1 gap-4"> {/* Increased gap slightly for better spacing */}
                {/* Store ID - Read only */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Store ID</label> {/* Lighter label text */}
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 cursor-not-allowed" // Dark input
                    value={Array.isArray(userState.storeIds) ? userState.storeIds[0] : userState.storeIds}
                    disabled
                  />
                </div>
                
                {/* Product Search Input and List */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Product</label> {/* Lighter label text */}
                  <input
                    type="text"
                    placeholder="Search product by name or ID"
                    className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" // Dark input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowProductList(true);
                      setProductId(""); // Clear selection when search term changes
                    }}
                    onFocus={() => setShowProductList(true)}
                  />
                  {showProductList && searchTerm && (
                    <div className="mt-1 max-h-40 overflow-y-auto border border-gray-600 rounded-md bg-gray-700 absolute z-10 w-[calc(100%-2rem)]"> {/* Dark dropdown */}
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="cursor-pointer hover:bg-gray-600 px-3 py-2 text-sm text-gray-100" // Dark dropdown items
                            onClick={() => {
                              setProductId(product.id.toString());
                              setSearchTerm(product.name); // Set input to selected product's name
                              setShowProductList(false);
                            }}
                          >
                            {product.name} (ID: {product.id}) - Stock: {product.stock} - Loc: {product.warehouse?.location || 'N/A'}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-400">No products found.</div> /* Lighter placeholder text */
                      )}
                    </div>
                  )}
                </div>

                {/* Show selected product details */}
                {productId && products.find(p => p.id === Number(productId)) && (
                  <div className="mt-2 p-3 bg-gray-700 rounded-md"> {/* Darker background for details */}
                    <p className="text-sm text-gray-200">
                      Selected: {products.find(p => p.id === Number(productId))?.name}
                    </p>
                    <p className="text-sm text-gray-300">
                      Available Stock: {products.find(p => p.id === Number(productId))?.stock}
                    </p>
                    <p className="text-sm text-gray-300">
                      Warehouse: {products.find(p => p.id === Number(productId))?.warehouse?.location || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4"> {/* Increased gap */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label> {/* Lighter label text */}
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" // Dark input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Requested By</label> {/* Lighter label text */}
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 cursor-not-allowed" // Dark input
                    value={userState.email}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-4 min-h-[3rem]"> {/* Adjusted min-height */}
                {loading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-400 mx-auto"></div> {/* Adjusted spinner color */}
                  </div>
                )}
                {backendResponse && (
                  <div className="p-2 bg-green-700 text-green-100 rounded"> {/* Darker success message */}
                    {backendResponse}
                  </div>
                )}
                {error && (
                  <div className="p-2 bg-red-700 text-red-100 rounded"> {/* Darker error message */}
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3"> {/* Increased space */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !productId || !quantity} 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 transition-colors"
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

export default RequestOrderModal;