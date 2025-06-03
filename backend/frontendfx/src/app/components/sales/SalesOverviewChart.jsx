import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../config";
import { useRecoilValue } from "recoil";
import { userStates } from "../../../atoms";
import { ChevronDown, ChevronUp } from "lucide-react";
import CalendarWithPopupTable from "../InventoryAndSalesScreen/CalendarSales";

// Helper to ensure we always have a valid object
const safeObject = (obj) => (obj && typeof obj === "object" ? obj : {});

const CollapsibleSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div className="mt-8 p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-lg border border-gray-700">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SalesOverviewChart = () => {
  const userState = useRecoilValue(userStates);
  const [stores, setStores] = useState([]);
  const [cashInputs, setCashInputs] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // Add messageType state

  // Helper function to show messages
  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000); // Clear message after 5 seconds
  };

  const [cashCollectionHistory, setCashCollectionHistory] = useState([]);
  const [todaySalesProfit, setTodaySalesProfit] = useState(0);
  const [summaryData, setSummaryData] = useState([]);
  const [overviewByStore, setOverviewByStore] = useState([]);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState("week");
  const [selectedStore, setSelectedStore] = useState("all");
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Fetch store list, history, and today's profit
  const fetchStores = async () => {
    try {
      const [storesRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/cash/cash-collection`),
        fetch(`${API_URL}/api/cash/cash-collection/history`)
      ]);
      const storesData = await storesRes.json();
      const historyData = await historyRes.json();
      setStores(storesData.stores || []);
      setCashCollectionHistory(historyData.history || []);
      setTodaySalesProfit(historyData.todaySalesProfit || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
      setMessage("Error fetching data.");
    }
  };

  // Fetch inventory summary for calendar
  const fetchSummaryData = async () => {
    if (!userState.storeIds?.length) return;
    try {
      const res = await fetch(
        `${API_URL}/api/stores/${userState.storeIds[0]}/inventory/summary`
      );
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const summary = await res.json();
      setSummaryData(summary);
    } catch (err) {
      console.error("Error fetching summary data:", err);
    }
  };

  // Fetch overview by store
  const fetchOverviewByStore = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cash/overview/by-store`);
      const data = await res.json();
      setOverviewByStore(data.data || []);
    } catch (err) {
      console.error("Error fetching overview by store:", err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchOverviewByStore();
    fetchSummaryData();
  }, []);

  useEffect(() => {
    // Filter history based on selected time period and store
    const now = new Date();
    const filtered = cashCollectionHistory.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      
      // Time filter
      if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (entryDate < weekAgo) return false;
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (entryDate < monthAgo) return false;
      } else if (timeFilter === "year") {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        if (entryDate < yearAgo) return false;
      }
      
      // Store filter
      if (selectedStore !== "all" && entry.storeName !== selectedStore) {
        return false;
      }
      
      return true;
    });
    
    setFilteredHistory(filtered);
  }, [timeFilter, selectedStore, cashCollectionHistory]);

  // Handle cash collection per store
  const handleCollection = async (storeId) => {
    const cashValue = Number(cashInputs[storeId]);
    if (!cashValue || isNaN(cashValue) || cashValue <= 0) {
      showMessage("Please enter a valid amount greater than 0.", "error");
      return;
    }

    setLoadingStates((p) => ({ ...p, [storeId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/cash/cash-collection/${storeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cashCollected: cashValue,
          collectionDate: new Date().toISOString()
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error recording cash collection");
      }
      
      showMessage("Cash collection recorded successfully.");
      await Promise.all([
        fetchStores(),
        fetchOverviewByStore()
      ]);
    } catch (err) {
      console.error("Error during collection:", err);
      showMessage(err.message || "Error recording cash collection.", "error");
    } finally {
      setLoadingStates((p) => ({ ...p, [storeId]: false }));
      setCashInputs((p) => ({ ...p, [storeId]: "" }));
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl z-20 shadow-lg border border-gray-700 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">
        Cash Collection Dashboard
      </h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          messageType === "error" ? "bg-red-900 text-red-200" : "bg-green-900 text-green-200"
        }`}>
          {message}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-gray-300 mr-2">Time Period:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-3 py-1"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
        <div>
          <label className="text-gray-300 mr-2">Store:</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-3 py-1"
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store.storeId} value={store.storeName}>
                {store.storeName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <CollapsibleSection title="Cash Collection">
        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-100">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-gray-600">Store Name</th>
                <th className="px-4 py-2 border-b border-gray-600">Cash At Hand</th>
                <th className="px-4 py-2 border-b border-gray-600">Unsold Stock Value</th>
                <th className="px-4 py-2 border-b border-gray-600">Inventory Actual Value</th>
                <th className="px-4 py-2 border-b border-gray-600">Collect Cash</th>
              </tr>
            </thead>
            <tbody>
              {stores.length > 0 ? (
                stores.map((store) => (
                  <tr key={store.storeId}>
                    <td className="px-4 py-2 border-b border-gray-600">{store.storeName}</td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K <span className="font-bold text-amber-500">{store.cashAtHand.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {store.totalInventoryValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {store.inventoryActualValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={cashInputs[store.storeId] || ""}
                          onChange={(e) =>
                            setCashInputs((prev) => ({
                              ...prev,
                              [store.storeId]: e.target.value,
                            }))
                          }
                          className="bg-gray-700 text-white rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleCollection(store.storeId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loadingStates[store.storeId]}
                        >
                          {loadingStates[store.storeId] ? "Processing..." : "Collect"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">No stores available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Today's Sales Profit">
        <p className="text-green-400 text-lg font-bold">
          K {todaySalesProfit.toFixed(2)}
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Cash Collection History">
        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-100">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-gray-600">Date & Time</th>
                <th className="px-4 py-2 border-b border-gray-600">Store</th>
                <th className="px-4 py-2 border-b border-gray-600">Amount Collected</th>
                <th className="px-4 py-2 border-b border-gray-600">Balance Left</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 border-b border-gray-600">
                      {new Date(entry.createdAt).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">{entry.storeName}</td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {entry.collectedCash.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {(entry.balanceLeft || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">No history available for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Overview by Store and Profit">
        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-100">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-gray-600">Store Name</th>
                <th className="px-4 py-2 border-b border-gray-600">Cash At Hand</th>
                <th className="px-4 py-2 border-b border-gray-600">Unsold Stock Value</th>
                <th className="px-4 py-2 border-b border-gray-600">Total Profit</th>
              </tr>
            </thead>
            <tbody>
              {overviewByStore.length > 0 ? (
                overviewByStore.map((item) => (
                  <tr key={item.storeId}>
                    <td className="px-4 py-2 border-b border-gray-600">{item.storeName}</td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {item.cashAtHand.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {item.totalInventoryValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600">
                      K {(item.totalProfit || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">No overview data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Sales Calendar View */}
      <motion.div className="mt-8">
        {userState && userState.storeIds && userState.storeIds.length > 0 ? (
          <div className="w-full">
            <CalendarWithPopupTable
              summaryData={summaryData}
              userState={userState}
              API_URL={API_URL}
            />
          </div>
        ) : (
          <p className="text-gray-300">Store information not available.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SalesOverviewChart;