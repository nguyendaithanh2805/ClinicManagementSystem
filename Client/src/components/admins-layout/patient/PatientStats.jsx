import React from 'react';
import { Calendar, FileText, Pill, HeartPulse } from 'lucide-react';

const PatientStats = ({ appointments, medicalRecords, prescriptions }) => {
  const currentMonthAppointments = appointments.filter(apt =>
    new Date(apt.appointmentDate).getMonth() === new Date().getMonth()
  ).length;

  const totalRecords = medicalRecords.length;
  const totalPrescriptions = prescriptions.length;

  const stats = [
    {
      icon: Calendar,
      label: 'Lịch khám tháng này',
      value: currentMonthAppointments,
      change: 'Lịch hẹn đã xác nhận',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FileText,
      label: 'Tổng số hồ sơ bệnh án',
      value: totalRecords,
      change: `Cập nhật lần cuối ${totalRecords > 0 ? new Date(medicalRecords[0].createAt).toLocaleDateString('vi-VN') : ''}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Pill,
      label: 'Số loại thuốc đang dùng',
      value: totalPrescriptions,
      change: 'Từ các đơn thuốc gần đây',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: HeartPulse,
      label: 'Chẩn đoán gần nhất',
      value: totalRecords > 0 ? medicalRecords[0].diagnosis : "Chưa có",
      change: 'Từ hồ sơ mới nhất',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="glass-effect rounded-xl p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-medical-900 mb-1 truncate">{stat.value}</p>
              <p className="text-sm font-medium text-medical-700 mb-1">{stat.label}</p>
              <p className="text-xs text-medical-500 truncate">{stat.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientStats;