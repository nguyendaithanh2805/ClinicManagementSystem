import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText, Search, Filter, Download, Eye, Calendar, User, CalendarDays, Heart, TestTube, Pill, AlertCircle, CheckCircle, Stethoscope,
  Info, ListTodo, ClipboardCheck, Microscope, X, Clock, XCircle, CircleCheckBig, UserCheck, UserX, BriefcaseMedical
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import api from "../../admins-layout/contexts/Api";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import PrintableMedicalRecord from '../pages/PrintableMedicalRecord'; // Đảm bảo đúng đường dẫn
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDbUtcToVnTime } from "../../../utils/dateFormatter";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const [activeTabDetail, setActiveTabDetail] = useState('summary');
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Thêm ref cho vùng render PDF ẩn
  const pdfPrintAreaRef = useRef(null);

  // --- TOÀN BỘ HÀM HELPER VÀ LOGIC ---
  const getStatusColorClass = (status) => {
    switch (status) {
      case false: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case true: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case false: return 'Chưa hoàn thành';
      case true: return 'Đã hoàn thành';
    }
  };
  
  // <summary>
  /// Trả về chuỗi mô tả trạng thái TÁI KHÁM.
  /// </summary>
  /// <param name="revisitStatus">Mã trạng thái (0, 1, 2).</param>
  /// <returns>Chuỗi mô tả.</returns>
  const getRevisitStatusText = (revisitStatus) => {
    switch (revisitStatus) {
      case 1: return 'Tái khám';
      case 2: return 'Hoàn thành tái khám';
    }
  };

  /// <summary>
  /// Trả về các lớp CSS Tailwind cho badge TÁI KHÁM.
  /// </summary>
  /// <param name="revisitStatus">Mã trạng thái (0, 1, 2).</param>
  /// <returns>Chuỗi các lớp CSS.</returns>
  const getRevisitStatusColorClass = (revisitStatus) => {
    switch (revisitStatus) {
      case 1: return 'bg-purple-100 text-purple-700 border-purple-200'; // Cần tái khám
      case 2: return 'bg-green-100 text-green-700 border-green-200';   // Đã hoàn thành
    }
  };
  
  const getAppointmentStatusText = (status) => {
    switch (status) {
      case 0: return 'Chờ xác nhận';
      case 1: return 'Đã xác nhận';
      case 2: return 'Bệnh nhân đã đến';
      case 3: return 'Đang khám';
      case 4: return 'Đã hoàn thành';
      case 5: return 'Đã hủy';
      case 6: return 'Không đến';
      default: return 'Không xác định';
    }
  };

  const getAppointmentStatusColorClass = (status) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pending
      case 1: return 'bg-green-100 text-green-700 border-green-200';   // Confirmed
      case 2: return 'bg-cyan-100 text-cyan-700 border-cyan-200';     // CheckedIn
      case 3: return 'bg-indigo-100 text-indigo-700 border-indigo-200'; // InProgress
      case 4: return 'bg-blue-100 text-blue-700 border-blue-200';      // Completed
      case 5: return 'bg-red-100 text-red-700 border-red-200';        // Cancelled
      case 6: return 'bg-gray-100 text-gray-700 border-gray-200';      // NoShow
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAppointmentStatusIcon = (status) => {
  switch (status) {
    case 0: return <AlertTriangle className="w-4 h-4 text-yellow-500" />; // Chờ xác nhận
    case 1: return <CheckCircle className="w-4 h-4 text-green-500" />;   // Đã xác nhận
    case 2: return <UserCheck className="w-4 h-4 text-cyan-500" />;     // Bệnh nhân đã đến
    case 3: return <Stethoscope className="w-4 h-4 text-indigo-500" />; // Đang khám
    case 4: return <CircleCheckBig className="w-4 h-4 text-blue-500" />;    // Đã hoàn thành
    case 5: return <XCircle className="w-4 h-4 text-red-500" />;        // Đã hủy
    case 6: return <UserX className="w-4 h-4 text-gray-500" />;         // Không đến
    default: return <Info className="w-4 h-4 text-gray-500" />;         // Không xác định
  }
};

  useEffect(() => {
      // Kiểm tra xem có state openRecordId được gửi đến không
      if (location.state?.openRecordId) {
        // Nếu có, set searchTerm bằng ID đó (chuyển sang String)
        setSearchTerm(String(location.state.openRecordId));
        
        // Xóa state khỏi location để khi người dùng
        // refresh trang, nó không tự động tìm kiếm lại ID đó.
        navigate(location.pathname, { replace: true, state: {} });
      }
  }, [location, navigate]);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const response = await api.get('/patients/medical-records/me');
        if (response.data.status) {
          const formattedRecords = response.data.data.map(record => ({
            id: record.id,
            date: parseISO(record.createAt),
            type: record.diagnosis,
            doctor: record.staff?.fullName,
            department: record.staff?.expertise,
            diagnosis: record.diagnosis,
            symptoms: record.symptoms || [],
            prescriptions: record.prescriptions || [],
            labTests: record.testResults || [],
            notes: record.treatmentMethod,
            patientName: record.patient?.fullName,
            patientDob: record.patient?.dateOfBirth,
            patientAddress: record.patient?.address,
            patientEmail: record.patient?.account?.email,
            requiresTest: record.requiresTest,
            staff: record.staff,
            createAt: record.createAt,
            treatmentMethod: record.treatmentMethod,
            appointments: Array.isArray(record.appointments) ? record.appointments : [],
            status: record.status
          }));
          setMedicalRecords(formattedRecords);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Không thể tải hồ sơ bệnh án. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  const getTypeIcon = (type) => {
    if (type.toLowerCase().includes('viêm dạ dày') || type.toLowerCase().includes('huyết áp') || type.toLowerCase().includes('khám')) return Stethoscope;
    if (type.toLowerCase().includes('xét nghiệm') || type.toLowerCase().includes('test')) return TestTube;
    return FileText;
  };

  const filteredRecords = medicalRecords.filter(record => {
    const lowercasedSearchTerm = searchTerm.toLowerCase().trim();

    const matchesSearch = searchTerm === '' ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(record.id).includes(lowercasedSearchTerm);;

    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'examination' && record.prescriptions.length === 0) ||
      (selectedCategory === 'prescription' && record.prescriptions.length > 0);

    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (record) => {
    console.log(record)
    setSelectedRecordDetail(record);
    setActiveTabDetail('summary');
  };

  const handleExportPdf = async (recordToExport) => {
    if (!recordToExport) {
      alert("Không có hồ sơ để xuất PDF.");
      return;
    }

    // Tạo một div ẩn để render component in
    let printAreaElement = document.getElementById('hidden-print-area');
    if (!printAreaElement) {
      printAreaElement = document.createElement('div');
      printAreaElement.id = 'hidden-print-area';
      printAreaElement.style.position = 'absolute';
      printAreaElement.style.left = '-9999px'; // Đẩy ra ngoài màn hình
      printAreaElement.style.width = '210mm'; // Đảm bảo đúng kích thước A4
      document.body.appendChild(printAreaElement);
    }

    const root = ReactDOM.createRoot(printAreaElement);
    root.render(React.createElement(PrintableMedicalRecord, { record: recordToExport }));

    // Đợi một chút để React render và trình duyệt tải tài nguyên
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(printAreaElement, {
          scale: 2, // Tăng scale để ảnh nét hơn
          useCORS: true, // Quan trọng để tải ảnh từ nguồn khác domain
          allowTaint: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: printAreaElement.offsetWidth,
          windowHeight: printAreaElement.offsetHeight,
          imageTimeout: 15000,
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = 210; // Chiều rộng A4 tính bằng mm
        const pageHeight = 297; // Chiều cao A4 tính bằng mm
        const imgHeight = canvas.height * imgWidth / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position = - (imgHeight - heightLeft);
          }
        }

        pdf.save(`Ho_so_benh_an_${recordToExport.patientName || 'BN'}_${format(recordToExport.date, 'dd_MM_yyyy')}.pdf`);

      } catch (pdfError) {
        console.error("Lỗi khi xuất PDF:", pdfError);
        alert("Không thể xuất PDF. Vui lòng thử lại. Lỗi: " + pdfError.message);
      } finally {
        root.unmount(); // Dọn dẹp root React
        document.body.removeChild(printAreaElement); // Xóa element ẩn
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-medical-600">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang tải hồ sơ bệnh án...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-red-600">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-bold mb-2">Lỗi</h3>
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="glass-effect rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              Quản lý hồ sơ bệnh án của bạn
            </h1>
            <p className="text-medical-600 text-sm">
              Xem lịch sử khám bệnh và kết quả điều trị của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-medical-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-medical-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Tìm kiếm theo chẩn đoán, bác sĩ, loại khám..."
            />
          </div>

          <button className="btn-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-medical-200 bg-white text-medical-700 hover:bg-medical-50 transition-colors">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-xl font-bold text-medical-900">
            Hồ sơ bệnh án ({filteredRecords.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-medical-600">
            <Calendar className="w-4 h-4" />
            <span>Cập nhật gần nhất: {format(new Date(), 'dd/MM/yyyy', { locale: vi })}</span>
          </div>
        </div>

        <div className="space-y-4">
  { filteredRecords.map((record) => {
      // --- Lấy thông tin lịch hẹn liên kết ---
      const linkedAppointment = record.appointments?.find(
        apt => apt.patientMedicalRecordId === record.id
      );
      const linkedAppointmentStatus = linkedAppointment?.status;
      const revisitText = getRevisitStatusText(linkedAppointment?.revisit);

      return (
        // --- BẮT ĐẦU Cấu trúc JSX mới ---
        <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row items-start gap-4">

          {/* Cột trái: Icon + Mã HS */}
          <div className="flex-shrink-0 flex flex-col items-center w-16 text-center pt-1">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-1.5">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-gray-200">
              HS: {record.id || 'N/A'}
            </span>
          </div>

          {/* Cột phải: Nội dung chính */}
          <div className="flex-1 w-full">
            {/* Hàng trên: Tên, Trạng thái, Nút Xem */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-tight mb-1"> {/* Tăng cỡ chữ */}
                  {record.patient?.fullName || "Bệnh nhân chưa có tên"}
                </h3>
                {/* Nhóm trạng thái */}
                <div className="flex items-center gap-2 flex-wrap">
                  {linkedAppointment ? (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${getAppointmentStatusColorClass(linkedAppointmentStatus)} bg-opacity-80`}
                    >
                      Lịch hẹn: {getAppointmentStatusText(linkedAppointmentStatus)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">
                      Lịch hẹn: K.liên kết
                    </span>
                  )}
                  {linkedAppointment && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${getRevisitStatusColorClass(linkedAppointment?.revisit)}`}
                    >
                      {getRevisitStatusText(linkedAppointment?.revisit)}
                    </span>
                  )}
                </div>
              </div>
              {/* Nút Xem chi tiết */}
              <button
                onClick={() => handleViewDetails(record)}
                className="mt-2 sm:mt-0 px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 flex items-center gap-1 whitespace-nowrap shadow-sm hover:shadow" // Cập nhật style nút
              >
                <Eye className="w-3.5 h-3.5" /> Xem chi tiết
              </button>
            </div>

            {/* Khối thông tin màu xám */}
            <div className="bg-gray-50 border border-gray-100 rounded-md p-3 space-y-1.5 text-sm"> {/* Giảm space-y */}
              {/* Dịch vụ khám*/}
              <p className="text-gray-700 flex items-center gap-1.5">
                <BriefcaseMedical className="w-4 h-4 text-gray-500 flex-shrink-0" /> {/* Đổi màu icon */}
                <span className="font-medium text-gray-500 min-w-[60px]">Dịch vụ:</span> {/* Thêm min-width */}
                <span className="text-gray-800">{linkedAppointment?.medicalService?.name || 'N/A'}</span>
              </p>
              {/* Bác sĩ */}
              <p className="text-gray-700 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-gray-500 flex-shrink-0" /> {/* Đổi màu icon */}
                <span className="font-medium text-gray-500 min-w-[60px]">Bác sĩ:</span> {/* Thêm min-width */}
                <span className="text-gray-800">{record.staff?.fullName || 'N/A'}</span>
              </p>
              {/* Chẩn đoán */}
              <div className="flex items-start gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" /> {/* Đổi màu icon */}
                <span className="font-medium text-gray-500 min-w-[60px]">Chẩn đoán:</span> {/* Thêm min-width */}
                <span className="text-gray-800 line-clamp-2">{record.diagnosis || 'Chưa có'}</span> {/* Thêm line-clamp */}
              </div>
              {/* Điều trị (có thể ẩn nếu không cần thiết) */}
              {record.treatmentMethod && (
                 <div className="flex items-start gap-1.5">
                   <ListTodo className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" /> {/* Đổi màu icon */}
                   <span className="font-medium text-gray-500 min-w-[60px]">Điều trị:</span> {/* Thêm min-width */}
                   <span className="text-gray-800 line-clamp-2">{record.treatmentMethod}</span> {/* Thêm line-clamp */}
                 </div>
              )}
              {/* Ngày tạo HS */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Ngày tạo HS:</span>
                <span>{formatDbUtcToVnTime(record.createAt)}</span>
              </div>
            </div>

            {/* Hàng dưới: Trạng thái HSBA + Nút Xuất PDF */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getStatusColorClass(record.status)}`}>
                HS: {getStatusText(record.status)}
              </span>
              <button
                  onClick={(e) => { e.stopPropagation(); handleExportPdf(record); }} // Ngăn click vào card cha
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 p-1 rounded hover:bg-green-50"
              >
                  <Download className="w-3.5 h-3.5" /> Xuất PDF
              </button>
            </div>
          </div>
        </div>
        // --- KẾT THÚC Cấu trúc JSX mới ---
      );
    })
  }
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-medical-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-medical-900 mb-2">
              Không tìm thấy hồ sơ bệnh án
            </h3>
            <p className="text-medical-600">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bạn chưa có hồ sơ bệnh án nào.'}
            </p>
          </div>
        )}
      </div>

      {selectedRecordDetail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => {
                setSelectedRecordDetail(null);
                setActiveTabDetail('summary');
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
              <TabButton icon={<Info className="w-5 h-5" />} label="Tổng quan" isActive={activeTabDetail === 'summary'} onClick={() => setActiveTabDetail('summary')} />
              <TabButton icon={<Pill className="w-5 h-5" />} label="Đơn thuốc" isActive={activeTabDetail === 'prescriptions'} onClick={() => setActiveTabDetail('prescriptions')} />
              <TabButton icon={<ListTodo className="w-5 h-5" />} label="Triệu chứng" isActive={activeTabDetail === 'symptoms'} onClick={() => setActiveTabDetail('symptoms')} />
              <TabButton icon={<Microscope className="w-5 h-5" />} label="Kết quả xét nghiệm" isActive={activeTabDetail === 'testResults'} onClick={() => setActiveTabDetail('testResults')} />
              <TabButton icon={<Stethoscope className="w-5 h-5" />} label="Bác sĩ điều trị" isActive={activeTabDetail === 'staff'} onClick={() => setActiveTabDetail('staff')} />
              <TabButton icon={<CalendarDays className="w-4 h-4" />} label="Lịch hẹn" isActive={activeTabDetail === 'appointments'} onClick={() => setActiveTabDetail('appointments')} />
            </div>

            <div className="py-4">
              {activeTabDetail === 'summary' && (
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" /> Chi tiết Hồ sơ Bệnh án
                  </h2>
                  <DetailItem icon={<User className="w-5 h-5 text-blue-500" />} label="Bệnh nhân">
                    <p>{selectedRecordDetail.patientName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Ngày sinh: {selectedRecordDetail.patientDob ? format(parseISO(selectedRecordDetail.patientDob), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Địa chỉ: {selectedRecordDetail.patientAddress || 'N/A'}</p>
                  </DetailItem>
                  <DetailItem icon={<ClipboardCheck className="w-5 h-5 text-green-500" />} label="Chẩn đoán">
                    <p className="whitespace-pre-wrap">{selectedRecordDetail.diagnosis || 'N/A'}</p>
                  </DetailItem>
                  <DetailItem icon={<ListTodo className="w-5 h-5 text-indigo-500" />} label="Phương pháp điều trị">
                    <p className="whitespace-pre-wrap">{selectedRecordDetail.treatmentMethod || 'N/A'}</p>
                  </DetailItem>
                  <DetailItem icon={<Info className="w-5 h-5 text-orange-500" />} label="Yêu cầu xét nghiệm">
                    <p>{selectedRecordDetail.requiresTest ? 'Có' : 'Không'}</p>
                  </DetailItem>
                </div>
              )}

              {activeTabDetail === 'prescriptions' && (
                <div className="space-y-4">
                  {selectedRecordDetail.prescriptions && selectedRecordDetail.prescriptions.length > 0 ? (
                    selectedRecordDetail.prescriptions.map((prescription, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2 border-b pb-2">
                          <CalendarDays className="w-5 h-5 text-emerald-600" /> Đơn thuốc ngày {
                            prescription.prescriptionDate && isValid(parseISO(prescription.prescriptionDate))
                              ? formatInTimeZone(parseISO(prescription.prescriptionDate), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm', { locale: vi })
                              : 'N/A'
                          }
                        </h4>
                        <div className="space-y-3 pl-2 border-l-2 border-emerald-200 ml-1">
                          {prescription.prescriptionDetails && prescription.prescriptionDetails.length > 0 ? (
                            prescription.prescriptionDetails.map((detail, detIndex) => (
                              <div key={detIndex} className="border-t border-gray-100 pt-3 mt-3 first:border-t-0 first:pt-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between group py-2">
                                  <div className="text-sm text-gray-700 flex-1">
                                    <p className="font-semibold text-base md:text-lg text-gray-900 mb-1 flex items-center gap-2">
                                      <Pill className="w-5 h-5 text-purple-600" />
                                      {detail.medicine?.name} (<span className="text-blue-600 font-normal">{detail.medicine?.category}</span>)
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-4 pl-7 text-gray-600">
                                      <p>Liều lượng: <span className="font-medium">{detail.dosage}</span></p>
                                      <p>Tần suất: <span className="font-medium">{detail.frequency}</span></p>
                                      <p>Số lượng: <span className="font-medium">{detail.quantity} {detail.medicine?.unit || 'viên'}</span></p>
                                      <p className="col-span-full">Giá: <span className="font-medium text-green-700">{detail.amount?.toLocaleString('vi-VN')} VNĐ</span></p>
                                      {detail.medicine?.description && <p className="text-xs text-gray-500 col-span-full">Mô tả: {detail.medicine.description}</p>}
                                      {detail.medicine?.contraindications && <p className="text-xs text-red-500 col-span-full">Chống chỉ định: {detail.medicine.contraindications}</p>}
                                      {detail.medicine?.interactions && <p className="text-xs text-orange-500 col-span-full">Tương tác thuốc: {detail.medicine.interactions}</p>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4 italic">Không có chi tiết đơn thuốc nào trong đơn này.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Không có đơn thuốc nào.</p>
                  )}
                </div>
              )}
              {activeTabDetail === 'symptoms' && (
                <div className="space-y-4">
                  {selectedRecordDetail.symptoms && selectedRecordDetail.symptoms.length > 0 ? (
                    <ul className="list-none pl-0 text-gray-700 space-y-2">
                      {selectedRecordDetail.symptoms.map((symptom) => (
                        <li key={symptom.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <span className="flex items-center gap-3 text-base">
                            <ListTodo className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <span className="font-medium text-gray-800">{symptom.name}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4 italic">Không có triệu chứng nào được ghi nhận.</p>
                  )}
                </div>
              )}

              {activeTabDetail === 'testResults' && (
                <div className="space-y-4">
                  {selectedRecordDetail.labTests && selectedRecordDetail.labTests.length > 0 ? (
                    selectedRecordDetail.labTests.map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                          <Microscope className="w-5 h-5 text-cyan-600" /> Kết quả xét nghiệm: {result.name || 'N/A'}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700 pl-7 border-l-2 border-cyan-200 ml-1 pt-1">
                          <p>Mô tả: <span className="font-medium">{result.description || 'N/A'}</span></p>
                          <p>Thực hiện bởi: <span className="font-medium">{result.staff?.fullName || 'N/A'}</span> (<span className="text-gray-600">{result.staff?.expertise || 'Kỹ thuật viên'}</span>)</p>
                          <p>Ngày thực hiện: <span className="font-medium">{result.createdAt && isValid(parseISO(result.createdAt)) ? format(parseISO(result.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</span></p>
                          {result.image ? (
                            <div>
                              <p className="font-medium mt-2">Hình ảnh:</p>
                              <ResultImage
                                  src={`${IMAGE_URL}/${result.image}`}
                                  alt={`Kết quả ${result.name}`}
                                  onViewFull={openFullScreenImage}
                                />
                            </div>
                          ) : (
                            <p className="font-medium mt-2 text-gray-500 italic">Không có hình ảnh kết quả xét nghiệm.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 italic">Không có kết quả xét nghiệm nào.</p>
                  )}
                </div>
              )}
              {fullScreenImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
                  <div className="relative max-w-full max-h-full">
                    <button
                      className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-100 transition-all duration-200"
                      onClick={closeFullScreenImage}
                      title="Đóng ảnh"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <img
                      src={fullScreenImage}
                      alt="Full Screen Result"
                      className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              )}
              {activeTabDetail === 'staff' && (
                <div className="space-y-4">
                  {selectedRecordDetail.staff ? (
                    <DetailItem icon={<Stethoscope className="w-5 h-5 text-purple-500" />} label="Bác sĩ điều trị">
                      <p className="font-medium text-lg text-gray-900">{selectedRecordDetail.staff.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Chuyên môn: <span className="font-medium">{selectedRecordDetail.staff.expertise || 'N/A'}</span></p>
                      <p className="text-sm text-gray-600">Email: <span className="font-medium">{selectedRecordDetail.staff.account?.email || 'N/A'}</span></p>
                      <p className="text-sm text-gray-600">Số điện thoại: <span className="font-medium">{selectedRecordDetail.staff.account?.phoneNumber || 'N/A'}</span></p>
                    </DetailItem>
                  ) : (
                    <p className="text-center text-gray-500 py-4 italic">Không có thông tin bác sĩ điều trị.</p>
                  )}
                </div>
              )}
              {activeTabDetail === 'appointments' && (
             <div className="space-y-4">
              {selectedRecordDetail.appointments && selectedRecordDetail.appointments.length > 0 ? (
                selectedRecordDetail.appointments
                  .sort(
                    (a, b) =>
                      parseISO(b.appointmentDate).getTime() -
                        parseISO(a.appointmentDate).getTime() ||
                      a.appointmentTime.localeCompare(b.appointmentTime)
                  )
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                          {getAppointmentStatusIcon ? (
                            getAppointmentStatusIcon(apt.status)
                          ) : (
                            <CalendarDays className="w-4 h-4 text-blue-600" />
                          )}
                          <span>{apt.medicalService?.name || 'Lịch hẹn'}</span>
                          <span className="text-gray-400 font-normal text-xs">
                            (Mã LH: {apt.id})
                          </span>
                        </h4>
                        {/* Nhóm trạng thái */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {apt && getAppointmentStatusText && getAppointmentStatusColorClass ? (
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getAppointmentStatusColorClass(
                                apt.status
                              )} bg-opacity-80`}
                            >
                              {getAppointmentStatusText(apt.status)}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">
                              N/A
                            </span>
                          )}

                          {(apt?.revisit === 1 || apt?.revisit === 2) && (
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getRevisitStatusColorClass(
                                apt?.revisit
                              )}`}
                            >
                              {getRevisitStatusText(apt?.revisit)}
                            </span>
                          )}
                            </div>

                      </div>

                      {/* Details */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p className="flex items-center gap-2 text-gray-700 sm:col-span-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-600 w-20">Bệnh nhân:</span>
                          <span className="text-gray-900 font-semibold">
                            {selectedRecordDetail.patient?.fullName || 'N/A'}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-gray-700">
                          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-600 w-20">Ngày:</span>
                          <span className="text-gray-900">
                            {format(parseISO(apt.appointmentDate), 'dd/MM/yyyy')}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-600 w-20">Giờ:</span>
                          <span className="text-gray-900">
                            {apt.appointmentTime.substring(0, 5)}
                          </span>
                        </p>

                        {apt.staff && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <Stethoscope className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="font-medium text-gray-600 w-20">Bác sĩ:</span>
                            <span className="text-gray-900 font-medium">
                              {apt.staff.fullName}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
               ) : (
                 <p className="text-center text-sm text-gray-500 py-4 italic">Không có lịch hẹn nào liên kết với hồ sơ bệnh án này.</p>
               )}
             </div>
          )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedRecordDetail(null);
                  setActiveTabDetail('summary');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200
      ${isActive ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
    `}
    onClick={onClick}
  >
    {icon} {label}
  </button>
);

const DetailItem = ({ icon, label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-3 border-b border-gray-100 pb-3 last:border-b-0">
    <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
      {icon}
      <strong className="font-semibold">{label}:</strong>
    </div>
    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
      {children}
    </div>
  </div>
);

function ResultImage({ src, alt, onViewFull }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="mt-2 p-4 bg-gray-100 text-gray-500 italic rounded">
        Không thể tải ảnh ({alt}).
      </div>
    );
  }

  return (
    <div className="mt-2">
      <img
        src={src}
        alt={alt}
        crossorigin="anonymous"
        className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 object-cover max-h-32 w-48 cursor-pointer transform hover:scale-105 transition-transform duration-200"
        onError={() => setError(true)}
        onClick={() => onViewFull(src)}
      />
      <button
        onClick={() => onViewFull(src)}
        className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
      >
        <Eye className="w-4 h-4" /> Xem ảnh
      </button>
    </div>
  );
}

export default MedicalRecordsPage;