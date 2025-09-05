import React from 'react';
import { Pill, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const MedicationReminders = () => {
  const medications = [
    {
      id: 'med001',
      name: 'Amlodipine 5mg',
      dosage: '1 viên',
      frequency: 'Sáng sau ăn',
      nextDose: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'pending',
      daysLeft: 5,
      color: 'blue'
    },
    {
      id: 'med002',
      name: 'Metformin 500mg',
      dosage: '2 viên',
      frequency: 'Sáng và tối sau ăn',
      nextDose: new Date(Date.now() + 6 * 60 * 60 * 1000),
      status: 'taken',
      daysLeft: 12,
      color: 'green'
    },
    {
      id: 'med003',
      name: 'Vitamin D3',
      dosage: '1 viên',
      frequency: 'Hàng ngày sau ăn sáng',
      nextDose: new Date(Date.now() + 18 * 60 * 60 * 1000),
      status: 'overdue',
      daysLeft: 20,
      color: 'purple'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'taken':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'taken':
        return 'border-l-green-500 bg-green-50';
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Sắp đến giờ';
      case 'taken':
        return 'Đã uống';
      case 'overdue':
        return 'Quá giờ';
      default:
        return 'Không xác định';
    }
  };

  const getMedicationColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-medical-900">Nhắc nhở uống thuốc</h2>
        <button className="btn-secondary text-sm">
          Cài đặt
        </button>
      </div>

      <div className="space-y-3">
        {medications.map((medication) => (
          <div key={medication.id} className={`border-l-4 pl-4 py-3 rounded-r-lg ${getStatusColor(medication.status)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getMedicationColor(medication.color)}`}>
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-medical-900 text-sm">
                    {medication.name}
                  </h3>
                  <p className="text-xs text-medical-600">
                    {medication.dosage} - {medication.frequency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(medication.status)}
                <span className="text-xs font-medium text-medical-700">
                  {getStatusText(medication.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-medical-600">
              <span>
                Lần tiếp theo: {medication.nextDose.toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              <span>
                Còn {medication.daysLeft} ngày
              </span>
            </div>

            {medication.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-white text-medical-700 py-2 px-3 rounded-lg text-xs font-medium border border-medical-200 hover:bg-medical-50 transition-colors">
                  Hoãn 30p
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                  Đã uống
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-medical-200">
        <button className="w-full btn-secondary text-sm">
          Xem lịch uống thuốc đầy đủ
        </button>
      </div>
    </div>
  );
};

export default MedicationReminders;