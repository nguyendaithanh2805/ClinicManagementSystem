import React from 'react';
import { Calendar, FileText, Phone, CreditCard, MessageCircle, MapPin } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: Calendar,
      label: 'Đặt lịch khám',
      description: 'Đặt lịch hẹn với bác sĩ',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Đặt lịch khám')
    },
    {
      icon: FileText,
      label: 'Xem hồ sơ',
      description: 'Hồ sơ y tế chi tiết',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('Xem hồ sơ')
    },
    {
      icon: CreditCard,
      label: 'Thanh toán',
      description: 'Thanh toán viện phí',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Thanh toán')
    },
    {
      icon: Phone,
      label: 'Liên hệ',
      description: 'Gọi tổng đài hỗ trợ',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Liên hệ')
    },
    {
      icon: MessageCircle,
      label: 'Tư vấn online',
      description: 'Chat với bác sĩ',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      action: () => console.log('Tư vấn online')
    },
    {
      icon: MapPin,
      label: 'Chỉ đường',
      description: 'Đường đến phòng khám',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => console.log('Chỉ đường')
    }
  ];

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-bold text-medical-900 mb-6">Thao tác nhanh</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="group p-4 bg-white rounded-xl border border-medical-200 hover:shadow-soft transition-all duration-200 text-left"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 transition-colors`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-medical-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">
              {action.label}
            </h3>
            <p className="text-xs text-medical-600">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-medical-200">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-medical-900 text-sm">Cần hỗ trợ khẩn cấp?</p>
              <p className="text-xs text-medical-600">Gọi hotline: 1900-1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;