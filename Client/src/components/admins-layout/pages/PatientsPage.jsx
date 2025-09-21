import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../../admins-layout/contexts/Api";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  UserCircle,
  Trash,
  Edit,
  Calendar, 
} from "lucide-react";
import { toast } from 'react-toastify';
import PatientFormModal from "./PatientFormModal";

const PatientsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal xác nhận xoá
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Modal thêm/sửa bệnh nhân
  const [showPatientFormModal, setShowPatientFormModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null); // Lưu thông tin bệnh nhân để chỉnh sửa

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Lay danh sach benh nhan
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/staff/patients`);

      if (response.data.status) {
        setPatients(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi fetch patients:", error.message);
      toast.error("Lỗi kết nối server khi tải bệnh nhân.");
    } finally {
      setLoading(false);
    }
  }, [user.token, API_BASE_URL]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Xoa benh nhan
  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/staff/patients/${id}`);

      if (res.status == 204) {
        setPatients((prev) => prev.filter((p) => p.id !== id));
        toast.success("Xoá bệnh nhân thành công!");
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      toast.error(err.response?.data?.message || "Không thể kết nối server");
    } finally {
      setPatientToDelete(null); // Đóng modal xác nhận
    }
  };

  const handleAddPatientClick = () => {
    setPatientToEdit(null); // Đảm bảo là chế độ thêm mới
    setShowPatientFormModal(true);
  };

  const handleEditPatientClick = (patient) => {
    setPatientToEdit(patient); // Truyền dữ liệu bệnh nhân để chỉnh sửa
    setShowPatientFormModal(true);
  };

  const handleSavePatientSuccess = () => {
    fetchPatients(); // Tải lại danh sách bệnh nhân sau khi thêm/sửa thành công
  };

  const filteredPatients = patients.filter(
    (p) =>
      searchTerm === "" ||
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toString().includes(searchTerm) ||
      p.phoneNumber?.includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p className="text-center text-primary-600">Đang tải dữ liệu bệnh nhân...</p>;
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bệnh nhân</h1>
          <p className="text-gray-500">Theo dõi danh sách và thông tin chi tiết</p>
        </div>
        <button
          onClick={handleAddPatientClick}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm bệnh nhân
        </button>
      </div>

      {/* Search */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Tìm kiếm theo tên, mã BN, SĐT, email..."
          />
        </div>
      </div>

      {/* Patients list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition relative"
          >
            {/* Nút sửa và xoá */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleEditPatientClick(p)}
                className="text-primary-500 hover:text-primary-700"
                title="Chỉnh sửa"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPatientToDelete(p)}
                className="text-red-500 hover:text-red-700"
                title="Xoá"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>


            {/* Avatar */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleEditPatientClick(p)}>
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold flex-shrink-0">
                {p.fullName ? p.fullName.charAt(0).toUpperCase() : <UserCircle className="w-8 h-8"/>}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {p.fullName || "Chưa có tên"}
                </h3>
                <p className="text-sm text-gray-500">Mã BN: {p.id}</p>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500" />
                {p.phoneNumber || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500" />
                {p.email || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                {p.address || "Chưa cập nhật"}
              </div>
              {p.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  {new Date(p.dateOfBirth).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Không tìm thấy bệnh nhân</h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Thử đổi từ khóa tìm kiếm"
                : "Chưa có bệnh nhân nào trong hệ thống"}
            </p>
          </div>
        )}
      </div>

      {/* Modal xác nhận xoá */}
      {patientToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Xác nhận xoá
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xoá bệnh nhân{" "}
              <span className="font-semibold">{patientToDelete.fullName}</span> (ID:{" "}
              {patientToDelete.id}) không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(patientToDelete.id)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa bệnh nhân */}
      <PatientFormModal
        isOpen={showPatientFormModal}
        onClose={() => setShowPatientFormModal(false)}
        patientData={patientToEdit} // Truyền dữ liệu bệnh nhân nếu là chỉnh sửa
        onSaveSuccess={handleSavePatientSuccess}
        userToken={user.token}
      />
    </div>
  );
};

export default PatientsPage;