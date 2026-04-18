import { useState } from 'react';
import { Modal, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import useUsers from '../../../hooks/useUsers';
import UserForm from './UserForm';

export default function UserList() {
  const {
    users,
    loading,
    selectedUser,
    isFormOpen,
    deleteUser,
    openAddForm,
    openEditForm,
    closeForm,
  } = useUsers();

  const getStatusBadge = (status) => {
    const statusLower = (status || 'active').toLowerCase();
    const isActive = statusLower === 'active' || statusLower === 'true' || status === true;
    return isActive ? (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: 'var(--admin-success-bg)',
          color: 'var(--admin-success)',
        }}
      >
        Active
      </span>
    ) : (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: 'var(--admin-border)',
          color: 'var(--admin-text-secondary)',
        }}
      >
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleName = (role || 'Người dùng').toLowerCase();
    if (roleName === 'admin') {
      return (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: 'var(--accent-bg)',
            color: 'var(--accent)',
          }}
        >
          Admin
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--accent)',
        }}
      >
        {role || 'User'}
      </span>
    );
  };

  const handleDelete = (id, email) => {
    Modal.confirm({
      title: 'Xóa người dùng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa người dùng "${email}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        deleteUser(id);
      },
    });
  };

  if (loading && users.length === 0) {
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
          Users
        </h1>
        {/* <button
          onClick={openAddForm}
          className="px-6 py-2 rounded-lg transition-colors duration-200 font-semibold"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          + Add User
        </button> */}
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
        }}
      >
        {users.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--admin-text-secondary)' }}>
            <p className="text-lg">No users found</p>
            <p className="text-sm mt-2">
              Tạo người dùng đầu tiên bằng cách nhấn nút "Thêm người dùng" phía trên
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
                  Email
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Full Name
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Role
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Status
                </th>
                {/* <th
                  className="px-6 py-4 text-left text-sm font-semibold"
                  style={{ color: 'var(--admin-text)' }}
                >
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id || index}
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
                    {user.id}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-medium"
                    style={{ color: 'var(--admin-text)' }}
                  >
                    {user.email}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{ color: 'var(--admin-text-secondary)' }}
                  >
                    {user.fullName || user.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">{getRoleBadge(user.roleName || user.role)}</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(user.status)}</td>
                  {/* <td className="px-6 py-4 text-sm space-x-3 flex">
                    <button
                      onClick={() => openEditForm(user)}
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
                      onClick={() => handleDelete(user.id, user.email)}
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
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Form Modal */}
      {isFormOpen && <UserForm onClose={closeForm} user={selectedUser} />}
    </div>
  );
}
