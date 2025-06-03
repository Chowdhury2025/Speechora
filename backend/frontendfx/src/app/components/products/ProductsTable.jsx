import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config";
import AddInventoryModal from "../../modals/AddInventoryModal";
import UpdatePriceModal from "../../modals/UpdatePriceModal";
import DamageReportModal from "../../modals/DamageReportModal";
import EditProductModal from "../../modals/EditProductModal";
// Import the components with explicit default imports to avoid issues 
import WarehouseProductsTable from "./WarehouseProductsTable";
import StoreProductsTable from "./StoreProductsTable";

const ProductsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [selectedStore, setSelectedStore] = useState("All");
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);

  // Fetch warehouses and stores
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const [warehouseRes, storeRes] = await Promise.all([
          axios.get(`${API_URL}/wareHousestore/warehouse`),
          axios.get(`${API_URL}/wareHousestore/store`)
        ]);
        setWarehouses(warehouseRes.data.warehouses || []);
        setStores(storeRes.data.stores || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Search functionality will be implemented at a later time
    // Currently, searching is done in the separate components
  };

  // Handler to open the update price modal
  const handleOpenUpdatePrice = (product) => {
    setSelectedProduct(product);
    setIsPriceModalOpen(true);
  };

  // Handle price updated
  const handlePriceUpdated = () => {
    // Just close the modal, the component will refetch data
    setIsPriceModalOpen(false);
    setSelectedProduct(null);
  };

  // Delete product handler (for warehouse products)
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product (and its warehouse stock)?")) {
      try {
        await axios.delete(`${API_URL}/api/warehouse-products/${productId}`);
        // The WarehouseProductsTable component will refetch data on its own
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  // Delete store inventory record handler
  const handleDeleteStoreInventory = async (inventoryId) => {
    if (window.confirm("Are you sure you want to delete this store inventory record?")) {
      try {
        await axios.delete(`${API_URL}/api/store-products/inventory/${inventoryId}`);
        // The StoreProductsTable component will refetch data on its own
      } catch (error) {
        console.error("Error deleting store inventory record:", error);
        alert("Failed to delete store inventory record");
      }
    }
  };

  // Handle damage report
  const handleDamageReport = (storeInventory) => {
    setSelectedProduct({
      storeId: storeInventory.storeId,
      productId: storeInventory.productId,
      name: storeInventory.product?.name
    });
    setIsDamageModalOpen(true);
  };

  // Handle opening the edit product modal
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle product update
  const handleProductUpdated = () => {
    // Just close the modal, the component will refetch data
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <motion.div
      className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl font-semibold text-gray-100">Products</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Add Inventory
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
          {/* Search Bar */}
          {/* <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search products.vv.."
              value={searchTerm}
              onChange={handleSearch}
              className="bg-gray-800 text-gray-100 pl-10 pr-4 py-2 rounded w-full"
            />
          </div> */}

          {/* Warehouse Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-400">Warehouse:</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-gray-800 text-gray-100 p-2 rounded"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-400">Store:</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-gray-800 text-gray-100 p-2 rounded"
            >
              <option value="All">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.name}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Notice About Filtering */}
       
      </div>

      {/* Warehouse Products Table Component */}
      <WarehouseProductsTable
        selectedWarehouse={selectedWarehouse}
        onOpenUpdatePrice={handleOpenUpdatePrice}
        onOpenEditModal={handleOpenEditModal}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Store Products Table Component */}
      <StoreProductsTable
        selectedStore={selectedStore}
        onDeleteStoreInventory={handleDeleteStoreInventory}
      />

      {/* Modals */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UpdatePriceModal
        isOpen={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onPriceUpdated={handlePriceUpdated}
      />

      {selectedProduct && (
        <DamageReportModal
          isOpen={isDamageModalOpen}
          onClose={() => {
            setIsDamageModalOpen(false);
            setSelectedProduct(null);
          }}
          storeId={selectedProduct.storeId}
          productId={selectedProduct.productId}
          productName={selectedProduct.name}
          onDamageReported={() => {
            setIsDamageModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
    </motion.div>
  );
};

export default ProductsTable;
