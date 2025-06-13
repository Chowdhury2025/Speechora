import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import axios from 'axios';
import AddUserModal from './AddUserModal.jsx';
import EditUserModal from './EditUserModal.jsx';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [limit, ] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('username');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/user/users?page=${page}&limit=${limit}&sort=${sortField}&order=${sortDirection}`);
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/api/user/${userId}`);
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert('Failed to delete user');
      }
    }
  };

  const handleUserAdded = () => {
    fetchUsers(); // Refresh the user list
  };

  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the user list
  };

  // Filter the users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All roles' || user.role === roleFilter;
    const matchesVerification = 
      verificationFilter === 'All' || 
      (verificationFilter === 'Verified' && user.isEmailVerified) || 
      (verificationFilter === 'Not Verified' && !user.isEmailVerified);
    
    return matchesSearch && matchesRole && matchesVerification;
  });

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">User Management</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-xl border-b-4 border-primary-dark hover:border-primary-pressed active:border-b-0 active:mt-1 transition-all duration-200"
            >
              Add New User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
            >
              <option>All roles</option>
              <option>USER</option>
              <option>ADMIN</option>
              <option>STAFF</option>
            </select>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary font-medium"
            >
              <option>All</option>
              <option>Verified</option>
              <option>Unverified</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('username')}
                >
                  Username {renderSortIcon('username')}
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  Email {renderSortIcon('email')}
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('role')}
                >
                  Role {renderSortIcon('role')}
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                >
                  Status
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-slate-600">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-slate-600">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isEmailVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-bg text-success-text">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-error-bg text-error-text">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="text-secondary hover:text-secondary-hover font-bold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={() => {
          fetchUsers();
          setIsAddModalOpen(false);
        }}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={() => {
          fetchUsers();
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagementScreen;