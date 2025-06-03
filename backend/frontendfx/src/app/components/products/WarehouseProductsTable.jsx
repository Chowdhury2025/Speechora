import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, DollarSign } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config";

const WarehouseProductsTable = ({ 
  selectedWarehouse, 
  onOpenUpdatePrice, 
  onOpenEditModal, 
  onDeleteProduct 
}) => {
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [isLoading, setIsLoading] = useState(true);  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchWarehouseProducts();
  }, [selectedWarehouse]);
  
  // Reset search term when warehouse changes to prevent confusing filter results
  useEffect(() => {
    setSearchTerm('');
  }, [selectedWarehouse]);
  
  // Filter products based on search term
  useEffect(() => {
    if (!warehouseProducts.length) return;
    
    let filtered = warehouseProducts;
    
    // Apply search term filter if present
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        // Search by product name, category, brand, warehouse name
        return (
          product.name.toLowerCase().includes(lowerSearchTerm) ||
          (product.category && product.category.toLowerCase().includes(lowerSearchTerm)) ||
          (product.brand && product.brand.toLowerCase().includes(lowerSearchTerm)) ||
          (product.warehouse && product.warehouse.name.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, warehouseProducts]);

  const fetchWarehouseProducts = async () => {
    setIsLoading(true);
    try {
      let endpoint = `${API_URL}/api/warehouse-products`;
      
      // If a specific warehouse is selected (not "All"), fetch only products from that warehouse
      if (selectedWarehouse !== "All") {
        endpoint = `${API_URL}/api/warehouse-products/warehouse/${selectedWarehouse}`;
      }
      
      const response = await axios.get(endpoint);
      setWarehouseProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching warehouse products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for warehouse row styling based on stock
  const getWarehouseRowClass = (stock) => {
    if (stock === 0) return "bg-red-500";
    else if (stock < 8) return "bg-amber-500";
    return "";
  };

  // Calculate totals for warehouse products
  const calculateWarehouseTotals = (products = null) => {
    // Use filtered products when searching, otherwise use all warehouse products
    const productsToCalculate = products || (searchTerm.trim() ? filteredProducts : warehouseProducts);
    return productsToCalculate.reduce((acc, product) => {
      return {
        totalStock: acc.totalStock + (product.stock || 0),
        totalCostValue: acc.totalCostValue + (product.stock * product.price || 0),
        totalSellingValue: acc.totalSellingValue + (product.stock * product.afterSalePrice || 0),
        potentialProfit: acc.potentialProfit + (product.stock * (product.afterSalePrice - product.price) || 0)
      };
    }, { totalStock: 0, totalCostValue: 0, totalSellingValue: 0, potentialProfit: 0 });
  };

  // Render table rows for warehouse products
  const renderWarehouseRows = (items) => {
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="text-center p-4 text-gray-300">
            No warehouse products found.
          </td>
        </tr>
      );
    }
    return items.map((product) => (
      <tr
        key={product.id}
        className={`divide-x divide-gray-700 ${getWarehouseRowClass(product.stock)}`}
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
          {product.warehouse ? product.warehouse.name : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          {product.stock}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          K{product.price.toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          K{product.afterSalePrice.toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          <button 
            className="text-green-400 hover:text-green-300 mr-2"
            onClick={() => onOpenUpdatePrice(product)}
          >
            <DollarSign size={18} />
          </button>
          <button 
            className="text-indigo-400 hover:text-indigo-300 mr-2"
            onClick={() => onOpenEditModal(product)}
          >
            <Edit size={18} />
          </button>
          <button
            className="text-red-400 hover:text-red-300"
            onClick={() => onDeleteProduct(product.id)}
          >
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <button
        className="w-full text-left bg-gray-700 p-2 mb-2"
        onClick={() => setShowWarehouses(!showWarehouses)}
      >
        {showWarehouses ? "Hide" : "Show"} Warehouse Products
      </button>      {showWarehouses && (
        <div className="overflow-x-auto mb-6">{/* Search Input */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">
              Warehouse Products
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
          
          {/* Warehouse Totals Summary */}
          {!isLoading && (
            <div className="grid grid-cols-4 gap-4 mb-4 bg-gray-700 p-4 rounded-lg">
              {(() => {
                const totals = calculateWarehouseTotals();
                return (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm">Total Stock</p>
                      <p className="text-gray-100 text-lg font-semibold">{totals.totalStock}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Cost Value</p>
                      <p className="text-gray-100 text-lg font-semibold">K{totals.totalCostValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Selling Value</p>
                      <p className="text-gray-100 text-lg font-semibold">K{totals.totalSellingValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Potential Profit</p>
                      <p className="text-green-400 text-lg font-semibold">K{totals.potentialProfit.toFixed(2)}</p>
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
                      Warehouse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {renderWarehouseRows(searchTerm.trim() ? filteredProducts : warehouseProducts)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Make sure default export is explicit and clear
export default WarehouseProductsTable;
