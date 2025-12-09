import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FlaskConical, MapPin, Phone, Clock, Thermometer } from 'lucide-react';

const LabHeader = () => {
  const { user } = useAuth();

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'Ca sáng (06:00 - 14:00)';
    if (hour >= 14 && hour < 22) return 'Ca chiều (14:00 - 22:00)';
    return 'Ca đêm (22:00 - 06:00)';
  };

  const getLabEnvironment = () => {
    return {
      temperature: '22°C',
      humidity: '45%',
      status: 'Tối ưu'
    };
  };

  const labEnv = getLabEnvironment();

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-soft">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-1">
              Chào mừng, {user?.username}
            </h1>
            <p className="text-medical-600">
              Mã nhân viên: <span className="font-medium">{user?.staffId}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 md:ml-6">
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <MapPin className="w-4 h-4" />
            <span>{user?.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Clock className="w-4 h-4" />
            <span>{getCurrentShift()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Thermometer className="w-4 h-4" />
            <span>{labEnv.temperature} | {labEnv.humidity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Phone className="w-4 h-4" />
            <span>{user?.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">Phòng lab hoạt động</span>
        </div>
      </div>
    </div>
  );
};

export default LabHeader;