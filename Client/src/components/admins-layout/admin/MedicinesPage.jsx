import React, { useState, useEffect } from 'react';
import { 
  Pill, Plus, Edit, Trash2, X, List, Save, Search, AlertTriangle, 
  DollarSign, Tag, ClipboardList, Package, FileText, AlertOctagon, Share2
} from 'lucide-react';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api"; // Đảm bảo đường dẫn này đúng
import ConfirmationModal from "../ConfirmationModal"; // Đảm bảo đường dẫn này đúng

// Danh sách cố định cho đơn vị tính (Unit)
const MEDICINE_UNITS = [
  'Viên', 'Vỉ', 'Hộp', 'Lọ', 'Tuýp', 'Gói', 'Chai', 'ml', 'mg'
];

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentMedicine, setCurrentMedicine] = useState(null); 
  const [errors, setErrors] = useState({}); // State cho lỗi validation

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  /// <summary>
  /// Tải danh sách thuốc từ API.
  /// </summary>
  const fetchMedicines = async () => {
    try {
      const response = await api.get('/staff/medicines');
      if (response.data.status) {
        setMedicines(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách thuốc.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi kết nối máy chủ để tải thuốc.');
      console.error('Lỗi fetchMedicines:', error);
    }
  };

  /// <summary>
  /// Kiểm tra tính hợp lệ của dữ liệu form trước khi gửi.
  /// </summary>
  /// <returns>True nếu hợp lệ, False nếu có lỗi.</returns>
  const validateForm = () => {
    const newErrors = {};
    if (!currentMedicine.name || currentMedicine.name.trim() === '') {
      newErrors.name = "Tên thuốc là bắt buộc.";
    }
    if (!currentMedicine.category || currentMedicine.category.trim() === '') {
      newErrors.category = "Phân loại là bắt buộc.";
    }
    if (!currentMedicine.unit || currentMedicine.unit === '') {
      newErrors.unit = "Vui lòng chọn đơn vị tính.";
    }
    
    const price = parseFloat(currentMedicine.price);
    if (isNaN(price) || price < 0) {
      newErrors.price = "Giá phải là một số lớn hơn hoặc bằng 0.";
    } else if (currentMedicine.price === '' || currentMedicine.price === null) {
       newErrors.price = "Giá là bắt buộc.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /// <summary>
  /// Mở modal ở chế độ "Thêm mới".
  /// </summary>
  const openAddModal = () => {
    setCurrentMedicine({ 
      name: '', 
      category: '', 
      description: '', 
      unit: '', 
      contraindications: '', 
      interactions: '', 
      price: '' 
    });
    setModalMode('add');
    setErrors({});
    setIsModalOpen(true);
  };

  /// <summary>
  /// Mở modal ở chế độ "Chỉnh sửa" với dữ liệu của thuốc được chọn.
  /// </summary>
  /// <param name="medicine">Đối tượng thuốc cần sửa.</param>
  const openEditModal = (medicine) => {
    setCurrentMedicine({ ...medicine }); 
    setModalMode('edit');
    setErrors({});
    setIsModalOpen(true);
  };

  /// <summary>
  /// Đóng modal Thêm/Sửa và reset state.
  /// </summary>
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMedicine(null);
    setErrors({});
  };

  /// <summary>
  /// Cập nhật state 'currentMedicine' khi người dùng nhập liệu vào form.
  /// </summary>
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedicine(prev => ({ ...prev, [name]: value }));
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
      ...currentMedicine,
      price: parseFloat(currentMedicine.price),
      // Đảm bảo các trường optional là null nếu rỗng, thay vì ""
      description: currentMedicine.description?.trim() || null,
      contraindications: currentMedicine.contraindications?.trim() || null,
      interactions: currentMedicine.interactions?.trim() || null,
    };
    
    if (modalMode === 'add') {
      delete dataToSend.id;
    }

    try {
      let response;
      if (modalMode === 'add') {
        response = await api.post('/staff/medicines', dataToSend);
        toast.success(response.data.message || 'Thêm thuốc thành công!');
      } else {
        response = await api.put(`/staff/medicines/${currentMedicine.id}`, dataToSend);
        toast.success(response.data.message || 'Cập nhật thuốc thành công!');
      }

      if (response.data.status) {
        fetchMedicines(); 
        closeModal();
      } else {
        toast.error(response.data.message || 'Thao tác thất bại.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu thuốc.');
      console.error('Lỗi handleSubmit:', error);
    }
  };

  /// <summary>
  /// Mở modal xác nhận xóa.
  /// </summary>
  /// <param name="medicine">Thuốc sẽ bị xóa.</param>
  const openConfirmDelete = (medicine) => {
    setMedicineToDelete(medicine);
    setShowConfirmModal(true);
  };

  /// <summary>
  /// Xử lý gọi API xóa (DELETE) và xử lý response 204 No Content.
  /// </summary>
  const confirmDelete = async () => {
    if (!medicineToDelete) return;
    try {
      const response = await api.delete(`/staff/medicines/${medicineToDelete.id}`);

      // Xử lý thành công (bao gồm cả 204 No Content)
      // Nếu request thành công và không ném lỗi, ta coi là thành công.
      if (response.status === 204) {
        toast.success(`Đã xóa thuốc "${medicineToDelete.name}" thành công.`);
        fetchMedicines(); // Tải lại danh sách
      } else {
        // Fallback nếu API trả về JSON (dù bạn nói là 204)
         toast.success(response.data.message || 'Xóa thuốc thành công!');
         fetchMedicines();
      }

    } catch (error) {
      // Bắt lỗi (vd: 404, 500, hoặc lỗi mạng)
      toast.error(error.response?.data?.message || 'Lỗi khi xóa thuốc.');
      console.error('Lỗi confirmDelete:', error);
    } finally {
      setShowConfirmModal(false);
      setMedicineToDelete(null);
    }
  };

  /// <summary>
  /// Lọc danh sách thuốc dựa trên thanh tìm kiếm (theo Tên hoặc Phân loại).
  /// </summary>
  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý thuốc</h1>
      <p className="text-gray-500">Thêm, xóa, và chỉnh sửa thông tin thuốc trong kho.</p>

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        {/* Thanh tìm kiếm và nút Thêm mới */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm theo tên, phân loại..."
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
            <Plus className="w-5 h-5 mr-2" /> Thêm thuốc mới
          </button>
        </div>

        {/* Bảng hiển thị danh sách thuốc */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thuốc</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phân loại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá (VNĐ)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{med.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800">
                        {med.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-medium">{med.price.toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-full transition-colors"
                        title="Sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openConfirmDelete(med)}
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
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Không có thuốc nào trong kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Thuốc */}
      {isModalOpen && currentMedicine && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 z-10"
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
              {modalMode === 'add' ? 'Thêm thuốc mới' : 'Cập nhật thông tin thuốc'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Grid cho các trường chính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên thuốc */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thuốc (Bắt buộc)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={currentMedicine.name}
                      onChange={handleFormChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="VD: Paracetamol 500mg"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Phân loại */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Phân loại (Bắt buộc)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClipboardList className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={currentMedicine.category}
                      onChange={handleFormChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="VD: Thuốc giảm đau"
                    />
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> {errors.category}
                    </p>
                  )}
                </div>

                {/* Đơn vị tính (Dropdown) */}
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị (Bắt buộc)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="w-5 h-5 text-gray-400" />
                    </span>
                    <select
                      id="unit"
                      name="unit"
                      value={currentMedicine.unit}
                      onChange={handleFormChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.unit ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 bg-white`}
                    >
                      <option value="">-- Chọn đơn vị --</option>
                      {MEDICINE_UNITS.map(unit => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.unit && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> {errors.unit}
                    </p>
                  )}
                </div>
                
                {/* Giá */}
                <div className="col-span-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ) (Bắt buộc)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={currentMedicine.price}
                      onChange={handleFormChange}
                      min="0"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="VD: 50000"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> {errors.price}
                    </p>
                  )}
                </div>

                {/* Mô tả (Textarea) */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả (Không bắt buộc)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={currentMedicine.description || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả công dụng, thành phần..."
                  ></textarea>
                </div>

                {/* Chống chỉ định (Textarea) */}
                <div className="col-span-2">
                  <label htmlFor="contraindications" className="block text-sm font-medium text-gray-700 mb-1">
                    Chống chỉ định (Không bắt buộc)
                  </label>
                   <textarea
                    id="contraindications"
                    name="contraindications"
                    rows="3"
                    value={currentMedicine.contraindications || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Các trường hợp không nên dùng thuốc..."
                  ></textarea>
                </div>

                {/* Tương tác thuốc (Textarea) */}
                <div className="col-span-2">
                  <label htmlFor="interactions" className="block text-sm font-medium text-gray-700 mb-1">
                    Tương tác thuốc (Không bắt buộc)
                  </label>
                   <textarea
                    id="interactions"
                    name="interactions"
                    rows="3"
                    value={currentMedicine.interactions || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tương tác với các loại thuốc, thực phẩm khác..."
                  ></textarea>
                </div>
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
          message={`Bạn có chắc chắn muốn xóa thuốc "${medicineToDelete?.name}" không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmModal(false)}
          title="Xác nhận Xóa Thuốc"
          confirmText="Đồng ý Xóa"
          confirmColor="bg-red-600 hover:bg-red-700" 
        />
      )}
    </div>
  );
};

export default MedicinesPage;