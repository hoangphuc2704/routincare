import { useState, useEffect } from 'react';
import adminApi from '../services/api/adminApi';
import categoryApi from '../services/api/categoryApi';
import { message } from 'antd';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch all categories (use public endpoint)
  const fetchCategories = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getAll(params);
      const data = response.data?.data || response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const addCategory = async (categoryData) => {
    try {
      setLoading(true);
      const response = await adminApi.createCategory(categoryData);
      message.success('Category created successfully');
      setIsFormOpen(false);
      await fetchCategories(); // Refresh list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create category';
      message.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing category
  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      const response = await adminApi.updateCategory(id, categoryData);
      message.success('Category updated successfully');
      setIsFormOpen(false);
      setSelectedCategory(null);
      await fetchCategories(); // Refresh list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update category';
      message.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      await adminApi.deleteCategory(id);
      message.success('Category deleted successfully');
      await fetchCategories(); // Refresh list
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete category';
      message.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Open form for adding new category
  const openAddForm = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  // Open form for editing category
  const openEditForm = (category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  // Close form
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    selectedCategory,
    isFormOpen,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    openAddForm,
    openEditForm,
    closeForm,
  };
}
