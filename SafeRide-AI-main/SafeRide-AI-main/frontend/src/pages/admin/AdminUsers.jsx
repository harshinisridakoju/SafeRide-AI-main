import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Search, 
  Filter,
  User,
  Wrench,
  Crown,
  Mail,
  Phone,
  Calendar,
  Shield,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MoreVertical
} from 'lucide-react';

const AdminUsersPage = () => {
  const { api } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', 20);
      
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (error) {
      console.error('Fetch users error:', error);
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      setShowActions(null);
    } catch (error) {
      console.error('Role update error:', error);
      setError('Failed to update user role');
    }
  };

  const handleVerificationToggle = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      await fetchUsers();
    } catch (error) {
      console.error('Verification toggle error:', error);
      setError('Failed to update verification status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
      setShowActions(null);
    } catch (error) {
      console.error('Delete user error:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'provider': return Wrench;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'provider': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage users, providers, and administrators
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Role Filter */}
          <div className="lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort);
                setSortOrder(order);
              }}
              className="input"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchTerm || roleFilter !== 'all' ? 'No matching users' : 'No users found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {searchTerm || roleFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Get started by inviting users to the platform'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {user.role}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="w-4 h-4 text-gray-400 mr-1" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.isVerified && (
                            <div className="flex items-center text-green-600">
                              <Shield className="w-4 h-4 mr-1" />
                              <span className="text-sm">Verified</span>
                            </div>
                          )}
                          {user.role === 'provider' && user.isAvailable && (
                            <div className="flex items-center text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                              <span className="text-sm">Available</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === user._id ? null : user._id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          {showActions === user._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleVerificationToggle(user._id);
                                    setShowActions(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {user.isVerified ? 'Unverify' : 'Verify'} User
                                </button>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                
                                <button
                                  onClick={() => {
                                    handleRoleUpdate(user._id, user.role === 'provider' ? 'user' : 'provider');
                                    setShowActions(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  disabled={user.role === 'admin'}
                                >
                                  Change to {user.role === 'provider' ? 'User' : 'Provider'}
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleRoleUpdate(user._id, 'admin');
                                    setShowActions(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  disabled={user.role === 'admin'}
                                >
                                  Make Admin
                                </button>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user._id);
                                    setShowActions(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  disabled={user.role === 'admin'}
                                >
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.current - 1) * 20) + 1} to {Math.min(pagination.current * 20, pagination.count)} of{' '}
            {pagination.count} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* Implement pagination */}}
              disabled={pagination.current === 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {pagination.current} of {pagination.total}
            </span>
            
            <button
              onClick={() => {/* Implement pagination */}}
              disabled={pagination.current === pagination.total}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
