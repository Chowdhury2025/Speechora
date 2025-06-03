import { useState, useEffect } from "react";
import { Wallet, CreditCard, DollarSign, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecoilValue } from "recoil";
import { userStates } from "../../atoms";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import ExpensesTable from "../components/expenses/ExpensesTable";
import DailyExpenses from "../components/expenses/DailyExpenses";
import ExpenseDistribution from "../components/expenses/ExpenseDistribution";
import AddExpenseModal from "../components/expenses/AddExpenseModal";
import ExpensesCalendar from "../components/expenses/ExpensesCalendar";
import { API_URL } from "../../config";

const ExpensesPage = () => {
  const userState = useRecoilValue(userStates);
  const [isExpensesCollapsed, setIsExpensesCollapsed] = useState(true);
  const [expenseStats, setExpenseStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    yearlyExpenses: 0,
    totalTransactions: 0,
  });
  const [selectedStore, setSelectedStore] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fetchStats = async (storeFilter, userFilter) => {
    try {
      let url = `${API_URL}/api/expv1/expenses/stats`;
      
      // If user is STAFF or STOREMANAGER, force their store ID
      if (userState.role === 'STAFF' || userState.role === 'STOREMANAGER') {
        const storeId = Array.isArray(userState.storeIds) ? userState.storeIds[0] : userState.storeIds;
        url += `?userStoreId=${storeId}&role=${userState.role}`;
      } else {
        // For admin users, apply the selected filters
        if (storeFilter !== "All") url += `?storeName=${storeFilter}`;
        if (userFilter !== "All") url += `${storeFilter !== "All" ? "&" : "?"}userId=${userFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setExpenseStats({
          totalExpenses: data.totalExpenses || 0,
          monthlyExpenses: data.monthlyExpenses || 0,
          yearlyExpenses: data.yearlyExpenses || 0,
          totalTransactions: data.totalTransactions || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching expense stats:", error);
    }
  };

  const fetchStoresAndUsers = async () => {
    try {
      const [storesRes, usersRes] = await Promise.all([        fetch(`${API_URL}/api/expv1/stores`),
        fetch(`${API_URL}/api/expv1/users`)
      ]);

      const storesData = await storesRes.json();
      const usersData = await usersRes.json();

      if (storesData.success) {
        setStores(storesData.stores);
      }
      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error("Error fetching stores and users:", error);
    }
  };

  useEffect(() => {
    // For STAFF and STOREMANAGER, set their store ID as the selected store
    if (userState.role === 'STAFF' || userState.role === 'STOREMANAGER') {
      const storeId = Array.isArray(userState.storeIds) ? userState.storeIds[0] : userState.storeIds;
      setSelectedStore(storeId);
    }
    fetchStoresAndUsers();
  }, [userState]);

  useEffect(() => {
    fetchStats(selectedStore, selectedUser);
  }, [selectedStore, selectedUser]);

  return (
    <div className="flex-1 relative z-10 overflow-auto">
      <Header title="Expenses" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Stats Cards */}
        {['ADMIN', 'SUPERUSER'].includes(userState.role) ? (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard 
              name="Total Expenses" 
              icon={Wallet} 
              value={`K${expenseStats.totalExpenses.toFixed(2)}`} 
              color="#6366F1" 
            />
            <StatCard 
              name="Monthly Expenses" 
              icon={CreditCard} 
              value={`K${expenseStats.monthlyExpenses.toFixed(2)}`} 
              color="#F59E0B" 
            />
            <StatCard
              name="Yearly Expenses"
              icon={DollarSign}
              value={`K${expenseStats.yearlyExpenses.toFixed(2)}`}
              color="#10B981"
            />
            <StatCard 
              name="Total Transactions" 
              icon={CreditCard} 
              value={expenseStats.totalTransactions} 
              color="#8B5CF6" 
            />
          </motion.div>
        ) : (
          // Stats for STAFF and STOREMANAGER - only show their store's expenses
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard 
              name="Store Monthly Expenses" 
              icon={CreditCard} 
              value={`K${expenseStats.monthlyExpenses.toFixed(2)}`} 
              color="#F59E0B" 
            />
            <StatCard 
              name="Store Total Expenses" 
              icon={Wallet} 
              value={`K${expenseStats.totalExpenses.toFixed(2)}`} 
              color="#6366F1" 
            />
          </motion.div>
        )}
        
        {/* Add Expense Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onExpenseAdded={() => {
            fetchStats(selectedStore, selectedUser);
          }}
        />
        
        {/* Filters - Only show for ADMIN and SUPERUSER */}
        {['ADMIN', 'SUPERUSER'].includes(userState.role) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Store
              </label>              <select
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                <option value="All">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by User
              </label>
              <select
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="All">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Show store and user info for STAFF and STOREMANAGER */}
        {(userState.role === 'STAFF' || userState.role === 'STOREMANAGER') && stores.length > 0 && (
          <div className="mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Store</label>
                  <span className="text-white">
                    {stores.find(store => store.id === Number(selectedStore))?.name || 'Loading...'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
                  <span className="text-white">{userState.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Table - Collapsible */}
        <div className="mb-8">
          <div 
            onClick={() => setIsExpensesCollapsed(!isExpensesCollapsed)} 
            className="bg-gray-800 rounded-lg p-4 cursor-pointer flex justify-between items-center"
          >
            <h2 className="text-lg font-semibold text-white">
              Expenses Table
            </h2>
            {isExpensesCollapsed ? (
              <ChevronDown className="text-gray-400" />
            ) : (
              <ChevronUp className="text-gray-400" />
            )}
          </div>
          <AnimatePresence>
            {!isExpensesCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ExpensesTable 
                  selectedStore={selectedStore} 
                  selectedUser={selectedUser} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Expenses Calendar */}
        <div className="mb-8">
          <ExpensesCalendar
            selectedStore={selectedStore}
            selectedUser={selectedUser}
          />
        </div>
        
     
      </main>
    </div>
  );
};

export default ExpensesPage;
