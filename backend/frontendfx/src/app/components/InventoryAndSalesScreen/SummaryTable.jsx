import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import DamageReportModal from '../../modals/DamageReportModal';

const CombinedInventorySummaryTable = ({ inventoryData, summaryData, isLoading, filterCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // Add state to track if the tracker is expanded (default: false - retracted)
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredData = useMemo(() => {
    if (!Array.isArray(inventoryData) || !Array.isArray(summaryData)) return [];

    return inventoryData
      .filter(item =>
        (filterCategory === 'All' || item.product?.category === filterCategory) &&
        (item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.productId.toString().includes(searchTerm))
      )
      .map(item => {
        const summary = summaryData.find(s => s.productId === item.productId);
        // For stockIn, use summary if available, otherwise use either openingStock (for first transfer) or received (for subsequent transfers)
        const stockIn = summary?.stockIn ?? 
                       (item.openingStock > 0 ? item.openingStock : (item.received || 0));
        const stockOut = summary?.stockOut ?? (item.sold || 0) + (item.damages || 0);
        const balance = summary?.balance ?? item.closedStock;
        return {
          ...item,
          stockIn,
          stockOut, 
          balance,
          sold: item.sold || 0
        };
      });
  }, [inventoryData, summaryData, filterCategory, searchTerm]);

  const handleDamageReport = (item) => {
    setSelectedItem(item);
    setIsDamageModalOpen(true);
  };

  const handleDamageReported = () => {
    // You might want to refresh the inventory data here
    setIsDamageModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto mt-8 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-gray-900 bg-opacity-80 flex items-center justify-center">
          <div className="loader border-4 border-t-transparent border-white rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-purple-700 bg-gray-700 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="text-lg font-semibold text-gray-100">
          Inventory Summary Tracker
        </h2>
        <button 
          className="text-gray-400 hover:text-gray-300 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or warehouse ID..."
              className="w-full px-3 py-2 mb-4 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 bg-gray-700 text-gray-100"
            />

            {filteredData.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Warehouse ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Category</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Brand</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Opening Stock</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Stock In</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Stock Out</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Balance</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Sold</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Damages</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Price</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredData.map((row) => {
                    // Determine row background color based on balance instead of closedStock
                    const rowBackgroundClass = 
                      row.balance === 0 ? 'bg-red-900' : 
                      row.balance < 10 ? 'bg-yellow-900' : 
                      '';
                    
                    return (
                      <tr key={row.productId} className={rowBackgroundClass}>
                        <td className="px-4 py-2 text-sm text-gray-100 font-mono">{row.productId}</td>
                        <td className="px-4 py-2 text-sm text-gray-100">
                          {row.product?.name || 'Product Unavailable'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-100">
                          {row.product?.category || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-100">
                          {row.product?.brand || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-100">{row.openingStock}</td>
                        <td className="px-4 py-2 text-sm text-gray-100">{row.received}</td>
                        <td className="px-4 py-2 text-sm text-gray-100">{row.stockOut}</td>
                        <td className={`px-4 py-2 text-sm ${row.balance === 0 ? 'text-red-400 font-bold' : 'text-gray-100'}`}>
                          {row.balance}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-100">{row.sold}</td>
                        <td className="px-4 py-2 text-sm text-gray-100">{row.damages || 0}</td>
                        <td className="px-4 py-2 text-sm text-gray-100">
                          {row.product?.afterSalePrice != null
                            ? `K${row.product.afterSalePrice.toFixed(2)}`
                            : 'Price Unavailable'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-100">
                          <button
                            onClick={() => handleDamageReport(row)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Report Damage"
                          >
                            <AlertTriangle size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-100">No inventory data available.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedItem && (
        <DamageReportModal
          isOpen={isDamageModalOpen}
          onClose={() => {
            setIsDamageModalOpen(false);
            setSelectedItem(null);
          }}
          storeId={selectedItem.storeId}
          productId={selectedItem.productId}
          productName={selectedItem.product?.name || 'Unknown Product'}
          onDamageReported={handleDamageReported}
        />
      )}
    </motion.div>
  );
};

export default CombinedInventorySummaryTable;
