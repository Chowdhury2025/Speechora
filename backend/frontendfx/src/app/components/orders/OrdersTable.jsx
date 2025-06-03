import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, Package } from "lucide-react";
import TransferStockModal from "../../modals/TransferStockModal";
import { API_URL } from "../../../config";
import { useRecoilValue } from "recoil";
import { userStates } from "../../../atoms";

const OrdersTable = () => {
  const userState = useRecoilValue(userStates);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedOrderForTransfer, setSelectedOrderForTransfer] = useState(null);
  const [loading, setLoading] = useState(false);

  const isStoreManager = userState.role === "STOREMANAGER";
  const userStoreIds = userState.storeIds || [];

  // Function to delete order via API
  const deleteOrder = async (orderId) => {
    try {
      setLoading(true);
      
      // Update URL to include orderId in the path
      const res = await fetch(`${API_URL}/api/A/deleteOrder/${orderId}`, {
        method: "DELETE", 
        headers: {
          "Content-Type": "application/json"
        },
      });
  
      const data = await res.json();
      
      if (res.ok) {
        console.log("Order deleted:", data.message);
      } else {
        console.error("Error deleting order:", data.message);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders from the dynamic API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/a/listorders`);
      const data = await res.json();
      if (data.orders) {
        const validOrders = data.orders.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
        setOrders(filterOrdersByUserRole(validOrders));
        setFilteredOrders(filterOrdersByUserRole(validOrders));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = orders
      .filter(
        (order) =>
          order.id.toString().includes(term) ||
          (order.store?.name && order.store.name.toLowerCase().includes(term)) ||
          (order.product?.name && order.product.name.toLowerCase().includes(term))
      )
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    setFilteredOrders(filtered);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/a/updateStutusOrder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Order updated:", data.order);
        fetchOrders();
      } else {
        console.error("Error updating order:", data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferClick = (order) => {
    // Include the order id along with other details
    setSelectedOrderForTransfer({
      id: order.id,
      storeId: order.store.id,
      productId: order.product.id,
      quantity: order.quantity,
    });
    setIsTransferModalOpen(true);
  };

  const handleDeleteClick = async (orderId) => {
    if (!loading) {
      await deleteOrder(orderId);
      fetchOrders();
    }
  };

  const handleReceiveOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to confirm this order? Please verify that:\n\n1. All items have been received\n2. Quantities match the order\n3. Items are in good condition\n\nClick OK to confirm receipt.')) {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/A/order/receive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        const data = await res.json();
        if (res.ok) {
          // Only update the status to RECEIVED, no transfer needed as it was already transferred
          await updateStatus(orderId, "RECEIVED");
          fetchOrders();
        } else {
          console.error("Error receiving order:", data.message);
          alert(data.message || "Failed to receive order. Please try again.");
        }
      } catch (error) {
        console.error("Error receiving order:", error);
        alert("An error occurred while receiving the order. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter orders based on user role and store
  const filterOrdersByUserRole = (orders) => {
    if (isStoreManager) {
      return orders.filter(order => userStoreIds.includes(order.storeId));
    }
    return orders;
  };

  return (
    <>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">ORDER List</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {/* <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={18} />
              Request Order
            </button> */}
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-300 mb-4">
            Loading...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  PRODUCT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  QUANTITY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide divide-gray-700">
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    ord-{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {order.store?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {order.product?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {order.quantity.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "PENDING"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(order.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      {!isStoreManager && order.status === "PENDING" && (
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenDropdown(openDropdown === order.id ? null : order.id)
                            }
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                          >
                            Status
                          </button>
                          {openDropdown === order.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    updateStatus(order.id, "APPROVED");
                                    setOpenDropdown(null);
                                  }}
                                  disabled={loading}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    updateStatus(order.id, "TRANSIT");
                                    setOpenDropdown(null);
                                  }}
                                  disabled={loading}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  In Transit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {isStoreManager && order.status === "TRANSIT" && (
                        <button
                          onClick={() => handleReceiveOrder(order.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1 text-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          <Package size={14} />
                          Receive
                        </button>
                      )}

                      {!isStoreManager && order.status === "APPROVED" && (
                        <button
                          onClick={() => handleTransferClick(order)}
                          disabled={loading}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 text-xs disabled:opacity-50"
                        >
                          Transfer
                        </button>
                      )}

                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleDeleteClick(order.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1 text-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferCompleted={(data) => {
          console.log("Transfer completed:", data);
          setIsTransferModalOpen(false);
          if (selectedOrderForTransfer?.id) {
            updateStatus(selectedOrderForTransfer.id, "TRANSIT");
          }
        }}
        orderData={selectedOrderForTransfer}
      />
    </>
  );
};

export default OrdersTable;