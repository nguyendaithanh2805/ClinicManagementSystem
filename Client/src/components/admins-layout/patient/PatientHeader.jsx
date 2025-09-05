import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Phone, User } from 'lucide-react';

const PatientHeader = () => {
  const { user } = useAuth();

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <FaRegUserCircle className="w-8 h-8 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-1">
              Chào mừng, {user?.username}
            </h1>
            <p className="text-medical-600">
              Mã bệnh nhân: <span className="font-medium">{user?.patientId}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:ml-6">
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Phone className="w-4 h-4" />
            <span>{user?.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Calendar className="w-4 h-4" />
            <span>Sinh: {new Date(user?.dateOfBirth).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{user?.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;