import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Phone, CheckCircle, AlertCircle, Loader2, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from "../../admins-layout/contexts/Api";
import { format } from 'date-fns';
import ServiceSelectionModal from './ServiceSelectionModal';

// Component Spinner để hiển thị khi tải
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-10">
    {/* Đổi màu spinner về primary-600 */}
    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
    <p className="mt-4 text-gray-600">Đang tải thông tin bệnh nhân...</p>
  </div>
);

const AppointmentBooking = () => {
  const location = useLocation();
  const { medicalServiceId: initialMedicalServiceId } = location.state || {};

  // === KHAI BÁO STATE ===
  const [formData, setFormData] = useState({
    patientId: "",
    medicalServiceId: initialMedicalServiceId || "",
    appointmentDate: "",
    appointmentTime: "",
    fullName: "",
    phoneNumber: "",
  });

  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState();
  const [medicalServices, setMedicalServices] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [patientError, setPatientError] = useState(null);

  const [loading, setLoading] = useState(false); // Loading khi submit form
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  // Tính ngày hiện tại để dùng cho thuộc tính 'min'
    const today = new Date();
    // Định dạng thành YYYY-MM-DD
    const minDate = format(today, 'yyyy-MM-dd');

  // === LOGIC TẢI DỮ LIỆU ===

  // 1. Tải thông tin bệnh nhân (MỚI)
  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoadingPatient(true);
      setPatientError(null);
      try {
        const response = await api.get('/patients/accounts/me');
        if (response.data.status) {
          setPatientData(response.data.data);
        } else {
          toast.error(response.data.message || "Không thể tải thông tin bệnh nhân.");
          setPatientError(response.data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi kết nối khi tải thông tin bệnh nhân.");
        setPatientError("Lỗi kết nối máy chủ.");
      } finally {
        setIsLoadingPatient(false);
      }
    };

    fetchPatientData();
  }, []);

  // 2. Tự động điền vào form khi có dữ liệu bệnh nhân (MỚI)
  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        patientId: patientData.id,
        fullName: patientData.fullName,
        phoneNumber: patientData.account?.phoneNumber || "",
      }));
    }
  }, [patientData]);


  // 3. Tải danh sách chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/specialties`);
        const result = await res.json();
        if (res.ok && result.data) setSpecialties(result.data);
        else toast.error(result.message || "Không thể tải chuyên khoa");
      } catch {
        toast.error("Lỗi kết nối đến server (chuyên khoa)");
      }
    };
    fetchSpecialties();
  }, [API_BASE_URL]); // Thêm dependency

  // 4. Tải danh sách dịch vụ
  useEffect(() => {
    const fetchMedicalServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/medical-services`);
        const result = await res.json();
        if (res.ok && result.data) {
          setMedicalServices(result.data);
          // If an initial service ID was passed, find its specialty
          if (initialMedicalServiceId) {
            const selected = result.data.find(s => s.id === initialMedicalServiceId);
            if (selected) {
              setSelectedSpecialtyId(selected.specialtyId);
            }
          }
        } else toast.error(result.message || "Không thể tải dịch vụ");
      } catch {
        toast.error("Lỗi kết nối đến server (dịch vụ)");
      }
    };
    fetchMedicalServices();
  }, [API_BASE_URL, initialMedicalServiceId]);

  // === LOGIC XỬ LÝ FORM ===
  const openServiceSelectionModal = () => {
      setIsServiceModalOpen(true);
  };

   const handleSelectService = (selectedId) => {
       const selectedService = medicalServices.find(s => s.id === selectedId);
       if (selectedService) {
           setFormData(prev => ({ ...prev, medicalServiceId: selectedId }));
           setSelectedSpecialtyId(selectedService.specialtyId);
       }
       setIsServiceModalOpen(false); // Close the modal
   };
  // Cờ điều kiện (MỚI)
  const isNameUpdateRequired = useMemo(() => {
    // CẬP NHẬT: Sửa lại chuỗi theo code mới của bạn
    return patientData?.fullName === "Bệnh nhân chưa có tên";
  }, [patientData]);

  const isPhoneUpdateRequired = useMemo(() => {
    return !patientData?.account?.phoneNumber; // Check rỗng hoặc null
  }, [patientData]);
  
  // Cập nhật formData chung
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hàm Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { 
        ...formData,
        patientId: patientData.id
      };

      const response = await api.post("/staff/appointments", payload);
      
      if (!response.data.status) {
        toast.error(response.data.message);
        return;
      }

      // Nếu thành công
      toast.success(response.data.message || "Đặt lịch thành công!");

      // Reset form, nhưng giữ lại thông tin bệnh nhân
      setFormData({
        patientId: patientData.id,
        medicalServiceId: "",
        appointmentDate: "",
        appointmentTime: "",
        fullName: patientData.fullName,
        phoneNumber: patientData.account?.phoneNumber || "",
      });
      setSelectedSpecialtyId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đặt lịch.");
    } finally {
      setLoading(false);
    }
  };

  // === RENDER GIAO DIỆN ===

  // Get selected service details (name and cost)
  const selectedServiceDetails = useMemo(() => {
    if (!formData.medicalServiceId) return null;
    return medicalServices.find(s => s.id === formData.medicalServiceId);
  }, [formData.medicalServiceId, medicalServices]);

  const specialtyName = useMemo(() => {
    if (!selectedSpecialtyId) return "Vui lòng chọn một dịch vụ";
    return specialties.find(s => s.id === selectedSpecialtyId)?.name || "Đang tải...";
  }, [selectedSpecialtyId, specialties]);


  // Input style (MỚI) - Đổi màu focus về primary-500
  const inputStyle = "w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 shadow-sm";
  const labelStyle = "block text-sm font-medium text-gray-800 mb-2";

  return (
    // Đổi màu nền về bg-gray-50
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          {/* Đổi màu link về primary-600 */}
          <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="text-center mb-10">
            {/* Đổi màu icon Calendar về primary-600 */}
            <Calendar className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt Lịch Khám Bệnh</h1>
            <p className="text-gray-600">Vui lòng điền đầy đủ thông tin bên dưới.</p>
          </div>

          {isLoadingPatient ? (
            <LoadingSpinner />
          ) : patientError ? (
            <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">Không thể tải thông tin</p>
                <p className="text-red-600 text-sm">{patientError}</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Thông báo cập nhật thông tin (MỚI) */}
                {(isNameUpdateRequired || isPhoneUpdateRequired) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">Cập nhật thông tin</p>
                            <p className="text-sm text-yellow-700">
                                Vui lòng cập nhật thông tin cá nhân của bạn để tiếp tục đặt lịch.
                            </p>
                        </div>
                    </div>
                )}

                {/* Họ và tên (HIỂN THỊ CÓ ĐIỀU KIỆN) */}
                {isNameUpdateRequired && (
                  <div>
                    <label htmlFor="fullName" className={labelStyle}>Họ và tên</label>
                    <div className="relative">
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ và tên của bạn"
                          className={`${inputStyle} pl-10`} required />
                    </div>
                  </div>
                )}

                {/* Số điện thoại (HIỂN THỊ CÓ ĐIỀU KIỆN) */}
                {isPhoneUpdateRequired && (
                  <div>
                    <label htmlFor="phoneNumber" className={labelStyle}>Số điện thoại</label>
                    <div className="relative">
                        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Nhập số điện thoại"
                          className={`${inputStyle} pl-10`} required />
                    </div>
                  </div>
                )}
                
                {/* Chuyên khoa (Giao diện mới) */}
                <div>
                  <label className={labelStyle}>Chuyên khoa</label>
                  <p className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 shadow-sm">
                    {formData.medicalServiceId ? specialtyName : "Vui lòng chọn dịch vụ khám"}
                  </p>
                </div>

                {/* --- Dịch vụ khám (Display + Select Button) --- */}
                <div>
                  <label htmlFor="medicalServiceBtn" className={labelStyle}>Dịch vụ khám <span className="text-red-500">*</span></label>
                  {/* Display selected service name + button */}
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg bg-gray-50 px-4 py-2 shadow-sm">
                    <span className="text-gray-800 font-medium text-sm">
                       {selectedServiceDetails?.name || '-- Chọn dịch vụ --'}
                    </span>
                    <button
                        type="button" // Important: prevent form submission
                        id="medicalServiceBtn"
                        onClick={openServiceSelectionModal}
                        className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded hover:bg-blue-200 flex items-center gap-1"
                    >
                        <Edit2 className="w-3 h-3"/> Chọn
                    </button>
                  </div>
                  
                  {/* Hiển thị giá */}
                  {selectedServiceDetails && (
                    <p className="mt-2 text-sm text-gray-700">
                      {/* Đổi màu giá về primary-700 */}
                        Chi phí khám: <span className="font-semibold text-primary-700">{selectedServiceDetails.cost?.toLocaleString('vi-VN')} VND</span>
                    </p>
                  )}
                </div>

                {/* Ngày & Giờ */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="appointmentDate" className={labelStyle}>Ngày khám</label>
                        <input
                            type="date"
                            name="appointmentDate"
                            id="appointmentDate"
                            value={formData.appointmentDate}
                            onChange={handleChange}
                            min={minDate}
                            className={inputStyle}
                            required />
                    </div>
                    <div>
                        <label htmlFor="appointmentTime" className={labelStyle}>Giờ khám</label>
                        <select
                            name="appointmentTime"
                            id="appointmentTime"
                            value={formData.appointmentTime}
                            onChange={handleChange}
                            className={inputStyle}
                            required
                          >
                            <option value="" disabled>-- Chọn giờ khám --</option>
                            {/* Buổi Sáng */}
                            <option value="08:00:00">08:00 Sáng</option>
                            <option value="09:00:00">09:00 Sáng</option>
                            <option value="10:00:00">10:00 Sáng</option>
                            <option value="11:00:00">11:00 Sáng</option>
                            {/* Buổi Chiều */}
                            <option value="13:30:00">13:30 Chiều</option>
                            <option value="14:30:00">14:30 Chiều</option>
                            <option value="15:30:00">15:30 Chiều</option>
                            <option value="16:30:00">16:30 Chiều</option>
                          </select>
                    </div>
                </div>

                {/* Nút Submit */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    isLoadingPatient ||
                    !formData.medicalServiceId ||
                    !formData.appointmentDate ||
                    !formData.appointmentTime ||
                    (isNameUpdateRequired && !formData.fullName.trim()) ||
                    (isPhoneUpdateRequired && !formData.phoneNumber.trim())
                  }
                  className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <CheckCircle className="w-6 h-6 mr-2" />
                  )}
                  <span>{loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {isServiceModalOpen && (
          <ServiceSelectionModal
            isOpen={isServiceModalOpen}
            onClose={() => setIsServiceModalOpen(false)}
            services={medicalServices}
            specialties={specialties}
            onSelectService={handleSelectService}
            currentServiceId={formData.medicalServiceId}
          />
      )}
    </div>
  );
};

export default AppointmentBooking;
