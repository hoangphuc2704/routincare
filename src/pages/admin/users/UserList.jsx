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
      <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-xs font-medium">
        Hoạt động
      </span>
    ) : (
      <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs font-medium">
        Không hoạt động
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleName = (role || 'Người dùng').toLowerCase();
    if (roleName === 'admin') {
      return (
        <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-semibold">
          Quản trị viên
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium">
        {role || 'Người dùng'}
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
        <h1 className="text-3xl font-bold text-white">Người dùng</h1>
        <button
          onClick={openAddForm}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-semibold"
        >
          + Thêm người dùng
        </button>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-lg border border-white/10 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg">Không tìm thấy người dùng</p>
            <p className="text-sm mt-2">
              Tạo người dùng đầu tiên bằng cách nhấn nút "Thêm người dùng" phía trên
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-neutral-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Họ và tên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="border-b border-white/10 hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-300">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.fullName || user.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">{getRoleBadge(user.roleName || user.role)}</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-sm space-x-3 flex">
                    <button
                      onClick={() => openEditForm(user)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200 font-medium"
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

      {/* User Form Modal */}
      {isFormOpen && <UserForm onClose={closeForm} user={selectedUser} />}
    </div>
  );
}
