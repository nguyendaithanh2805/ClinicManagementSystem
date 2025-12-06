import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit, Trash2, X, Save, Search, AlertTriangle, 
  User, KeyRound, Mail, Phone, UserCheck, ShieldCheck
} from 'lucide-react';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api"; // Đảm bảo đường dẫn này đúng
import ConfirmationModal from "../ConfirmationModal"; // Đảm bảo đường dẫn này đúng

const AccountsPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [rolesList, setRolesList] = useState([]); // State mới để lưu roles
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentAccount, setCurrentAccount] = useState(null); 
  const [errors, setErrors] = useState({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  useEffect(() => {
    fetchAccounts();
    fetchRoles(); // Gọi API lấy roles
  }, []);

  /// <summary>
  /// Tải danh sách tài khoản/nhân viên từ API.
  /// </summary>
  const fetchAccounts = async () => {
    try {
      const response = await api.get('/staff/staffs/list'); 
      if (response.data.status) {
        setStaffList(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách tài khoản.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi kết nối máy chủ.');
      console.error('Lỗi fetchAccounts:', error);
    }
  };

  /// <summary>
  /// Tải danh sách vai trò (roles) từ API và lọc bỏ 'Admin'.
  /// </summary>
  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      if (response.data.status) {
        // Lọc bỏ quyền "Admin" khỏi danh sách chọn
        const filteredRoles = response.data.data.filter(
          role => role.name.toLowerCase() !== 'admin'
        );
        setRolesList(filteredRoles);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách quyền.');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách quyền.');
       console.error('Lỗi fetchRoles:', error);
    }
  };

  /// <summary>
  /// Validate email dùng regex đơn giản.
  /// </summary>
  const isValidEmail = (email) => {
    if (!email) return true; // Email là optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /// <summary>
  /// Kiểm tra tính hợp lệ của form (dựa trên payload mới).
  /// </summary>
  /// <returns>True nếu hợp lệ, False nếu có lỗi.</returns>
  const validateForm = () => {
    const newErrors = {};
    if (!currentAccount.username || currentAccount.username.trim() === '') {
      newErrors.username = "Tên đăng nhập là bắt buộc.";
    }
    if (!currentAccount.roleId || currentAccount.roleId === '') {
      newErrors.roleId = "Vui lòng chọn quyền cho tài khoản.";
    }

    if (modalMode === 'add' && (!currentAccount.password || currentAccount.password === '')) {
      newErrors.password = "Mật khẩu là bắt buộc khi tạo mới.";
    }
    
    if (currentAccount.email && !isValidEmail(currentAccount.email)) {
       newErrors.email = "Định dạng email không hợp lệ.";
    }
    
    // FullName, PhoneNumber là optional (string?) nên không cần validate bắt buộc

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /// <summary>
  /// Mở modal "Thêm mới" với state rỗng (theo payload mới).
  /// </summary>
  const openAddModal = () => {
    setCurrentAccount({ 
      username: '', 
      password: '', 
      fullName: '', 
      email: '', 
      phoneNumber: '',
      roleId: '',
      accountId: null
    });
    setModalMode('add');
    setErrors({});
    setIsModalOpen(true);
  };

  /// <summary>
  /// Mở modal "Chỉnh sửa" (Làm phẳng dữ liệu lồng, thêm roleId).
  /// </summary>
  /// <param name="staff">Đối tượng staff (lồng) từ API.</param>
  const openEditModal = (staff) => {
    setCurrentAccount({ 
      id: staff.id, // ID của Staff
      fullName: staff.fullName,
      accountId: staff.accountId,
      username: staff.account?.username || '',
      email: staff.account?.email || '',
      phoneNumber: staff.account?.phoneNumber || '',
      roleId: staff.account?.roleId?.toString() || '', // Lấy roleId từ account
      password: ''
    }); 
    setModalMode('edit');
    setErrors({});
    setIsModalOpen(true);
  };

  /// <summary>
  /// Đóng modal Thêm/Sửa.
  /// </summary>
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAccount(null);
    setErrors({});
  };

  /// <summary>
  /// Cập nhật state 'currentAccount' khi người dùng nhập liệu.
  /// </summary>
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccount(prev => ({ ...prev, [name]: value }));
  };

  /// <summary>
  /// Xử lý gửi form (Thêm/Sửa) với payload mới.
  /// </summary>
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn('Vui lòng kiểm tra lại thông tin đã nhập.');
      return;
    }

    const API_ENDPOINT = '/staff/staffs'; 

    try {
      let response;
      let dataToSend;

      if (modalMode === 'add') {
        dataToSend = {
          username: currentAccount.username,
          password: currentAccount.password,
          roleId: parseInt(currentAccount.roleId),
          fullName: currentAccount.fullName?.trim() || null,
          email: currentAccount.email?.trim() || null,
          phoneNumber: currentAccount.phoneNumber?.trim() || null,
        };
        
        response = await api.post(API_ENDPOINT, dataToSend);
        toast.success(response.data.message || 'Tạo tài khoản thành công!');
      } else {
        dataToSend = {
          Id: currentAccount.id,
          AccountId: currentAccount.accountId,
          Email: currentAccount.email?.trim() || null,
          PhoneNumber: currentAccount.phoneNumber?.trim() || null,
        };
        
        // Gửi PUT đến /staff/staffs/{id} (id của staff)
        response = await api.put(`${API_ENDPOINT}/${currentAccount.id}`, dataToSend);
        toast.success(response.data.message || 'Cập nhật tài khoản thành công!');
      }

      if (response.data.status) {
        fetchAccounts(); 
        closeModal();
      } else {
        toast.error(response.data.message || 'Thao tác thất bại.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu tài khoản.');
      console.error('Lỗi handleSubmit:', error);
    }
  };

  /// <summary>
  /// Mở modal xác nhận xóa.
  /// </summary>
  const openConfirmDelete = (account) => {
    setAccountToDelete(account);
    setShowConfirmModal(true);
  };

  /// <summary>
  /// Xử lý gọi API xóa (DELETE 204).
  /// </summary>
  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      const response = await api.delete(`/staff/staffs/${accountToDelete.id}`);

      if (response.status === 204) {
        toast.success(`Đã xóa tài khoản "${accountToDelete.account?.username}" thành công.`);
        fetchAccounts(); 
      } else {
         toast.success(response.data.message || 'Xóa tài khoản thành công!');
         fetchAccounts();
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa tài khoản.');
    } finally {
      setShowConfirmModal(false);
      setAccountToDelete(null);
    }
  };
  
  /// <summary>
  /// Helper: Lấy tên Quyền (Role) từ roleId.
  /// </summary>
  const getRoleName = (roleId) => {
     // Tìm trong danh sách roles đã fetch về (không bao gồm Admin)
     let role = rolesList.find(r => r.id === roleId);
     if (role) return role.name;
     // Fallback nếu không tìm thấy (ví dụ: role là Admin mà ta đã lọc)
     if (roleId === 1) return 'Admin';
     if (roleId === 2) return 'Patient'; // Mặc dù Patient có thể bị lọc
     return 'Không rõ';
  };

  /// <summary>
  /// Lọc danh sách tài khoản (theo Tên đăng nhập hoặc Họ tên).
  /// </summary>
  const filteredAccounts = staffList.filter(acc =>
    (acc.account?.username && acc.account.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (acc.fullName && acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
      <p className="text-gray-500">Thêm, xóa, và chỉnh sửa tài khoản nhân viên.</p>

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        {/* Thanh tìm kiếm và nút Thêm mới */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm theo tên đăng nhập, họ tên..."
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
            <Plus className="w-5 h-5 mr-2" /> Thêm tài khoản
          </button>
        </div>

        {/* Bảng hiển thị danh sách tài khoản */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {acc.account?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{acc.fullName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                       <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                        {getRoleName(acc.account?.roleId)}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {acc.account?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {acc.account?.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(acc)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-full transition-colors"
                        title="Sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openConfirmDelete(acc)}
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
                    Không có tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Tài khoản (Payload mới) */}
      {isModalOpen && currentAccount && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-lg max-h-[90vh] overflow-y-auto">
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
              {modalMode === 'add' ? 'Tạo tài khoản mới' : 'Cập nhật tài khoản'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Tên đăng nhập */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập (Bắt buộc)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={currentAccount.username}
                    onChange={handleFormChange}
                    disabled={modalMode === 'edit'} // Không cho sửa username
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 ${modalMode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="VD: nvb"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.username}
                  </p>
                )}
              </div>

              {/* Mật khẩu */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu {modalMode === 'add' ? '(Bắt buộc)' : '(Để trống nếu không đổi)'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={currentAccount.password}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={modalMode === 'add' ? 'Nhập mật khẩu' : 'Nhập mật khẩu mới...'}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.password}
                  </p>
                )}
              </div>
              
              {/* Quyền (Role) */}
              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                  Quyền (Bắt buộc)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                  </span>
                  <select
                    id="roleId"
                    name="roleId"
                    value={currentAccount.roleId}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.roleId ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 bg-white`}
                  >
                    <option value="">-- Chọn quyền --</option>
                    {rolesList.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.roleId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.roleId}
                  </p>
                )}
              </div>

              {/* Họ và tên */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên (Không bắt buộc)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={currentAccount.fullName || ''}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: Nguyễn Văn B"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Không bắt buộc)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={currentAccount.email || ''}
                    onChange={handleFormChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="VD: nvb@clinic.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại (Không bắt buộc)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </span>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={currentAccount.phoneNumber || ''}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: 0912345678"
                  />
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
          message={`Bạn có chắc chắn muốn xóa tài khoản "${accountToDelete?.account?.username}" (Tên: ${accountToDelete?.fullName}) không? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmModal(false)}
          title="Xác nhận Xóa Tài khoản"
          confirmText="Đồng ý Xóa"
          confirmColor="bg-red-600 hover:bg-red-700" 
        />
      )}
    </div>
  );
};

export default AccountsPage;