import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, Filter, Plus, Eye, Edit, Phone, Mail, Calendar, MapPin, FileText, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { format, subDays, subYears } from 'date-fns';
import { vi } from 'date-fns/locale';

const PatientsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patients = [
    {
      id: 'BN001',
      name: 'Nguyễn Văn An',
      dateOfBirth: subYears(new Date(), 45),
      gender: 'Nam',
      phone: '0901234567',
      email: 'nguyenvanan@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      lastVisit: subDays(new Date(), 3),
      nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      condition: 'Huyết áp cao',
      priority: 'high',
      insurance: 'BHYT',
      emergencyContact: {
        name: 'Nguyễn Thị Bình',
        relationship: 'Vợ',
        phone: '0912345678'
      },
      medicalHistory: [
        'Huyết áp cao (2020)',
        'Tiểu đường type 2 (2019)',
        'Cholesterol cao (2021)'
      ],
      allergies: ['Penicillin', 'Aspirin'],
      currentMedications: [
        'Amlodipine 5mg - 1 viên/ngày',
        'Metformin 500mg - 2 viên/ngày'
      ],
      vitalSigns: {
        bloodPressure: '140/90',
        heartRate: '78',
        temperature: '36.5',
        weight: '75',
        height: '170'
      }
    },
    {
      id: 'BN002',
      name: 'Trần Thị Mai',
      dateOfBirth: subYears(new Date(), 38),
      gender: 'Nữ',
      phone: '0912345678',
      email: 'tranthimai@email.com',
      address: '456 Đường DEF, Quận 3, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      lastVisit: subDays(new Date(), 7),
      nextAppointment: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      condition: 'Khám định kỳ',
      priority: 'normal',
      insurance: 'BHYT',
      emergencyContact: {
        name: 'Trần Văn Cường',
        relationship: 'Chồng',
        phone: '0923456789'
      },
      medicalHistory: [
        'Viêm dạ dày (2021)',
        'Thiếu máu (2020)'
      ],
      allergies: [],
      currentMedications: [
        'Iron supplement - 1 viên/ngày'
      ],
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: '72',
        temperature: '36.3',
        weight: '58',
        height: '160'
      }
    },
    {
      id: 'BN003',
      name: 'Lê Minh Tuấn',
      dateOfBirth: subYears(new Date(), 52),
      gender: 'Nam',
      phone: '0923456789',
      email: 'leminhtuanl@email.com',
      address: '789 Đường GHI, Quận 5, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      lastVisit: subDays(new Date(), 1),
      nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      condition: 'Tiểu đường',
      priority: 'urgent',
      insurance: 'Bảo hiểm tư nhân',
      emergencyContact: {
        name: 'Lê Thị Hoa',
        relationship: 'Vợ',
        phone: '0934567890'
      },
      medicalHistory: [
        'Tiểu đường type 2 (2018)',
        'Bệnh tim mạch (2020)',
        'Tăng cholesterol (2019)'
      ],
      allergies: ['Sulfa drugs'],
      currentMedications: [
        'Insulin - Theo chỉ định',
        'Metformin 1000mg - 2 viên/ngày',
        'Atorvastatin 20mg - 1 viên/ngày'
      ],
      vitalSigns: {
        bloodPressure: '145/95',
        heartRate: '85',
        temperature: '36.7',
        weight: '82',
        height: '175'
      }
    },
    {
      id: 'BN004',
      name: 'Phạm Thị Hoa',
      dateOfBirth: subYears(new Date(), 29),
      gender: 'Nữ',
      phone: '0934567890',
      email: 'phamthihoa@email.com',
      address: '321 Đường JKL, Quận 7, TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'inactive',
      lastVisit: subDays(new Date(), 30),
      nextAppointment: null,
      condition: 'Khám sức khỏe',
      priority: 'low',
      insurance: 'BHYT',
      emergencyContact: {
        name: 'Phạm Văn Nam',
        relationship: 'Anh trai',
        phone: '0945678901'
      },
      medicalHistory: [
        'Viêm họng mãn tính (2022)'
      ],
      allergies: [],
      currentMedications: [],
      vitalSigns: {
        bloodPressure: '115/75',
        heartRate: '68',
        temperature: '36.2',
        weight: '52',
        height: '155'
      }
    }
  ];

  const filters = [
    { id: 'all', label: 'Tất cả', count: patients.length },
    { id: 'active', label: 'Đang điều trị', count: patients.filter(p => p.status === 'active').length },
    { id: 'urgent', label: 'Khẩn cấp', count: patients.filter(p => p.priority === 'urgent').length },
    { id: 'today', label: 'Hẹn hôm nay', count: 2 },
    { id: 'inactive', label: 'Không hoạt động', count: patients.filter(p => p.status === 'inactive').length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === '' || 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'active' && patient.status === 'active') ||
      (selectedFilter === 'urgent' && patient.priority === 'urgent') ||
      (selectedFilter === 'inactive' && patient.status === 'inactive') ||
      (selectedFilter === 'today' && patient.nextAppointment && 
       format(patient.nextAppointment, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              Quản lý bệnh nhân
            </h1>
            <p className="text-medical-600">
              Quản lý thông tin và theo dõi tình trạng sức khỏe bệnh nhân
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-secondary inline-flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Xuất danh sách
            </button>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm bệnh nhân
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">{patients.length}</p>
              <p className="text-sm text-medical-600">Tổng bệnh nhân</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">
                {patients.filter(p => p.status === 'active').length}
              </p>
              <p className="text-sm text-medical-600">Đang điều trị</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">
                {patients.filter(p => p.priority === 'urgent').length}
              </p>
              <p className="text-sm text-medical-600">Khẩn cấp</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-medical-900">2</p>
              <p className="text-sm text-medical-600">Hẹn hôm nay</p>
            </div>
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
              placeholder="Tìm kiếm theo tên, mã BN, SĐT, tình trạng..."
            />
          </div>
          
          <button className="btn-secondary inline-flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedFilter === filter.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-medical-700 border border-medical-200 hover:bg-medical-50'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedFilter === filter.id
                  ? 'bg-white/20 text-white'
                  : 'bg-medical-100 text-medical-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Patients List */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-900">
            Danh sách bệnh nhân ({filteredPatients.length})
          </h2>
        </div>

        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="border border-medical-200 rounded-xl p-6 hover:shadow-soft transition-all duration-200">
              <div className="flex items-start gap-4">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-medical-900">
                          {patient.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                          {patient.status === 'active' ? 'Đang điều trị' : 'Không hoạt động'}
                        </span>
                        <div className={`flex items-center gap-1 ${getPriorityColor(patient.priority)}`}>
                          {getPriorityIcon(patient.priority)}
                          <span className="text-xs font-medium">
                            {patient.priority === 'urgent' ? 'Khẩn cấp' :
                             patient.priority === 'high' ? 'Ưu tiên cao' :
                             patient.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                          </span>
                        </div>
                      </div>
                      <p className="text-medical-600 mb-1">
                        Mã BN: {patient.id} • {calculateAge(patient.dateOfBirth)} tuổi • {patient.gender}
                      </p>
                      <p className="text-sm text-medical-500">
                        Tình trạng: {patient.condition}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-medical-600">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-medical-600">
                      <Mail className="w-4 h-4" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-medical-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-medical-900 mb-2">Sinh hiệu gần nhất</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-medical-600">Huyết áp:</span>
                            <span className="ml-1 font-medium">{patient.vitalSigns.bloodPressure} mmHg</span>
                          </div>
                          <div>
                            <span className="text-medical-600">Nhịp tim:</span>
                            <span className="ml-1 font-medium">{patient.vitalSigns.heartRate} bpm</span>
                          </div>
                          <div>
                            <span className="text-medical-600">Cân nặng:</span>
                            <span className="ml-1 font-medium">{patient.vitalSigns.weight} kg</span>
                          </div>
                          <div>
                            <span className="text-medical-600">Chiều cao:</span>
                            <span className="ml-1 font-medium">{patient.vitalSigns.height} cm</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-medical-900 mb-2">Thông tin khám</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-medical-600" />
                            <span className="text-medical-600">Khám gần nhất:</span>
                            <span className="font-medium">
                              {format(patient.lastVisit, 'dd/MM/yyyy', { locale: vi })}
                            </span>
                          </div>
                          {patient.nextAppointment && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-medical-600" />
                              <span className="text-medical-600">Hẹn tiếp theo:</span>
                              <span className="font-medium text-blue-600">
                                {format(patient.nextAppointment, 'dd/MM/yyyy', { locale: vi })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History & Medications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {patient.medicalHistory.length > 0 && (
                      <div>
                        <h4 className="font-medium text-medical-900 mb-2">Tiền sử bệnh</h4>
                        <div className="space-y-1">
                          {patient.medicalHistory.slice(0, 3).map((history, index) => (
                            <span key={index} className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs mr-1 mb-1">
                              {history}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {patient.currentMedications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-medical-900 mb-2">Thuốc đang dùng</h4>
                        <div className="space-y-1">
                          {patient.currentMedications.slice(0, 2).map((med, index) => (
                            <p key={index} className="text-sm text-medical-600">{med}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  {patient.allergies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-medical-900 mb-2">Dị ứng</h4>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            ⚠️ {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-medical-900 mb-1">Liên hệ khẩn cấp</h4>
                    <p className="text-sm text-medical-600">
                      {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) - {patient.emergencyContact.phone}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-medical-100">
                    <div className="flex gap-2">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Xem hồ sơ đầy đủ
                      </button>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Lịch sử khám
                      </button>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Đặt lịch hẹn
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-medical-600 hover:text-medical-900 hover:bg-medical-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-medical-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-medical-900 mb-2">
              Không tìm thấy bệnh nhân
            </h3>
            <p className="text-medical-600">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Chưa có bệnh nhân nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;