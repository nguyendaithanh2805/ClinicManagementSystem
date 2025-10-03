import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Pill, User, Stethoscope, ListTodo, ClipboardCheck,
  Microscope, Eye, X, Info, ChevronLeft, ChevronRight, Edit, Plus, Trash2, Save, XCircle, Search, CalendarDays
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";
import { formatInTimeZone } from 'date-fns-tz';
import ConfirmationModal from  "../ConfirmationModal";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL; 

const ITEMS_PER_PAGE = 5;

const MedicalRecordPageForDoctor = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('summary');

  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editedRecord, setEditedRecord] = useState(null);

  const [medicines, setMedicines] = useState([]);

  // NEW: State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  // END NEW
  
  const [fullScreenImage, setFullScreenImage] = useState(null); // NEW: State để lưu URL ảnh full-screen
  
  // States for NEW Prescription Management
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

  // States for EDITING Prescription Management
  const [selectedPrescriptionDetail, setSelectedPrescriptionDetail] = useState(null);
  const [editPrescriptionDetailSearchTerm, setEditPrescriptionDetailSearchTerm] = useState('');
  const [editPrescriptionDetailSearchResults, setEditPrescriptionDetailSearchResults] = useState([]);
  const [showEditPrescriptionDetailSearchResults, setShowEditPrescriptionDetailSearchResults] = useState(false);
  const editPrescriptionSearchRef = useRef(null);


  // States for Symptom Management
  const [newSymptomName, setNewSymptomName] = useState('');
  const newSymptomInputRef = useRef(null); // Ref for new symptom input

  // Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalAction, setConfirmModalAction] = useState(null); // Function to execute on confirm

  useEffect(() => {
    fetchMedicalRecords();
    fetchMedicines();
  }, []);

  // Effect to close new prescription search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (newPrescriptionSearchRef.current && !newPrescriptionSearchRef.current.contains(event.target)) {
        setShowNewPrescriptionDetailSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to close edit prescription search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editPrescriptionSearchRef.current && !editPrescriptionSearchRef.current.contains(event.target)) {
        setShowEditPrescriptionDetailSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NEW: Hàm mở ảnh full-screen
  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  // NEW: Hàm đóng ảnh full-screen
  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  // Reset new prescription search state when modal closes
  useEffect(() => {
    if (!showAddPrescriptionModal) {
      setNewPrescriptionDetailSearchTerm('');
      setNewPrescriptionDetailSearchResults([]);
      setShowNewPrescriptionDetailSearchResults(false);
      setNewPrescriptionDetail({ medicineId: '', medicineName: '', quantity: '', dosage: '', frequency: '' });
    }
  }, [showAddPrescriptionModal]);

  // Reset edit prescription search state when edit mode closes
  useEffect(() => {
    if (!selectedPrescriptionDetail) {
      setEditPrescriptionDetailSearchTerm('');
      setEditPrescriptionDetailSearchResults([]);
      setShowEditPrescriptionDetailSearchResults(false);
    } else {
        setEditPrescriptionDetailSearchTerm(selectedPrescriptionDetail.medicineName || '');
    }
  }, [selectedPrescriptionDetail]);

   // NEW: Effect để lọc hồ sơ khi searchTerm hoặc medicalRecords thay đổi
  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const results = medicalRecords.filter(record =>
        record.patient?.fullName.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredMedicalRecords(results);
    } else {
      setFilteredMedicalRecords(medicalRecords); // Nếu không có searchTerm, hiển thị tất cả
    }
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm/lọc
  }, [medicalRecords, searchTerm]);
  // END NEW

  const fetchMedicalRecords = async () => {
    try {
      const response = await api.get('/staff/medical-records/me');
      if (response.data.status) {
        const sortedRecords = response.data.data.sort((a, b) => b.id - a.id);
        setMedicalRecords(sortedRecords);
        if (selectedRecord) {
          const updatedSelected = sortedRecords.find(rec => rec.id === selectedRecord.id);
          setSelectedRecord(updatedSelected);
        }
      } else {
        toast.error(response.data.message || 'Không thể tải hồ sơ bệnh án.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi tải hồ sơ bệnh án.');
      console.error('Lỗi khi lấy hồ sơ bệnh án:', error);
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
      toast.error('Lỗi khi tải danh sách thuốc.');
      console.error('Lỗi khi lấy danh sách thuốc:', error);
    }
  };


  // --- Medical Record Update Logic ---
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
        // Since fetchMedicalRecords updates selectedRecord, no need to set here
      } else {
        toast.error(response.data.message || 'Cập nhật hồ sơ bệnh án thất bại.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi cập nhật hồ sơ bệnh án.');
      console.error('Lỗi khi cập nhật hồ sơ bệnh án:', error);
    }
  };

  // --- Prescription Management Logic ---
  const handleAddPrescriptionDetail = async () => {
    if (!selectedRecord) return;
    if (!newPrescriptionDetail.medicineId || !newPrescriptionDetail.quantity || !newPrescriptionDetail.dosage || !newPrescriptionDetail.frequency) {
        toast.warn('Vui lòng điền đầy đủ thông tin chi tiết đơn thuốc.');
        return;
    }

    try {
      const payload = {
        medicineId: parseInt(newPrescriptionDetail.medicineId),
        patientMedicalRecordId: selectedRecord.id,
        quantity: parseInt(newPrescriptionDetail.quantity),
        dosage: newPrescriptionDetail.dosage,
        frequency: newPrescriptionDetail.frequency,
      };

      const response = await api.post('/staff/prescription-details', payload);

      if (response.data.status) {
        toast.success(response.data.message);
        setShowAddPrescriptionModal(false);
        setNewPrescriptionDetail({ medicineId: '', medicineName: '', quantity: '', dosage: '', frequency: '' });
        setNewPrescriptionDetailSearchTerm(''); // Clear search term after adding
        fetchMedicalRecords(); // Re-fetch to update the selected record's prescriptions
      } else {
        toast.error(response.data.message || 'Thêm chi tiết đơn thuốc thất bại.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi thêm chi tiết đơn thuốc.');
      console.error('Lỗi khi thêm chi tiết đơn thuốc:', error);
    }
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
        setEditPrescriptionDetailSearchTerm(''); // Clear search term after updating
        fetchMedicalRecords(); // Re-fetch to update the selected record's prescriptions
      } else {
        toast.error(response.data.message || 'Cập nhật chi tiết đơn thuốc thất bại.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi cập nhật chi tiết đơn thuốc.');
      console.error('Lỗi khi cập nhật chi tiết đơn thuốc:', error);
    }
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
        toast.error('Lỗi khi kết nối đến máy chủ khi xóa chi tiết đơn thuốc.');
        console.error('Lỗi khi xóa chi tiết đơn thuốc:', error);
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Generic medicine search handler, adapted for context
  const handleMedicineSearch = (e, context) => {
    const value = e.target.value;
    let currentSearchTerm = '';
    let setSearchTermFn = () => {};
    let setSearchResultsFn = () => {};
    let setShowSearchResultsFn = () => {};

    if (context === 'new') {
        setNewPrescriptionDetail(prev => ({ ...prev, medicineName: value, medicineId: '' })); // Clear ID if user types
        currentSearchTerm = value;
        setSearchTermFn = setNewPrescriptionDetailSearchTerm;
        setSearchResultsFn = setNewPrescriptionDetailSearchResults;
        setShowSearchResultsFn = setShowNewPrescriptionDetailSearchResults;
    } else if (context === 'edit') {
        setSelectedPrescriptionDetail(prev => ({ ...prev, medicineName: value, medicineId: '' })); // Clear ID if user types
        currentSearchTerm = value;
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

  // Generic medicine selection handler, adapted for context
  const handleSelectMedicine = (medicine, context) => {
    if (context === 'new') {
      setNewPrescriptionDetail(prev => ({
        ...prev,
        medicineId: medicine.id,
        medicineName: medicine.name,
      }));
      setNewPrescriptionDetailSearchTerm(medicine.name); // Keep search input displaying selected name
      setShowNewPrescriptionDetailSearchResults(false);
      setNewPrescriptionDetailSearchResults([]);
    } else if (context === 'edit') {
      setSelectedPrescriptionDetail(prev => ({
        ...prev,
        medicineId: medicine.id,
        medicineName: medicine.name,
      }));
      setEditPrescriptionDetailSearchTerm(medicine.name); // Keep search input displaying selected name
      setShowEditPrescriptionDetailSearchResults(false);
      setEditPrescriptionDetailSearchResults([]);
    }
  };


  // --- Symptom Management Logic ---
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
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi thêm triệu chứng.');
      console.error('Lỗi khi thêm triệu chứng:', error);
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
      toast.error('Lỗi khi kết nối đến máy chủ khi xóa triệu chứng.');
      console.error('Lỗi khi xóa triệu chứng:', error);
    } finally {
      setShowConfirmModal(false);
    }
  });
  setShowConfirmModal(true);
};



  // Pagination logic
  const totalPages = Math.ceil(filteredMedicalRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredMedicalRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

   function ResultImage({ src, alt, onViewFull }) { // NEW: Thêm onViewFull prop
    const [error, setError] = useState(false);

    if (error) {
      return (
        <div className="mt-2 p-4 bg-gray-100 text-gray-500 italic rounded">
          Không thể tải ảnh ({alt}).
        </div>
      );
    }

    return (
      <div className="mt-2">
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 object-cover max-h-32 w-48 cursor-pointer transform hover:scale-105 transition-transform duration-200" // NEW: Kích thước nhỏ hơn, có hiệu ứng hover
          onError={() => setError(true)}
          onClick={() => onViewFull(src)} // NEW: Gọi onViewFull khi click vào ảnh
        />
        <button
          onClick={() => onViewFull(src)} // NEW: Thêm nút xem ảnh
          className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
        >
          <Eye className="w-4 h-4" /> Xem ảnh
        </button>
      </div>
    );
  }

  const MedicalRecordCard = ({ record, onClick }) => (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              <p>
                Bệnh nhân:{" "}
                <span className="text-blue-600 font-semibold">
                  {record.patient?.fullName || "Chưa có bệnh nhân"}
                </span>
              </p>
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Stethoscope className="w-4 h-4 inline-block text-gray-500" />
              Bác sĩ điều trị: {record.staff?.fullName || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClick}
            className="mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> Xem chi tiết
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-gray-500" />
            <span>Chẩn đoán: {record.diagnosis || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-gray-500" />
            <span>Ngày tạo: {format(parseISO(record.createAt), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
          </div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-gray-500" />
            <span>Phương pháp điều trị: {record.treatmentMethod || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hồ sơ Bệnh án</h1>
        <p className="text-gray-500">Xem và quản lý chi tiết hồ sơ bệnh án của bệnh nhân.</p>
      </div>
      {/* NEW: Ô tìm kiếm */}
        <div className="mt-4 mb-6 flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Tìm kiếm hồ sơ bệnh án theo tên bệnh nhân..."
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
        {/* END NEW */}

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Danh sách Hồ sơ Bệnh án
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
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? `Không tìm thấy hồ sơ bệnh án nào cho "${searchTerm}".` : 'Không có hồ sơ bệnh án nào để hiển thị.'}
            </p>
          )}
        </div>

        {/* Pagination Controls */}
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
                className={`px-4 py-2 rounded-full text-sm font-medium
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

      {/* Medical Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => {
                setSelectedRecord(null);
                setSelectedPrescriptionDetail(null); // Close any open prescription edit form
              }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tabs for detailed view */}
            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
              <TabButton icon={<Info className="w-5 h-5" />} label="Tổng quan" isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
              <TabButton icon={<Pill className="w-5 h-5" />} label="Đơn thuốc" isActive={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} />
              <TabButton icon={<ListTodo className="w-5 h-5" />} label="Triệu chứng" isActive={activeTab === 'symptoms'} onClick={() => setActiveTab('symptoms')} />
              <TabButton icon={<Microscope className="w-5 h-5" />} label="Kết quả xét nghiệm" isActive={activeTab === 'testResults'} onClick={() => setActiveTab('testResults')} />
              <TabButton icon={<Stethoscope className="w-5 h-5" />} label="Bác sĩ điều trị" isActive={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'summary' && (
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" /> Chi tiết Hồ sơ Bệnh án
                    {!isEditingRecord && (
                      <button
                        onClick={handleEditRecordClick}
                        className="ml-auto px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> Chỉnh sửa hồ sơ
                      </button>
                    )}
                  </h2>
                  <DetailItem icon={<User className="w-5 h-5 text-blue-500" />} label="Bệnh nhân">
                    <p>{selectedRecord.patient?.fullName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Ngày sinh: {selectedRecord.patient?.dateOfBirth ? format(parseISO(selectedRecord.patient.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Địa chỉ: {selectedRecord.patient?.address || 'N/A'}</p>
                  </DetailItem>
                  <DetailItem icon={<ClipboardCheck className="w-5 h-5 text-green-500" />} label="Chẩn đoán">
                    {isEditingRecord ? (
                      <textarea
                        value={editedRecord.diagnosis || ''}
                        onChange={(e) => setEditedRecord({ ...editedRecord, diagnosis: e.target.value })}
                        className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                        rows="3"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{selectedRecord.diagnosis || 'N/A'}</p>
                    )}
                  </DetailItem>
                  <DetailItem icon={<ListTodo className="w-5 h-5 text-indigo-500" />} label="Phương pháp điều trị">
                    {isEditingRecord ? (
                      <textarea
                        value={editedRecord.treatmentMethod || ''}
                        onChange={(e) => setEditedRecord({ ...editedRecord, treatmentMethod: e.target.value })}
                        className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                        rows="3"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{selectedRecord.treatmentMethod || 'N/A'}</p>
                    )}
                  </DetailItem>
                  <DetailItem icon={<Info className="w-5 h-5 text-orange-500" />} label="Yêu cầu xét nghiệm">
                    {isEditingRecord ? (
                      <label className="flex items-center space-x-2 mt-1">
                        <input
                          type="checkbox"
                          checked={editedRecord.requiresTest || false}
                          onChange={(e) => setEditedRecord({ ...editedRecord, requiresTest: e.target.checked })}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">Có yêu cầu xét nghiệm</span>
                      </label>
                    ) : (
                      <p>{selectedRecord.requiresTest ? 'Có' : 'Không'}</p>
                    )}
                  </DetailItem>
                  {isEditingRecord && (
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleCancelEditRecord}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-5 h-5" /> Hủy
                      </button>
                      <button
                        onClick={handleUpdateMedicalRecord}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" /> Lưu thay đổi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowAddPrescriptionModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Plus className="w-5 h-5" /> Thêm Đơn thuốc
                    </button>
                  </div>

                  {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 ? (
                    selectedRecord.prescriptions.map((prescription, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2 border-b pb-2">
                          <CalendarDays className="w-5 h-5 text-emerald-600" /> Đơn thuốc ngày {
                            prescription.prescriptionDate && isValid(parseISO(prescription.prescriptionDate))
                              ? formatInTimeZone(parseISO(prescription.prescriptionDate), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm', { locale: vi })
                              : 'N/A'
                          }
                        </h4>
                        <div className="space-y-3 pl-2 border-l-2 border-emerald-200 ml-1">
                          {prescription.prescriptionDetails && prescription.prescriptionDetails.length > 0 ? (
                            prescription.prescriptionDetails.map((detail, detIndex) => (
                              <div key={detIndex} className="border-t border-gray-100 pt-3 mt-3 first:border-t-0 first:pt-0">
                                {selectedPrescriptionDetail && selectedPrescriptionDetail.prescriptionId === prescription.id && selectedPrescriptionDetail.medicineId === detail.medicineId ? (
                                  // Edit form for prescription detail
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="relative col-span-full" ref={editPrescriptionSearchRef}>
                                      <label htmlFor={`editMedicineSearch-${prescription.id}-${detail.medicineId}`} className="block text-sm font-medium text-gray-700">Thuốc</label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          id={`editMedicineSearch-${prescription.id}-${detail.medicineId}`}
                                          value={editPrescriptionDetailSearchTerm}
                                          onChange={(e) => handleMedicineSearch(e, 'edit')}
                                          onFocus={() => setShowEditPrescriptionDetailSearchResults(true)}
                                          placeholder="Tìm kiếm thuốc..."
                                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-10 p-2"
                                          required
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                      </div>
                                      {showEditPrescriptionDetailSearchResults && (
                                        <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                          {editPrescriptionDetailSearchResults.length > 0 ? (
                                            editPrescriptionDetailSearchResults.map(med => (
                                              <li
                                                key={med.id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer text-gray-8
                                                                                                text-sm"
                                                onClick={() => handleSelectMedicine(med, 'edit')}
                                              >
                                                {med.name} ({med.category})
                                              </li>
                                            ))
                                          ) : (
                                            <li className="p-2 text-sm text-gray-500 italic">Không tìm thấy thuốc nào.</li>
                                          )}
                                        </ul>
                                      )}
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                      <input
                                        type="number"
                                        value={selectedPrescriptionDetail.quantity}
                                        onChange={(e) => setSelectedPrescriptionDetail({ ...selectedPrescriptionDetail, quantity: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">Liều lượng</label>
                                      <input
                                        type="text"
                                        value={selectedPrescriptionDetail.dosage}
                                        onChange={(e) => setSelectedPrescriptionDetail({ ...selectedPrescriptionDetail, dosage: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">Tần suất</label>
                                      <input
                                        type="text"
                                        value={selectedPrescriptionDetail.frequency}
                                        onChange={(e) => setSelectedPrescriptionDetail({ ...selectedPrescriptionDetail, frequency: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                      />
                                    </div>
                                    <div className="col-span-full flex justify-end gap-2 mt-2">
                                      <button
                                        onClick={() => setSelectedPrescriptionDetail(null)}
                                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm flex items-center gap-1"
                                      >
                                        <XCircle className="w-4 h-4" /> Hủy
                                      </button>
                                      <button
                                        onClick={() => handleUpdatePrescriptionDetail(prescription.id, detail.medicineId)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                                      >
                                        <Save className="w-4 h-4" /> Lưu
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Display mode for prescription detail
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between group py-2 hover:bg-gray-100 rounded-md transition-colors duration-150 p-2 -mx-2">
                                    <div className="text-sm text-gray-700 flex-1">
                                      <p className="font-semibold text-base md:text-lg text-gray-900 mb-1 flex items-center gap-2">
                                        <Pill className="w-5 h-5 text-purple-600" />
                                        {detail.medicine?.name} (<span className="text-blue-600 font-normal">{detail.medicine?.category}</span>)
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-4 pl-7 text-gray-600">
                                        <p>Liều lượng: <span className="font-medium">{detail.dosage}</span></p>
                                        <p>Tần suất: <span className="font-medium">{detail.frequency}</span></p>
                                        <p>Số lượng: <span className="font-medium">{detail.quantity} {detail.medicine?.unit || 'viên'}</span></p>
                                        <p className="col-span-full">Giá: <span className="font-medium text-green-700">{detail.amount?.toLocaleString('vi-VN')} VNĐ</span></p>
                                        {detail.medicine?.description && <p className="text-xs text-gray-500 col-span-full">Mô tả: {detail.medicine.description}</p>}
                                        {detail.medicine?.contraindications && <p className="text-xs text-red-500 col-span-full">Chống chỉ định: {detail.medicine.contraindications}</p>}
                                        {detail.medicine?.interactions && <p className="text-xs text-orange-500 col-span-full">Tương tác thuốc: {detail.medicine.interactions}</p>}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 sm:mt-0 sm:ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <button
                                        onClick={() => setSelectedPrescriptionDetail({ ...detail, prescriptionId: prescription.id, medicineId: detail.medicineId, medicineName: detail.medicine?.name })}
                                        className="p-1.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                                        title="Chỉnh sửa chi tiết đơn thuốc"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePrescriptionDetail(prescription.id, detail.medicineId)}
                                        className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                        title="Xóa chi tiết đơn thuốc"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4 italic">Không có chi tiết đơn thuốc nào trong đơn này.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Không có đơn thuốc nào.</p>
                  )}
                </div>
              )}
              {activeTab === 'symptoms' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      ref={newSymptomInputRef}
                      type="text"
                      value={newSymptomName}
                      onChange={(e) => setNewSymptomName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSymptom();
                          e.preventDefault(); // Prevent default behavior (e.g., form submission)
                        }
                      }}
                      placeholder="Thêm triệu chứng mới..."
                      className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-full"
                    />
                    <button
                      onClick={handleAddSymptom}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md flex-shrink-0"
                    >
                      <Plus className="w-5 h-5" /> Thêm
                    </button>
                  </div>

                  {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 ? (
                    <ul className="list-none pl-0 text-gray-700 space-y-2">
                      {selectedRecord.symptoms.map((symptom) => (
                        <li key={symptom.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                          <span className="flex items-center gap-3 text-base">
                            <ListTodo className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <span className="font-medium text-gray-800">{symptom.name}</span>
                          </span>
                          <button
                            onClick={() => handleDeleteSymptom(symptom.id)}
                            className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa triệu chứng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4 italic">Không có triệu chứng nào được ghi nhận.</p>
                  )}
                </div>
              )}

              {activeTab === 'testResults' && (
                <div className="space-y-4">
                  {selectedRecord.testResults && selectedRecord.testResults.length > 0 ? (
                    selectedRecord.testResults.map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                          <Microscope className="w-5 h-5 text-cyan-600" /> Kết quả xét nghiệm: {result.name || 'N/A'}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700 pl-7 border-l-2 border-cyan-200 ml-1 pt-1">
                          <p>Mô tả: <span className="font-medium">{result.description || 'N/A'}</span></p>
                          <p>Thực hiện bởi: <span className="font-medium">{result.staff?.fullName || 'N/A'}</span> (<span className="text-gray-600">{result.staff?.expertise || 'Kỹ thuật viên'}</span>)</p>
                          <p>Ngày thực hiện: <span className="font-medium">{result.createdAt && isValid(parseISO(result.createdAt)) ? format(parseISO(result.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</span></p>
                          {result.image ? (
                            <div>
                              <p className="font-medium mt-2">Hình ảnh:</p>
                              <ResultImage
                                  src={`${IMAGE_URL}/${result.image}`}
                                  alt={`Kết quả ${result.name}`}
                                  onViewFull={openFullScreenImage} // NEW: Truyền hàm mở ảnh full-screen
                                />
                            </div>
                          ) : (
                            <p className="font-medium mt-2 text-gray-500 italic">Không có hình ảnh kết quả xét nghiệm.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 italic">Không có kết quả xét nghiệm nào.</p>
                  )}
                </div>
              )}
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
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  {selectedRecord.staff ? (
                    <DetailItem icon={<Stethoscope className="w-5 h-5 text-purple-500" />} label="Bác sĩ điều trị">
                      <p className="font-medium text-lg text-gray-900">{selectedRecord.staff.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Chuyên môn: <span className="font-medium">{selectedRecord.staff.expertise || 'N/A'}</span></p>
                      <p className="text-sm text-gray-600">Email: <span className="font-medium">{selectedRecord.staff.email || 'N/A'}</span></p>
                      <p className="text-sm text-gray-600">Số điện thoại: <span className="font-medium">{selectedRecord.staff.phone || 'N/A'}</span></p>
                    </DetailItem>
                  ) : (
                    <p className="text-center text-gray-500 py-4 italic">Không có thông tin bác sĩ điều trị.</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setIsEditingRecord(false);
                  setSelectedPrescriptionDetail(null); // Close any open prescription edit form
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Prescription Detail Modal */}
      {showAddPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => setShowAddPrescriptionModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
              <Pill className="w-6 h-6 text-green-600" /> Thêm Chi tiết Đơn thuốc
            </h2>
            <div className="space-y-4">
              <div className="relative" ref={newPrescriptionSearchRef}>
                <label htmlFor="medicineSearch" className="block text-sm font-medium text-gray-700">Thuốc</label>
                <div className="relative">
                  <input
                    type="text"
                    id="medicineSearch"
                    value={newPrescriptionDetail.medicineName || newPrescriptionDetailSearchTerm}
                    onChange={(e) => handleMedicineSearch(e, 'new')}
                    onFocus={() => setShowNewPrescriptionDetailSearchResults(true)}
                    placeholder="Tìm kiếm thuốc..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-10 p-2"
                    required
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {showNewPrescriptionDetailSearchResults && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {newPrescriptionDetailSearchResults.length > 0 ? (
                      newPrescriptionDetailSearchResults.map(med => (
                        <li
                          key={med.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                          onClick={() => handleSelectMedicine(med, 'new')}
                        >
                          {med.name} ({med.category})
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-sm text-gray-500 italic">Không tìm thấy thuốc nào.</li>
                    )}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
                <input
                  type="number"
                  id="quantity"
                  value={newPrescriptionDetail.quantity}
                  onChange={(e) => setNewPrescriptionDetail({ ...newPrescriptionDetail, quantity: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Liều lượng</label>
                <input
                  type="text"
                  id="dosage"
                  value={newPrescriptionDetail.dosage}
                  onChange={(e) => setNewPrescriptionDetail({ ...newPrescriptionDetail, dosage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Tần suất</label>
                <input
                  type="text"
                  id="frequency"
                  value={newPrescriptionDetail.frequency}
                  onChange={(e) => setNewPrescriptionDetail({ ...newPrescriptionDetail, frequency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddPrescriptionModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Hủy
              </button>
              <button
                onClick={handleAddPrescriptionDetail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Render */}
      {showConfirmModal && (
        <ConfirmationModal
          message={confirmModalMessage}
          onConfirm={confirmModalAction}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

// Helper component for Tab Buttons
const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200
      ${isActive ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
    `}
    onClick={onClick}
  >
    {icon} {label}
  </button>
);

// Helper component for Detail Items
const DetailItem = ({ icon, label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-3 border-b border-gray-100 pb-3 last:border-b-0">
    <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
      {icon}
      <strong className="font-semibold">{label}:</strong>
    </div>
    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
      {children}
    </div>
  </div>
);

export default MedicalRecordPageForDoctor;