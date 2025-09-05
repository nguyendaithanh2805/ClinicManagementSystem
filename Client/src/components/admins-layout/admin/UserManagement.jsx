import React, { useState } from 'react';
import { Users, Plus, Search, MoreVertical, Shield, UserCheck, UserX } from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 1,
      name: 'BS. Trần Thị Bình',
      email: 'doctor@clinic.com',
      role: 'doctor',
      status: 'active',
      lastLogin: '2 giờ trước',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Y tá Lê Thị Cẩm',
      email: 'nurse@clinic.com',
      role: 'nurse',
      status: 'active',
      lastLogin: '1 giờ trước',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Lễ tân Nguyễn Thị Dung',
      email: 'receptionist@clinic.com',
      role: 'receptionist',
      status: 'active',
      lastLogin: '30 phút trước',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'KTV. Phạm Văn Minh',
      email: 'lab_tech@clinic.com',
      role: 'lab_technician',
      status: 'active',
      lastLogin: '45 phút trước',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Nguyễn Văn An',
      email: 'patient@clinic.com',
      role: 'patient',
      status: 'inactive',
      lastLogin: '1 ngày trước',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'doctor':
        return 'bg-blue-100 text-blue-700';
      case 'nurse':
        return 'bg-green-100 text-green-700';
      case 'receptionist':
        return 'bg-orange-100 text-orange-700';
      case 'lab_technician':
        return 'bg-teal-100 text-teal-700';
      case 'patient':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'doctor':
        return 'Bác sĩ';
      case 'nurse':
        return 'Y tá';
      case 'receptionist':
        return 'Lễ tân';
      case 'lab_technician':
        return 'KTV Xét nghiệm';
      case 'patient':
        return 'Bệnh nhân';
      default:
        return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? (
      <UserCheck className="w-4 h-4 text-green-600" />
    ) : (
      <UserX className="w-4 h-4 text-red-600" />
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-medical-900">Quản lý người dùng</h2>
        <button className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm mới
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medical-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-medical-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          placeholder="Tìm kiếm người dùng..."
        />
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-medical-200 hover:shadow-soft transition-all duration-200">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-medical-900 text-sm">{user.name}</p>
                {getStatusIcon(user.status)}
              </div>
              <p className="text-xs text-medical-600 mb-1">{user.email}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}>
                  {getRoleText(user.role)}
                </span>
                <span className="text-xs text-medical-500">
                  Đăng nhập: {user.lastLogin}
                </span>
              </div>
            </div>
            
            <button className="p-1 text-medical-400 hover:text-medical-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">
              {users.filter(u => u.status === 'active').length}
            </p>
            <p className="text-xs text-medical-600">Đang hoạt động</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">
              {users.filter(u => u.role !== 'patient').length}
            </p>
            <p className="text-xs text-medical-600">Nhân viên</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">
              {users.filter(u => u.role === 'patient').length}
            </p>
            <p className="text-xs text-medical-600">Bệnh nhân</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;