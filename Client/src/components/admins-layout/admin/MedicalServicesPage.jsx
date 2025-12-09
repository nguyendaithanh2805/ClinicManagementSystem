import React, { useState, useEffect } from 'react';
import { 
  BriefcaseMedical, DollarSign, Plus, Edit, Trash2, X, List, Hash, 
  Tag, Save, Search, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";
import ConfirmationModal from "../ConfirmationModal";

const MedicalServicesPage = () => {
  const [services, setServices] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentService, setCurrentService] = useState(null); // Dịch vụ đang được thêm/sửa
  const [errors, setErrors] = useState({}); // State cho lỗi validation

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchSpecialties();
  }, []);

  /// <summary>
  /// Tải danh sách dịch vụ y tế từ API.
  /// </summary>
  const fetchServices = async () => {
    try {
      // Giả sử API trả về cấu trúc { status: true, data: [...] }
      const response = await api.get('/medical-services');
      if (response.data.status) {
        setServices(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách dịch vụ.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi kết nối máy chủ để tải dịch vụ.');
      console.error('Lỗi fetchServices:', error);
    }
  };

  /// <summary>
  /// Tải danh sách chuyên khoa từ API (dùng cho dropdown).
  /// </summary>
  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      if (response.data.status) {
        setSpecialties(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách chuyên khoa.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi kết nối máy chủ để tải chuyên khoa.');
      console.error('Lỗi fetchSpecialties:', error);
    }
  };

  /// <summary>
  /// Kiểm tra tính hợp lệ của dữ liệu form trước khi gửi.
  /// </summary>
  /// <returns>True nếu hợp lệ, False nếu có lỗi.</returns>
  const validateForm = () => {
    const newErrors = {};
    if (!currentService.name || currentService.name.trim() === '') {
      newErrors.name = "Tên dịch vụ là bắt buộc.";
    }
    if (!currentService.specialtyId || currentService.specialtyId === '') {
      newErrors.specialtyId = "Vui lòng chọn chuyên khoa.";
    }
    
    const cost = parseFloat(currentService.cost);
    if (isNaN(cost) || cost < 0) {
      newErrors.cost = "Chi phí phải là một số lớn hơn hoặc bằng 0.";
    } else if (currentService.cost === '' || currentService.cost === null) {
       newErrors.cost = "Chi phí là bắt buộc.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /// <summary>
  /// Mở modal ở chế độ "Thêm mới".
  /// </summary>
  const openAddModal = () => {
    setCurrentService({ name: '', specialtyId: '', cost: '' }); // Khởi tạo rỗng
    setModalMode('add');
    setErrors({});
    setIsModalOpen(true);
  };

  /// <summary>
  /// Mở modal ở chế độ "Chỉnh sửa" với dữ liệu của dịch vụ được chọn.
  /// </summary>
  /// <param name="service">Đối tượng dịch vụ cần sửa.</param>
  const openEditModal = (service) => {
    setCurrentService({ ...service }); // Sử dụng bản sao để tránh thay đổi trực tiếp
    setModalMode('edit');
    setErrors({});
    setIsModalOpen(true);
  };

  /// <summary>
  /// Đóng modal Thêm/Sửa và reset state.
  /// </summary>
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
    setErrors({});
  };

  /// <summary>
  /// Cập nhật state 'currentService' khi người dùng nhập liệu vào form.
  /// </summary>
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({ ...prev, [name]: value }));
  };

  /// <summary>
  /// Xử lý gửi form (Thêm mới hoặc Cập nhật) sau khi validate.
  /// </summary>
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn('Vui lòng kiểm tra lại thông tin đã nhập.');
      return;
    }

    const dataToSend = {
      ...currentService,
      specialtyId: parseInt(currentService.specialtyId),
      cost: parseFloat(currentService.cost)
    };
    
    // API body không cần Id khi thêm mới
    if (modalMode === 'add') {
      delete dataToSend.id;
    }

    try {
      let response;
      if (modalMode === 'add') {
        // Gọi API POST để thêm mới
        response = await api.post('/medical-services', dataToSend);
        toast.success(response.data.message || 'Thêm dịch vụ thành công!');
      } else {
        // Gọi API PUT để cập nhật
        response = await api.put(`/medical-services/${currentService.id}`, dataToSend);
        toast.success(response.data.message || 'Cập nhật dịch vụ thành công!');
      }

      if (response.data.status) {
        fetchServices(); // Tải lại danh sách
        closeModal(); // Đóng modal
      } else {
        toast.error(response.data.message || 'Thao tác thất bại.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu dịch vụ.');
      console.error('Lỗi handleSubmit:', error);
    }
  };

  /// <summary>
  /// Mở modal xác nhận xóa.
  /// </summary>
  /// <param name="service">Dịch vụ sẽ bị xóa.</param>
  const openConfirmDelete = (service) => {
    setServiceToDelete(service);
    setShowConfirmModal(true);
  };

  /// <summary>
  /// Xử lý gọi API xóa sau khi người dùng xác nhận.
  /// </summary>
  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      const response = await api.delete(`/medical-services/${serviceToDelete.id}`);
      if (response.status === 204) {
        toast.success('Xóa dịch vụ thành công!');
        fetchServices(); // Tải lại danh sách
      } else {
        toast.error('Xóa dịch vụ thất bại.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa dịch vụ.');
      console.error('Lỗi confirmDelete:', error);
    } finally {
      setShowConfirmModal(false);
      setServiceToDelete(null);
    }
  };

  /// <summary>
  /// Helper: Lấy tên chuyên khoa từ ID.
  /// </summary>
  const getSpecialtyName = (id) => {
    return specialties.find(s => s.id === id)?.name || 'Không xác định';
  };

  /// <summary>
  /// Lọc danh sách dịch vụ dựa trên thanh tìm kiếm.
  /// </summary>
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ y tế</h1>
      <p className="text-gray-500">Thêm, xóa, và chỉnh sửa các dịch vụ của phòng khám.</p>

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        {/* Thanh tìm kiếm và nút Thêm mới */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" /> Thêm dịch vụ mới
          </button>
        </div>

        {/* Bảng hiển thị danh sách dịch vụ */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên dịch vụ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên khoa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí (VNĐ)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {getSpecialtyName(service.specialtyId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.cost.toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-full transition-colors"
                        title="Sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openConfirmDelete(service)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Không có dịch vụ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Dịch vụ */}
      {isModalOpen && currentService && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-lg">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={closeModal}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              {modalMode === 'add' ? (
                <Plus className="w-6 h-6 text-blue-600" />
              ) : (
                <Edit className="w-6 h-6 text-yellow-600" />
              )}
              {modalMode === 'add' ? 'Thêm dịch vụ mới' : 'Cập nhật dịch vụ'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên dịch vụ */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên dịch vụ
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentService.name}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="VD: Khám tổng quát"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Chuyên khoa */}
              <div>
                <label htmlFor="specialtyId" className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên khoa
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BriefcaseMedical className="w-5 h-5 text-gray-400" />
                  </span>
                  <select
                    id="specialtyId"
                    name="specialtyId"
                    value={currentService.specialtyId}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.specialtyId ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 bg-white`}
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.specialtyId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.specialtyId}
                  </p>
                )}
              </div>

              {/* Chi phí */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Chi phí (VNĐ)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={currentService.cost}
                    onChange={handleFormChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.cost ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="VD: 300000"
                  />
                </div>
                 {errors.cost && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.cost}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  <Save className="w-5 h-5 mr-2" /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {showConfirmModal && (
        <ConfirmationModal
          message={`Bạn có chắc chắn muốn xóa dịch vụ "${serviceToDelete?.name}" không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmModal(false)}
          title="Xác nhận Xóa Dịch vụ"
          confirmText="Đồng ý Xóa"
          confirmColor="bg-red-600 hover:bg-red-700" // Làm cho nút xóa có màu đỏ
        />
      )}
    </div>
  );
};

export default MedicalServicesPage;