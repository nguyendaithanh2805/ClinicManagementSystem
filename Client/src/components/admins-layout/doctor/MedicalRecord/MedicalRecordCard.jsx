import React from 'react';
import {
  FileText, Stethoscope, ListTodo, ClipboardCheck, CircleCheckBig, Eye
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const MedicalRecordCard = ({ record, onClick, onMarkAsComplete, getStatusColorClass, getStatusText }) => (
  <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
    <div className="flex-shrink-0">
      <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
    </div>

    <div className="flex-1 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            <p>
              Bệnh nhân:{" "}
              <span className="text-blue-600 font-semibold">
                {record.patient?.fullName || "Chưa có bệnh nhân"}
              </span>
            </p>
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Stethoscope className="w-4 h-4 inline-block text-gray-500" />
            Bác sĩ điều trị: {record.staff?.fullName || 'N/A'}
          </p>
        </div>
        <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(record.status)}`}>
          {getStatusText(record.status)}
        </span>
        <button
          onClick={onClick}
          className="mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
        >
          <Eye className="w-4 h-4" /> Xem chi tiết
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-gray-500" />
          <span>Chẩn đoán: {record.diagnosis || 'Chưa có'}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-gray-500" />
          <span>Ngày tạo: {format(parseISO(record.createAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
        </div>
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-gray-500" />
          <span>Phương pháp điều trị: {record.treatmentMethod || 'Chưa có'}</span>
        </div>
        {record.status === false && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => onMarkAsComplete(record.id)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                border border-green-300 text-green-700 hover:bg-green-100 transition-colors"
            >
              <CircleCheckBig className="w-4 h-4" /> Đánh dấu hoàn thành khám
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MedicalRecordCard;