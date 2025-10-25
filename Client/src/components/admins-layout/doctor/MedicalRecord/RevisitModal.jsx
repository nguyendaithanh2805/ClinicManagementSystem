import React, { useState } from 'react';
import { XCircle, Save, CalendarDays, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Phiếu hẹn tái khám
const RevisitModal = ({ onClose, onSubmit }) => {
  // Lấy ngày mai làm giá trị mặc định
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  
  const [appointmentDate, setAppointmentDate] = useState(tomorrow);
  const [appointmentTime, setAppointmentTime] = useState('09:00');

  const handleSubmit = () => {
    if (!appointmentDate || !appointmentTime) {
      toast.warn('Vui lòng chọn ngày và giờ hẹn tái khám.');
      return;
    }

    // API của bạn yêu cầu DateOnly và TimeOnly.
    // Dữ liệu từ input type="date" là 'yyyy-MM-dd' (DateOnly)
    // Dữ liệu từ input type="time" là 'HH:mm' (TimeOnly)
    // -> Chúng ta có thể gửi thẳng
    const payload = {
      AppointmentDate: appointmentDate,
      AppointmentTime: appointmentTime,
    };

    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          onClick={onClose}
        >
          <XCircle className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Phiếu hẹn tái khám
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="revisitDate" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn ngày hẹn
            </label>
            <div className="relative">
              <input
                type="date"
                id="revisitDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={tomorrow} // Không cho phép chọn ngày trong quá khứ
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 pl-10"
              />
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
          <div>
            <label htmlFor="revisitTime" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn giờ hẹn
            </label>
            <div className="relative">
              <input
                type="time"
                id="revisitTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 pl-10"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" /> Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" /> Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisitModal;