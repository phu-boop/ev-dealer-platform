import React from "react";
import { Edit3, Trash2, Eye ,User} from "lucide-react";

export default function UserTable({ users, onEdit, onView, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <User size={64} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có user nào</h3>
        <p className="text-gray-500">Hãy thêm nhân viên mới để bắt đầu</p>
      </div>
    );
  }

  const formatRoles = (roles) => {
    return roles.map(role => role.name).join(", ");
  };

  // const formatPermissions = (roles) => {
  //   const permissions = new Set();
  //   roles.forEach(role => {
  //     role.permissions.forEach(permission => {
  //       permissions.add(permission.name);
  //     });
  //   });
  //   return Array.from(permissions).join(", ");
  // };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles & Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {user.name?.charAt(0) || user.fullName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.name} • ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone}</div>
                  {user.address && (
                    <div className="text-sm text-gray-500 mt-1">{user.address}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatRoles(user.roles)}
                  </div>
                  {/*<div className="text-sm text-gray-500 mt-1">*/}
                  {/*  {formatPermissions(user.roles)}*/}
                  {/*</div>*/}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(user)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}