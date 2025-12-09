import React from 'react';
import { Users, Activity, Clock, TrendingUp } from 'lucide-react';

const DepartmentOverview = () => {
  const departmentStats = {
    name: 'Nội khoa - Tim mạch',
    totalPatients: 156,
    todayPatients: 24,
    avgWaitTime: 15,
    satisfaction: 4.8
  };

  const staffOnDuty = [
    {
      id: 'staff001',
      name: 'BS. Trần Thị Bình',
      role: 'Bác sĩ chính',
      status: 'busy',
      currentPatients: 3,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'staff002',
      name: 'Y tá Lê Thị Cẩm',
      role: 'Y tá trưởng',
      status: 'available',
      currentPatients: 0,
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'staff003',
      name: 'Y tá Nguyễn Văn Đức',
      role: 'Y tá',
      status: 'busy',
      currentPatients: 2,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Sẵn sàng';
      case 'busy':
        return 'Đang bận';
      case 'offline':
        return 'Nghỉ';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-bold text-medical-900 mb-6">Tổng quan khoa</h2>
      
      {/* Department Stats */}
      <div className="mb-6">
        <h3 className="font-semibold text-medical-900 mb-3">{departmentStats.name}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Hôm nay</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{departmentStats.todayPatients}</p>
            <p className="text-xs text-blue-600">/{departmentStats.totalPatients} tổng</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Chờ TB</span>
            </div>
            <p className="text-lg font-bold text-green-900">{departmentStats.avgWaitTime}p</p>
            <p className="text-xs text-green-600">Giảm 5p</p>
          </div>
        </div>
      </div>

      {/* Staff on Duty */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-medical-700 mb-3">Nhân viên đang làm việc</h3>
        <div className="space-y-2">
          {staffOnDuty.map((staff) => (
            <div key={staff.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-medical-200">
              <div className="relative">
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(staff.status)} rounded-full border-2 border-white`}></div>
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-medical-900 text-sm">{staff.name}</p>
                <p className="text-xs text-medical-600">{staff.role}</p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-medical-500">{getStatusText(staff.status)}</p>
                {staff.currentPatients > 0 && (
                  <p className="text-xs text-blue-600">{staff.currentPatients} BN</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-4 border-t border-medical-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-medical-600">Hiệu suất</span>
            </div>
            <p className="text-lg font-bold text-purple-600">92%</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-medical-600">Đánh giá</span>
            </div>
            <p className="text-lg font-bold text-orange-600">{departmentStats.satisfaction}/5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOverview;