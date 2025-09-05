import React from 'react';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const PatientQueue = () => {
  const queue = [
    {
      id: 'q001',
      number: 1,
      patient: 'Nguyễn Văn An',
      patientId: 'BN006',
      checkedIn: new Date(Date.now() - 45 * 60 * 1000),
      priority: 'normal',
      status: 'waiting',
      estimatedTime: 10,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'q002',
      number: 2,
      patient: 'Trần Thị Bình',
      patientId: 'BN007',
      checkedIn: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'high',
      status: 'waiting',
      estimatedTime: 25,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'q003',
      number: 3,
      patient: 'Lê Minh Cường',
      patientId: 'BN008',
      checkedIn: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'normal',
      status: 'waiting',
      estimatedTime: 40,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'q004',
      number: 4,
      patient: 'Phạm Thị Hoa',
      patientId: 'BN009',
      checkedIn: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'urgent',
      status: 'waiting',
      estimatedTime: 55,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Khẩn cấp';
      case 'high':
        return 'Ưu tiên cao';
      case 'normal':
        return 'Bình thường';
      case 'low':
        return 'Ưu tiên thấp';
      default:
        return 'Không xác định';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <Clock className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getWaitingTime = (checkedIn) => {
    const minutes = Math.floor((Date.now() - checkedIn.getTime()) / (1000 * 60));
    return `${minutes} phút`;
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Hàng đợi bệnh nhân</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-medical-600">Tổng: {queue.length} bệnh nhân</span>
          <button className="btn-secondary text-sm">
            Làm mới
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {queue.map((patient, index) => (
          <div key={patient.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-1">
                  <span className="text-sm font-bold text-primary-600">
                    {patient.number}
                  </span>
                </div>
                <span className="text-xs text-medical-500">STT</span>
              </div>

              <img
                src={patient.avatar}
                alt={patient.patient}
                className="w-12 h-12 rounded-xl object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-medical-900 mb-1">
                      {patient.patient}
                    </h3>
                    <p className="text-sm text-medical-600">
                      {patient.patientId}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getPriorityColor(patient.priority)}`}>
                    {getPriorityIcon(patient.priority)}
                    {getPriorityText(patient.priority)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-medical-600">
                    <Clock className="w-4 h-4" />
                    <span>Chờ: {getWaitingTime(patient.checkedIn)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-medical-600">
                    <Users className="w-4 h-4" />
                    <span>Dự kiến: {patient.estimatedTime}p</span>
                  </div>
                  <div className="flex justify-end">
                    <button className="btn-primary text-sm py-2 px-4">
                      Gọi vào
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{queue.length}</p>
            <p className="text-sm text-medical-600">Đang chờ</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {Math.round(queue.reduce((acc, p) => acc + (Date.now() - p.checkedIn.getTime()) / (1000 * 60), 0) / queue.length)}p
            </p>
            <p className="text-sm text-medical-600">Thời gian chờ TB</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-sm text-medical-600">Đã hoàn thành</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;