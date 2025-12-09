import React, { useState } from 'react';
import { Search, User, Phone, Calendar, FileText } from 'lucide-react';

const QuickPatientSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const mockPatients = [
    {
      id: 'BN001',
      name: 'Nguyễn Văn An',
      phone: '0901234567',
      lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active'
    },
    {
      id: 'BN002',
      name: 'Trần Thị Bình',
      phone: '0912345678',
      lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'active'
    },
    {
      id: 'BN003',
      name: 'Lê Minh Cường',
      phone: '0923456789',
      lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'inactive'
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.length > 0) {
      const results = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(value.toLowerCase()) ||
        patient.id.toLowerCase().includes(value.toLowerCase()) ||
        patient.phone.includes(value)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const recentPatients = [
    {
      id: 'BN004',
      name: 'Phạm Thị Hoa',
      lastAction: 'Khám 2 giờ trước',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'BN005',
      name: 'Võ Minh Tuấn',
      lastAction: 'Tái khám hôm qua',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'BN006',
      name: 'Đặng Thị Lan',
      lastAction: 'Xét nghiệm 3 ngày trước',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-bold text-medical-900 mb-6">Tìm kiếm bệnh nhân</h2>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-medical-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Tìm theo tên, mã BN, số điện thoại..."
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-medical-700 mb-3">Kết quả tìm kiếm</h3>
          <div className="space-y-2">
            {searchResults.map((patient) => (
              <div key={patient.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-medical-200 hover:shadow-soft transition-all duration-200 cursor-pointer">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-medical-900 text-sm">{patient.name}</p>
                  <p className="text-xs text-medical-600">{patient.id} • {patient.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${patient.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <button className="p-1 text-medical-400 hover:text-medical-600">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Patients */}
      <div>
        <h3 className="text-sm font-medium text-medical-700 mb-3">Bệnh nhân gần đây</h3>
        <div className="space-y-2">
          {recentPatients.map((patient) => (
            <div key={patient.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-medical-200 hover:shadow-soft transition-all duration-200 cursor-pointer">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-medical-900 text-sm">{patient.name}</p>
                <p className="text-xs text-medical-600">{patient.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-medical-500">{patient.lastAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-sm py-2">
            Thêm BN mới
          </button>
          <button className="btn-secondary text-sm py-2">
            Danh sách đầy đủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPatientSearch;