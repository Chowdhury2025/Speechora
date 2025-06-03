import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config";

const StoreProductsTable = ({ 
  selectedStore,
  onDeleteStoreInventory
}) => {
  const [showStores, setShowStores] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeProducts, setStoreProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Add state for monthly sales data from API
  const [monthlyApiData, setMonthlyApiData] = useState({
    totalProfit: 0,
    totalSales: 0,
    totalUnitsSold: 0
  });
  
  // Helper function to get current month's date range
  const getCurrentMonthDateRange = () => {
    const now = new Date();
    // Use UTC methods to avoid timezone issues
    const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
    const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
    return { firstDay, lastDay };
  };
    // Log when selected store changes to debug filtering issues
  useEffect(() => {
    console.log("Selected store changed to:", selectedStore);
    // Refetch store products when the selected store changes
    fetchStoreProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);
  
  // Reset search term when store changes to prevent confusing filter results
  useEffect(() => {
    setSearchTerm('');
  }, [selectedStore]);
  
  useEffect(() => {
    // Initial fetch is handled by the above effect when component mounts
    // This prevents double fetching on initial render
  }, []);  // Filter products based on search term and selected store
  useEffect(() => {
    if (!storeProducts.length) return;
    
    let filtered = storeProducts;
    
    // Apply search term filter if present
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        // Search by product name, category, brand
        if (
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          (product.category && product.category.toLowerCase().includes(lowerSearchTerm)) ||
          (product.brand && product.brand.toLowerCase().includes(lowerSearchTerm))
        ) {
          return true;
        }
        
        // Search within store inventories
        return product.storeInventories.some(inv => 
          (inv.store && inv.store.name.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }
    
    setFilteredProducts(filtered);
    
    // Log filtering info to help debug
    console.log("Filtering applied:", {
      searchTerm: searchTerm,
      originalCount: storeProducts.length,
      filteredCount: filtered.length,
      isFiltering: searchTerm.trim() !== ''
    });
  }, [searchTerm, storeProducts]);
  
  const fetchStoreProducts = async () => {
    setIsLoading(true);
    try {
      let endpoint = `${API_URL}/api/store-products`;
      
      // If a specific store is selected (not "All"), fetch only products from that store
      if (selectedStore !== "All") {
        console.log(`Fetching products for store: ${selectedStore}`);
        endpoint = `${API_URL}/api/store-products/store/${selectedStore}`;
      }
      
      console.log(`Using endpoint: ${endpoint}`);
      const response = await axios.get(endpoint);
      const products = response.data.products || [];
      
      // Fetch monthly sales data to ensure we have accurate profit numbers
      // that match the calendar component
      try {
        const { firstDay, lastDay } = getCurrentMonthDateRange();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        
        console.log(`Fetching sales data for ${month}/${year}`);
          // Add store filter to API request if a specific store is selected
        let calendarEndpoint = `${API_URL}/api/stores/sales/calendar?month=${month}&year=${year}`;
        if (selectedStore !== "All") {
          try {
            // Find the store ID based on the name for use in the calendar API
            const storeResponse = await axios.get(`${API_URL}/api/store-products/stores`);
            const storeList = storeResponse.data?.stores || [];
            const matchingStore = storeList.find(s => s.name === selectedStore);
            
            if (matchingStore) {
              calendarEndpoint += `&storeId=${matchingStore.id}`;
              console.log(`Adding store filter for ID ${matchingStore.id} to calendar API request`);
            }
          } catch (storeError) {
            console.error("Error fetching store details:", storeError);
          }
        }
        
        const salesResponse = await axios.get(calendarEndpoint);
        console.log("Sales data response:", salesResponse.data);
        
        // Enhance product data with sales information if available
        if (salesResponse.data && salesResponse.data.summary) {
          const summary = salesResponse.data.summary;
          console.log("Using API profit data:", summary);
          
          // Update the monthly API data state
          setMonthlyApiData({
            totalProfit: summary.totalProfit || 0,
            totalSales: summary.totalAmount || 0,
            totalUnitsSold: summary.totalSoldUnits || 0
          });
        }
      } catch (salesError) {
        console.error("Error fetching monthly sales data:", salesError);
      }
      
      setStoreProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error("Error fetching store products:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate totals for store products
  const calculateStoreTotals = (productsToCalculate = storeProducts) => {
    const { firstDay, lastDay } = getCurrentMonthDateRange();
    console.log("Date range for calculations:", {
      firstDay: firstDay.toISOString(),
      lastDay: lastDay.toISOString()
    });
    
    // Debug: Log the first few products to check structure
    if (productsToCalculate.length > 0) {
      console.log("Sample product data:", JSON.stringify(productsToCalculate[0], null, 2));
    }
    
    // Now calculate all values directly from the products data, matching CalendarSales profit calculation
    return productsToCalculate.reduce((acc, product) => {
      const storeTotals = product.storeInventories.reduce((storeAcc, inv) => {
        // The key issue: Calendar component gets data directly from the sales database
        // which is filtered by sale date, while store inventory data doesn't track when items were sold
        // We'll keep calculating inventory data but later use the API data for display
        const inventoryDate = new Date(inv.createdAt || inv.updatedAt || new Date());
        
        // For debugging only - we're not using this filter anymore
        const dateInRange = inventoryDate >= firstDay && inventoryDate <= lastDay;
        
        // Include all inventory items since we'll use the API data for consistency
        const isCurrentMonth = true;
        
        // Calculate total value of stock received (cost value)
        const totalCostValue = inv.closedStock * product.price;
        
        // Calculate actual selling value of sold items
        const soldValue = inv.sold * inv.unitPrice;
        
        // Calculate proper unsold value (closed stock * unit price)
        const unsoldValue = inv.closedStock * inv.unitPrice;
        
        // Calculate damages cost and value loss
        const damagesCostLoss = (inv.damages || 0) * product.price;
        const damagesValueLoss = (inv.damages || 0) * inv.unitPrice;
        
        // Calculate profit exactly as it's calculated in the backend for sales
        // This matches how profit is calculated in CalendarSales.jsx
        const costOfSoldItems = inv.sold * product.price;
        const profit = soldValue - costOfSoldItems;
        
        // Track total units sold
        const unitsSold = inv.sold || 0;
        
        // Debug profit calculation
        console.log("Product profit calculation:", {
          productName: product.name,
          sold: inv.sold,
          unitPrice: inv.unitPrice,
          productCostPrice: product.price, 
          soldValue: soldValue,
          costOfSoldItems: costOfSoldItems,
          profit: profit,
          isCurrentMonth: isCurrentMonth
        });
        
        // Only include this inventory in profit if it's from current month
        // This ensures consistency with how CalendarSales filters by month
        const profitToAdd = isCurrentMonth ? profit : 0;
        // Only count units sold in the current month for the monthly total
        const unitsSoldToAdd = isCurrentMonth ? unitsSold : 0;
        
        return {
          totalStock: storeAcc.totalStock + (inv.closedStock || 0),
          totalCostValue: storeAcc.totalCostValue + totalCostValue,
          totalProfit: storeAcc.totalProfit + profitToAdd,
          totalSoldValue: storeAcc.totalSoldValue + soldValue,
          unsoldValue: storeAcc.unsoldValue + unsoldValue,
          totalDamages: storeAcc.totalDamages + (inv.damages || 0),
          damageCostLoss: storeAcc.damageCostLoss + damagesCostLoss,
          damageValueLoss: storeAcc.damageValueLoss + damagesValueLoss,
          totalUnitsSold: storeAcc.totalUnitsSold + unitsSoldToAdd
        };
      }, { 
        totalStock: 0, 
        totalCostValue: 0, 
        totalSellingValue: 0, 
        totalProfit: 0,
        totalSoldValue: 0,
        unsoldValue: 0,
        totalDamages: 0,
        damageCostLoss: 0,
        damageValueLoss: 0,
        totalUnitsSold: 0
      });
      
      return {
        totalStock: acc.totalStock + storeTotals.totalStock,
        totalCostValue: acc.totalCostValue + storeTotals.totalCostValue,
        totalProfit: acc.totalProfit + storeTotals.totalProfit,
        totalSoldValue: acc.totalSoldValue + storeTotals.totalSoldValue,
        unsoldValue: acc.unsoldValue + storeTotals.unsoldValue,
        totalDamages: acc.totalDamages + storeTotals.totalDamages,
        damageCostLoss: acc.damageCostLoss + storeTotals.damageCostLoss,
        damageValueLoss: acc.damageValueLoss + storeTotals.damageValueLoss,
        totalUnitsSold: acc.totalUnitsSold + storeTotals.totalUnitsSold
      };
    }, { 
      totalStock: 0, 
      totalCostValue: 0, 
      totalSellingValue: 0, 
      totalProfit: 0,
      totalSoldValue: 0,
      unsoldValue: 0,
      totalDamages: 0,
      damageCostLoss: 0,
      damageValueLoss: 0,
      totalUnitsSold: 0
    });
  };

  // Helper function for store row styling based on closedStock
  const getStoreRowClass = (closedStock) => {
    if (closedStock === 0) return "bg-red-500";
    else if (closedStock < 8) return "bg-amber-500";
    return "";
  };

  // Render table rows for store products by iterating over each product's storeInventories
  const renderStoreRows = (items) => {
    const rows = [];
    items.forEach((product) => {
      product.storeInventories.forEach((inv, idx) => {
        // Calculate correct unsold amount
        const actualUnsoldAmount = inv.closedStock * inv.unitPrice;
        
        rows.push(
          <tr
            key={`${product.id}-${inv.id || idx}`}
            className={`divide-x divide-gray-700 ${getStoreRowClass(inv.closedStock)}`}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {product.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
              {product.image && (
                <img
                  src={product.image}
                  alt="Product"
                  className="h-10 w-10 rounded-full"
                />
              )}
              {product.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {product.category || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {product.brand || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.store ? inv.store.name : "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.openingStock}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.received}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.transferred}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.total}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.closedStock}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.sold}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              K{product.price.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              K{product.afterSalePrice.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              K{inv.unitPrice.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              K{(inv.sold * inv.unitPrice).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              K{actualUnsoldAmount.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              {inv.damages}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
              <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                <Edit size={18} />
              </button>
              <button
                className="text-red-400 hover:text-red-300 mr-2"
                onClick={() => onDeleteStoreInventory(inv.id)}
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        );
      });
    });
    
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan="18" className="text-center p-4 text-gray-300">
            No store products found.
          </td>
        </tr>
      );
    }
    
    return rows;
  };

  return (
    <>
      <button
        className="w-full text-left bg-gray-700 p-2 mb-2"
        onClick={() => setShowStores(!showStores)}
      >
        {showStores ? "Hide" : "Show"} Store Products
      </button>
      {showStores && (
        <div className="overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">
              Store Products
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {/* Store Totals Summary */}
          {!isLoading && (
            <div className="grid grid-cols-4 gap-4 mb-4 bg-gray-700 p-4 rounded-lg">
              {(() => {
                // Use filtered products for totals when searching
                const totals = calculateStoreTotals(filteredProducts);                // Check if we're filtering
                const isFiltering = searchTerm.trim() !== '' || selectedStore !== 'All';
                  // Check if we're actively filtering by search term
                const isSearchFiltering = searchTerm.trim() !== '';
                
                // Debug final calculated values
                console.log("Final calculated totals:", {
                  isSearchFiltering: isSearchFiltering,
                  selectedStore: selectedStore,
                  searchTerm: searchTerm,
                  filteredProductsCount: filteredProducts.length,
                  allProductsCount: storeProducts.length,
                  totalStock: totals.totalStock,
                  totalCostValue: totals.totalCostValue.toFixed(2),
                  calculatedProfit: totals.totalProfit.toFixed(2),
                  apiProfit: monthlyApiData.totalProfit.toFixed(2),
                  unsoldValue: totals.unsoldValue.toFixed(2),
                  totalDamages: totals.totalDamages,
                  damageCostLoss: totals.damageCostLoss.toFixed(2),
                  damageValueLoss: totals.damageValueLoss.toFixed(2),
                  calculatedUnitsSold: totals.totalUnitsSold,
                  apiUnitsSold: monthlyApiData.totalUnitsSold
                });
                
                // When searching, always use calculated data from filtered products
                // When just filtering by store (not searching), we can use API data for store-filtered results
                // But for text search, we need to use the calculated values from filtered products
                const displayUnits = isSearchFiltering ? totals.totalUnitsSold : (monthlyApiData.totalUnitsSold || totals.totalUnitsSold);
                const displayProfit = isSearchFiltering ? totals.totalProfit : (monthlyApiData.totalProfit || totals.totalProfit);
                return (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm">Total Units Sold</p>
                      <p className="text-blue-400 text-lg font-semibold">{displayUnits}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Stock</p>
                      <p className="text-gray-100 text-lg font-semibold">{totals.totalStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Cost Value</p>
                      <p className="text-gray-100 text-lg font-semibold">K{totals.totalCostValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Current Month Profit</p>
                      <p className={`text-lg font-semibold ${displayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        K{displayProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Unsold Stock Value</p>
                      <p className="text-gray-100 text-lg font-semibold">K{totals.unsoldValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Damaged Items</p>
                      <p className="text-red-400 text-lg font-semibold">{totals.totalDamages}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Damage Loss (Cost)</p>
                      <p className="text-red-400 text-lg font-semibold">K{totals.damageCostLoss.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Damage Loss (Value)</p>
                      <p className="text-red-400 text-lg font-semibold">K{totals.damageValueLoss.toFixed(2)}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          {isLoading ? (
            <div className="text-center text-gray-300">Loading products...</div>
          ) : (
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      Opening Stock
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      Received
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      Transferred
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      Total
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      Closed Stock
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sold Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Unsold Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Damages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {renderStoreRows(filteredProducts)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StoreProductsTable;