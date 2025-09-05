import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Search, Filter, Plus, Download, Eye, Calendar, User, Activity, Heart, TestTube, Pill, AlertCircle, CheckCircle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const medicalRecords = [
    {
      id: 'HS001',
      date: new Date(),
      type: 'Khám tổng quát',
      doctor: 'BS. Trần Thị Bình',
      department: 'Nội khoa - Tim mạch',
      diagnosis: 'Huyết áp cao nhẹ',
      status: 'completed',
      priority: 'normal',
      symptoms: ['Đau đầu nhẹ', 'Mệt mỏi', 'Chóng mặt'],
      vitalSigns: {
        bloodPressure: '140/90 mmHg',
        heartRate: '78 bpm',
        temperature: '36.5°C',
        weight: '68 kg',
        height: '165 cm'
      },
      prescription: [
        { name: 'Amlodipine 5mg', dosage: '1 viên/ngày', duration: '30 ngày' },
        { name: 'Aspirin 100mg', dosage: '1 viên/ngày', duration: '30 ngày' }
      ],
      labTests: ['Xét nghiệm máu tổng quát', 'Đo điện tim'],
      notes: 'Bệnh nhân cần theo dõi huyết áp hàng tuần, điều chỉnh chế độ ăn ít muối.',
      followUp: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      attachments: ['ECG_20241227.pdf', 'BloodTest_20241227.pdf']
    },
    {
      id: 'HS002',
      date: subDays(new Date(), 7),
      type: 'Xét nghiệm máu',
      doctor: 'BS. Lê Văn Cường',
      department: 'Xét nghiệm',
      diagnosis: 'Kết quả bình thường',
      status: 'completed',
      priority: 'normal',
      symptoms: [],
      vitalSigns: {},
      prescription: [],
      labTests: ['Sinh hóa máu', 'Lipid profile', 'HbA1c'],
      results: {
        glucose: { value: 95, unit: 'mg/dL', range: '70-100', status: 'normal' },
        cholesterol: { value: 180, unit: 'mg/dL', range: '<200', status: 'normal' },
        hba1c: { value: 5.8, unit: '%', range: '<6.0', status: 'normal' }
      },
      notes: 'Tất cả các chỉ số trong giới hạn bình thường. Tiếp tục duy trì lối sống lành mạnh.',
      followUp: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      attachments: ['LabResults_20241220.pdf']
    },
    {
      id: 'HS003',
      date: subDays(new Date(), 14),
      type: 'Siêu âm tim',
      doctor: 'BS. Phạm Thị Hoa',
      department: 'Chẩn đoán hình ảnh',
      diagnosis: 'Chức năng tim bình thường',
      status: 'completed',
      priority: 'high',
      symptoms: ['Đau ngực', 'Khó thở khi gắng sức'],
      vitalSigns: {
        bloodPressure: '135/85 mmHg',
        heartRate: '82 bpm'
      },
      prescription: [],
      labTests: ['Siêu âm tim', 'Đo điện tim'],
      notes: 'Siêu âm tim cho thấy chức năng tim hoạt động bình thường. Không có dấu hiệu bất thường về cấu trúc.',
      followUp: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      attachments: ['Echocardiogram_20241213.pdf', 'ECG_20241213.pdf']
    },
    {
      id: 'HS004',
      date: subDays(new Date(), 30),
      type: 'Khám da liễu',
      doctor: 'BS. Nguyễn Thị Mai',
      department: 'Da liễu',
      diagnosis: 'Viêm da cơ địa',
      status: 'completed',
      priority: 'normal',
      symptoms: ['Ngứa', 'Phát ban', 'Da khô'],
      vitalSigns: {},
      prescription: [
        { name: 'Kem Hydrocortisone 1%', dosage: 'Thoa 2 lần/ngày', duration: '14 ngày' },
        { name: 'Cetirizine 10mg', dosage: '1 viên/ngày', duration: '14 ngày' }
      ],
      labTests: [],
      notes: 'Tránh tiếp xúc với các chất gây dị ứng. Giữ da ẩm và sạch sẽ.',
      followUp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      attachments: ['SkinPhotos_20241127.jpg']
    }
  ];

  const categories = [
    { id: 'all', label: 'Tất cả', icon: FileText },
    { id: 'examination', label: 'Khám bệnh', icon: User },
    { id: 'lab', label: 'Xét nghiệm', icon: TestTube },
    { id: 'imaging', label: 'Chẩn đoán hình ảnh', icon: Activity },
    { id: 'prescription', label: 'Đơn thuốc', icon: Pill }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ xử lý';
      case 'in_progress':
        return 'Đang xử lý';
      default:
        return 'Không xác định';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    if (type.includes('Xét nghiệm')) return TestTube;
    if (type.includes('Siêu âm') || type.includes('Chẩn đoán')) return Activity;
    if (type.includes('Khám')) return User;
    return FileText;
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'examination' && record.type.includes('Khám')) ||
      (selectedCategory === 'lab' && record.type.includes('Xét nghiệm')) ||
      (selectedCategory === 'imaging' && (record.type.includes('Siêu âm') || record.type.includes('Chẩn đoán'))) ||
      (selectedCategory === 'prescription' && record.prescription.length > 0);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              {user?.role === 'patient' ? 'Hồ sơ y tế của tôi' : 'Quản lý hồ sơ y tế'}
            </h1>
            <p className="text-medical-600">
              {user?.role === 'patient' 
                ? 'Xem lịch sử khám bệnh và kết quả điều trị'
                : 'Quản lý hồ sơ bệnh án và lịch sử điều trị'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất PDF
            </button>
            {user?.role !== 'patient' && (
              <button className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo hồ sơ mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-medical-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tìm kiếm theo chẩn đoán, bác sĩ, loại khám..."
            />
          </div>
          
          <button className="btn-secondary inline-flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
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

      {/* Medical Records List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">
            Hồ sơ y tế ({filteredRecords.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Calendar className="w-4 h-4" />
            <span>Cập nhật gần nhất: {format(new Date(), 'dd/MM/yyyy', { locale: vi })}</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const TypeIcon = getTypeIcon(record.type);
            return (
              <div key={record.id} className="border border-medical-200 rounded-xl p-6 hover:shadow-soft transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                      <TypeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-medical-600">
                      {record.id}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-medical-900 mb-1">
                          {record.type}
                        </h3>
                        <p className="text-medical-600 mb-1">
                          Bác sĩ: {record.doctor} • {record.department}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-medical-500">
                          <Calendar className="w-4 h-4" />
                          <span>{format(record.date, 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                        <AlertCircle className={`w-4 h-4 ${getPriorityColor(record.priority)}`} />
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-medical-900">Chẩn đoán</h4>
                      </div>
                      <p className="text-medical-700">{record.diagnosis}</p>
                      {record.notes && (
                        <p className="text-sm text-medical-600 mt-2">{record.notes}</p>
                      )}
                    </div>

                    {/* Symptoms */}
                    {record.symptoms.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-medical-900 mb-2">Triệu chứng</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.symptoms.map((symptom, index) => (
                            <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vital Signs */}
                    {Object.keys(record.vitalSigns).length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-medical-900 mb-2">Sinh hiệu</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(record.vitalSigns).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg border border-medical-200 p-3 text-center">
                              <p className="text-xs text-medical-600 uppercase">{key}</p>
                              <p className="font-semibold text-medical-900">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Results */}
                    {record.results && (
                      <div className="mb-4">
                        <h4 className="font-medium text-medical-900 mb-2">Kết quả xét nghiệm</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Object.entries(record.results).map(([key, result]) => (
                            <div key={key} className="bg-white rounded-lg border border-medical-200 p-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-medical-900 uppercase">{key}</p>
                                {result.status === 'normal' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <p className={`font-semibold ${result.status === 'normal' ? 'text-green-600' : 'text-red-600'}`}>
                                {result.value} {result.unit}
                              </p>
                              <p className="text-xs text-medical-500">Bình thường: {result.range}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescription */}
                    {record.prescription.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-medical-900 mb-2">Đơn thuốc</h4>
                        <div className="space-y-2">
                          {record.prescription.map((med, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <Pill className="w-5 h-5 text-green-600" />
                              <div className="flex-1">
                                <p className="font-medium text-medical-900">{med.name}</p>
                                <p className="text-sm text-medical-600">{med.dosage} • {med.duration}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Tests */}
                    {record.labTests.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-medical-900 mb-2">Xét nghiệm đã thực hiện</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.labTests.map((test, index) => (
                            <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up */}
                    {record.followUp && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Tái khám:</span>
                          <span className="text-purple-700">
                            {format(record.followUp, 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {record.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-medical-900 mb-2">Tài liệu đính kèm</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((file, index) => (
                            <button key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700">{file}</span>
                              <Download className="w-4 h-4 text-gray-600" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-medical-100">
                      <div className="flex gap-2">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          Xem chi tiết
                        </button>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          In hồ sơ
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
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-medical-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-medical-900 mb-2">
              Không tìm thấy hồ sơ y tế
            </h3>
            <p className="text-medical-600">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có hồ sơ y tế nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordsPage;