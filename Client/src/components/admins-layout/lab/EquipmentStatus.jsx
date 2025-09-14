import React from 'react';
import { Monitor, Wifi, Battery, AlertTriangle, CheckCircle, Settings, Wrench } from 'lucide-react';

const EquipmentStatus = () => {
  const equipment = [
    {
      id: 'EQ001',
      name: 'Máy phân tích máu tự động',
      model: 'Sysmex XN-1000',
      status: 'online',
      utilization: 85,
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      samplesProcessed: 156,
      alerts: []
    },
    {
      id: 'EQ002',
      name: 'Máy sinh hóa tự động',
      model: 'Roche Cobas c311',
      status: 'online',
      utilization: 72,
      lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      samplesProcessed: 89,
      alerts: ['Cần thay reagent glucose']
    },
    {
      id: 'EQ003',
      name: 'Máy đông máu',
      model: 'Stago STA-R Max',
      status: 'maintenance',
      utilization: 0,
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      samplesProcessed: 0,
      alerts: ['Đang bảo trì định kỳ']
    },
    {
      id: 'EQ004',
      name: 'Máy ELISA',
      model: 'BioTek ELx800',
      status: 'warning',
      utilization: 45,
      lastMaintenance: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      samplesProcessed: 23,
      alerts: ['Nhiệt độ cao bất thường', 'Cần hiệu chuẩn']
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'offline':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      default:
        return <Monitor className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Hoạt động';
      case 'warning':
        return 'Cảnh báo';
      case 'offline':
        return 'Ngoại tuyến';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Không xác định';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'bg-red-500';
    if (utilization >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const overallStats = {
    totalEquipment: equipment.length,
    onlineEquipment: equipment.filter(e => e.status === 'online').length,
    warningEquipment: equipment.filter(e => e.status === 'warning').length,
    maintenanceEquipment: equipment.filter(e => e.status === 'maintenance').length
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-medical-900">Trạng thái thiết bị</h2>
        <button className="btn-secondary text-sm">
          Chi tiết
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-medical-900">Tổng quan thiết bị</p>
            <p className="text-sm text-medical-600">{overallStats.totalEquipment} thiết bị</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{overallStats.onlineEquipment}</p>
            <p className="text-xs text-medical-600">Hoạt động</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600">{overallStats.warningEquipment}</p>
            <p className="text-xs text-medical-600">Cảnh báo</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{overallStats.maintenanceEquipment}</p>
            <p className="text-xs text-medical-600">Bảo trì</p>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-medical-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-medical-900 text-sm mb-1">
                  {item.name}
                </h4>
                <p className="text-xs text-medical-600">{item.model}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>

            {/* Utilization Bar */}
            {item.status !== 'maintenance' && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-medical-600 mb-1">
                  <span>Tải sử dụng</span>
                  <span>{item.utilization}%</span>
                </div>
                <div className="w-full bg-medical-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUtilizationColor(item.utilization)}`}
                    style={{ width: `${item.utilization}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-medical-600">Mẫu hôm nay</p>
                <p className="font-semibold text-medical-900">{item.samplesProcessed}</p>
              </div>
              <div>
                <p className="text-xs text-medical-600">Bảo trì tiếp theo</p>
                <p className="font-semibold text-medical-900">
                  {Math.ceil((item.nextMaintenance - new Date()) / (1000 * 60 * 60 * 24))} ngày
                </p>
              </div>
            </div>

            {/* Alerts */}
            {item.alerts.length > 0 && (
              <div className="border-t border-medical-100 pt-3">
                <p className="text-xs text-medical-600 mb-2">Cảnh báo:</p>
                {item.alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-orange-600 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-sm py-2 flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            Cài đặt
          </button>
          <button className="btn-secondary text-sm py-2">
            Lịch bảo trì
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentStatus;