import React from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const RecentMedicalRecords = ({ medicalRecords }) => {
  // Sắp xếp hồ sơ theo ngày gần nhất và chỉ lấy 3 hồ sơ
  const recentRecords = [...medicalRecords]
    .sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
    .slice(0, 3);

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Hồ sơ y tế gần đây</h2>
        <button className="btn-secondary text-sm">Xem tất cả</button>
      </div>

      <div className="space-y-4">
        {recentRecords.length > 0 ? (
          recentRecords.map((record) => (
            <div key={record.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-medical-900 mb-1">Chẩn đoán: {record.diagnosis}</h3>
                    <p className="text-sm text-medical-600 mb-1">Bác sĩ: {record.staff.fullName}</p>
                    <div className="flex items-center gap-2 text-sm text-medical-500">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(record.createAt), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700`}>
                  Hoàn thành
                </span>
              </div>

              <div className="bg-medical-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-medical-900 mb-1">Phương pháp điều trị:</p>
                <p className="text-sm text-medical-600">{record.treatmentMethod}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {record.testResults.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Có kết quả xét nghiệm
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
          ))
        ) : (
          <p className="text-center text-medical-600">Chưa có hồ sơ y tế nào.</p>
        )}
      </div>
    </div>
  );
};

export default RecentMedicalRecords;