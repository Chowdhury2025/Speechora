import React from 'react';
import { motion } from "framer-motion";

const StoreOverviewTable = ({ storeOverviews }) => {
  return (
    <motion.div className="mt-8 p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Store Overview</h3>
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
            {storeOverviews.length > 0 ? (
              storeOverviews.map((store) => (
                <tr key={store.storeId}>
                  <td className="px-4 py-2 border-b border-gray-600">
                    {store.storeName}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-600">
                    K {store.cashAtHand.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-600">
                    K {store.totalInventoryValue.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-600">
                    K {store.totalProfit.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No store overview data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default StoreOverviewTable;