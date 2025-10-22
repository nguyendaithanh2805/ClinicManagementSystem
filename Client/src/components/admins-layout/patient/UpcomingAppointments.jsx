import React from 'react';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const UpcomingAppointments = ({ appointments }) => {
    // Hàm chuyển đổi status từ số sang text và màu sắc
    const getStatusInfo = (status) => {
        switch (status) {
            case 0: // Pending
                return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
            case 1: // Confirmed
                return { text: 'Đã xác nhận', color: 'bg-green-100 text-green-700 border-green-200' };
            case 2: // Cancelled
                return { text: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' };
            case 3: // Completed
                return { text: 'Đã hoàn thành', color: 'bg-blue-100 text-blue-700 border-blue-200' };
            default:
                return { text: 'Không xác định', color: 'bg-gray-100 text-gray-700 border-gray-200' };
        }
    };

    // Lọc các lịch hẹn sắp tới (status là Chờ xác nhận hoặc Đã xác nhận)
    // Sắp xếp theo ngày gần nhất và chỉ lấy 3 lịch hẹn đầu tiên
    const upcomingAppointments = appointments
        .filter(apt => {
            const appointmentDay = new Date(apt.appointmentDate);
            // Bỏ đi phần giờ, phút, giây để so sánh ngày chính xác
            appointmentDay.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Lịch hẹn phải từ hôm nay trở đi VÀ có trạng thái là 0 (chờ) hoặc 1 (xác nhận)
            return appointmentDay >= today && (apt.status === 0 || apt.status === 1);
        })
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 3);

    return (
        <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-medical-900">Lịch khám sắp tới</h2>
                <button className="btn-secondary text-sm">Xem tất cả</button>
            </div>

            <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => {
                        const statusInfo = getStatusInfo(appointment.status);
                        return (
                            <div key={appointment.id} className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-medical-900 mb-1">{appointment.staff.fullName}</h3>
                                                <p className="text-sm text-medical-600">{appointment.medicalService.name}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                            <div className="flex items-center gap-2 text-sm text-medical-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(new Date(appointment.appointmentDate), 'dd/MM/yyyy', { locale: vi })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-medical-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{appointment.appointmentTime.substring(0, 5)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-medical-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>Phòng khám</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-medical-600 py-8">Không có lịch hẹn nào sắp tới.</p>
                )}
            </div>
        </div>
    );
};

export default UpcomingAppointments;