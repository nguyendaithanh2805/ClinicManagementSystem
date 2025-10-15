import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Microscope, User, CalendarDays, Plus, X, Search, UploadCloud, Eye, XCircle, Stethoscope,
  ChevronLeft, ChevronRight, Edit, Trash2 // Added Edit and Trash2 icons
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from "react-toastify";
import api from "../../admins-layout/contexts/Api";
import { formatInTimeZone } from 'date-fns-tz';
import ConfirmationModal from  "../ConfirmationModal";

const ITEMS_PER_PAGE = 5;

const LabTechnicianPage = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  
  // State cho modal tải lên kết quả xét nghiệm
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTestResult, setNewTestResult] = useState({
    name: '',
    description: '',
    file: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // State cho modal chỉnh sửa kết quả xét nghiệm
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTestResult, setEditingTestResult] = useState(null); // Stores the test result being edited
  const [editFilePreview, setEditFilePreview] = useState(null);
  const editFileInputRef = useRef(null);

  const [fullScreenImage, setFullScreenImage] = useState(null);
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const results = medicalRecords.filter(record =>
        (record.patient?.fullName.toLowerCase().includes(lowercasedSearchTerm) ||
         record.diagnosis?.toLowerCase().includes(lowercasedSearchTerm)) &&
        record.requiresTest
      );
      setFilteredMedicalRecords(results);
    } else {
      setFilteredMedicalRecords(medicalRecords.filter(record => record.requiresTest));
    }
    setCurrentPage(1);
  }, [medicalRecords, searchTerm]);

  const fetchMedicalRecords = async () => {
    try {
      const response = await api.get('/staff/medical-records');
      if (response.data.status) {
        const recordsNeedingTest = response.data.data.filter(record => record.requiresTest);
        const sortedRecords = recordsNeedingTest.sort((a, b) => b.id - a.id);
        setMedicalRecords(sortedRecords);
        if (selectedRecord) {
          // Update selectedRecord to get the latest test results after changes
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTestResult(prev => ({ ...prev, file: file }));
      setFilePreview(URL.createObjectURL(file));
    } else {
      setNewTestResult(prev => ({ ...prev, file: null }));
      setFilePreview(null);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingTestResult(prev => ({ ...prev, newFile: file })); // Use newFile for replacement
      setEditFilePreview(URL.createObjectURL(file));
    } else {
      setEditingTestResult(prev => ({ ...prev, newFile: null }));
      setEditFilePreview(null);
    }
  };

  const handleUploadTestResult = async () => {
    if (!selectedRecord) {
      toast.error('Không có hồ sơ bệnh án nào được chọn.');
      return;
    }
    if (!newTestResult.name.trim() || !newTestResult.description.trim() || !newTestResult.file) {
      toast.warn('Vui lòng điền đầy đủ tên, mô tả và chọn tệp ảnh.');
      return;
    }

    const formData = new FormData();
    formData.append('patientMedicalRecordId', selectedRecord.id);
    formData.append('name', newTestResult.name);
    formData.append('description', newTestResult.description);
    formData.append('file', newTestResult.file);

    try {
      const response = await api.post('/staff/labs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        toast.success(response.data.message);
        setShowUploadModal(false);
        setNewTestResult({ name: '', description: '', file: null });
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMedicalRecords();
      } else {
        toast.error(response.data.message || 'Tải lên kết quả xét nghiệm thất bại.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi tải lên kết quả xét nghiệm.');
      console.error('Lỗi khi tải lên kết quả xét nghiệm:', error);
    }
  };

  const handleEditTestResult = async () => {
    if (!editingTestResult || !editingTestResult.id) {
      toast.error('Không có kết quả xét nghiệm nào được chọn để chỉnh sửa.');
      return;
    }
    if (!editingTestResult.name.trim() || !editingTestResult.description.trim()) {
      toast.warn('Tên và mô tả xét nghiệm không được để trống.');
      return;
    }

    const formData = new FormData();
    formData.append('id', editingTestResult.id);
    formData.append('name', editingTestResult.name);
    formData.append('description', editingTestResult.description);
    // Only append file if a new one is selected
    if (editingTestResult.newFile) {
      formData.append('file', editingTestResult.newFile);
    }

    try {
      const response = await api.patch(`/staff/labs/${editingTestResult.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        toast.success(response.data.message || 'Cập nhật kết quả xét nghiệm thành công!');
        setShowEditModal(false);
        setEditingTestResult(null);
        setEditFilePreview(null);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
        fetchMedicalRecords(); // Refresh data to show changes
      } else {
        toast.error(response.data.message || 'Cập nhật kết quả xét nghiệm thất bại.');
        console.error(response.data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ khi cập nhật kết quả xét nghiệm.');
      console.error('Lỗi khi cập nhật kết quả xét nghiệm:', error);
    }
  };

  const handleDeleteTestResult = async (resultId) => {
    setConfirmModalMessage('Bạn có chắc chắn muốn xóa kết quả xét nghiệm này không?');
    setConfirmModalAction(() => async () => {
      try {
        const response = await api.delete(`/staff/labs/${resultId}`);
        if (response.status == 204) {
          toast.success('Xóa kết quả xét nghiệm thành công!');
          fetchMedicalRecords();
        } else {
          toast.error('Xóa kết quả xét nghiệm thất bại.');
        }
      } catch (error) {
        toast.error('Lỗi khi kết nối đến máy chủ khi xóa kết quả xét nghiệm.');
        console.error('Lỗi khi xóa kết quả xét nghiệm:', error);
      } finally {
        setShowConfirmModal(false);
      }
    })
    setShowConfirmModal(true);
  };

  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  const totalPages = Math.ceil(filteredMedicalRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredMedicalRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  function ResultImage({ src, alt, onViewFull }) {
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
          className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 object-cover max-h-32 w-48 cursor-pointer transform hover:scale-105 transition-transform duration-200"
          onError={() => setError(true)}
          onClick={() => onViewFull(src)}
        />
        <button
          onClick={() => onViewFull(src)}
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
              <Microscope className="w-4 h-4 inline-block text-gray-500" />
              Yêu cầu xét nghiệm: <span className="font-semibold text-indigo-700">{record.requiresTest ? 'Có' : 'Không'}</span>
            </p>
          </div>
          <button
            onClick={onClick}
            className="mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> Xem chi tiết & Tải lên KQ
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span>Ngày tạo: {record.createAt && isValid(parseISO(record.createAt)) ? format(parseISO(record.createAt), 'HH:mm dd/MM/yyyy', { locale: vi }) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>Bác sĩ chỉ định: {record.staff?.fullName || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Xét nghiệm</h1>
        <p className="text-gray-500">Xem các hồ sơ bệnh án yêu cầu xét nghiệm và tải lên kết quả.</p>
      </div>

      <div className="mt-4 mb-6 flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <Search className="w-5 h-5 text-gray-500 mr-3" />
        <input
          type="text"
          placeholder="Tìm kiếm hồ sơ theo tên bệnh nhân hoặc chẩn đoán..."
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

      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Danh sách Hồ sơ Bệnh án Yêu cầu Xét nghiệm
        </h3>

        <div className="space-y-4">
          {paginatedRecords.length > 0 ? (
            paginatedRecords.map(record => (
              <MedicalRecordCard
                key={record.id}
                record={record}
                onClick={() => setSelectedRecord(record)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? `Không tìm thấy hồ sơ bệnh án yêu cầu xét nghiệm nào cho "${searchTerm}".` : 'Không có hồ sơ bệnh án nào yêu cầu xét nghiệm.'}
            </p>
          )}
        </div>

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

      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => setSelectedRecord(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" /> Chi tiết Hồ sơ Bệnh án - {selectedRecord.patient?.fullName || 'N/A'}
            </h2>

            <div className="space-y-4 text-gray-700 mb-6">
              <DetailItem icon={<User className="w-5 h-5 text-blue-500" />} label="Bệnh nhân">
                <p>{selectedRecord.patient?.fullName || 'N/A'}</p>
              </DetailItem>
              <DetailItem icon={<Microscope className="w-5 h-5 text-indigo-500" />} label="Yêu cầu xét nghiệm">
                <p className="font-semibold text-indigo-700">{selectedRecord.requiresTest ? 'Có' : 'Không'}</p>
              </DetailItem>
              <DetailItem icon={<CalendarDays className="w-5 h-5 text-gray-500" />} label="Ngày tạo hồ sơ">
                <p>{selectedRecord.createdAt && isValid(parseISO(selectedRecord.createdAt)) ? formatInTimeZone(parseISO(selectedRecord.createdAt), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</p>
              </DetailItem>
              <DetailItem icon={<Stethoscope className="w-5 h-5 text-purple-500" />} label="Bác sĩ chỉ định">
                <p>{selectedRecord.staff?.fullName || 'N/A'}</p>
              </DetailItem>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 pt-4 border-t">
                Kết quả Xét nghiệm đã có
              </h3>
              {selectedRecord.testResults && selectedRecord.testResults.length > 0 ? (
                <div className="space-y-3">
                  {selectedRecord.testResults.map((result, index) => (
                    <div key={result.id || index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <Microscope className="w-5 h-5 text-cyan-600" /> {result.name || 'N/A'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditingTestResult({ ...result, newFile: null }); // Initialize newFile to null
                                    setEditFilePreview(result.image ? `${IMAGE_URL}/${result.image}` : null);
                                    setShowEditModal(true);
                                }}
                                className="p-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                title="Sửa kết quả"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteTestResult(result.id)}
                                className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                title="Xóa kết quả"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 pl-7">Mô tả: {result.description || 'N/A'}</p>
                      <p className="text-xs text-gray-600 pl-7">Ngày tải lên: {result.createdAt && isValid(parseISO(result.createdAt)) ? format(parseISO(result.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</p>
                      {result.image && (
                        <div>
                           <ResultImage
                              src={`${IMAGE_URL}/${result.image}`}
                              alt={`Kết quả ${result.name}`}
                              onViewFull={openFullScreenImage}
                            />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4 italic">Chưa có kết quả xét nghiệm nào được tải lên cho hồ sơ này.</p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <Plus className="w-5 h-5" /> Tải lên Kết quả Xét nghiệm mới
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Test Result Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => {
                setShowUploadModal(false);
                setNewTestResult({ name: '', description: '', file: null });
                setFilePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-green-600" /> Tải lên Kết quả Xét nghiệm
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="testName" className="block text-sm font-medium text-gray-700">Tên xét nghiệm</label>
                <input
                  type="text"
                  id="testName"
                  value={newTestResult.name}
                  onChange={(e) => setNewTestResult({ ...newTestResult, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="testDescription" className="block text-sm font-medium text-gray-700">Mô tả kết quả</label>
                <textarea
                  id="testDescription"
                  value={newTestResult.description}
                  onChange={(e) => setNewTestResult({ ...newTestResult, description: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="testFile" className="block text-sm font-medium text-gray-700">Tệp hình ảnh kết quả</label>
                <input
                  type="file"
                  id="testFile"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
                {filePreview && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Xem trước ảnh:</p>
                    <img src={filePreview} alt="File preview" className="max-w-full h-auto max-h-48 object-contain rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setNewTestResult({ name: '', description: '', file: null });
                  setFilePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Hủy
              </button>
              <button
                onClick={handleUploadTestResult}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <UploadCloud className="w-5 h-5" /> Tải lên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Result Modal */}
      {showEditModal && editingTestResult && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ marginTop: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              onClick={() => {
                setShowEditModal(false);
                setEditingTestResult(null);
                setEditFilePreview(null);
                if (editFileInputRef.current) editFileInputRef.current.value = '';
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
              <Edit className="w-6 h-6 text-blue-600" /> Chỉnh sửa Kết quả Xét nghiệm
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="editTestName" className="block text-sm font-medium text-gray-700">Tên xét nghiệm</label>
                <input
                  type="text"
                  id="editTestName"
                  value={editingTestResult.name || ''}
                  onChange={(e) => setEditingTestResult({ ...editingTestResult, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="editTestDescription" className="block text-sm font-medium text-gray-700">Mô tả kết quả</label>
                <textarea
                  id="editTestDescription"
                  value={editingTestResult.description || ''}
                  onChange={(e) => setEditingTestResult({ ...editingTestResult, description: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="editTestFile" className="block text-sm font-medium text-gray-700">Tệp hình ảnh kết quả (Để trống nếu không muốn thay đổi)</label>
                <input
                  type="file"
                  id="editTestFile"
                  ref={editFileInputRef}
                  onChange={handleEditFileChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {(editFilePreview || editingTestResult.image) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại/Xem trước:</p>
                    <img
                      src={editFilePreview || (editingTestResult.image ? `${IMAGE_URL}/${editingTestResult.image}` : null)}
                      alt="Current/File preview"
                      className="max-w-full h-auto max-h-48 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTestResult(null);
                  setEditFilePreview(null);
                  if (editFileInputRef.current) editFileInputRef.current.value = '';
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Hủy
              </button>
              <button
                onClick={handleEditTestResult}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-5 h-5" /> Cập nhật
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

      {/* Full Screen Image Modal */}
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
    </div>
  );
};

// Helper component for Detail Items (tái sử dụng từ trang của Bác sĩ)
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

export default LabTechnicianPage;