import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { API_URL } from "../../../config";
import { userStates } from "../../../atoms";
import { useRecoilValue } from "recoil";

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded }) => {
  const userState = useRecoilValue(userStates);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "", // Changed from "Rent"
    paymentMethod: "Cash",
    notes: "",
    storeId: "",
    userId: userState?.userId || ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Set initial store ID when the component mounts and when userState changes
  useEffect(() => {
    if (userState) {
      // If user is STAFF or STOREMANAGER, use their assigned store
      if (userState.role === 'STAFF' || userState.role === 'STOREMANAGER') {
        const storeId = Array.isArray(userState.storeIds) 
          ? userState.storeIds[0] 
          : userState.storeIds;
        
        setFormData(prev => ({
          ...prev,
          storeId: storeId || ""
        }));
      }
    }
  }, [userState]);

  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Credit Card",
    "Mobile Money",
    "Check"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate amount is a valid number
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    // Validate store ID for STAFF and STOREMANAGER roles
    if (userState?.role === 'STAFF' || userState?.role === 'STOREMANAGER') {
      if (!formData.storeId) {
        setError("Store ID is required for staff members");
        setIsLoading(false);
        return;
      }
    }

    // Validate user authentication
    if (!userState?.userId) {
      setError("User authentication required");
      setIsLoading(false);
      return;
    }

    // Prepare the data with proper types
    const expenseData = {
      ...formData,
      amount: amount,
      userId: parseInt(userState.userId),
      storeId: formData.storeId ? parseInt(formData.storeId) : null, // Only include storeId if it exists
      date: new Date()
    };

    try {
      const response = await fetch(`${API_URL}/api/expv1/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (data.success) {
        onExpenseAdded();
        onClose();
      } else {
        setError(data.error || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-white mb-6">Add Expense</h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* User and Store Info Section */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-300 mb-1">User ID</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 cursor-not-allowed"
                  value={userState?.userId || ""}
                  disabled
                />
              </div>
              {/* Store ID field - Show for all users, but only enabled for STAFF and STOREMANAGER */}
              <div>
                <label className="block text-gray-300 mb-1">Store ID</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 cursor-not-allowed"
                  value={(userState?.role === 'STAFF' || userState?.role === 'STOREMANAGER') 
                    ? (Array.isArray(userState.storeIds) ? userState.storeIds[0] : userState.storeIds) || ""
                    : formData.storeId || "Not Assigned"}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                placeholder="Enter expense description"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                pattern="\d*\.?\d*"
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                placeholder="Enter amount (e.g., 100.00)"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                placeholder="Enter expense category"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                rows="3"
                placeholder="Optional notes"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddExpenseModal;
