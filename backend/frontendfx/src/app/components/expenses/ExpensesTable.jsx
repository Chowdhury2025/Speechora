import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, differenceInWeeks } from "date-fns";
import { Edit, Trash2, Search } from "lucide-react";
import { useRecoilValue } from "recoil";
import { userStates } from "../../../atoms";
import { API_URL } from "../../../config";
import EditExpenseModal from "./EditExpenseModal";

const ExpensesTable = ({ selectedStore, selectedUser, onExpenseUpdated }) => {
  const userState = useRecoilValue(userStates);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
    const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/expv1/expenses?page=${currentPage}&limit=10`;
      
      // Add search term to query if present
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }// If user is STAFF or STOREMANAGER, force their store name
      if (userState.role === 'STAFF' || userState.role === 'STOREMANAGER') {
        // For STAFF and STOREMANAGER, use their assigned store name
        const storeName = Array.isArray(userState.storeNames) ? userState.storeNames[0] : userState.storeNames;
        url += `&storeName=${encodeURIComponent(storeName)}`;
      } else {
        // For admin users, apply the selected filters
        if (selectedStore !== "All") url += `&storeName=${encodeURIComponent(selectedStore)}`;
        if (selectedUser !== "All") url += `&userId=${selectedUser}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setExpenses(data.expenses);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };
  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedStore, selectedUser, currentPage, searchTerm]);

  const canEditOrDelete = (expenseDate) => {
    // Allow ADMIN and SUPERUSER to edit/delete anytime
    if (['ADMIN', 'SUPERUSER'].includes(userState.role)) {
      return true;
    }

    // For STAFF and STOREMANAGER, check if expense is within 6 weeks
    if (['STAFF', 'STOREMANAGER'].includes(userState.role)) {
      const weeksDifference = differenceInWeeks(new Date(), new Date(expenseDate));
      return weeksDifference <= 6;
    }

    return false;
  };

  const handleEdit = (expense) => {
    if (!canEditOrDelete(expense.date)) {
      alert("Expenses older than 6 weeks cannot be edited");
      return;
    }
    setEditingExpense(expense);
  };

  const handleSaveEdit = async (updatedExpense) => {
    try {
      const response = await fetch(`${API_URL}/api/expv1/expenses/${updatedExpense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExpense),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update expense");
      }

      fetchExpenses();
      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id, date) => {
    if (!canEditOrDelete(date)) {
      alert("Expenses older than 6 weeks cannot be deleted");
      return;
    }

    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`${API_URL}/api/expv1/expenses/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        fetchExpenses();
        if (onExpenseUpdated) {
          onExpenseUpdated();
        }
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  return (
    <>
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >      <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Expense Transactions</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-400">
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-400">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {format(new Date(expense.date), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.category}
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {expense.store ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {expense.store.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No store assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">
                        K{expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {expense.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {canEditOrDelete(expense.date) ? (
                          <div className="flex space-x-3">
                            <button
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => handleEdit(expense)}
                              title={['STAFF', 'STOREMANAGER'].includes(userState.role) ? 
                                "You can only edit expenses within 6 weeks" : "Edit expense"}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDelete(expense.id, expense.date)}
                              title={['STAFF', 'STOREMANAGER'].includes(userState.role) ? 
                                "You can only delete expenses within 6 weeks" : "Delete expense"}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md 
                  ${currentPage === 1 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md 
                  ${currentPage === totalPages
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default ExpensesTable;
