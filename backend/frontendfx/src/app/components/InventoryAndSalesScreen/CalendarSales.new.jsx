import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../../config';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Spinner = () => (
  <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
);

const CalendarWithPopupTable = ({ userState }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [calendarSummary, setCalendarSummary] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const [storeFilter, setStoreFilter] = useState('All');
  const [monthTotals, setMonthTotals] = useState({
    units: 0,
    amount: 0,
    profit: 0
  });
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [stores, setStores] = useState([]);

  const canViewAllStores = ['ADMIN', 'SUPERUSER', 'INSPECTOR'].includes(userState.role);
  const canViewProfit = ['ADMIN', 'SUPERUSER', 'INSPECTOR'].includes(userState.role);
  const canDelete = ['STOREMANAGER'].includes(userState.role);

  // Build days for current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Fetch stores on component mount
  useEffect(() => {
    if (!canViewAllStores) return;
    
    fetch(`${API_URL}/api/stores`)
      .then(res => res.json())
      .then(data => {
        setStores(data.stores || []);
        // Initialize store filter with the first store if no store is selected
        if (storeFilter === 'All' && data.stores?.length) {
          setStoreFilter(data.stores[0].id.toString());
        }
      })
      .catch(err => {
        console.error('Error fetching stores:', err);
      });
  }, [API_URL, canViewAllStores]);

  // Fetch month-wide summary on month change or store filter change
  useEffect(() => {
    if (!isCalendarExpanded) return;
    
    const month = format(currentMonth, 'M');
    const year = format(currentMonth, 'yyyy');
    let url = `${API_URL}/api/stores/sales/calendar?month=${month}&year=${year}`;

    if (!canViewAllStores && userState.storeIds?.length) {
      url += `&storeId=${userState.storeIds[0]}`;
    } else if (storeFilter !== 'All') {
      url += `&storeId=${storeFilter}`;
    }

    setIsSummaryLoading(true);
    fetch(url)
      .then(async res => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const byDate = {};
        let totalUnits = 0;
        let totalAmount = 0;
        let totalProfit = 0;

        (data.sales || []).forEach(s => {
          const d = s.date; // 'yyyy-MM-dd'
          if (!byDate[d]) byDate[d] = { date: d, totalSoldUnits: 0, totalAmount: 0, totalProfit: 0 };
          byDate[d].totalSoldUnits += s.quantitySold;
          byDate[d].totalAmount += s.totalAmount || 0;
          byDate[d].totalProfit += s.profit || 0;
          
          totalUnits += s.quantitySold;
          totalAmount += s.totalAmount || 0;
          totalProfit += s.profit || 0;
        });

        setCalendarSummary(Object.values(byDate));
        setMonthTotals({
          units: totalUnits,
          amount: totalAmount,
          profit: totalProfit
        });
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to fetch calendar data');
      })
      .finally(() => setIsSummaryLoading(false));
  }, [currentMonth, API_URL, canViewAllStores, userState.storeIds, isCalendarExpanded, storeFilter]);

  // Click handler for a single day
  const onDateClick = async day => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    setSelectedDate(day);
    setIsLoading(true);
    setError('');

    let url;
    if (canViewAllStores) {
      url = `${API_URL}/api/stores/sales/calendar?date=${formattedDate}`;
      if (storeFilter !== 'All') {
        url += `&storeId=${storeFilter}`;
      }
    } else if (userState.storeIds?.length) {
      url = `${API_URL}/api/stores/${userState.storeIds[0]}/sales?date=${formattedDate}`;
    }

    if (!url) {
      setError('Store ID not available');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setSalesData(data.sales || data);
      setIsPopupOpen(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSalesData([]);
    setSelectedDate(null);
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale? This will revert the inventory changes.')) {
      return;
    }

    try {
      const storeId = userState.storeIds?.[0];
      if (!storeId) {
        throw new Error('No store ID available');
      }

      const res = await fetch(`${API_URL}/api/stores/${storeId}/sales/${saleId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Error ${res.status}`);
      }

      // Remove the deleted sale from the list
      setSalesData(salesData.filter(sale => sale.id !== saleId));
      
      // Refresh the calendar summary
      const month = format(currentMonth, 'M');
      const year = format(currentMonth, 'yyyy');
      let url = `${API_URL}/api/stores/sales/calendar?month=${month}&year=${year}`;
      
      // Apply store filter when refreshing calendar after deletion
      if (!canViewAllStores && userState.storeIds?.length) {
        url += `&storeId=${userState.storeIds[0]}`;
      } else if (storeFilter !== 'All') {
        url += `&storeId=${storeFilter}`;
      }
      
      const summaryRes = await fetch(url);
      const summaryData = await summaryRes.json();
      
      const byDate = {};
      let totalUnits = 0;
      let totalAmount = 0;
      let totalProfit = 0;

      (summaryData.sales || []).forEach(s => {
        const d = s.date;
        if (!byDate[d]) byDate[d] = { date: d, totalSoldUnits: 0, totalAmount: 0, totalProfit: 0 };
        byDate[d].totalSoldUnits += s.quantitySold;
        byDate[d].totalAmount += s.totalAmount || 0;
        byDate[d].totalProfit += s.profit || 0;
        
        totalUnits += s.quantitySold;
        totalAmount += s.totalAmount || 0;
        totalProfit += s.profit || 0;
      });

      setCalendarSummary(Object.values(byDate));
      setMonthTotals({
        units: totalUnits,
        amount: totalAmount,
        profit: totalProfit
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete sale');
    }
  };

  // Helper to get summary badge for a day
  const getSummaryFor = day => {
    const key = format(day, 'yyyy-MM-dd');
    return calendarSummary.find(c => c.date === key);
  };

  // Filter sales by store ID
  const filteredSales = salesData.filter(sale => {
    if (storeFilter === 'All') return true;
    return sale.storeId === parseInt(storeFilter, 10);
  });

  const StoreFilterDropdown = () => (
    <div className="mb-4">
      <select
        value={storeFilter}
        onChange={(e) => setStoreFilter(e.target.value)}
        className="w-full md:w-64 px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded"
      >
        <option value="All">All Stores</option>
        {stores.map(store => (
          <option key={store.id} value={store.id.toString()}>
            {store.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="mt-8 relative bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header and toggle button */}
      <div 
        className="px-6 py-4 bg-gray-700 flex justify-between items-center cursor-pointer"
        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
      >
        <h2 className="text-xl font-semibold text-green-300">Sales Calendar</h2>
        <button 
          className="text-gray-400 hover:text-gray-300 transition-colors"
          aria-label={isCalendarExpanded ? "Collapse" : "Expand"}
        >
          {isCalendarExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isCalendarExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Store filter and month navigation */}
              <div className="mb-6">
                {canViewAllStores && <StoreFilterDropdown />}
                
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-2 rounded-full hover:bg-gray-600">‹</button>
                  <h2 className="text-xl font-semibold text-gray-100">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-2 rounded-full hover:bg-gray-600">›</button>
                </div>
                
                {/* Month Totals Section */}
                <div className="bg-gray-700 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-3 rounded-md">
                    <h3 className="text-gray-400 text-sm">Total Units Sold</h3>
                    <p className="text-gray-100 font-semibold text-xl">{monthTotals.units}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <h3 className="text-gray-400 text-sm">Total Revenue</h3>
                    <p className="text-gray-100 font-semibold text-xl">K{monthTotals.amount.toFixed(2)}</p>
                  </div>
                  {canViewProfit && (
                    <div className="bg-gray-800 p-3 rounded-md">
                      <h3 className="text-gray-400 text-sm">Total Profit</h3>
                      <p className="text-green-400 font-semibold text-xl">K{monthTotals.profit.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar grid */}
              <div className="relative">
                {isSummaryLoading && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
                    <Spinner />
                  </div>
                )}
                <div className={`grid grid-cols-7 gap-2 ${
                  isSummaryLoading ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-center font-medium text-gray-300">
                      {d}
                    </div>
                  ))}
                  {daysInMonth.map(day => {
                    const summary = getSummaryFor(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    return (
                      <button key={day.toISOString()}
                              onClick={() => onDateClick(day)}
                              className={`
                                p-2 flex flex-col items-start rounded-lg focus:outline-none
                                ${isSelected
                                  ? 'bg-purple-600 text-gray-900'
                                  : 'bg-gray-700 text-gray-100 hover:bg-gray-600'}`}
                      >
                        <span className="text-sm font-medium">{format(day, 'd')}</span>
                        {summary?.totalSoldUnits > 0 && (
                          <span className="mt-1 text-xs text-green-400 font-medium">
                            {summary.totalSoldUnits} sold
                          </span>
                        )}
                        {canViewProfit && summary?.totalProfit > 0 && (
                          <span className="text-xs text-purple-300">
                            K{summary.totalProfit.toFixed(0)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={closePopup} />
          <motion.div className="bg-gray-800 rounded-lg shadow-xl overflow-y-auto max-h-full relative z-50 w-full max-w-4xl"
                      initial={{ scale: 0.8, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ duration: 0.3 }}>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-20">
                  <Spinner />
                </div>
              )}

              <div className="px-6 py-4 border-b border-purple-700 bg-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-100">
                  Sales for {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                </h2>
                <button onClick={closePopup}
                        className="text-gray-100 font-medium hover:text-gray-300">
                  Close
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Store filter dropdown */}
                {canViewAllStores && salesData.length > 0 && (
                  <StoreFilterDropdown />
                )}

                {/* Content */}
                {!isLoading && (
                  error ? (
                    <p className="text-red-400">{error}</p>
                  ) : filteredSales.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-600">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                            ID
                          </th>
                          {canViewAllStores && (
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                              Store
                            </th>
                          )}
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                            Quantity Sold
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                            Total Amount
                          </th>
                          {canViewProfit && (
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                              Profit
                            </th>
                          )}
                          {canDelete && (
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {filteredSales.map(sale => (
                          <tr key={sale.id}>
                            <td className="px-4 py-2 text-sm text-gray-100">
                              {sale.id}
                            </td>
                            {canViewAllStores && (
                              <td className="px-4 py-2 text-sm text-gray-100">
                                {sale.store?.name || sale.storeName || 'Store Removed'}
                              </td>
                            )}
                            <td className="px-4 py-2 text-sm text-gray-100">
                              {sale.product?.name || sale.productName || 'Product Removed'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-100">
                              {sale.quantitySold}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-100">
                              {sale.totalAmount ? `K${sale.totalAmount}` : 'N/A'}
                            </td>
                            {canViewProfit && (
                              <td className="px-4 py-2 text-sm text-green-400">
                                {sale.profit ? `K${sale.profit}` : 'N/A'}
                              </td>
                            )}
                            {canDelete && (
                              <td className="px-4 py-2 text-sm">
                                <button
                                  onClick={() => handleDelete(sale.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      
                      {/* Add a summary footer */}
                      <tfoot className="bg-gray-700">
                        <tr>
                          <td colSpan={canViewAllStores ? 3 : 2} className="px-4 py-2 text-sm font-semibold text-gray-100">
                            Totals:
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-100">
                            {filteredSales.reduce((sum, sale) => sum + (sale.quantitySold || 0), 0)}
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-100">
                            K{filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}
                          </td>
                          {canViewProfit && (
                            <td className="px-4 py-2 text-sm font-semibold text-green-400">
                              K{filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0).toFixed(2)}
                            </td>
                          )}
                          {canDelete && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p className="text-gray-100">No sales data available for this date.</p>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CalendarWithPopupTable;
