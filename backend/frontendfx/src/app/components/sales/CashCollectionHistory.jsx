import React from 'react';
import { motion } from "framer-motion";
import { Trash2 } from 'lucide-react';
import { API_URL } from '../../../config';



// THIS SCREEN IS OKAY DONT TOUCH ITITS OKAY TO MY STANDERD 
const CashCollectionHistory = ({ cashCollectionHistory, onDelete }) => {
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cash collection record? This will restore the cash balance to the store.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cash/cash-collection/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete cash collection');
      }

      // Call the parent's onDelete callback to update the UI
      onDelete(id);
    } catch (error) {
      console.error('Error deleting cash collection:', error);
      alert(error.message || 'Failed to delete cash collection');
    }
  };

  return (
    <motion.div className="mt-8 p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">
        Cash Collection History
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-gray-100">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b border-gray-600">Date & Time</th>
              <th className="px-4 py-2 border-b border-gray-600">Store Name</th>
              <th className="px-4 py-2 border-b border-gray-600">Collected Cash</th>
              <th className="px-4 py-2 border-b border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cashCollectionHistory.length > 0 ? (
              cashCollectionHistory.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 border-b border-gray-600">
                    {new Date(entry.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-600">
                    {entry.storeName}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-600">
                    K {entry.collectedCash.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-600">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete cash collection record"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CashCollectionHistory;