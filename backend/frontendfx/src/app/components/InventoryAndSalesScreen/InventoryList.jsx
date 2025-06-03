import { motion } from 'framer-motion';

const InventoryList = ({ inventoryData, isLoading, filterCategory }) => {
  // Apply category filter
  const filteredInventory = Array.isArray(inventoryData)
    ? inventoryData.filter(item => filterCategory === "All" || item.product?.category === filterCategory)
    : [];

  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-md overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="bg-gray-700 bg-opacity-75 backdrop-blur-md shadow-lg rounded-xl p-4 border border-gray-600">
        <h2 className="text-lg font-semibold text-green-300">Current Inventory</h2>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-100">Loading inventory data...</p>
          </div>
        ) : filteredInventory.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Product</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Available</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Sold</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">ID</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className={(!item.product?.id || item.closedStock < 10) ? 'bg-red-900' : ''}
                >
                  <td className="px-4 py-2 text-sm text-gray-100">
                    {item.product?.name || 'Product Unavailable'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-100">{item.closedStock}</td>
                  <td className="px-4 py-2 text-sm text-gray-100">
                    {item.product?.afterSalePrice != null
                      ? `K${item.product.afterSalePrice.toFixed(2)}`
                      : 'Price Unavailable'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-100">{item.sold}</td>
                  <td className="px-4 py-2 text-sm text-gray-100">{item.productId || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-100">No inventory items available.</p>
            <p className="text-gray-100 mt-2">Please contact warehouse to request stock.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryList;
