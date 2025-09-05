import React, { useState } from 'react';
import { FileText, Eye, Send, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ResultsReview = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const results = [
    {
      id: 'KQ001',
      patientName: 'Nguyễn Văn An',
      patientId: 'BN001',
      testType: 'Xét nghiệm máu tổng quát',
      completedTime: new Date(Date.now() - 30 * 60 * 1000),
      doctor: 'BS. Trần Thị Bình',
      status: 'pending_review',
      priority: 'normal',
      abnormalValues: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      results: {
        wbc: { value: 7.2, unit: '10³/μL', range: '4.0-10.0', status: 'normal' },
        rbc: { value: 4.8, unit: '10⁶/μL', range: '4.2-5.4', status: 'normal' },
        hgb: { value: 14.5, unit: 'g/dL', range: '12.0-16.0', status: 'normal' },
        hct: { value: 42.1, unit: '%', range: '36.0-46.0', status: 'normal' }
      }
    },
    {
      id: 'KQ002',
      patientName: 'Trần Thị Mai',
      patientId: 'BN002',
      testType: 'Sinh hóa máu',
      completedTime: new Date(Date.now() - 60 * 60 * 1000),
      doctor: 'BS. Lê Văn Cường',
      status: 'pending_review',
      priority: 'high',
      abnormalValues: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      results: {
        glucose: { value: 145, unit: 'mg/dL', range: '70-100', status: 'high' },
        cholesterol: { value: 220, unit: 'mg/dL', range: '<200', status: 'high' },
        creatinine: { value: 0.9, unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
        alt: { value: 28, unit: 'U/L', range: '7-56', status: 'normal' }
      }
    },
    {
      id: 'KQ003',
      patientName: 'Lê Minh Tuấn',
      patientId: 'BN003',
      testType: 'HbA1c',
      completedTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      doctor: 'BS. Phạm Thị Hoa',
      status: 'reviewed',
      priority: 'urgent',
      abnormalValues: 1,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      results: {
        hba1c: { value: 8.2, unit: '%', range: '<7.0', status: 'high' }
      }
    },
    {
      id: 'KQ004',
      patientName: 'Võ Thị Lan',
      patientId: 'BN004',
      testType: 'Lipid profile',
      completedTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      doctor: 'BS. Nguyễn Văn Đức',
      status: 'sent',
      priority: 'normal',
      abnormalValues: 0,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      results: {
        totalCholesterol: { value: 180, unit: 'mg/dL', range: '<200', status: 'normal' },
        hdl: { value: 55, unit: 'mg/dL', range: '>40', status: 'normal' },
        ldl: { value: 110, unit: 'mg/dL', range: '<130', status: 'normal' },
        triglycerides: { value: 120, unit: 'mg/dL', range: '<150', status: 'normal' }
      }
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
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sent':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_review':
        return 'Chờ duyệt';
      case 'reviewed':
        return 'Đã duyệt';
      case 'sent':
        return 'Đã gửi';
      default:
        return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getValueStatus = (status) => {
    switch (status) {
      case 'high':
        return 'text-red-600 font-semibold';
      case 'low':
        return 'text-blue-600 font-semibold';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-medical-900';
    }
  };

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    return result.status === activeTab;
  });

  const tabs = [
    { id: 'pending_review', label: 'Chờ duyệt', count: results.filter(r => r.status === 'pending_review').length },
    { id: 'reviewed', label: 'Đã duyệt', count: results.filter(r => r.status === 'reviewed').length },
    { id: 'sent', label: 'Đã gửi', count: results.filter(r => r.status === 'sent').length },
    { id: 'all', label: 'Tất cả', count: results.length }
  ];

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-medical-900">Duyệt kết quả</h2>
        <button className="btn-secondary text-sm">
          Xuất báo cáo
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

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map((result) => (
          <div key={result.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
            <div className="flex items-start gap-4">
              <img
                src={result.avatar}
                alt={result.patientName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-medical-900 mb-1">
                      {result.patientName}
                    </h3>
                    <p className="text-sm text-medical-600 mb-1">
                      {result.patientId} • {result.testType}
                    </p>
                    <p className="text-sm text-medical-500">
                      Bác sĩ: {result.doctor}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getPriorityColor(result.priority)}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {getPriorityText(result.priority)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                      {getStatusText(result.status)}
                    </span>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="bg-medical-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-medical-900">
                      Tóm tắt kết quả
                    </p>
                    {result.abnormalValues > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {result.abnormalValues} bất thường
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(result.results).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-xs text-medical-600 uppercase">{key}</p>
                        <p className={`text-sm font-medium ${getValueStatus(value.status)}`}>
                          {value.value} {value.unit}
                        </p>
                        <p className="text-xs text-medical-500">{value.range}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-medical-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Hoàn thành: {format(result.completedTime, 'HH:mm dd/MM', { locale: vi })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>KTV xử lý</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {result.status === 'pending_review' && (
                      <>
                        <button className="btn-secondary text-sm py-2 px-4">
                          Yêu cầu làm lại
                        </button>
                        <button className="btn-primary text-sm py-2 px-4">
                          Duyệt & Gửi
                        </button>
                      </>
                    )}
                    {result.status === 'reviewed' && (
                      <button className="btn-primary text-sm py-2 px-4">
                        Gửi kết quả
                      </button>
                    )}
                    {result.status === 'sent' && (
                      <button className="btn-secondary text-sm py-2 px-4">
                        Xem chi tiết
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-medical-300 mx-auto mb-4" />
          <p className="text-medical-600">Không có kết quả nào trong danh mục này</p>
        </div>
      )}
    </div>
  );
};

export default ResultsReview;