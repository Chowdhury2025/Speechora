import React from 'react';

const CashCollectionTable = ({ 
  stores, 
  cashInputs, 
  setCashInputs, 
  loadingStates, 
  handleCollection 
}) => {
  return (
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
                <td className="px-4 py-2 border-b border-gray-600">
                  {store.storeName}
                </td>
                <td className="px-4 py-2 border-b border-gray-600">K
                  <span className="font-bold text-amber-500">
                    {store.cashAtHand.toFixed(2)}
                  </span>
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
              <td colSpan={5} className="text-center py-4">
                No stores available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CashCollectionTable;