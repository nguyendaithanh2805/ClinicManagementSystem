import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TestTube, Search, Filter, Download, Eye, Calendar, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const TestResultsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('3months');

  const testResults = [
    {
      id: 'XN001',
      date: new Date(),
      testName: 'Xét nghiệm máu tổng quát',
      category: 'hematology',
      status: 'completed',
      doctor: 'BS. Trần Thị Bình',
      lab: 'Phòng XN Trung tâm',
      priority: 'normal',
      results: {
        wbc: { value: 7.2, unit: '10³/μL', range: '4.0-10.0', status: 'normal', previous: 6.8 },
        rbc: { value: 4.8, unit: '10⁶/μL', range: '4.2-5.4', status: 'normal', previous: 4.6 },
        hgb: { value: 14.5, unit: 'g/dL', range: '12.0-16.0', status: 'normal', previous: 14.2 },
        hct: { value: 42.1, unit: '%', range: '36.0-46.0', status: 'normal', previous: 41.8 },
        plt: { value: 280, unit: '10³/μL', range: '150-450', status: 'normal', previous: 275 }
      },
      summary: 'Tất cả các chỉ số trong giới hạn bình thường. Có cải thiện nhẹ so với lần trước.',
      recommendations: ['Tiếp tục duy trì chế độ ăn uống lành mạnh', 'Tập thể dục đều đặn'],
      attachments: ['BloodTest_20241227.pdf']
    },
    {
      id: 'XN002',
      date: subDays(new Date(), 14),
      testName: 'Sinh hóa máu',
      category: 'biochemistry',
      status: 'completed',
      doctor: 'BS. Lê Văn Cường',
      lab: 'Phòng XN Sinh hóa',
      priority: 'high',
      results: {
        glucose: { value: 145, unit: 'mg/dL', range: '70-100', status: 'high', previous: 140 },
        cholesterol: { value: 220, unit: 'mg/dL', range: '<200', status: 'high', previous: 215 },
        hdl: { value: 45, unit: 'mg/dL', range: '>40', status: 'normal', previous: 42 },
        ldl: { value: 150, unit: 'mg/dL', range: '<130', status: 'high', previous: 148 },
        triglycerides: { value: 180, unit: 'mg/dL', range: '<150', status: 'high', previous: 175 },
        creatinine: { value: 0.9, unit: 'mg/dL', range: '0.6-1.2', status: 'normal', previous: 0.8 },
        alt: { value: 28, unit: 'U/L', range: '7-56', status: 'normal', previous: 25 },
        ast: { value: 24, unit: 'U/L', range: '10-40', status: 'normal', previous: 22 }
      },
      summary: 'Có dấu hiệu rối loạn lipid máu và đường huyết cao. Cần điều chỉnh chế độ ăn uống.',
      recommendations: [
        'Hạn chế đường và tinh bột',
        'Tăng cường rau xanh và trái cây',
        'Tập thể dục ít nhất 30 phút/ngày',
        'Tái khám sau 1 tháng'
      ],
      attachments: ['Biochemistry_20241213.pdf']
    },
    {
      id: 'XN003',
      date: subDays(new Date(), 30),
      testName: 'HbA1c',
      category: 'diabetes',
      status: 'completed',
      doctor: 'BS. Phạm Thị Hoa',
      lab: 'Phòng XN Đặc biệt',
      priority: 'urgent',
      results: {
        hba1c: { value: 8.2, unit: '%', range: '<7.0', status: 'high', previous: 8.5 }
      },
      summary: 'Kiểm soát đường huyết chưa tốt. Có cải thiện nhẹ so với lần trước nhưng vẫn cao.',
      recommendations: [
        'Điều chỉnh liều insulin theo chỉ định bác sĩ',
        'Kiểm soát chế độ ăn nghiêm ngặt',
        'Theo dõi đường huyết hàng ngày',
        'Tái khám sau 2 tuần'
      ],
      attachments: ['HbA1c_20241127.pdf']
    },
    {
      id: 'XN004',
      date: subMonths(new Date(), 2),
      testName: 'Chức năng gan',
      category: 'liver',
      status: 'completed',
      doctor: 'BS. Nguyễn Văn Đức',
      lab: 'Phòng XN Trung tâm',
      priority: 'normal',
      results: {
        alt: { value: 32, unit: 'U/L', range: '7-56', status: 'normal', previous: 35 },
        ast: { value: 28, unit: 'U/L', range: '10-40', status: 'normal', previous: 30 },
        bilirubin: { value: 1.1, unit: 'mg/dL', range: '0.3-1.2', status: 'normal', previous: 1.0 },
        albumin: { value: 4.2, unit: 'g/dL', range: '3.5-5.0', status: 'normal', previous: 4.1 }
      },
      summary: 'Chức năng gan hoạt động bình thường. Không có dấu hiệu bất thường.',
      recommendations: ['Tiếp tục duy trì lối sống lành mạnh', 'Hạn chế rượu bia'],
      attachments: ['LiverFunction_20241027.pdf']
    }
  ];

  const categories = [
    { id: 'all', label: 'Tất cả', icon: TestTube, color: 'blue' },
    { id: 'hematology', label: 'Huyết học', icon: Activity, color: 'red' },
    { id: 'biochemistry', label: 'Sinh hóa', icon: BarChart3, color: 'green' },
    { id: 'diabetes', label: 'Tiểu đường', icon: TrendingUp, color: 'purple' },
    { id: 'liver', label: 'Chức năng gan', icon: CheckCircle, color: 'orange' }
  ];

  const timeRanges = [
    { id: '1month', label: '1 tháng' },
    { id: '3months', label: '3 tháng' },
    { id: '6months', label: '6 tháng' },
    { id: '1year', label: '1 năm' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'high':
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (current, previous) => {
    if (!previous) return null;
    if (current > previous) return <TrendingUp className="w-3 h-3 text-red-500" />;
    if (current < previous) return <TrendingUp className="w-3 h-3 text-green-500 transform rotate-180" />;
    return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'blue';
  };

  const filteredResults = testResults.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || result.category === selectedCategory;
    
    const matchesTimeRange = (() => {
      const now = new Date();
      const resultDate = result.date;
      switch (selectedTimeRange) {
        case '1month':
          return resultDate >= subMonths(now, 1);
        case '3months':
          return resultDate >= subMonths(now, 3);
        case '6months':
          return resultDate >= subMonths(now, 6);
        case '1year':
          return resultDate >= subMonths(now, 12);
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesCategory && matchesTimeRange;
  });

  const getOverallHealthStatus = () => {
    const latestResults = testResults.slice(0, 3);
    const abnormalCount = latestResults.reduce((count, result) => {
      const abnormalValues = Object.values(result.results).filter(r => r.status !== 'normal').length;
      return count + abnormalValues;
    }, 0);
    
    if (abnormalCount === 0) return { status: 'excellent', text: 'Tuyệt vời', color: 'green' };
    if (abnormalCount <= 2) return { status: 'good', text: 'Tốt', color: 'blue' };
    if (abnormalCount <= 4) return { status: 'fair', text: 'Cần chú ý', color: 'yellow' };
    return { status: 'poor', text: 'Cần theo dõi', color: 'red' };
  };

  const healthStatus = getOverallHealthStatus();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              Kết quả xét nghiệm
            </h1>
            <p className="text-medical-600">
              Theo dõi và phân tích kết quả xét nghiệm của bạn
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </button>
            <button className="btn-primary inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Xem xu hướng
            </button>
          </div>
        </div>
      </div>

      {/* Health Overview */}
      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-xl font-bold text-medical-900 mb-4">Tổng quan sức khỏe</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`bg-gradient-to-r from-${healthStatus.color}-50 to-${healthStatus.color}-100 rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-${healthStatus.color}-500 rounded-xl flex items-center justify-center`}>
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-medical-900">{healthStatus.text}</p>
                <p className="text-sm text-medical-600">Tình trạng tổng thể</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-medical-900">{testResults.length}</p>
                <p className="text-sm text-medical-600">Tổng số xét nghiệm</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-medical-900">
                  {testResults.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-medical-600">Đã hoàn thành</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-medical-900">
                  {format(testResults[0]?.date || new Date(), 'dd/MM', { locale: vi })}
                </p>
                <p className="text-sm text-medical-600">Gần nhất</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-medical-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tìm kiếm xét nghiệm, bác sĩ..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-medical-600" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-medical-700 border border-medical-200 hover:bg-medical-50'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {filteredResults.map((result) => (
          <div key={result.id} className="glass-effect rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-${getCategoryColor(result.category)}-100 rounded-xl flex items-center justify-center`}>
                  <TestTube className={`w-6 h-6 text-${getCategoryColor(result.category)}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-medical-900 mb-1">
                    {result.testName}
                  </h3>
                  <p className="text-medical-600 mb-1">
                    Bác sĩ: {result.doctor} • {result.lab}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-medical-500">
                    <Calendar className="w-4 h-4" />
                    <span>{format(result.date, 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Hoàn thành
              </span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(result.results).map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl border border-medical-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-medical-900 uppercase text-sm">{key}</h4>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(value.status)}
                      {getTrendIcon(value.value, value.previous)}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xl font-bold ${getStatusColor(value.status).split(' ')[0]}`}>
                      {value.value}
                    </span>
                    <span className="text-sm text-medical-600">{value.unit}</span>
                  </div>
                  <p className="text-xs text-medical-500 mb-2">
                    Bình thường: {value.range}
                  </p>
                  {value.previous && (
                    <p className="text-xs text-medical-500">
                      Trước: {value.previous} {value.unit}
                    </p>
                  )}
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value.status)}`}>
                    {value.status === 'normal' ? 'Bình thường' : 
                     value.status === 'high' ? 'Cao' : 'Thấp'}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-medical-900 mb-2">Tóm tắt kết quả</h4>
              <p className="text-medical-700">{result.summary}</p>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-medical-900 mb-2">Khuyến nghị</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-medical-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-medical-100">
              <div className="flex gap-2">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Xem xu hướng
                </button>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  So sánh với trước
                </button>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <TestTube className="w-16 h-16 text-medical-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-medical-900 mb-2">
            Không tìm thấy kết quả xét nghiệm
          </h3>
          <p className="text-medical-600">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có kết quả xét nghiệm nào'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TestResultsPage;