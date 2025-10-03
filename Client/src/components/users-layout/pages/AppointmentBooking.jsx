import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { decodeJwt } from '../../../utils/jwtHelper'
import { toast } from 'react-toastify';
import api from "../../admins-layout/contexts/Api";

const AppointmentBooking = () => {
  // Nhận dữ liệu từ state của Service.jsx
  const location = useLocation();
  const { medicalServiceId } = location.state || {};
  
  const [formData, setFormData] = useState({
    patientId: "",
    medicalServiceId: medicalServiceId || "",
    appointmentDate: "",
    appointmentTime: "",
    fullName: "",
    phoneNumber: "",
  });

  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState();
  const [medicalServices, setMedicalServices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Lấy danh sách chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/specialties`);
        const result = await res.json();
        if (res.ok && result.data) setSpecialties(result.data);
        else setError(result.message || "Không thể tải chuyên khoa");
      } catch {
        setError("Lỗi kết nối đến server");
      }
    };
    fetchSpecialties();
  }, []);

  // Lấy danh sách dịch vụ
  useEffect(() => {
    const fetchMedicalServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/medical-services`);
        const result = await res.json();
        if (res.ok && result.data) {
          setMedicalServices(result.data);
          if (serviceId) {
            const selected = result.data.find(s => s.id === serviceId);
            if (selected) {
              setSelectedSpecialtyId(selected.specialtyId);
            }
          }
        } else setError(result.message || "Không thể tải dịch vụ");
      } catch {
        setError("Lỗi kết nối đến server");
      }
    };
    fetchMedicalServices();
  }, [medicalServiceId]);
   
  // Khi người dùng nhấn nút đặt lịch từ trang dịch vụ thì method này sẽ được gọi để lấy tên chuyên khoa
  useEffect(() => {
    if (medicalServiceId) {
      setFormData(prev => ({
        ...prev,
        medicalServiceId: medicalServiceId
      }));

      const selectedMedicalService = medicalServices.find(s => s.id === medicalServiceId);
      if (selectedMedicalService)
        setSelectedSpecialtyId(selectedMedicalService.specialtyId);
    }
  }, [medicalServiceId, medicalServices]) // medicalServices phải có trước

  // Khi chọn dịch vụ, tự động chọn chuyên khoa
  const handleMedicalServiceChange = (e) => {
    const medicalServiceId = Number(e.target.value);
    const selectedMedicalService = medicalServices.find(s => s.id === medicalServiceId);

    setFormData(prev => ({ ...prev, medicalServiceId }));
    if (selectedMedicalService) 
      setSelectedSpecialtyId(selectedMedicalService.specialtyId);
    else 
      setSelectedSpecialtyId(null);
  };
  // Cập nhật formData chung
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = JSON.parse(localStorage.getItem("clinic_user"))?.token;
      const decoded = decodeJwt(token);
      const payload = { ...formData, patientId: parseInt(decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'], 10) };

      const response = await api.post("/staff/appointments", payload);
      if (!response.data.status) {
        toast.error(response.data.message);
        return;
      }

      // Nếu thành công
      toast.success(response.data.message);

      setFormData({
        patientId: "",
        medicalServiceId: "",
        appointmentDate: "",
        appointmentTime: "",
        fullName: "",
        phoneNumber: "",
      });
      setSelectedSpecialtyId(null);
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt Lịch Khám</h1>
            <p className="text-gray-600">Chọn thời gian phù hợp với bạn</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Chuyên khoa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
                <p className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                  {specialties.find(s => s.id === selectedSpecialtyId)?.name || "Chưa chọn dịch vụ"}
                </p>
              </div>


              {/* Dịch vụ khám */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ khám</label>
                <select
                  name="medicalServiceId"
                  value={formData.medicalServiceId}
                  onChange={handleMedicalServiceChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {medicalServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                
                {/* Hiển thị giá */}
                {formData.medicalServiceId && (
                  <p className="mt-2 text-gray-700">
                    Giá: {medicalServices.find(s => s.id === formData.medicalServiceId)?.cost.toLocaleString()} VND
                  </p>
                )}
              </div>

              {/* Ngày & Giờ */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
                  <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giờ</label>
                  <select name="appointmentTime" value={formData.appointmentTime} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                    <option value="">-- Chọn giờ --</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              {/* Thông tin bệnh nhân */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-4 disabled:opacity-50">
                <Calendar className="w-5 h-5" />
                <span>{loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}</span>
              </button>
            </form>

            {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
