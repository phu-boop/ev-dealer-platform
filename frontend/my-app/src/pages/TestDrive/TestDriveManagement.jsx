import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Calendar as CalendarIcon, List, BarChart3 } from 'lucide-react';
import Swal from 'sweetalert2';

import TestDriveFormModal from '../../components/TestDrive/TestDriveFormModal';
import TestDriveCard from '../../components/TestDrive/TestDriveCard';
import TestDriveFilter from '../../components/TestDrive/TestDriveFilter';

import {
  getTestDrivesByDealer,
  createTestDrive,
  updateTestDrive,
  cancelTestDrive,
  confirmTestDrive,
  completeTestDrive,
  filterTestDrives,
} from '../../services/testDriveService';

import { getAllModels, getModelDetails } from '../../services/vehicleService';
import staffService from '../../features/customers/services/staffService';

const TestDriveManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'calendar', 'statistics'
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Data for dropdowns
  const [vehicles, setVehicles] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // TODO: Sửa lại khi backend hỗ trợ dealer UUID
  // Tạm dùng dealerId = 1 vì backend expect Long, không phải UUID
  const dealerId = 1;
  const dealerUUID = sessionStorage.getItem('dealerId') || sessionStorage.getItem('profileId') || '6c8c229d-c8f6-43d8-b2f6-01261b46baa3';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load appointments
      const appointmentsRes = await getTestDrivesByDealer(dealerId);
      const appointmentsData = appointmentsRes.data || [];
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);

      // Load vehicles from vehicle service with variants
      try {
        const vehiclesRes = await getAllModels();
        const modelsData = vehiclesRes.data || [];
        
        // Load variants cho từng model
        const modelsWithVariants = await Promise.all(
          modelsData.map(async (model) => {
            try {
              const detailRes = await getModelDetails(model.modelId);
              return {
                ...model,
                variants: detailRes.data?.variants || []
              };
            } catch (error) {
              console.error(`Error loading variants for model ${model.modelId}:`, error);
              return { ...model, variants: [] };
            }
          })
        );
        
        setVehicles(modelsWithVariants);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        toast.error('Không thể tải danh sách xe');
      }

      // Load staff list (dùng UUID)
      try {
        const staffData = await staffService.getStaffByDealerId(dealerUUID);
        setStaffList(staffData || []);
      } catch (error) {
        console.error('Error loading staff:', error);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingAppointment) {
        // Update
        await updateTestDrive(editingAppointment.appointmentId, formData);
        toast.success('Cập nhật lịch hẹn thành công!');
      } else {
        // Create
        await createTestDrive(formData);
        toast.success('Tạo lịch hẹn thành công!');
      }
      
      setShowModal(false);
      setEditingAppointment(null);
      loadData();
    } catch (error) {
      console.error('Error submitting:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(message);
    }
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
      // Add dealerId to filter
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
    toast.info('ℹ️ Đã đặt lại bộ lọc');
  };

  // Statistics
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
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
              filteredAppointments.map((appointment) => (
                <TestDriveCard
                  key={appointment.appointmentId}
                  appointment={appointment}
                  vehicles={vehicles}
                  staffList={staffList}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  onComplete={handleComplete}
                />
              ))
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

      {/* Form Modal */}
      <TestDriveFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingAppointment}
        vehicles={vehicles}
      />
    </div>
  );
};

export default TestDriveManagement;
