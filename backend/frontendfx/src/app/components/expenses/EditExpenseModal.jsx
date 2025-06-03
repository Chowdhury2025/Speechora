import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const EditExpenseModal = ({ isOpen, onClose, expense, onSave }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    paymentMethod: "Cash",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount?.toString() || "",
        category: expense.category || "",
        paymentMethod: expense.paymentMethod || "Cash",
        notes: expense.notes || "",
      });
    }
  }, [expense]);

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

    try {
      await onSave({
        ...expense,
        ...formData,
        amount: amount
      });
      onClose();
    } catch (error) {
      setError(error.message || "Failed to update expense");
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

        <h2 className="text-2xl font-semibold text-white mb-6">Edit Expense</h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditExpenseModal;
