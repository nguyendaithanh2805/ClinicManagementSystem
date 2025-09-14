import React from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const RecentMedicalRecords = () => {
  const records = [
    {
      id: 'rec001',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'Khám tổng quát',
      doctor: 'BS. Trần Thị Bình',
      diagnosis: 'Huyết áp cao nhẹ',
      status: 'completed',
      hasResults: true,
      summary: 'Bệnh nhân có dấu hiệu huyết áp cao nhẹ, cần theo dõi và điều chỉnh chế độ ăn uống.'
    },
    {
      id: 'rec002',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'Xét nghiệm máu',
      doctor: 'BS. Nguyễn Văn Cường',
      diagnosis: 'Kết quả bình thường',
      status: 'completed',
      hasResults: true,
      summary: 'Các chỉ số máu trong giới hạn bình thường. Tiếp tục duy trì lối sống lành mạnh.'
    },
    {
      id: 'rec003',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      type: 'Siêu âm tim',
      doctor: 'BS. Lê Thị Hoa',
      diagnosis: 'Chức năng tim tốt',
      status: 'completed',
      hasResults: true,
      summary: 'Siêu âm tim cho thấy chức năng tim hoạt động bình thường, không có bất thường.'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ kết quả';
      case 'in_progress':
        return 'Đang xử lý';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Hồ sơ y tế gần đây</h2>
        <button className="btn-secondary text-sm">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-900 mb-1">
                    {record.type}
                  </h3>
                  <p className="text-sm text-medical-600 mb-1">
                    Bác sĩ: {record.doctor}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-medical-500">
                    <Calendar className="w-4 h-4" />
                    <span>{format(record.date, 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {getStatusText(record.status)}
              </span>
            </div>

            <div className="bg-medical-50 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium text-medical-900 mb-1">
                Chẩn đoán: {record.diagnosis}
              </p>
              <p className="text-sm text-medical-600">
                {record.summary}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {record.hasResults && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Có kết quả
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMedicalRecords;