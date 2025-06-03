import React from 'react';
import { motion } from "framer-motion";

const GroupedDataSection = ({ 
  groupBy, 
  setGroupBy, 
  groupedCashHistory, 
  groupedSalesProfit, 
  safeObject 
}) => {
  return (
    <motion.div className="mt-8 p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Group Data</h3>
      <div className="mb-4">
        <label className="text-gray-100 mr-2">Group by:</label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="bg-gray-700 text-white rounded-md px-2 py-1"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Grouped Cash Collection History */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-2">
          Grouped Cash Collection History ({groupBy})
        </h4>
        {Object.keys(safeObject(groupedCashHistory)).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(safeObject(groupedCashHistory)).map(([group, data]) => (
              <div key={group} className="bg-gray-700 p-4 rounded-md">
                <p className="font-semibold text-gray-200">{group}</p>
                <p className="text-gray-300">
                  Total Collected: K {(data.totalCollected || 0).toFixed(2)}
                </p>
                <p className="text-gray-300">
                  Transactions: {data.transactions ? data.transactions.length : 0}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">No grouped cash collection data.</p>
        )}
      </div>

      {/* Grouped Sales Profit */}
      <div>
        <h4 className="text-lg font-semibold text-gray-100 mb-2">
          Grouped Sales Profit ({groupBy})
        </h4>
        {Object.keys(safeObject(groupedSalesProfit)).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(safeObject(groupedSalesProfit)).map(([group, data]) => (
              <div key={group} className="bg-gray-700 p-4 rounded-md">
                <p className="font-semibold text-gray-200">{group}</p>
                <p className="text-gray-300">
                  Total Profit: K {(data.totalProfit || 0).toFixed(2)}
                </p>
                <p className="text-gray-300">
                  Transactions: {data.transactions ? data.transactions.length : 0}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">No grouped sales profit data.</p>
        )}
      </div>
    </motion.div>
  );
};

export default GroupedDataSection;