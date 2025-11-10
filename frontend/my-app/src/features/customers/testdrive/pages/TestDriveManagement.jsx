import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Calendar as CalendarIcon, List, BarChart3 } from 'lucide-react';
import Swal from 'sweetalert2';

// Import components từ testdrive/components
import TestDriveCard from '../components/TestDriveCard';
import TestDriveFilter from '../components/TestDriveFilter';
import FeedbackModal from '../components/FeedbackModal';

// Import services từ testdrive/services
import {
  getTestDrivesByDealer,
  cancelTestDrive,
  confirmTestDrive,
  completeTestDrive,
  filterTestDrives,
  submitFeedback,
} from '../services/testDriveService';

const TestDriveManagement = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // For stats calculation
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'calendar', 'statistics'
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAppointment, setFeedbackAppointment] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // TODO: Sửa lại khi backend hỗ trợ dealer UUID
  // Tạm dùng dealerId = 1 vì backend expect Long, không phải UUID
  const dealerId = 1;

  useEffect(() => {
    loadAllForStats();
    loadData();
  }, []);

  // Load all appointments for stats calculation (without pagination)
  const loadAllForStats = async () => {
    try {
      const response = await getTestDrivesByDealer(dealerId);
      const data = response.data || [];
      setAllAppointments(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadData = async (page = 0) => {
    try {
      setLoading(true);
      
      // Use filter API with pagination
      const response = await filterTestDrives({
        dealerId,
        page: page,
        size: pageSize,
        sortBy: 'appointmentDate',
        sortDirection: 'DESC'
      });
      
      const appointmentsData = response.data?.content || response.data || [];
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.totalElements || 0);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadData(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreate = () => {
    // Lấy roles từ sessionStorage (là JSON array)
    const rolesString = sessionStorage.getItem('roles');
    let basePath = '/dealer/staff'; // default
    
    try {
      const roles = rolesString ? JSON.parse(rolesString) : [];
      if (roles.includes('DEALER_MANAGER')) {
        basePath = '/dealer/manager';
      } else if (roles.includes('DEALER_STAFF')) {
        basePath = '/dealer/staff';
      }
    } catch (error) {
      console.error('Error parsing roles:', error);
    }
    
    navigate(`${basePath}/testdrives/create`);
  };

  const handleEdit = (appointment) => {
    // Navigate to edit page instead of opening modal
    const rolesString = sessionStorage.getItem('roles');
    let basePath = '/dealer/staff'; // default
    
    try {
      const roles = rolesString ? JSON.parse(rolesString) : [];
      if (roles.includes('DEALER_MANAGER')) {
        basePath = '/dealer/manager';
      } else if (roles.includes('DEALER_STAFF')) {
        basePath = '/dealer/staff';
      }
    } catch (error) {
      console.error('Error parsing roles:', error);
    }
    
    navigate(`${basePath}/testdrives/edit/${appointment.appointmentId}`);
  };

  const handleConfirm = async (appointmentId) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận lịch hẹn?',
        text: 'Khách hàng sẽ nhận được thông báo xác nhận',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await confirmTestDrive(appointmentId);
        toast.success('Đã xác nhận lịch hẹn!');
        loadData();
      }
    } catch (error) {
      console.error('Error confirming:', error);
      toast.error('Không thể xác nhận lịch hẹn');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      const result = await Swal.fire({
        title: 'Hoàn thành lịch hẹn?',
        text: 'Đánh dấu lịch hẹn này đã hoàn thành',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Hoàn thành',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await completeTestDrive(appointmentId);
        toast.success('Đã đánh dấu hoàn thành!');
        loadData();
      }
    } catch (error) {
      console.error('Error completing:', error);
      toast.error('Không thể hoàn thành lịch hẹn');
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      const { value: reason } = await Swal.fire({
        title: 'Hủy lịch hẹn',
        input: 'textarea',
        inputLabel: 'Lý do hủy',
        inputPlaceholder: 'Nhập lý do hủy lịch hẹn...',
        inputAttributes: {
          'aria-label': 'Nhập lý do hủy'
        },
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Hủy lịch hẹn',
        cancelButtonText: 'Không hủy',
        inputValidator: (value) => {
          if (!value) {
            return 'Vui lòng nhập lý do hủy!';
          }
        }
      });

      if (reason) {
        await cancelTestDrive(appointmentId, {
          cancellationReason: reason,
          cancelledBy: 'staff@dealer.com' // TODO: Get from auth
        });
        toast.success('Đã hủy lịch hẹn!');
        loadData();
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error('Không thể hủy lịch hẹn');
    }
  };

  const handleFilter = async (filterData) => {
    try {
      const fullFilter = {
        ...filterData,
        dealerId,
      };

      const response = await filterTestDrives(fullFilter);
      setFilteredAppointments(response.data || []);
      toast.success('Đã áp dụng bộ lọc');
    } catch (error) {
      console.error('Error filtering:', error);
      toast.error('Không thể lọc dữ liệu');
    }
  };

  const handleResetFilter = () => {
    setFilteredAppointments(appointments);
    toast.info('Đã đặt lại bộ lọc');
  };

  const handleFeedback = (appointment) => {
    setFeedbackAppointment(appointment);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (appointmentId, feedbackData) => {
    try {
      await submitFeedback(appointmentId, feedbackData);
      toast.success('Đã ghi kết quả lái thử thành công!');
      setShowFeedbackModal(false);
      setFeedbackAppointment(null);
      loadData(); // Reload để hiển thị feedback mới
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const message = error.response?.data?.message || 'Không thể ghi kết quả';
      toast.error(message);
      throw error; // Để FeedbackModal xử lý loading state
    }
  };

  // Statistics - calculated from ALL appointments, not just current page
  const stats = {
    total: allAppointments.length,
    scheduled: allAppointments.filter(a => a.status === 'SCHEDULED').length,
    confirmed: allAppointments.filter(a => a.status === 'CONFIRMED').length,
    completed: allAppointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: allAppointments.filter(a => a.status === 'CANCELLED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚗 Quản Lý Lịch Hẹn Lái Thử Xe
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các lịch hẹn lái thử xe điện
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng lịch hẹn</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-600">🟠 Đã đặt lịch</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">🟢 Đã xác nhận</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">🔵 Đã hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">🔴 Đã hủy</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('list')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5 mr-2" />
              Danh sách
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              disabled
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Lịch (Coming soon)
            </button>
            <button
              onClick={() => setView('statistics')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                view === 'statistics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              disabled
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Thống kê (Coming soon)
            </button>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo lịch hẹn mới
          </button>
        </div>

        {/* Filter */}
        <TestDriveFilter
          onFilter={handleFilter}
          onReset={handleResetFilter}
        />

        {/* Content */}
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAppointments.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">
                  📭 Chưa có lịch hẹn nào
                </p>
                <button
                  onClick={handleCreate}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo lịch hẹn đầu tiên
                </button>
              </div>
            ) : (
              <>
                {filteredAppointments.map((appointment) => (
                  <TestDriveCard
                    key={appointment.appointmentId}
                    appointment={appointment}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    onComplete={handleComplete}
                    onFeedback={handleFeedback}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Hiển thị <span className="font-semibold">{currentPage * pageSize + 1}</span> - <span className="font-semibold">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong tổng số <span className="font-semibold">{totalElements}</span> lịch hẹn
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex space-x-1">
                          {[...Array(totalPages)].map((_, index) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              index === 0 || 
                              index === totalPages - 1 || 
                              (index >= currentPage - 1 && index <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={index}
                                  onClick={() => handlePageChange(index)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === index
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {index + 1}
                                </button>
                              );
                            } else if (
                              index === currentPage - 2 || 
                              index === currentPage + 2
                            ) {
                              return <span key={index} className="px-2 text-gray-500">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Calendar View
            </h3>
            <p className="text-gray-500">
              Chức năng đang được phát triển...
            </p>
          </div>
        )}

        {view === 'statistics' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Statistics Dashboard
            </h3>
            <p className="text-gray-500">
              Chức năng đang được phát triển...
            </p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackAppointment && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackAppointment(null);
          }}
          appointment={feedbackAppointment}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
};

export default TestDriveManagement;
