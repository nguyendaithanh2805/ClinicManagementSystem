import React, { useState, useEffect } from 'react';
import { 
  Users, BriefcaseMedical, Clock, Edit, X, Search, ChevronDown, UserCheck 
} from 'lucide-react';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api"; // Đảm bảo đường dẫn này đúng

// Định nghĩa các ca làm việc theo yêu cầu
const WORK_SHIFTS = [
  { value: 'Sáng', label: 'Ca Sáng' },
  { value: 'Chiều', label: 'Ca Chiều' },
  { value: 'Tối', label: 'Ca Tối' },
];

const StaffAssignmentPage = () => {
  const [staffs, setStaffs] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State cho các giá trị được chỉnh sửa trong modal
  const [editedSpecialtyId, setEditedSpecialtyId] = useState('');
  const [editedExpertise, setEditedExpertise] = useState('');

  useEffect(() => {
    fetchStaffs();
    fetchSpecialties();
  }, []);

  /// <summary>
  /// Tải danh sách tất cả nhân viên từ API.
  /// </summary>
  const fetchStaffs = async () => {
    try {
      const response = await api.get('/staff/staffs');
      if (response.data.status) {
        setStaffs(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách nhân viên.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách nhân viên.');
    }
  };

  /// <summary>
  /// Tải danh sách tất cả chuyên khoa từ API.
  /// </summary>
  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties'); // Giả sử dùng 'api' context giống fetchStaffs
      if (response.data.status) {
        setSpecialties(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách chuyên khoa.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách chuyên khoa.');
    }
  };

  /// <summary>
  /// Xử lý việc mở modal và thiết lập giá trị ban đầu để chỉnh sửa.
  /// </summary>
  /// <param name="staff">Đối tượng nhân viên được chọn.</param>
  const handleOpenModal = (staff) => {
    setSelectedStaff(staff);
    // Đặt giá trị mặc định cho modal từ 'staff'
    setEditedSpecialtyId(staff.specialtyId?.toString() || ''); // Đảm bảo là string cho select
    setEditedExpertise(staff.expertise || '');
    setIsModalOpen(true);
  };

  /// <summary>
  /// Xử lý đóng modal và reset các state chỉnh sửa.
  /// </summary>
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    setEditedSpecialtyId('');
    setEditedExpertise('');
  };

  /// <summary>
  /// Xử lý việc lưu thay đổi phân công (gọi API).
  /// </summary>
  const handleSaveAssignment = async () => {
    if (!selectedStaff) return;

    // Kiểm tra xem có thay đổi không
    const hasChanged = 
      editedSpecialtyId !== (selectedStaff.specialtyId?.toString() || '') ||
      editedExpertise !== (selectedStaff.expertise || '');

    if (!hasChanged) {
      toast.info("Không có thay đổi nào được thực hiện.");
      handleCloseModal();
      return;
    }

    // Chuẩn bị payload
    const payload = {
      Id: selectedStaff.id, // Gửi Id trong body như yêu cầu
      SpecialtyId: editedSpecialtyId ? parseInt(editedSpecialtyId) : null,
      Expertise: editedExpertise,
    };
    
    // Giả sử endpoint là PATCH /staff/staffs/assign/{id}
    // (tương tự logic update appointment)
    try {
      const response = await api.patch(`/staff/staffs/assign/${selectedStaff.id}`, payload);
      
      if (response.data.status) {
        toast.success(response.data.message || 'Cập nhật phân công thành công!');
        fetchStaffs(); // Tải lại danh sách nhân viên
        handleCloseModal(); // Đóng modal
      } else {
        toast.error(response.data.message || 'Cập nhật thất bại.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu phân công.');
      console.error('Lỗi khi lưu phân công:', error);
    }
  };

  /// <summary>
  /// Lấy tên chuyên khoa từ ID.
  /// </summary>
  const getSpecialtyName = (id) => {
    return specialties.find(s => s.id === id)?.name || 'Chưa phân khoa';
  };

  // Lọc nhân viên dựa trên searchTerm
  const filteredStaffs = staffs.filter(staff =>
    staff.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /// <summary>
  /// Component Card hiển thị thông tin tóm tắt của nhân viên.
  /// </summary>
  const StaffCard = ({ staff }) => (
    <div className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-shrink-0 flex flex-col items-center w-20">
        <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
          <UserCheck className="w-6 h-6 text-blue-600" />
        </div>
        <span className="mt-1.5 inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
          ID: {staff.id}
        </span>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {staff.fullName || 'Chưa có tên'}
          </h3>
          <button
            onClick={() => handleOpenModal(staff)}
            className="mt-2 sm:mt-0 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-200 flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Phân công
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <BriefcaseMedical className="w-4 h-4 text-gray-500" />
            <span>{getSpecialtyName(staff.specialtyId)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Ca: {staff.expertise || 'Chưa xếp ca'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phân công nhân viên</h1>
        <p className="text-gray-500">Quản lý chuyên khoa và ca làm việc cho nhân viên.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
          <h3 className="text-xl font-semibold text-gray-800">Danh sách nhân viên</h3>
          
          {/* Thanh tìm kiếm */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStaffs.length > 0 ? (
            filteredStaffs.map(staff => (
              <StaffCard key={staff.id} staff={staff} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Không tìm thấy nhân viên nào.</p>
          )}
        </div>

        {/* Không cần phân trang nếu danh sách nhân viên thường không quá lớn */}
      </div>

      {/* Modal Phân công */}
      {isModalOpen && selectedStaff && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={handleCloseModal}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              <Edit className="w-6 h-6 text-indigo-600" /> Phân công
            </h2>

            <div className="space-y-4 text-gray-700">
              {/* Tên nhân viên - Read-only */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold">Nhân viên:</label>
                <p className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-medium">
                  {selectedStaff.fullName}
                </p>
              </div>

              {/* Dropdown Chuyên khoa */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="specialty" className="font-semibold">Chuyên khoa:</label>
                <div className="relative">
                  <select
                    id="specialty"
                    value={editedSpecialtyId}
                    onChange={(e) => setEditedSpecialtyId(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Dropdown Ca làm việc (Expertise) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="expertise" className="font-semibold">Ca làm việc:</label>
                 <div className="relative">
                  <select
                    id="expertise"
                    value={editedExpertise}
                    onChange={(e) => setEditedExpertise(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Chọn ca làm việc --</option>
                    {WORK_SHIFTS.map(shift => (
                      <option key={shift.value} value={shift.value}>
                        {shift.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAssignment}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                <Edit className="w-5 h-5 mr-2" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAssignmentPage;