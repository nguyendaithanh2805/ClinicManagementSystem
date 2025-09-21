import React, { useState, useEffect } from "react";
import { X, Calendar, Save } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PatientFormModal = ({
  isOpen,
  onClose,
  patientData,
  onSaveSuccess,
  userToken,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    dateOfBirth: null, // Sử dụng Date object
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (patientData) {
      // Nếu có patientData, điền vào form để chỉnh sửa
      setFormData({
        id: patientData.id,
        fullName: patientData.fullName || "",
        phoneNumber: patientData.phoneNumber || "",
        email: patientData.email || "",
        address: patientData.address || "",
        dateOfBirth: patientData.dateOfBirth
          ? new Date(patientData.dateOfBirth)
          : null,
        gender: patientData.gender || "",
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        username: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        dateOfBirth: null,
        gender: "",
      });
    }
  }, [patientData, isOpen]); // Reset hoặc điền lại khi patientData hoặc modal mở thay đổi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      ...formData,
      // Chuyển Date object sang chuỗi ISO 8601 hoặc định dạng mong muốn cho API
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.toISOString().split("T")[0]
        : null,
    };

    const method = patientData ? "PATCH" : "POST";
    const url = patientData
      ? `${API_BASE_URL}/staff/patients/${patientData.id}`
      : `${API_BASE_URL}/staff/patients`;

    try {
      const response = await api[method](url, dataToSend);

      if (response.data.status) {
        toast.success(response.data.message);
        onSaveSuccess(); // Làm mới danh sách
        onClose(); // Đóng modal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu bệnh nhân:", error);
      toast.error(error.response?.data?.message || "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-lg relative border border-gray-200"> {/* Thêm border */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition" // Nút đóng đẹp hơn
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4"> {/* Tiêu đề có border dưới */}
          {patientData ? "Cập nhật thông tin bệnh nhân" : "Thêm bệnh nhân mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chỉ hiển thị khi thêm mới bệnh nhân */}
          {!patientData && (
            <>
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="username123"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên đầy đủ */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1"> {/* Label đẹp hơn */}
                Tên đầy đủ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" // Input đẹp hơn
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            {/* Số điện thoại */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0987654321"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="email@example.com"
              />
            </div>
            {/* Ngày sinh */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <div className="relative">
                <DatePicker
                  id="dateOfBirth"
                  selected={formData.dateOfBirth}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày sinh"
                  className="form-input w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" // Input cho DatePicker
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  calendarClassName="custom-datepicker-calendar" // Thêm class để tùy chỉnh calendar
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Địa chỉ */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
              />
            </div>
          </div>

          {/* Nút lưu */}
          <div className="flex justify-end pt-4 border-t mt-6"> {/* Thêm border top và margin */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition" // Nút primary đẹp hơn
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {loading
                ? patientData
                  ? "Đang cập nhật..."
                  : "Đang thêm..."
                : patientData
                ? "Cập nhật bệnh nhân"
                : "Thêm bệnh nhân"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormModal;