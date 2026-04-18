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
      title: 'Xóa danh mục',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa "${name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
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
        <h1 className="text-3xl font-bold" style={{ color: 'var(--admin-text)' }}>
          Categories
        </h1>
        <button
          onClick={openAddForm}
          className="px-6 py-2 rounded-lg transition-colors duration-200 font-semibold"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
        }}
      >
        {categories.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--admin-text-secondary)' }}>
            <p className="text-lg">No categories found</p>
            <p className="text-sm mt-2">
              Tạo danh mục đầu tiên bằng cách nhấn nút "Thêm danh mục" phía trên
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--admin-border)',
                  backgroundColor: 'var(--admin-border)',
                }}
              >
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  ID
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Name
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Description
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.id || index}
                  style={{
                    borderBottom: '1px solid var(--admin-border)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--admin-border)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  className="transition-colors"
                >
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: 'var(--admin-text-secondary)' }}
                  >
                    {category.id}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-medium"
                    style={{ color: 'var(--admin-text)' }}
                  >
                    {category.name}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: 'var(--admin-text-secondary)' }}
                  >
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3 flex">
                    <button
                      onClick={() => openEditForm(category)}
                      className="px-4 py-2 rounded transition-colors duration-200 font-medium"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="px-4 py-2 rounded transition-colors duration-200 font-medium"
                      style={{
                        backgroundColor: 'var(--admin-error)',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      Xóa
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
