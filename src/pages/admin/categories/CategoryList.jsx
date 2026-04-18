import { useState } from 'react';
import { Modal, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import useCategories from '../../../hooks/useCategories';
import CategoryForm from './CategoryForm';

export default function CategoryList() {
  const {
    categories,
    loading,
    selectedCategory,
    isFormOpen,
    deleteCategory,
    openAddForm,
    openEditForm,
    closeForm,
  } = useCategories();

  const handleDelete = (id, name) => {
    Modal.confirm({
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        deleteCategory(id);
      },
    });
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Categories</h1>
        <button
          onClick={openAddForm}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-semibold"
        >
          + Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-lg border border-white/10 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg">No categories found</p>
            <p className="text-sm mt-2">
              Create your first category by clicking the "Add Category" button above
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-neutral-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.id || index}
                  className="border-b border-white/10 hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-300">{category.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-sm space-x-3 flex">
                    <button
                      onClick={() => openEditForm(category)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Form Modal */}
      {isFormOpen && <CategoryForm onClose={closeForm} category={selectedCategory} />}
    </div>
  );
}
