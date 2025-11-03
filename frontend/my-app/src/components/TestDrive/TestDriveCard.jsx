import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, Edit, XCircle, CheckCircle, X } from 'lucide-react';

const statusConfig = {
  SCHEDULED: { label: 'Đã đặt lịch', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', icon: '🟢' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '🔴' },
};

const TestDriveCard = ({ appointment, onEdit, onCancel, onConfirm, onComplete, vehicles = [], staffList = [] }) => {
  const status = statusConfig[appointment.status] || statusConfig.SCHEDULED;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Find vehicle info
  const vehicle = vehicles.find(v => v.modelId === appointment.modelId);
  const vehicleName = vehicle ? `${vehicle.modelName}` : `Model ${appointment.modelId}`;
  
  // Find variant info
  let variantName = '';
  if (appointment.variantId && vehicle) {
    const variant = vehicle.variants?.find(v => v.variantId === appointment.variantId);
    variantName = variant ? ` - ${variant.versionName} (${variant.color})` : ` - Variant ${appointment.variantId}`;
  }

  // Find staff info by staffId
  const staff = staffList.find(s => s.staffId === appointment.staffId);
  
  // Staff name: dùng fullName hoặc name, fallback về email
  const staffName = staff 
    ? `${staff.fullName || staff.name || 'Unknown'} (${staff.email})` 
    : appointment.staffId 
      ? `Staff ${appointment.staffId}` 
      : 'Chưa phân công';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              #{appointment.appointmentId} - {appointment.customerName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            📞 {appointment.customerPhone}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start text-sm text-gray-700">
          <Calendar className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
          <span>
            <strong>Thời gian:</strong> {formatDate(appointment.appointmentDate)}
          </span>
        </div>

        <div className="flex items-start text-sm text-gray-700">
          <Clock className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
          <span>
            <strong>Thời lượng:</strong> {appointment.durationMinutes} phút
          </span>
        </div>

        <div className="flex items-start text-sm text-gray-700">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
          <span>
            <strong>Địa điểm:</strong> {appointment.testDriveLocation}
          </span>
        </div>

        <div className="flex items-start text-sm text-gray-700">
          <User className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
          <span>
            <strong>Mẫu xe:</strong> {vehicleName}{variantName}
          </span>
        </div>

        <div className="flex items-start text-sm text-gray-700">
          <User className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
          <span>
            <strong>Nhân viên:</strong> {staffName}
          </span>
        </div>

        {appointment.customerNotes && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>💬 Ghi chú:</strong> {appointment.customerNotes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {appointment.status === 'SCHEDULED' && (
          <>
            <button
              onClick={() => onEdit(appointment)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Sửa
            </button>
            <button
              onClick={() => onConfirm(appointment.appointmentId)}
              className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Xác nhận
            </button>
            <button
              onClick={() => onCancel(appointment.appointmentId)}
              className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Hủy
            </button>
          </>
        )}

        {appointment.status === 'CONFIRMED' && (
          <>
            <button
              onClick={() => onComplete(appointment.appointmentId)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Hoàn thành
            </button>
            <button
              onClick={() => onCancel(appointment.appointmentId)}
              className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Hủy
            </button>
          </>
        )}

        {appointment.status === 'CANCELLED' && (
          <div className="w-full p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              <strong>Lý do hủy:</strong> {appointment.cancellationReason || 'Không có lý do'}
            </p>
            {appointment.cancelledBy && (
              <p className="text-xs text-red-600 mt-1">
                Bởi: {appointment.cancelledBy} - {formatDate(appointment.cancelledAt)}
              </p>
            )}
          </div>
        )}

        {appointment.status === 'COMPLETED' && (
          <div className="w-full p-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              ✅ Hoàn thành lúc {formatDate(appointment.completedAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDriveCard;
