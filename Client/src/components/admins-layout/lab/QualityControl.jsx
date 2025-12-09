import React from 'react';
import { Shield, CheckCircle, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

const QualityControl = () => {
  const qcResults = [
    {
      id: 'QC001',
      testName: 'Glucose Control',
      level: 'Level 1',
      result: 95.2,
      target: 95.0,
      range: '90.0 - 100.0',
      status: 'passed',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      deviation: 0.2
    },
    {
      id: 'QC002',
      testName: 'Cholesterol Control',
      level: 'Level 2',
      result: 205.8,
      target: 200.0,
      range: '190.0 - 210.0',
      status: 'passed',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      deviation: 5.8
    },
    {
      id: 'QC003',
      testName: 'Hemoglobin Control',
      level: 'Level 1',
      result: 12.8,
      target: 12.0,
      range: '11.0 - 13.0',
      status: 'warning',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      deviation: 0.8
    },
    {
      id: 'QC004',
      testName: 'Creatinine Control',
      level: 'Level 2',
      result: 1.15,
      target: 1.20,
      range: '1.10 - 1.30',
      status: 'passed',
      date: new Date(Date.now() - 8 * 60 * 60 * 1000),
      deviation: -0.05
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'passed':
        return 'Đạt';
      case 'warning':
        return 'Cảnh báo';
      case 'failed':
        return 'Không đạt';
      default:
        return 'Không xác định';
    }
  };

  const overallStats = {
    passRate: 92,
    totalTests: qcResults.length,
    passedTests: qcResults.filter(r => r.status === 'passed').length,
    warningTests: qcResults.filter(r => r.status === 'warning').length,
    failedTests: qcResults.filter(r => r.status === 'failed').length
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-medical-900">Kiểm soát chất lượng</h2>
        <button className="btn-secondary text-sm">
          Xem báo cáo
        </button>
      </div>

      {/* Overall Stats */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-medical-900">Tỷ lệ đạt QC hôm nay</p>
            <p className="text-sm text-medical-600">Cập nhật lần cuối: 2 giờ trước</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{overallStats.passedTests}</p>
            <p className="text-xs text-medical-600">Đạt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{overallStats.warningTests}</p>
            <p className="text-xs text-medical-600">Cảnh báo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{overallStats.failedTests}</p>
            <p className="text-xs text-medical-600">Không đạt</p>
          </div>
        </div>
      </div>

      {/* QC Results */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-medical-700">Kết quả QC gần đây</h3>
        {qcResults.map((result) => (
          <div key={result.id} className="bg-white rounded-lg border border-medical-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-medical-900 text-sm mb-1">
                  {result.testName}
                </h4>
                <p className="text-xs text-medical-600">{result.level}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                  {getStatusText(result.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-medical-600">Kết quả</p>
                <p className="font-semibold text-medical-900">{result.result}</p>
              </div>
              <div>
                <p className="text-xs text-medical-600">Mục tiêu</p>
                <p className="font-semibold text-medical-900">{result.target}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-medical-600 mb-1">Khoảng chấp nhận: {result.range}</p>
              <div className="w-full bg-medical-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${result.status === 'passed' ? 'bg-green-500' : result.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-medical-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{result.date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span>
                Độ lệch: {result.deviation > 0 ? '+' : ''}{result.deviation}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-sm py-2">
            Chạy QC mới
          </button>
          <button className="btn-secondary text-sm py-2">
            Xem xu hướng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QualityControl;