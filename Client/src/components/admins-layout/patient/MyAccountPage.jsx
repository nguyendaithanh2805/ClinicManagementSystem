import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Lock, CheckCircle, UserRoundPen, BookCopy, KeyRound } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";

const MyAccountPage = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [user]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients/accounts/me');
      if (response.data.status) {
        setPatientData(response.data.data);
        setFormData({
          username: response.data.data.account?.username || '',
          fullName: response.data.data.fullName || '',
          dateOfBirth: response.data.data.dateOfBirth ? format(parseISO(response.data.data.dateOfBirth), 'yyyy-MM-dd') : '',
          address: response.data.data.address || '',
          phoneNumber: response.data.data.account?.phoneNumber || '',
          email: response.data.data.account?.email || ''
        });
      } else {
        toast.error(response.data.message || 'Không thể tải thông tin tài khoản của bạn.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi tải thông tin tài khoản.');
      console.error('Lỗi khi lấy thông tin tài khoản:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    fetchPatientData();
    setEditMode(prev => !prev);
    if (editMode) {
      setFormData({
        fullName: patientData.fullName || '',
        dateOfBirth: patientData.dateOfBirth ? format(parseISO(patientData.dateOfBirth), 'yyyy-MM-dd') : '',
        address: patientData.address || '',
        phoneNumber: patientData.phoneNumber || '',
        email: patientData.email || ''
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.fullName.trim()) {
        toast.error("Vui lòng nhập họ và tên.");
        return;
    }

    if (!formData.address.trim()) {
        toast.error("Vui lòng nhập địa chỉ.");
        return;
    }

    if (!formData.dateOfBirth) {
        toast.error("Vui lòng nhập ngày tháng năm sinh.");
        return;
    }
    setSaving(true);
    try {
      const updatePayload = {
        id: patientData.id,
        accountId: patientData.accountId,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      };

      const response = await api.patch(`/patients/accounts/me/${patientData.id}`, updatePayload);

      if (response.data.status) {
        setPatientData(response.data.data);
        setEditMode(false);
        fetchPatientData();
        toast.success(response.data.message || 'Cập nhật thông tin thành công!');
      } else {
        toast.error(response.data.message || 'Cập nhật thông tin thất bại.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ để cập nhật thông tin.');
      console.error('Lỗi khi cập nhật thông tin:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await api.patch(`/patients/accounts/change-password/${patientData.accountId}`, {
        accountId: patientData.accountId,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.status == 204) {
        toast.success('Thay đổi mật khẩu thành công!');
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        toast.error('Thay đổi mật khẩu thất bại.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ để thay đổi mật khẩu.');
      console.error('Lỗi khi thay đổi mật khẩu:', error);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 glass-effect rounded-2xl p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-medical-600">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-8 glass-effect rounded-2xl p-6">
        <User className="w-12 h-12 text-medical-300 mx-auto mb-4" />
        <p className="text-medical-600">Không thể tải thông tin tài khoản của bạn.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-medical-900 mb-2">
              Thông tin tài khoản của tôi
            </h1>
            <p className="text-medical-600">
              Xem và chỉnh sửa thông tin cá nhân của bạn
            </p>
          </div>

          <button
            onClick={handleEditToggle}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 shadow-md
              ${editMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
            `}
          >
            {editMode ? <X className="w-5 h-5 mr-2" /> : <Edit className="w-5 h-5 mr-2" />}
            {editMode ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-xl font-bold text-medical-900 mb-6 border-b pb-3 flex items-center gap-2">
            <BookCopy className="w-5 h-5" /> Thông tin cá nhân
        </h2>


        
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <strong className="font-semibold w-32 text-medical-700">Tên đăng nhập</strong>
            <p className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-medical-800">
            {patientData.account?.username || 'Không có thông tin'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <UserRoundPen className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <strong className="font-semibold w-32 text-medical-700">Họ và tên:</strong>
            {editMode ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
              />
            ) : (
              <p className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-medical-800">
                {patientData.fullName || 'Không có thông tin'}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <strong className="font-semibold w-32 text-medical-700">Ngày sinh:</strong>
            {editMode ? (
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
              />
            ) : (
              <p className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-medical-800">
                {patientData.dateOfBirth ? format(parseISO(patientData.dateOfBirth), 'dd/MM/yyyy', { locale: vi }) : 'Không có thông tin'}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
            <strong className="font-semibold w-32 text-medical-700">Địa chỉ:</strong>
            {editMode ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
              />
            ) : (
              <p className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-medical-800">
                {patientData.address || 'Không có thông tin'}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Phone className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <strong className="font-semibold w-32 text-medical-700">Số điện thoại:</strong>
            {editMode ? (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
              />
            ) : (
              <p className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-medical-800">
                {patientData.account?.phoneNumber || 'Không có thông tin'}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <strong className="font-semibold w-32 text-medical-700">Email:</strong>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
              />
            ) : (
              <p className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-medical-800">
                {patientData.account?.email || 'Không có thông tin'}
              </p>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors duration-200 shadow-md
                ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}
              `}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-xl font-bold text-medical-900 mb-6 border-b pb-3 flex items-center gap-2">
          <Lock className="w-6 h-6 text-yellow-600" />
          Thay đổi mật khẩu
        </h2>
        <p className="text-medical-600 mb-4">
          Để bảo mật tài khoản, vui lòng thay đổi mật khẩu định kỳ.
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 shadow-md"
        >
          <Lock className="w-5 h-5 mr-2" /> Đổi mật khẩu
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50"
            style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative">
            <h2 className="text-2xl font-bold text-medical-900 mb-6 border-b pb-3 flex items-center gap-2">
              <KeyRound className="w-5 h-5"/> Thay đổi mật khẩu
            </h2>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-medical-700 text-sm font-semibold mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-medical-700 text-sm font-semibold mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-medical-700 text-sm font-semibold mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-medical-800"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors duration-200 shadow-md
                  ${passwordSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                `}
              >
                {passwordSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" /> Cập nhật mật khẩu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccountPage;