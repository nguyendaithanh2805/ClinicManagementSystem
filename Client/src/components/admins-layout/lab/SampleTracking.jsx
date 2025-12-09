import React, { useState } from 'react';
import { Search, TestTube, MapPin, Clock, User, Scan } from 'lucide-react';

const SampleTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const recentSamples = [
    {
      id: 'XN001',
      patientName: 'Nguyễn Văn An',
      testType: 'Máu tổng quát',
      location: 'Máy phân tích A1',
      status: 'processing',
      progress: 75,
      estimatedTime: 15
    },
    {
      id: 'XN002',
      patientName: 'Trần Thị Mai',
      testType: 'Sinh hóa máu',
      location: 'Máy sinh hóa B2',
      status: 'completed',
      progress: 100,
      estimatedTime: 0
    },
    {
      id: 'XN003',
      patientName: 'Lê Minh Tuấn',
      testType: 'HbA1c',
      location: 'Khu vực chuẩn bị',
      status: 'preparing',
      progress: 25,
      estimatedTime: 45
    }
  ];

  const mockSamples = [
    {
      id: 'XN004',
      patientName: 'Phạm Thị Hoa',
      testType: 'Lipid profile',
      location: 'Máy phân tích C3',
      status: 'processing'
    },
    {
      id: 'XN005',
      patientName: 'Võ Minh Tuấn',
      testType: 'Glucose',
      location: 'Hoàn thành',
      status: 'completed'
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.length > 0) {
      const results = mockSamples.filter(sample =>
        sample.id.toLowerCase().includes(value.toLowerCase()) ||
        sample.patientName.toLowerCase().includes(value.toLowerCase()) ||
        sample.testType.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'preparing':
        return 'Chuẩn bị';
      case 'error':
        return 'Lỗi';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-bold text-medical-900 mb-6">Theo dõi mẫu</h2>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-medical-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          placeholder="Tìm mẫu theo mã, tên BN..."
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-medical-700 mb-3">Kết quả tìm kiếm</h3>
          <div className="space-y-2">
            {searchResults.map((sample) => (
              <div key={sample.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-medical-200 hover:shadow-soft transition-all duration-200 cursor-pointer">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-medical-900 text-sm">{sample.id}</p>
                  <p className="text-xs text-medical-600">{sample.patientName} • {sample.testType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-medical-500">{sample.location}</p>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(sample.status)} mt-1`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Samples */}
      <div>
        <h3 className="text-sm font-medium text-medical-700 mb-3">Mẫu đang xử lý</h3>
        <div className="space-y-3">
          {recentSamples.map((sample) => (
            <div key={sample.id} className="bg-white rounded-lg border border-medical-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-medical-900 text-sm">{sample.id}</p>
                    <p className="text-xs text-medical-600">{sample.patientName}</p>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${getStatusColor(sample.status)}`}></span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-medical-700 mb-1">{sample.testType}</p>
                <div className="flex items-center gap-2 text-xs text-medical-600">
                  <MapPin className="w-3 h-3" />
                  <span>{sample.location}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-medical-600 mb-1">
                  <span>Tiến độ</span>
                  <span>{sample.progress}%</span>
                </div>
                <div className="w-full bg-medical-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(sample.status)}`}
                    style={{ width: `${sample.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-medical-600">
                  <Clock className="w-3 h-3" />
                  <span>
                    {sample.estimatedTime > 0 ? `Còn ${sample.estimatedTime}p` : 'Hoàn thành'}
                  </span>
                </div>
                <span className="text-medical-500">{getStatusText(sample.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-sm py-2 flex items-center justify-center gap-2">
            <Scan className="w-4 h-4" />
            Quét mã vạch
          </button>
          <button className="btn-secondary text-sm py-2">
            Báo cáo tiến độ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleTracking;