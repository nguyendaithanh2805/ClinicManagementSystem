import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Stethoscope, User, FileText, Clock, CheckCircle,
  AlertTriangle, XCircle, Pill, Microscope, Info, BriefcaseMedical, TrendingUp, ChevronRight
} from 'lucide-react';
import { format, isToday, parseISO, isPast, addHours, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";

const DoctorDashboard = () => {
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [recentMedicalRecords, setRecentMedicalRecords] = useState([]);
  const [pendingTestResults, setPendingTestResults] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchAppointmentsToday(),
          fetchRecentMedicalRecords(),
          fetchDashboardStats()
        ]);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        toast.error("Lỗi khi tải dữ liệu dashboard.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAppointmentsToday = async () => {
    try {
      const response = await api.get('/staff/appointments/me');
      if (response.data.status) {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        const filtered = response.data.data.filter(apt => {
          const aptDate = parseISO(apt.appointmentDate);
          // Chỉ lấy lịch hẹn Đã xác nhận (1) hoặc Hoàn thành (3)
          return (apt.status === 1 || apt.status === 3) && aptDate >= startOfToday && aptDate <= endOfToday;
        }).sort((a, b) => {
          // Sắp xếp theo thời gian
          const timeA = parseTimeToDate(a.appointmentTime, a.appointmentDate);
          const timeB = parseTimeToDate(b.appointmentTime, b.appointmentDate);
          return timeA.getTime() - timeB.getTime();
        });
        setAppointmentsToday(filtered);
      } else {
        toast.error(response.data.message || 'Không thể tải lịch hẹn hôm nay.');
      }
    } catch (error) {
      toast.error('Lỗi khi tải lịch hẹn hôm nay.');
      console.error('Lỗi khi lấy lịch hẹn hôm nay:', error);
    }
  };

  const fetchRecentMedicalRecords = async () => {
    try {
      const response = await api.get('/staff/medical-records/me');
      if (response.data.status) {
        // Sắp xếp theo thời gian tạo giảm dần và lấy 5 bản ghi mới nhất
        const sortedRecords = response.data.data
          .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime())
          .slice(0, 5);
        setRecentMedicalRecords(sortedRecords);
      } else {
        toast.error(response.data.message || 'Không thể tải hồ sơ bệnh án gần đây.');
      }
    } catch (error) {
      toast.error('Lỗi khi tải hồ sơ bệnh án gần đây.');
      console.error('Lỗi khi lấy hồ sơ bệnh án gần đây:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Ví dụ: Lấy tổng số bệnh nhân
      const patientsResponse = await api.get('/staff/patients');
      if (patientsResponse.data.status) {
        setTotalPatients(patientsResponse.data.data.length);
      }

      // Ví dụ: Đếm số bệnh án yêu cầu xét nghiệm chưa có kết quả (giả định)
      // Trong thực tế, bạn sẽ cần một endpoint API cụ thể để lấy dữ liệu này
      const recordsResponse = await api.get('/staff/medical-records/me');
      if (recordsResponse.data.status) {
        const recordsNeedingTest = recordsResponse.data.data.filter(
          record => record.requiresTest && (!record.testResults || record.testResults.length === 0)
        ).length;
        setPendingTestResults(recordsNeedingTest);
      }

    } catch (error) {
      console.error('Lỗi khi lấy thống kê dashboard:', error);
    }
  };

  const parseTimeToDate = (timeString, dateString) => {
    // timeString ví dụ "09:00"
    // dateString ví dụ "2023-10-27T00:00:00"
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = parseISO(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Chờ xác nhận';
      case 1: return 'Đã xác nhận';
      case 2: return 'Đã hủy';
      case 3: return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-700'; // Pending
      case 1: return 'bg-green-100 text-green-700';   // Confirmed
      case 2: return 'bg-red-100 text-red-700';      // Cancelled
      case 3: return 'bg-blue-100 text-blue-700';     // Completed
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAppointmentStatusIcon = (status) => {
    switch (status) {
      case 1: return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 3: return <Stethoscope className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Xin chào, Bác sĩ!</h1>
      <p className="text-gray-600 mb-8">Tổng quan hoạt động phòng khám của bạn hôm nay.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<CalendarDays className="w-8 h-8 text-blue-600" />}
          title="Lịch hẹn hôm nay"
          value={appointmentsToday.length}
          description="Các cuộc hẹn đã xác nhận/hoàn thành"
          color="blue"
        />
        <StatCard
          icon={<User className="w-8 h-8 text-green-600" />}
          title="Tổng số bệnh nhân"
          value={totalPatients}
          description="Số lượng bệnh nhân trong hệ thống"
          color="green"
        />
        <StatCard
          icon={<Microscope className="w-8 h-8 text-orange-600" />}
          title="Cần kết quả xét nghiệm"
          value={pendingTestResults}
          description="Hồ sơ bệnh án yêu cầu xét nghiệm"
          color="orange"
        />
        <StatCard
          icon={<FileText className="w-8 h-8 text-purple-600" />}
          title="Hồ sơ gần đây"
          value={recentMedicalRecords.length}
          description="Bản ghi bệnh án mới nhất"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch hẹn hôm nay */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" /> Lịch hẹn hôm nay
          </h2>
          {appointmentsToday.length > 0 ? (
            <ul className="space-y-4">
              {appointmentsToday.map(apt => (
                <li key={apt.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-shrink-0 mr-4">
                    {getAppointmentStatusIcon(apt.status)}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">
                      {apt.patient?.fullName || 'Bệnh nhân ẩn danh'} - {apt.medicalService?.name || 'Dịch vụ không rõ'}
                    </p>
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" /> {apt.appointmentTime}
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { /* Navigate to appointment detail or open modal */ toast.info(`Xem chi tiết lịch hẹn ${apt.id}`); }}
                    className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    title="Xem chi tiết"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-8 italic">
              Không có lịch hẹn đã xác nhận hoặc hoàn thành nào trong hôm nay.
            </div>
          )}
        </div>

        {/* Hồ sơ bệnh án gần đây */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" /> Hồ sơ Bệnh án Gần đây
          </h2>
          {recentMedicalRecords.length > 0 ? (
            <ul className="space-y-4">
              {recentMedicalRecords.map(record => (
                <li key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">
                      {record.patient?.fullName || 'Bệnh nhân ẩn danh'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Chẩn đoán: {record.diagnosis ? (record.diagnosis.length > 30 ? record.diagnosis.substring(0, 30) + '...' : record.diagnosis) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {record.createdAt && format(parseISO(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                  <button
                    onClick={() => { /* Navigate to medical record detail or open modal */ toast.info(`Xem chi tiết hồ sơ ${record.id}`); }}
                    className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    title="Xem chi tiết"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-8 italic">
              Không có hồ sơ bệnh án gần đây nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for Stat Cards
const StatCard = ({ icon, title, value, description, color }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 border-l-4 border-${color}-400`}>
    <div className={`p-3 rounded-full bg-${color}-100`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

export default DoctorDashboard;