// import React, { useState } from 'react';
// import { useSalesOrders } from '../hooks/useSalesOrders';
// import OrderStatus from '../components/OrderStatus';
// import { Link } from 'react-router-dom';

// /**
//  * Trang danh sách đơn hàng B2C
//  * Hiển thị tất cả đơn hàng của dealer với phân trang và tìm kiếm
//  */
// const SalesOrderListPage = () => {
//   const { orders, loading, error, fetchOrders } = useSalesOrders();
//   const [searchTerm, setSearchTerm] = useState('');

//   // Lọc đơn hàng theo từ khóa tìm kiếm
//   const filteredOrders = orders.filter(order =>
//     order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     order.customerId?.toString().includes(searchTerm)
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-red-600 text-xl mb-2">Lỗi tải dữ liệu</div>
//           <button 
//             onClick={fetchOrders}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng B2C</h1>
//           <p className="text-gray-600 mt-2">Theo dõi và quản lý tất cả đơn hàng của đại lý</p>
//         </div>

//         {/* Search và Filters */}
//         <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1">
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm theo mã đơn hàng hoặc mã khách hàng..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//             <button
//               onClick={fetchOrders}
//               className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
//             >
//               🔄 Làm mới
//             </button>
//           </div>
//         </div>

//         {/* Danh sách đơn hàng */}
//         <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//           {filteredOrders.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-gray-400 text-6xl mb-4">📦</div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
//               <p className="text-gray-500">Chưa có đơn hàng B2C nào được tạo.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Mã đơn hàng
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Khách hàng
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Ngày đặt
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Tổng tiền
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Trạng thái
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Phê duyệt
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Thao tác
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredOrders.map((order) => (
//                     <OrderRow key={order.orderId} order={order} />
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Component cho mỗi dòng đơn hàng
// const OrderRow = ({ order }) => {
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND'
//     }).format(amount || 0);
//   };

//   const formatDate = (date) => {
//     return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
//   };

//   return (
//     <tr className="hover:bg-gray-50 transition-colors">
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm font-medium text-gray-900">
//           #{order.orderId.slice(-8)}
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">KH-{order.customerId}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm font-medium text-gray-900">
//           {formatCurrency(order.totalAmount)}
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <OrderStatus status={order.orderStatusB2C} />
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">
//           {order.managerApproval ? (
//             <span className="inline-flex items-center text-green-600">
//               ✅ Đã duyệt
//             </span>
//           ) : (
//             <span className="inline-flex items-center text-yellow-600">
//               ⏳ Chờ duyệt
//             </span>
//           )}
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//         <Link
//           to={`/dealer/staff/orders/${order.orderId}`}
//           className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
//         >
//           Xem chi tiết
//         </Link>
//       </td>
//     </tr>
//   );
// };

// export default SalesOrderListPage;



import React, { useState } from 'react';
import { useSalesOrders } from '../hooks/useSalesOrders';
import OrderStatus from '../components/OrderStatus';
import { Link } from 'react-router-dom';
import { message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

/**
 * Trang danh sách đơn hàng B2C
 * Hiển thị tất cả đơn hàng của dealer với phân trang và tìm kiếm
 */
const SalesOrderListPage = () => {
  const { orders, loading, error, fetchOrders, approveOrder } = useSalesOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingOrderId, setApprovingOrderId] = useState(null);

  // Lấy thông tin user từ session store
  const user = sessionStorage.getItem('roles');
  const userRoles = user || [];
  const isManager = userRoles.includes('["DEALER_MANAGER"]');
  const memberId = sessionStorage.getItem('memberId');

  // Lọc đơn hàng theo từ khóa tìm kiếm
  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerId?.toString().includes(searchTerm)
  );

  // Xử lý duyệt đơn hàng
  const handleApproveOrder = async (orderId) => {
    if (!isManager) {
      message.warning('Chỉ quản lý mới có quyền duyệt đơn hàng');
      return;
    }

    confirm({
      title: 'Xác nhận duyệt đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn duyệt đơn hàng này? Sau khi duyệt, đơn hàng sẽ chuyển sang trạng thái APPROVED.',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setApprovingOrderId(orderId);
          await approveOrder(orderId, memberId);
          message.success('Duyệt đơn hàng thành công');
          await fetchOrders(); // Refresh danh sách
        } catch (error) {
          console.error('Approve order error:', error);
          message.error('Duyệt đơn hàng thất bại');
        } finally {
          setApprovingOrderId(null);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Lỗi tải dữ liệu</div>
          <button 
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng B2C</h1>
              <p className="text-gray-600 mt-2">Theo dõi và quản lý tất cả đơn hàng của đại lý</p>
            </div>
            {isManager && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="text-sm font-medium text-blue-800">Quyền: Quản lý</div>
                <div className="text-xs text-blue-600">Có thể duyệt đơn hàng</div>
              </div>
            )}
          </div>
        </div>

        {/* Search và Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc mã khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={fetchOrders}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <span>🔄</span>
              Làm mới
            </button>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm font-medium text-gray-500">Tổng đơn hàng</div>
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm font-medium text-gray-500">Chờ duyệt</div>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.orderStatusB2C === 'EDITED').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm font-medium text-gray-500">Đã duyệt</div>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.orderStatusB2C === 'APPROVED').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm font-medium text-gray-500">Đã giao</div>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.orderStatusB2C === 'DELIVERED').length}
            </div>
          </div>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy đơn hàng phù hợp với từ khóa tìm kiếm.' : 'Chưa có đơn hàng B2C nào được tạo.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phê duyệt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <OrderRow 
                      key={order.orderId} 
                      order={order} 
                      isManager={isManager}
                      onApprove={handleApproveOrder}
                      approvingOrderId={approvingOrderId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component cho mỗi dòng đơn hàng
const OrderRow = ({ order, isManager, onApprove, approvingOrderId }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
  };

  const canApprove = isManager && order.orderStatusB2C === 'EDITED';
  const isApproving = approvingOrderId === order.orderId;

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 font-mono">
            #{order.orderId.slice(-8)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">KH-{order.customerId}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
        {order.orderDate && (
          <div className="text-xs text-gray-500">
            {new Date(order.orderDate).toLocaleTimeString('vi-VN')}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(order.totalAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <OrderStatus status={order.orderStatusB2C} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          {order.managerApproval ? (
            <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Đã duyệt
            </span>
          ) : (
            <span className="inline-flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
              Chờ duyệt
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center space-x-2">
          <Link
            to={`/dealer/staff/orders/${order.orderId}`}
            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
          >
            Chi tiết
          </Link>
          
          {canApprove && (
            <button
              onClick={() => onApprove(order.orderId)}
              disabled={isApproving}
              className={`px-3 py-1 rounded-lg transition-colors border ${
                isApproving 
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700'
              }`}
            >
              {isApproving ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Đang duyệt...
                </span>
              ) : (
                'Duyệt đơn'
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default SalesOrderListPage;