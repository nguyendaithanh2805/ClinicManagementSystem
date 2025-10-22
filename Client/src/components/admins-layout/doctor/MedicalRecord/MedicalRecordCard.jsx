import React from 'react';
import {
  FileText, Stethoscope, ListTodo, ClipboardCheck, CircleCheckBig, Eye,
  CalendarDays
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const MedicalRecordCard = ({
  record,
  onClick,
  onMarkAsComplete,
  onMarkAsRevisit,
  getStatusColorClass, // For Medical Record (true/false)
  getStatusText,       // For Medical Record (true/false)
  getAppointmentStatusText, // For Appointment (0-6)
  getAppointmentStatusColorClass // For Appointment (0-6)
}) => {
  const linkedAppointment = record.appointments?.find(
    apt => apt.patientMedicalRecordId === record.id
  );
  const linkedAppointmentStatus = linkedAppointment?.status;

  const handleActionClick = (actionFunction, recordId) => {
    if (linkedAppointmentStatus === 3) {
      actionFunction(recordId);
    } else {
      toast.warn(`Vui lòng khám bệnh cho bệnh nhân trước`);
    }
  };

  return (
    // Card tổng thể, thêm shadow nhẹ khi hover
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row items-start gap-4">

      {/* --- Cột trái: Icon + Mã HS --- */}
      <div className="flex-shrink-0 flex flex-col items-center w-16 text-center pt-1">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-1.5">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-gray-200">
          HS: {record.id || 'N/A'}
        </span>
      </div>

      {/* --- Cột phải: Chi tiết --- */}
      <div className="flex-1 w-full">
        {/* --- Hàng trên: Tên BN, Status LH, Nút Xem --- */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
          {/* Tên BN và Status LH */}
          <div>
            {/* THAY ĐỔI: Tăng kích thước/độ đậm tên BN */}
            <h3 className="font-bold text-gray-900 text-xl leading-tight mb-1">
              <span className="text-blue-700">
                {record.patient?.fullName || "Chưa có bệnh nhân"}
              </span>
            </h3>
            {/* Status LH (nhỏ hơn) */}
            {linkedAppointment && getAppointmentStatusText && getAppointmentStatusColorClass && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getAppointmentStatusColorClass(linkedAppointment.status)} bg-opacity-80`}>
                LH: {getAppointmentStatusText(linkedAppointment.status)}
              </span>
            )}
          </div>
          {/* Nút Xem (gọn hơn) */}
          <button
            onClick={onClick}
            className="mt-1 sm:mt-0 px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" /> Xem
          </button>
        </div>

        {/* --- Phần thông tin phụ (BS, Chẩn đoán, Ngày tạo, Điều trị) --- */}
        {/* THAY ĐỔI: Bỏ text-sm, tăng space-y */}
        <div className="bg-gray-50 border border-gray-100 rounded-md p-3 space-y-2">
          {/* Bác sĩ */}
          <p className="text-gray-700 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-purple-600 flex-shrink-0" />
            {/* THAY ĐỔI: Nhãn nhỏ hơn, xám hơn */}
            <span className="font-medium text-gray-500 text-xs">Bác sĩ:</span>
            {/* THAY ĐỔI: Dữ liệu text-sm */}
            <span className="text-sm text-gray-800">{record.staff?.fullName || 'N/A'}</span>
          </p>
          {/* Chẩn đoán */}
          <div className="flex items-start gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            {/* THAY ĐỔI: Nhãn nhỏ hơn, xám hơn */}
            <span className="font-medium text-gray-500 text-xs">Chẩn đoán:</span>
            {/* THAY ĐỔI: Dữ liệu text-sm */}
            <span className="text-sm text-gray-800">{record.diagnosis || 'Chưa có'}</span>
          </div>
          {/* Điều trị */}
          <div className="flex items-start gap-1.5">
            <ListTodo className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            {/* THAY ĐỔI: Nhãn nhỏ hơn, xám hơn */}
            <span className="font-medium text-gray-500 text-xs">Điều trị:</span>
            {/* THAY ĐỔI: Dữ liệu text-sm */}
            <span className="text-sm text-gray-800">{record.treatmentMethod || 'Chưa có'}</span>
          </div>
            {/* Ngày tạo */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Ngày tạo HS:</span>
            <span>{format(parseISO(record.createAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
          </div>
        </div>

        {/* --- Hàng dưới: Nút Actions & Status HSBA --- */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          {/* Status HSBA (chuyển xuống dưới) */}
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getStatusColorClass(record.status)}`}>
              HSBA: {getStatusText(record.status)}
            </span>

          {/* Nút Actions (nếu HSBA chưa hoàn thành) */}
          {record.status === false && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleActionClick(onMarkAsRevisit, record.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title={linkedAppointmentStatus !== 3 ? 'Chỉ thực hiện khi đang khám' : 'Đặt lịch tái khám'}
              >
                <CalendarDays className="w-3.5 h-3.5" /> Tái khám
              </button>
              <button
                onClick={() => handleActionClick(onMarkAsComplete, record.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-green-500 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title={linkedAppointmentStatus !== 3 ? 'Chỉ thực hiện khi đang khám' : 'Hoàn thành khám'}
              >
                <CircleCheckBig className="w-3.5 h-3.5" /> Hoàn thành
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordCard;