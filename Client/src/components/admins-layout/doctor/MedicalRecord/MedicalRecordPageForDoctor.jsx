import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Search, CalendarDays } from 'lucide-react'; // (MỚI) Thêm CalendarDays
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../contexts/Api";
import { formatDbUtcToVnTime } from '../../../../utils/dateFormatter';
import ConfirmationModal from "../../ConfirmationModal";
import MedicalRecordCard from './MedicalRecordCard';
import MedicalRecordDetailModal from './MedicalRecordDetailModal';
import AddPrescriptionModal from './AddPrescriptionModal';
import RevisitModal from './RevisitModal'; // (MỚI) Import modal tái khám
import { useLocation, useNavigate } from 'react-router-dom';

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
const ITEMS_PER_PAGE = 5;

const MedicalRecordPageForDoctor = () => {
  // --- TOÀN BỘ STATE VÀ REFS ---
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('summary');

  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editedRecord, setEditedRecord] = useState(null);

  const [medicines, setMedicines] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  
  const [fullScreenImage, setFullScreenImage] = useState(null);
  
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
  const [newPrescriptionDetail, setNewPrescriptionDetail] = useState({
    medicineId: '',
    medicineName: '',
    quantity: '',
    dosage: '',
    frequency: '',
  });
  const [newPrescriptionDetailSearchTerm, setNewPrescriptionDetailSearchTerm] = useState('');
  const [newPrescriptionDetailSearchResults, setNewPrescriptionDetailSearchResults] = useState([]);
  const [showNewPrescriptionDetailSearchResults, setShowNewPrescriptionDetailSearchResults] = useState(false);
  const newPrescriptionSearchRef = useRef(null);

  const [selectedPrescriptionDetail, setSelectedPrescriptionDetail] = useState(null);
  const [editPrescriptionDetailSearchTerm, setEditPrescriptionDetailSearchTerm] = useState('');
  const [editPrescriptionDetailSearchResults, setEditPrescriptionDetailSearchResults] = useState([]);
  const [showEditPrescriptionDetailSearchResults, setShowEditPrescriptionDetailSearchResults] = useState(false);
  const editPrescriptionSearchRef = useRef(null);

  const [newSymptomName, setNewSymptomName] = useState('');
  const newSymptomInputRef = useRef(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalAction, setConfirmModalAction] = useState(null);

  // (MỚI) State cho modal tái khám
  const [showRevisitModal, setShowRevisitModal] = useState(false);
  const [recordToRevisit, setRecordToRevisit] = useState(null);
  // --- HẾT PHẦN STATE VÀ REFS ---

  const location = useLocation();
  const navigate = useNavigate();

  // --- (Các useEffect giữ nguyên) ---
  useEffect(() => {
    fetchMedicalRecords();
    fetchMedicines();
  }, []);

  // useEffect này dùng để "nhận" ID từ trang Lịch Hẹn
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
    const handleClickOutside = (event) => {
      if (newPrescriptionSearchRef.current && !newPrescriptionSearchRef.current.contains(event.target)) {
        setShowNewPrescriptionDetailSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editPrescriptionSearchRef.current && !editPrescriptionSearchRef.current.contains(event.target)) {
        setShowEditPrescriptionDetailSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showAddPrescriptionModal) {
      setNewPrescriptionDetailSearchTerm('');
      setNewPrescriptionDetailSearchResults([]);
      setShowNewPrescriptionDetailSearchResults(false);
      setNewPrescriptionDetail({ medicineId: '', medicineName: '', quantity: '', dosage: '', frequency: '' });
    }
  }, [showAddPrescriptionModal]);

  useEffect(() => {
    if (!selectedPrescriptionDetail) {
      setEditPrescriptionDetailSearchTerm('');
      setEditPrescriptionDetailSearchResults([]);
      setShowEditPrescriptionDetailSearchResults(false);
    } else {
        setEditPrescriptionDetailSearchTerm(selectedPrescriptionDetail.medicineName || '');
    }
  }, [selectedPrescriptionDetail]);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase().trim(); // Thêm .trim()
      const results = medicalRecords.filter(record => {
        // (CẬP NHẬT LOGIC)
        // 1. Kiểm tra Tên Bệnh nhân
        const nameMatches = record.patient?.fullName.toLowerCase().includes(lowercasedSearchTerm);
        // 2. Kiểm tra ID Hồ sơ
        const idMatches = String(record.id).includes(lowercasedSearchTerm);
        
        // Trả về true nếu 1 trong 2 khớp
        return nameMatches || idMatches;
      });
      setFilteredMedicalRecords(results);
    } else {
      setFilteredMedicalRecords(medicalRecords);
    }
    setCurrentPage(1);
  }, [medicalRecords, searchTerm]);
  // --- HẾT PHẦN USEEFFECT ---


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


  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  const fetchMedicalRecords = async () => {
    try {
      const response = await api.get('/staff/medical-records/me');
      if (response.data.status) {
        console.log(response.data.data)
        const sortedRecords = response.data.data.sort((a, b) => b.id - a.id);
        setMedicalRecords(sortedRecords);
        if (selectedRecord) {
          const updatedSelected = sortedRecords.find(rec => rec.id === selectedRecord.id);
          setSelectedRecord(updatedSelected);
        }
      } else {
        toast.error(response.data.message || 'Không thể tải hồ sơ bệnh án.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi tải hồ sơ bệnh án.');
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/staff/medicines');
      if (response.data.status) {
        setMedicines(response.data.data);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách thuốc.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi tải danh sách thuốc.');
    }
  };

  // (Các hàm xử lý edit/update record giữ nguyên)
  const handleEditRecordClick = () => {
    setIsEditingRecord(true);
    setEditedRecord({ ...selectedRecord });
  };

  const handleCancelEditRecord = () => {
    setIsEditingRecord(false);
    setEditedRecord(null);
  };

  const handleUpdateMedicalRecord = async () => {
    if (!editedRecord || !selectedRecord) return;
    try {
      const payload = {
        Id: editedRecord.id,
        Diagnosis: editedRecord.diagnosis,
        TreatmentMethod: editedRecord.treatmentMethod,
        RequiresTest: editedRecord.requiresTest,
      };
      const response = await api.patch(`/staff/medical-records/${editedRecord.id}`, payload);
      if (response.data.status) {
        toast.success(response.data.message);
        setIsEditingRecord(false);
        setEditedRecord(null);
        fetchMedicalRecords();
      } else {
        toast.error(response.data.message || 'Cập nhật hồ sơ bệnh án thất bại.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi cập nhật hồ sơ bệnh án.');
    }
  };

  // (Các hàm xử lý prescription giữ nguyên)
  // --- Xử lý lưu nhiều chi tiết cùng lúc bằng cách gửi body là list cho backend tự xử ---
  const handleCreatePrescription = async (detailsList) => {
    if (detailsList.length === 0) {
      toast.warn("Vui lòng thêm ít nhất một thuốc vào đơn.");
      return;
    }
    if (!selectedRecord) return;

    try {
      // Tắt modal ngay lập tức
      setShowAddPrescriptionModal(false); 
      
      // 1. Tạo ra danh sách các payload
      const payloadList = detailsList.map(detail => {
        return {
          medicineId: parseInt(detail.medicineId),
          patientMedicalRecordId: selectedRecord.id,
          quantity: parseInt(detail.quantity),
          dosage: detail.dosage,
          frequency: detail.frequency,
        };
      });

      // 2. Gửi MỘT request duy nhất chứa toàn bộ danh sách
      const response = await api.post('/staff/prescription-details', payloadList);
      if (response.data.status) {
        toast.success(`Đã thêm ${detailsList.length} chi tiết vào đơn thuốc mới!`);
        fetchMedicalRecords();
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Có lỗi xảy ra khi lưu đơn thuốc. Vui lòng thử lại.');
      console.error("Lỗi khi tạo đơn thuốc:", error.response.data.message);
      fetchMedicalRecords();
      setShowAddPrescriptionModal(true);
    }
  };

  // --- Dọn dẹp form trong modal ---
  const clearNewPrescriptionForm = () => {
    setNewPrescriptionDetail({ medicineId: '', medicineName: '', quantity: '', dosage: '', frequency: '' });
    setNewPrescriptionDetailSearchTerm('');
    setNewPrescriptionDetailSearchResults([]);
    setShowNewPrescriptionDetailSearchResults(false);
  };

  const handleUpdatePrescriptionDetail = async (prescriptionId, medicineId) => {
    if (!selectedRecord || !selectedPrescriptionDetail) return;
    if (!selectedPrescriptionDetail.medicineId || !selectedPrescriptionDetail.quantity || !selectedPrescriptionDetail.dosage || !selectedPrescriptionDetail.frequency) {
        toast.warn('Vui lòng điền đầy đủ thông tin chi tiết đơn thuốc.');
        return;
    }
    
    try {
      const payload = {
        prescriptionId: prescriptionId,
        medicineId: parseInt(selectedPrescriptionDetail.medicineId),
        quantity: parseInt(selectedPrescriptionDetail.quantity),
        dosage: selectedPrescriptionDetail.dosage,
        frequency: selectedPrescriptionDetail.frequency,
      };
      const response = await api.put(`/staff/prescription-details/${prescriptionId}/${medicineId}`, payload);
      if (response.data.status) {
        toast.success(response.data.message);
        setSelectedPrescriptionDetail(null);
        fetchMedicalRecords();
      } else {
        toast.error(response.data.message || 'Cập nhật chi tiết đơn thuốc thất bại.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi cập nhật chi tiết đơn thuốc.');
    }
  };

  const handleDeletePrescription = (prescriptionId) => {
    setConfirmModalMessage('Bạn có chắc chắn muốn đơn thuốc này không?');
    setConfirmModalAction(() => async () => {
      try {
        const response = await api.delete(`/staff/prescription-details/${prescriptionId}`);
        if (response.status === 204) {
          toast.success('Xóa chi tiết đơn thuốc thành công');
          fetchMedicalRecords();
        } else {
          toast.error('Xóa chi tiết đơn thuốc thất bại.');
        }
      } catch (error) {
        toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi xóa chi tiết đơn thuốc.');
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeletePrescriptionDetail = (prescriptionId, medicineId) => {
    setConfirmModalMessage('Bạn có chắc chắn muốn xóa chi tiết đơn thuốc này không?');
    setConfirmModalAction(() => async () => {
      try {
        const response = await api.delete(`/staff/prescription-details/${prescriptionId}/${medicineId}`);
        if (response.status === 204) {
          toast.success('Xóa chi tiết đơn thuốc thành công');
          fetchMedicalRecords();
        } else {
          toast.error('Xóa chi tiết đơn thuốc thất bại.');
        }
      } catch (error) {
        toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi xóa chi tiết đơn thuốc.');
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // (Các hàm xử lý search/select medicine giữ nguyên)
  const handleMedicineSearch = (e, context) => {
    const value = e.target.value;
    let setSearchTermFn = () => {};
    let setSearchResultsFn = () => {};
    let setShowSearchResultsFn = () => {};

    if (context === 'new') {
        setNewPrescriptionDetail(prev => ({ ...prev, medicineName: value, medicineId: '' }));
        setSearchTermFn = setNewPrescriptionDetailSearchTerm;
        setSearchResultsFn = setNewPrescriptionDetailSearchResults;
        setShowSearchResultsFn = setShowNewPrescriptionDetailSearchResults;
    } else if (context === 'edit') {
        setSearchTermFn = setEditPrescriptionDetailSearchTerm;
        setSearchResultsFn = setEditPrescriptionDetailSearchResults;
        setShowSearchResultsFn = setShowEditPrescriptionDetailSearchResults;
    }

    setSearchTermFn(value);

    if (value.length > 0) {
      const filtered = medicines.filter(med =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResultsFn(filtered);
      setShowSearchResultsFn(true);
    } else {
      setSearchResultsFn([]);
      setShowSearchResultsFn(false);
    }
  };

  const handleSelectMedicine = (medicine, context) => {
    if (context === 'new') {
      setNewPrescriptionDetail(prev => ({
        ...prev,
        medicineId: medicine.id,
        medicineName: medicine.name,
      }));
      setNewPrescriptionDetailSearchTerm(medicine.name);
      setShowNewPrescriptionDetailSearchResults(false);
      setNewPrescriptionDetailSearchResults([]);
    } else if (context === 'edit') {
      setSelectedPrescriptionDetail(prev => ({
        ...prev,
        medicineId: medicine.id,
        medicineName: medicine.name,
      }));
      setEditPrescriptionDetailSearchTerm(medicine.name);
      setShowEditPrescriptionDetailSearchResults(false);
      setEditPrescriptionDetailSearchResults([]);
    }
  };

  // (Các hàm xử lý symptom giữ nguyên)
  const handleAddSymptom = async () => {
    if (!selectedRecord || !newSymptomName.trim()) {
      toast.warn('Vui lòng nhập tên triệu chứng.');
      return;
    }
    try {
      const payload = {
        patientMedicalRecordId: selectedRecord.id,
        name: newSymptomName.trim()
      };
      const response = await api.post('/staff/symptoms', payload);
      if (response.data.status) {
        toast.success(response.data.message);
        setNewSymptomName('');
        fetchMedicalRecords();
      } else {
        toast.error(response.data.message || 'Thêm triệu chứng thất bại.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi thêm triệu chứng.');
    }
  };

  const handleDeleteSymptom = (symptomId) => {
    setConfirmModalMessage('Bạn có chắc chắn muốn xóa triệu chứng này không?');
    setConfirmModalAction(() => async () => {
      try {
        const response = await api.delete(`/staff/symptoms/${symptomId}`);
        if (response.status === 204) {
          toast.success('Xóa triệu chứng thành công');
          fetchMedicalRecords();
        } else {
          toast.error('Xóa triệu chứng thất bại.');
        }
      } catch (error) {
        toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ khi xóa triệu chứng.');
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // (Hàm handleMarkAsComplete giữ nguyên)
  const handleMarkAsComplete = async (id) => {
    setConfirmModalMessage('Bạn có chắc chắn xác nhận hoàn thành khám cho hồ sơ này không?');
    setConfirmModalAction(() => async () => {
    try {
      const response = await api.put(`/staff/medical-records/confirm-completed/${id}`);
      if (response.data.status) {
        toast.success(response.data.message || 'Đã cập nhật trạng thái hồ sơ!');
        toast.success('Đã cập nhật tổng tiền thuốc vào hóa đơn');
        fetchMedicalRecords();
      } else {
        toast.error(response.data.message || 'Cập nhật trạng thái thất bại.');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Lỗi khi kết nối đến máy chủ.');
    } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleConfirmInProgress = async (recordId) => {
    try {
      const response = await api.put(`/staff/medical-records/confirm-inprogress/${recordId}`);
      if (response.data.status) {
        toast.info(response.data.message || "Xác nhận đang khám");
        fetchMedicalRecords();
      }
    } catch (error) {
      toast.error(error.response.data.message || `Lỗi khi cập nhật trạng thái hồ sơ #${recordId}.`);
      console.error("Lỗi khi gọi API confirm-inprogress:", error);
    }
  };
  
  // Hàm handleMarkAsRevisit
  const handleMarkAsRevisit = (id) => {
    const record = medicalRecords.find(r => r.id === id);
    if (record) {
      setRecordToRevisit(record);
      setShowRevisitModal(true);
    }
  };

  // Hàm xử lý submit từ RevisitModal
  const handleConfirmRevisit = async (payload) => {
    if (!recordToRevisit) return;

    try {
      const response = await api.put(`/staff/medical-records/confirm-revisit/${recordToRevisit.id}`, payload);
      if (response.data.status) {
        toast.success(response.data.message || 'Đã tạo lịch hẹn tái khám thành công!');
        fetchMedicalRecords(); // Tải lại danh sách
        setShowRevisitModal(false); // Đóng modal
        setRecordToRevisit(null);

        navigate('/staff/schedule', {
          state: { filterStatus: '1' } // Truyền '1' cho "Đã xác nhận"
        });
      } else {
        toast.error(response.data.message || 'Tạo lịch hẹn tái khám thất bại.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi kết nối đến máy chủ.');
    }
  };

  // (Các hàm phân trang giữ nguyên)
  const totalPages = Math.ceil(filteredMedicalRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredMedicalRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // --- HẾT PHẦN HÀM HELPER VÀ LOGIC ---


  // --- PHẦN RENDER---
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* ... (Phần tiêu đề và ô tìm kiếm giữ nguyên) ... */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hồ sơ bệnh án</h1>
        <p className="text-gray-500">Xem và quản lý chi tiết hồ sơ bệnh án của bệnh nhân.</p>
      </div>
      
      {/* Ô tìm kiếm */}
      <div className="mt-4 mb-6 flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <Search className="w-5 h-5 text-gray-500 mr-3" />
        <input
          type="text"
          placeholder="Tìm theo Tên Bệnh nhân hoặc Mã Hồ sơ..."
          className="flex-1 border-none focus:ring-0 outline-none text-gray-800 placeholder-gray-500"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="ml-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            title="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Danh sách hồ sơ */}
      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Danh sách Hồ sơ bệnh án
        </h3>
        <div className="space-y-4">
          {paginatedRecords.length > 0 ? (
            paginatedRecords.map(record => (
              <MedicalRecordCard
                key={record.id}
                record={record}
                onClick={() => {
                  setSelectedRecord(record);
                  setActiveTab('summary');
                  setIsEditingRecord(false);
                  setSelectedPrescriptionDetail(null);
                }}
                onMarkAsComplete={handleMarkAsComplete}
                onMarkAsRevisit={handleMarkAsRevisit}
                getStatusColorClass={getStatusColorClass}
                getStatusText={getStatusText}
                getAppointmentStatusText={getAppointmentStatusText}
                getAppointmentStatusColorClass={getAppointmentStatusColorClass}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? `Không tìm thấy hồ sơ bệnh án nào cho "${searchTerm}".` : 'Không có hồ sơ bệnh án nào để hiển thị.'}
            </p>
          )}
        </div>

        {/* Phân trang (Giữ nguyên) */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-full sm:text-base font-medium
                  ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* (CẬP NHẬT) Medical Record Detail Modal (NEW) */}
      {selectedRecord && (
        <MedicalRecordDetailModal
          record={selectedRecord}
          isCompleted={selectedRecord.status === true}
          isEditing={isEditingRecord}
          editedRecord={editedRecord}
          getAppointmentStatusText={getAppointmentStatusText}
          getAppointmentStatusColorClass={getAppointmentStatusColorClass}
          onInteractionStart={handleConfirmInProgress}
          onClose={() => {
            setSelectedRecord(null);
            setIsEditingRecord(false);
            setSelectedPrescriptionDetail(null);
          }}
          onEdit={handleEditRecordClick}
          onCancelEdit={handleCancelEditRecord}
          onSaveEdit={handleUpdateMedicalRecord}
          onEditedRecordChange={setEditedRecord}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          // Symptoms
          newSymptomName={newSymptomName}
          onNewSymptomChange={setNewSymptomName}
          onAddSymptom={handleAddSymptom}
          onDeleteSymptom={handleDeleteSymptom}
          newSymptomInputRef={newSymptomInputRef}
          // Prescriptions
          onShowAddPrescriptionModal={() => setShowAddPrescriptionModal(true)}
          selectedPrescriptionDetail={selectedPrescriptionDetail}
          onSelectPrescriptionDetail={setSelectedPrescriptionDetail}
          onDeletePrescriptionDetail={handleDeletePrescriptionDetail}
          onDeletePrescription={handleDeletePrescription}
          onUpdatePrescriptionDetail={handleUpdatePrescriptionDetail}
          // Medicine Search (for editing)
          medicines={medicines}
          editPrescriptionSearchTerm={editPrescriptionDetailSearchTerm}
          onEditPrescriptionSearchChange={setEditPrescriptionDetailSearchTerm}
          editPrescriptionSearchResults={editPrescriptionDetailSearchResults}
          showEditPrescriptionSearchResults={showEditPrescriptionDetailSearchResults}
          onShowEditPrescriptionSearchResults={setShowEditPrescriptionDetailSearchResults}
          onMedicineSearch={handleMedicineSearch}
          onSelectMedicine={handleSelectMedicine}
          editPrescriptionSearchRef={editPrescriptionSearchRef}
          // Image Viewer
          onViewFullImage={openFullScreenImage}
          // Props cho format
          format={format}
          parseISO={parseISO}
          isValid={isValid}
          viLocale={vi}
          formatDbUtcToVnTime={formatDbUtcToVnTime}
          imageUrl={IMAGE_URL}
          // (MỚI) Truyền 2 hàm helper cho tab Lịch hẹn
          getStatusText={getStatusText}
          getStatusColorClass={getStatusColorClass}
        />
      )}

      {/* Add Prescription Detail Modal (Giữ nguyên) */}
      {showAddPrescriptionModal && selectedRecord && (
        <AddPrescriptionModal
          onFirstInputChange={() => handleConfirmInProgress(selectedRecord.id)}
          onClose={() => setShowAddPrescriptionModal(false)}
          onSavePrescription={handleCreatePrescription}
          onClearForm={clearNewPrescriptionForm}
          // State and handlers for the modal's form
          newPrescriptionDetail={newPrescriptionDetail}
          onNewPrescriptionDetailChange={setNewPrescriptionDetail}
          medicines={medicines}
          newPrescriptionSearchTerm={newPrescriptionDetailSearchTerm}
          newPrescriptionSearchResults={newPrescriptionDetailSearchResults}
          showNewPrescriptionSearchResults={showNewPrescriptionDetailSearchResults}
          onShowNewPrescriptionSearchResults={setShowNewPrescriptionDetailSearchResults}
          onMedicineSearch={handleMedicineSearch}
          onSelectMedicine={handleSelectMedicine}
          newPrescriptionSearchRef={newPrescriptionSearchRef}
        />
      )}

      {/* Full Screen Image Viewer (Giữ nguyên) */}
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

      {/* Confirmation Modal Render (Giữ nguyên) */}
      {showConfirmModal && (
        <ConfirmationModal
          message={confirmModalMessage}
          onConfirm={confirmModalAction}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* (MỚI) Revisit Modal Render */}
      {showRevisitModal && recordToRevisit && (
        <RevisitModal
          onClose={() => {
            setShowRevisitModal(false);
            setRecordToRevisit(null);
          }}
          onSubmit={handleConfirmRevisit}
        />
      )}
    </div>
  );
};
export default MedicalRecordPageForDoctor;