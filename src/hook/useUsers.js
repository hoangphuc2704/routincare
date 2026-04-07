import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import { message } from 'antd';

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch all users
  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getUsers(params);
      const data = response.data?.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async (userData) => {
    try {
      setLoading(true);
      const response = await adminApi.createUser(userData);
      message.success('User created successfully');
      setIsFormOpen(false);
      await fetchUsers(); // Refresh list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create user';
      message.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing user
  const updateUser = async (id, userData) => {
    try {
      setLoading(true);
      const response = await adminApi.updateUser(id, userData);
      message.success('User updated successfully');
      setIsFormOpen(false);
      setSelectedUser(null);
      await fetchUsers(); // Refresh list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update user';
      message.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      setLoading(true);
      await adminApi.deleteUser(id);
      message.success('User deleted successfully');
      await fetchUsers(); // Refresh list
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete user';
      message.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Open form for adding new user
  const openAddForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  // Open form for editing user
  const openEditForm = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  // Close form
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    selectedUser,
    isFormOpen,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    openAddForm,
    openEditForm,
    closeForm,
  };
}
