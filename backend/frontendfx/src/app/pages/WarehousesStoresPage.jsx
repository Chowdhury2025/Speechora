import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import AddWarehouseModal from "../modals/AddWarehouseModal";
import AddStoreModal from "../modals/AddStoreModal";
import EditWarehouseModal from "../modals/EditWarehouseModal";
import EditStoreModal from "../modals/EditStoreModal";

const WarehousesStoresPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  // Modal states for add/edit operations
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [isEditWarehouseModalOpen, setIsEditWarehouseModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [isEditStoreModalOpen, setIsEditStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Modal states for viewing assigned staff/managers
  const [isViewStoreStaffModalOpen, setIsViewStoreStaffModalOpen] = useState(false);
  const [storeStaff, setStoreStaff] = useState({ managers: [], staff: [] });
  const [selectedStoreForStaff, setSelectedStoreForStaff] = useState(null);

  const [isViewWarehouseStaffModalOpen, setIsViewWarehouseStaffModalOpen] = useState(false);
  const [warehouseStaff, setWarehouseStaff] = useState({ managers: [], staff: [] });
  const [selectedWarehouseForStaff, setSelectedWarehouseForStaff] = useState(null);

  // Modal states for assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetType, setAssignTargetType] = useState(""); // "store" or "warehouse"
  const [assignRole, setAssignRole] = useState(""); // "manager" or "staff"
  const [assignTarget, setAssignTarget] = useState(null); // target store/warehouse object
  const [selectedUser, setSelectedUser] = useState("");

  // Fetch Warehouses
  const fetchWarehouses = async () => {
    setIsLoadingWarehouses(true);
    try {
      const response = await axios.get(`${API_URL}/wareHousestore/warehouse`);
      setWarehouses(response.data.warehouses || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    setIsLoadingStores(true);
    try {
      const response = await axios.get(`${API_URL}/wareHousestore/store`);
      setStores(response.data.stores || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoadingStores(false);
    }
  };

  // Fetch Users for assignment
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/wareHousestore/users`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchStores();
    fetchUsers();
  }, []);
  // Delete Warehouse
  const handleDeleteWarehouse = async (id) => {
    try {
      // First check if warehouse has any products
      const response = await axios.get(`${API_URL}/api/A/listproducts`);
      const products = response.data.products || [];
      const warehouseProducts = products.filter(p => p.warehouseId === id);

      if (warehouseProducts.length > 0) {
        alert(`Cannot delete warehouse - it contains ${warehouseProducts.length} product(s). Please remove all products first.`);
        return;
      }

      if (window.confirm("Are you sure you want to delete this warehouse?")) {
        await axios.delete(`${API_URL}/wareHousestore/warehouse/${id}`);
        fetchWarehouses();
      }
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      alert(error.response?.data?.error || "Failed to delete warehouse");
    }
  };
  // Delete Store
  const handleDeleteStore = async (id) => {
    try {
      // First check if store has any inventory
      const response = await axios.get(`${API_URL}/api/stores/${id}/inventory`);
      const inventory = response.data || [];

      if (inventory.length > 0) {
        const productList = inventory
          .map(item => `\n- ${item.product?.name}: ${item.closedStock} units`)
          .join("");
        
        alert(`Cannot delete store - it contains inventory items:${productList}\n\nPlease remove all inventory first.`);
        return;
      }

      if (window.confirm("Are you sure you want to delete this store?")) {
        await axios.delete(`${API_URL}/wareHousestore/store/${id}`);
        fetchStores();
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      alert(error.response?.data?.error || "Failed to delete store");
    }
  };

  // Open edit modals with pre-filled data
  const openEditWarehouseModal = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditWarehouseModalOpen(true);
  };

  const openEditStoreModal = (store) => {
    setSelectedStore(store);
    setIsEditStoreModalOpen(true);
  };

  // Fetch and view store staff
  const handleViewStoreStaff = async (store) => {
    try {
      const response = await axios.get(`${API_URL}/wareHousestore/store/${store.id}/staff`);
      setStoreStaff(response.data);
      setSelectedStoreForStaff(store);
      setIsViewStoreStaffModalOpen(true);
    } catch (error) {
      console.error("Error fetching store staff:", error);
    }
  };

  // Fetch and view warehouse staff
  const handleViewWarehouseStaff = async (warehouse) => {
    try {
      const response = await axios.get(`${API_URL}/wareHousestore/warehouse/${warehouse.id}/staff`);
      setWarehouseStaff(response.data);
      setSelectedWarehouseForStaff(warehouse);
      setIsViewWarehouseStaffModalOpen(true);
    } catch (error) {
      console.error("Error fetching warehouse staff:", error);
    }
  };

  // Open assignment modal for store or warehouse
  const openAssignModal = (targetType, role, target) => {
    setAssignTargetType(targetType);
    setAssignRole(role);
    setAssignTarget(target);
    setSelectedUser("");
    setIsAssignModalOpen(true);
  };

  // Handle assignment submission
  const handleAssign = async () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }
    try {
      if (assignTargetType === "store") {
        const endpoint =
          assignRole === "manager"
            ? `${API_URL}/wareHousestore/store/${assignTarget.id}/assign-manager`
            : `${API_URL}/wareHousestore/store/${assignTarget.id}/assign-staff`;
        await axios.post(endpoint, { userId: parseInt(selectedUser) });
        alert(`${assignRole === "manager" ? "Manager" : "Staff"} assigned to store successfully.`);
      } else if (assignTargetType === "warehouse") {
        const endpoint =
          assignRole === "manager"
            ? `${API_URL}/wareHousestore/warehouse/${assignTarget.id}/assign-manager`
            : `${API_URL}/wareHousestore/warehouse/${assignTarget.id}/assign-staff`;
        await axios.post(endpoint, { userId: parseInt(selectedUser) });
        alert(`${assignRole === "manager" ? "Manager" : "Staff"} assigned to warehouse successfully.`);
      }
      setIsAssignModalOpen(false);
      // Optionally refresh staff view if currently open
      if (assignTargetType === "store") handleViewStoreStaff(assignTarget);
      else if (assignTargetType === "warehouse") handleViewWarehouseStaff(assignTarget);
    } catch (error) {
      console.error("Assignment error:", error);
      alert("Failed to assign user.");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 p-6 z-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Warehouses & Stores</h1>

        {/* Warehouses Section */}
        <div className="mb-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Warehouses</h2>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              onClick={() => setIsAddWarehouseModalOpen(true)}
            >
              Add Warehouse
            </button>
          </div>
          {isLoadingWarehouses ? (
            <div className="text-gray-400">Loading warehouses...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Actions</th>
                    <th className="px-4 py-3">Staff</th>
                    <th className="px-4 py-3">Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                      <td className="px-4 py-3 text-gray-300">{warehouse.id}</td>
                      <td className="px-4 py-3 text-gray-300">{warehouse.name}</td>
                      <td className="px-4 py-3 text-gray-300">{warehouse.location}</td>
                      <td className="px-4 py-3">
                        <button
                          className="text-blue-400 hover:text-blue-300 mr-2"
                          onClick={() => openEditWarehouseModal(warehouse)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                        >
                          Delete
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-green-400 hover:text-green-300"
                          onClick={() => handleViewWarehouseStaff(warehouse)}
                        >
                          View Staff
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            className="text-purple-400 hover:text-purple-300"
                            onClick={() => openAssignModal("warehouse", "manager", warehouse)}
                          >
                            Assign Manager
                          </button>
                          <button
                            className="text-purple-400 hover:text-purple-300"
                            onClick={() => openAssignModal("warehouse", "staff", warehouse)}
                          >
                            Assign Staff
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {warehouses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-gray-400">
                        No warehouses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stores Section */}
        <div className="mb-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Stores</h2>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              onClick={() => setIsAddStoreModalOpen(true)}
            >
              Add Store
            </button>
          </div>
          {isLoadingStores ? (
            <div className="text-gray-400">Loading stores...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Actions</th>
                    <th className="px-4 py-3">Staff</th>
                    <th className="px-4 py-3">Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b border-gray-700 hover:bg-gray-700 transition duration-300">
                      <td className="px-4 py-3 text-gray-300">{store.id}</td>
                      <td className="px-4 py-3 text-gray-300">{store.name}</td>
                      <td className="px-4 py-3 text-gray-300">{store.location}</td>
                      <td className="px-4 py-3">
                        <button
                          className="text-blue-400 hover:text-blue-300 mr-2"
                          onClick={() => openEditStoreModal(store)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteStore(store.id)}
                        >
                          Delete
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-green-400 hover:text-green-300"
                          onClick={() => handleViewStoreStaff(store)}
                        >
                          View Staff
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            className="text-purple-400 hover:text-purple-300"
                            onClick={() => openAssignModal("store", "manager", store)}
                          >
                            Assign Manager
                          </button>
                          <button
                            className="text-purple-400 hover:text-purple-300"
                            onClick={() => openAssignModal("store", "staff", store)}
                          >
                            Assign Staff
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-gray-400">
                        No stores found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals (unchanged from previous implementation) */}
        <AddWarehouseModal
          isOpen={isAddWarehouseModalOpen}
          onClose={() => setIsAddWarehouseModalOpen(false)}
          onWarehouseAdded={() => fetchWarehouses()}
        />
        <EditWarehouseModal
          isOpen={isEditWarehouseModalOpen}
          onClose={() => setIsEditWarehouseModalOpen(false)}
          warehouse={selectedWarehouse}
          onWarehouseUpdated={() => fetchWarehouses()}
        />
        <AddStoreModal
          isOpen={isAddStoreModalOpen}
          onClose={() => setIsAddStoreModalOpen(false)}
          onStoreAdded={() => fetchStores()}
        />
        <EditStoreModal
          isOpen={isEditStoreModalOpen}
          onClose={() => setIsEditStoreModalOpen(false)}
          store={selectedStore}
          onStoreUpdated={() => fetchStores()}
        />

        {/* Staff and Assignment Modals (mostly unchanged, just updated styling) */}
        {/* View Store Staff Modal */}
        {isViewStoreStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-lg p-6 w-1/2 text-gray-100">
              <h2 className="text-xl font-bold mb-4 text-white">
                Staff for Store: {selectedStoreForStaff?.name}
              </h2>
              <div>
                <h3 className="font-semibold text-gray-300">Managers:</h3>
                <ul className="mb-4">
                  {storeStaff.managers.length > 0 ? (
                    storeStaff.managers.map((manager) => (
                      <li key={manager.id} className="text-gray-400">
                        {manager.username} ({manager.email})
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No managers assigned</li>
                  )}
                </ul>
                <h3 className="font-semibold text-gray-300">Staff:</h3>
                <ul>
                  {storeStaff.staff.length > 0 ? (
                    storeStaff.staff.map((staffMember) => (
                      <li key={staffMember.id} className="text-gray-400">
                        {staffMember.username} ({staffMember.email})
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No staff assigned</li>
                  )}
                </ul>
              </div>
              <button
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setIsViewStoreStaffModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* View Warehouse Staff Modal */}
        {isViewWarehouseStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-lg p-6 w-1/2 text-gray-100">
              <h2 className="text-xl font-bold mb-4 text-white">
                Staff for Warehouse: {selectedWarehouseForStaff?.name}
              </h2>
              <div>
                <h3 className="font-semibold text-gray-300">Managers:</h3>
                <ul className="mb-4">
                  {warehouseStaff.managers.length > 0 ? (
                    warehouseStaff.managers.map((manager) => (
                      <li key={manager.id} className="text-gray-400">
                        {manager.username} ({manager.email})
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No managers assigned</li>
                  )}
                </ul>
                <h3 className="font-semibold text-gray-300">Staff:</h3>
                <ul>
                  {warehouseStaff.staff.length > 0 ? (
                    warehouseStaff.staff.map((staffMember) => (
                      <li key={staffMember.id} className="text-gray-400">
                        {staffMember.username} ({staffMember.email})
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No staff assigned</li>
                  )}
                </ul>
              </div>
              <button
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setIsViewWarehouseStaffModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-lg p-6 w-1/3 text-gray-100">
              <h2 className="text-xl font-bold mb-4 text-white">
                Assign {assignRole === "manager" ? "Manager" : "Staff"} to{" "}
                {assignTargetType === "store" ? "Store" : "Warehouse"}: {assignTarget?.name}
              </h2>
              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Select User:</label>
                <select
                  className="w-full border border-gray-700 bg-gray-900 text-gray-300 rounded px-3 py-2"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="" className="bg-gray-900">--Select User--</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="bg-gray-900">
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  onClick={handleAssign}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehousesStoresPage;