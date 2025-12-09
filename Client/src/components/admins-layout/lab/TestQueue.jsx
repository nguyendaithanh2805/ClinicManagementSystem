import React, { useState } from 'react';
import { TestTube, Clock, User, FileText, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const TestQueue = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const testQueue = [
    {
      id: 'XN001',
      patientName: 'Nguyễn Văn An',
      patientId: 'BN001',
      testType: 'Xét nghiệm máu tổng quát',
      priority: 'normal',
      status: 'pending',
      sampleTime: new Date(Date.now() - 30 * 60 * 1000),
      estimatedTime: 45,
      doctor: 'BS. Trần Thị Bình',
      notes: 'Kiểm tra tình trạng sức khỏe tổng quát',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'XN002',
      patientName: 'Trần Thị Mai',
      patientId: 'BN002',
      testType: 'Sinh hóa máu',
      priority: 'high',
      status: 'in_progress',
      sampleTime: new Date(Date.now() - 60 * 60 * 1000),
      estimatedTime: 30,
      doctor: 'BS. Lê Văn Cường',
      notes: 'Theo dõi chức năng gan, thận',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'XN003',
      patientName: 'Lê Minh Tuấn',
      patientId: 'BN003',
      testType: 'HbA1c',
      priority: 'urgent',
      status: 'pending',
      sampleTime: new Date(Date.now() - 15 * 60 * 1000),
      estimatedTime: 60,
      doctor: 'BS. Phạm Thị Hoa',
      notes: 'Kiểm tra tiểu đường, cần kết quả gấp',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'XN004',
      patientName: 'Võ Thị Lan',
      patientId: 'BN004',
      testType: 'Lipid profile',
      priority: 'normal',
      status: 'completed',
      sampleTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedTime: 0,
      doctor: 'BS. Nguyễn Văn Đức',
      notes: 'Kiểm tra mỡ máu định kỳ',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'review':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xử lý';
      case 'review':
        return 'Cần xem lại';
      default:
        return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'review':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionButton = (status, testId) => {
    switch (status) {
      case 'pending':
        return (
          <button className="btn-primary text-sm py-2 px-4">
            Bắt đầu xử lý
          </button>
        );
      case 'in_progress':
        return (
          <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            Tạm dừng
          </button>
        );
      case 'completed':
        return (
          <button className="btn-secondary text-sm py-2 px-4">
            Xem kết quả
          </button>
        );
      default:
        return (
          <button className="btn-secondary text-sm py-2 px-4">
            Chi tiết
          </button>
        );
    }
  };

  const filteredTests = testQueue.filter(test => {
    if (activeTab === 'all') return true;
    return test.status === activeTab;
  });

  const tabs = [
    { id: 'pending', label: 'Chờ xử lý', count: testQueue.filter(t => t.status === 'pending').length },
    { id: 'in_progress', label: 'Đang xử lý', count: testQueue.filter(t => t.status === 'in_progress').length },
    { id: 'completed', label: 'Hoàn thành', count: testQueue.filter(t => t.status === 'completed').length },
    { id: 'all', label: 'Tất cả', count: testQueue.length }
  ];

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Hàng đợi xét nghiệm</h2>
        <button className="btn-secondary text-sm">
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-medical-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-medical-900 shadow-sm'
                : 'text-medical-600 hover:text-medical-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Test Queue */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <div key={test.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-2">
                  <TestTube className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs font-medium text-medical-600">
                  {test.id}
                </span>
              </div>

              <img
                src={test.avatar}
                alt={test.patientName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-medical-900 mb-1">
                      {test.patientName}
                    </h3>
                    <p className="text-sm text-medical-600 mb-1">
                      {test.patientId} • {test.testType}
                    </p>
                    <p className="text-sm text-medical-500">
                      Bác sĩ: {test.doctor}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getPriorityColor(test.priority)}`}>
                      <AlertCircle className="w-3 h-3" />
                      {getPriorityText(test.priority)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                      {getStatusText(test.status)}
                    </span>
                  </div>
                </div>

                <div className="bg-medical-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-medical-700">
                    <span className="font-medium">Ghi chú:</span> {test.notes}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <Clock className="w-4 h-4" />
                    <span>Lấy mẫu: {format(test.sampleTime, 'HH:mm dd/MM', { locale: vi })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <TestTube className="w-4 h-4" />
                    <span>
                      {test.status === 'completed' ? 'Hoàn thành' : `Còn ~${test.estimatedTime}p`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-medical-600">
                    <User className="w-4 h-4" />
                    <span>KTV xử lý</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-medical-100">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Xem chi tiết mẫu
                  </button>
                  {getActionButton(test.status, test.id)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-8">
          <TestTube className="w-12 h-12 text-medical-300 mx-auto mb-4" />
          <p className="text-medical-600">Không có mẫu xét nghiệm nào trong danh mục này</p>
        </div>
      )}
    </div>
  );
};

export default TestQueue;