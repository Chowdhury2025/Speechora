import { useEffect, useState, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import { API_URL } from '../../config';
import { Package, DollarSign, ShoppingBag, Plus, TrendingUp, CreditCard, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RequestOrderModal from '../modals/RequestOrderModal';
import axios from 'axios';

import StatCard from '../components/InventoryAndSalesScreen/StatCard.jsx';
import CombinedInventorySummaryTable from '../components/InventoryAndSalesScreen/SummaryTable.jsx';
import SaleForm from '../components/InventoryAndSalesScreen/SaleForm.jsx';
import CalendarWithPopupTable from '../components/InventoryAndSalesScreen/CalendarSales.jsx';

// Popup Notification Component
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, type === 'error' ? 5000 : 3000);
    
    return () => clearTimeout(timer);
  }, [onClose, type]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 min-w-[300px] p-4 rounded-lg shadow-lg flex items-center justify-between
        ${type === 'error' ? 'bg-red-800 border-red-700 text-red-100' : 'bg-green-800 border-green-700 text-green-100'}`}
    >
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className={`ml-4 hover:${type === 'error' ? 'text-red-200' : 'text-green-200'}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const InventoryAndSalesScreen = () => {
  const userState = useRecoilValue(userStates);
  const [inventoryData, setInventoryData] = useState([]); 
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    totalValue: '0.00',
    topSellingItem: 'None',
    lowStockItems: 0,
  });
  const [summaryData, setSummaryData] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSoldUnits: 0,
    cashAtHand: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [saleData, setSaleData] = useState({
    productId: '',
    quantitySold: 1,
  });
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [salesHistory, setSalesHistory] = useState([]);
  const [isSalesHistoryCollapsed, setIsSalesHistoryCollapsed] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a data refresh
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Display success message with auto-dismiss
  const showSuccessMessage = useCallback((message) => {
    setSuccessMessage(message);
    setError(null);
  }, []);

  // Display error message with auto-dismiss
  const showErrorMessage = useCallback((message) => {
    setError(message);
    setSuccessMessage('');
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setSuccessMessage('');
    setError(null);
  }, []);

  const fetchInventoryData = useCallback(async () => {
    if (!userState.storeIds?.length) {
      showErrorMessage('No store ID available');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/stores/${userState.storeIds[0]}/inventory`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Filter out invalid/null entries and ensure data is an array
      const validData = Array.isArray(data) ? data.filter(item => 
        item && 
        item.productId && 
        item.product
      ) : [];

      setInventoryData(validData);

      // Calculate stats only from valid data
      const stats = validData.reduce((acc, item) => {
        const stock = Number(item.closedStock) || 0;
        const price = Number(item.product?.afterSalePrice) || 0;
        const value = stock * price;
        
        return {
          totalItems: acc.totalItems + stock,
          totalValue: acc.totalValue + value,
          topSeller: item.sold > (acc.topSeller?.sold || 0) ? item : acc.topSeller,
          lowStockItems: acc.lowStockItems + (stock < 10 ? 1 : 0)
        };
      }, { totalItems: 0, totalValue: 0, topSeller: null, lowStockItems: 0 });

      setInventoryStats({
        totalItems: stats.totalItems,
        totalValue: stats.totalValue.toFixed(2),
        topSellingItem: stats.topSeller?.product?.name || 'None',
        lowStockItems: stats.lowStockItems
      });

    } catch (error) {
      console.error('Error fetching inventory:', error);
      showErrorMessage(`Failed to load inventory: ${error.message}`);
      setInventoryData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userState.storeIds, showErrorMessage]);

  const fetchSummaryData = useCallback(async () => {
    if (!userState.storeIds || userState.storeIds.length === 0) return;
    const storeId = userState.storeIds[0];
    
    try {
      // Fetch cash collection data to get the persistentCashBalance
      const cashResponse = await fetch(`${API_URL}/api/cash/cash-collection`);
      if (!cashResponse.ok) {
        throw new Error(`Cash API responded with ${cashResponse.status}`);
      }
      const cashData = await cashResponse.json();
      const storeCashData = cashData.stores.find(store => store.storeId === storeId);

      setSalesStats({
        totalSoldUnits: 0, // This will be updated from sales data
        cashAtHand: storeCashData ? storeCashData.cashAtHand : 0,
      });

      // Now fetch sales data
      const salesResponse = await fetch(`${API_URL}/api/stores/${storeId}/sales`);
      if (!salesResponse.ok) {
        throw new Error(`Sales API responded with ${salesResponse.status}`);
      }
      const salesData = await salesResponse.json();

      setSalesStats(prev => ({
        ...prev,
        totalSoldUnits: salesData.totalSoldUnits || 0,
      }));

    } catch (error) {
      console.error('Error fetching sales stats', error);
      showErrorMessage('Failed to fetch sales statistics');
    }
  }, [userState.storeIds, showErrorMessage]);

  const fetchSalesHistory = useCallback(async () => {
    if (!userState.storeIds?.[0]) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/stores/${userState.storeIds[0]}/sales`, );
      
      const sales = response.data.sales || [];
      // Sort sales by date, most recent first
      const sortedSales = [...sales].sort((a, b) => {
        const dateA = a.saleDate ? new Date(a.saleDate) : new Date(a.date + 'T' + (a.time || '00:00:00'));
        const dateB = b.saleDate ? new Date(b.saleDate) : new Date(b.date + 'T' + (b.time || '00:00:00'));
        return dateB - dateA; // Sort in descending order (newest first)
      });
      setSalesHistory(sortedSales);
    } catch (error) {
      console.error('Error fetching sales history:', error);
      if (!error.response) {
        showErrorMessage('Network error: Please check your connection');
      } else {
        showErrorMessage('Failed to fetch sales history');
      }
      setSalesHistory([]); // Clear sales history on error
    } finally {
      setIsLoading(false);
    }
  }, [userState.storeIds, showErrorMessage]);

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale? This will revert the inventory changes.')) {
      return;
    }
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/api/stores/${userState.storeIds[0]}/sales/${saleId}`);
      showSuccessMessage('Sale deleted successfully');
      
      // Refresh all data
      refreshData();
    } catch (error) {
      console.error('Error deleting sale:', error);
      showErrorMessage('Failed to delete sale: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDamageReported = () => {
    showSuccessMessage('Damage report submitted successfully');
    refreshData();
  };

  // Combined function to fetch all data
  const fetchAllData = useCallback(() => {
    fetchInventoryData();
    fetchSummaryData();
    fetchSalesHistory();
  }, [fetchInventoryData, fetchSummaryData, fetchSalesHistory]);

  useEffect(() => {
    if (
      userState.role === 'STOREMANAGER' &&
      Array.isArray(userState.storeIds) &&
      userState.storeIds.length > 0
    ) {
      fetchAllData();
    }
  }, [userState, fetchAllData, refreshTrigger]);

  const handleSaleSuccess = (msg) => {
    showSuccessMessage(msg);
    refreshData();
  };

  const handleSaleError = (msg) => {
    showErrorMessage(msg);
  };

  const handleOrderRequested = (order) => {
    showSuccessMessage(`Order requested successfully for product ID: ${order.productId}`);
    setTimeout(() => {
      refreshData();
    }, 500);
  };

  if (userState.role !== 'STOREMANAGER') {
    return <div className="text-gray-100">You do not have access to this page.</div>;
  }

  if (isLoading && inventoryData.length === 0) {
    return <div className="text-gray-100 text-center py-10">Loading inventory...</div>;
  }

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden pb-10">
      <div className="space-y-6 px-4">
        <div className="flex justify-between items-center pt-4">
          <h1 className="text-2xl font-bold text-gray-100">shop sales Management</h1>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-gray-900 rounded hover:bg-purple-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Request Order
          </button>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <motion.div
            className="flex gap-5 min-w-max"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatCard title="Total Inventory" value={inventoryStats.totalItems} icon={Package} color="#6366F1" isLoading={isLoading} />
            <StatCard title="Inventory Value" value={`K${inventoryStats.totalValue}`} icon={DollarSign} color="#10B981" isLoading={isLoading} />
            <StatCard title="Top Selling Item" value={inventoryStats.topSellingItem} icon={ShoppingBag} color="#F59E0B" isLoading={isLoading} />
            <StatCard title="Total Sold" value={salesStats.totalSoldUnits} icon={TrendingUp} color="#4F46E5" isLoading={isLoading} />
            <StatCard title="Cash At Hand" value={`K${salesStats.cashAtHand}`} icon={CreditCard} color="#22C55E" isLoading={isLoading} />
          </motion.div>
        </div>

        <style jsx global>{`
          body, html {
            height: 100%;
            overflow: hidden;
          }
          #__next, main {
            height: 100%;
          }
        `}</style>

        {/* Success and Error Messages with Animation */}
        <AnimatePresence>
          {error && (
            <Notification type="error" message={error} onClose={clearNotifications} />
          )}

          {successMessage && (
            <Notification type="success" message={successMessage} onClose={clearNotifications} />
          )}
        </AnimatePresence>

        {/* Category Filter Dropdown */}
        <div className="flex items-center space-x-4">
          <label htmlFor="categoryFilter" className="text-gray-100 font-medium">
            Filter by Category:
          </label>
          <select
            id="categoryFilter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-gray-100 border border-gray-500 rounded-md"
          >
            <option value="All">All</option>
            {Array.from(new Set(inventoryData.map(item => item.product?.category).filter(Boolean)))
              .map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
          </select>
          

        </div>

        <SaleForm
          saleData={saleData}
          setSaleData={setSaleData}
          inventoryData={inventoryData}
          isSubmitting={isSubmitting}
          userState={userState}
          onSuccess={handleSaleSuccess}
          onError={handleSaleError}
        />

        <div className="overflow-x-auto">
          <CombinedInventorySummaryTable
            inventoryData={inventoryData}
            summaryData={summaryData}
            isLoading={isLoading}
            filterCategory={filterCategory}
            onDamageReported={handleDamageReported}
          />
        </div>

        <div className="overflow-x-auto">
          <CalendarWithPopupTable
            summaryData={summaryData}
            userState={userState}
            API_URL={API_URL}
          />
        </div>

        <RequestOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          onOrderRequested={handleOrderRequested}
        />

        {/* Sales History Section */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-300">Sales History</h2>
            <button
              onClick={() => setIsSalesHistoryCollapsed(!isSalesHistoryCollapsed)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              {isSalesHistoryCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </button>
          </div>
          
          <motion.div
            initial={false}
            animate={{ height: isSalesHistoryCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-400 text-center py-4">{error}</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Sale ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Warehouse ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {salesHistory.length > 0 ? (
                      salesHistory.map((sale) => (
                        <tr key={sale.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">{sale.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-300">{sale.productId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {sale.productName || sale.product?.name || 'Product Removed'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">{sale.quantitySold}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">K{sale.totalAmount?.toFixed(2) || '0.00'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {sale.saleDate ? 
                              new Date(sale.saleDate).toLocaleString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(sale.date + 'T' + (sale.time || '00:00:00')).toLocaleString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete sale record"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                          No sales history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryAndSalesScreen;