import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import useCategories from '../../../hook/useCategories';

export default function CategoryForm({ onClose, category }) {
  const { addCategory, updateCategory, loading } = useCategories();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setFormData({ name: '', description: '' });
    }
    setErrors({});
  }, [category]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (category?.id) {
        await updateCategory(category.id, formData);
      } else {
        await addCategory(formData);
      }
      onClose();
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <Modal
      title={category ? 'Edit Category' : 'Add New Category'}
      open={true}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="admin-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter category name"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: '#3a3a3a',
              color: 'white',
              borderColor: errors.name ? '#ef4444' : 'var(--admin-border)',
              focusRing: 'var(--accent)',
            }}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description (optional)"
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-white resize-none"
            style={{
              backgroundColor: '#3a3a3a',
              color: 'white',
              borderColor: 'var(--admin-border)',
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {loading ? 'Processing...' : category ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
