import React, { useState, useRef, useEffect, useCallback } from 'react'; // Added useRef, useEffect
import { Pill, X, Search, XCircle, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AddPrescriptionModal = ({
  onClose,
  onSavePrescription,
  onClearForm,
  newPrescriptionDetail,
  onNewPrescriptionDetailChange,
  medicines,
  newPrescriptionSearchTerm,
  newPrescriptionSearchResults,
  showNewPrescriptionSearchResults,
  onShowNewPrescriptionSearchResults,
  onMedicineSearch,
  onSelectMedicine,
  newPrescriptionSearchRef,
  // (Thêm prop này từ MedicalRecordPageForDoctor)
  onFirstInputChange
}) => {
  const [detailsList, setDetailsList] = useState([]);

  // --- Logic gọi API confirm-inprogress một lần ---
  const interactionTriggeredModal = useRef(false);
  const triggerInProgressFromModal = useCallback(() => {
      if (!interactionTriggeredModal.current && onFirstInputChange) {
          onFirstInputChange();
          interactionTriggeredModal.current = true;
      }
  }, [onFirstInputChange]);
  useEffect(() => {
      interactionTriggeredModal.current = false; // Reset khi modal mở
  }, []);
  // --- Kết thúc logic gọi API ---


  const handleAddToList = () => {
    const { medicineId, quantity, dosage, frequency } = newPrescriptionDetail; // Bỏ medicineName

    if (!medicineId || !quantity || !dosage || !frequency) {
      toast.warn('Vui lòng điền đầy đủ thông tin thuốc.');
      return;
    }
    if (detailsList.find(detail => detail.medicineId === medicineId)) {
      toast.warn('Thuốc này đã có trong đơn.');
      return;
    }

    // Lấy tên thuốc từ danh sách medicines dựa trên medicineId đã chọn
    const selectedMedicine = medicines.find(m => m.id === parseInt(medicineId));
    const medicineNameForDisplay = selectedMedicine?.name || 'Không rõ';

    setDetailsList(prev => [...prev, {
      ...newPrescriptionDetail,
       medicineId: parseInt(medicineId), // Đảm bảo là số
       quantity: parseInt(quantity), // Đảm bảo là số
       medicineName: medicineNameForDisplay // Sử dụng tên vừa tìm được
     }]);
    onClearForm();
  };

  const handleRemoveFromList = (medicineId) => {
    setDetailsList(prev => prev.filter(detail => detail.medicineId !== medicineId));
  };

  // Hàm xử lý chung cho input change và gọi trigger
  const handleInputChange = (field, value) => {
      onNewPrescriptionDetailChange({ ...newPrescriptionDetail, [field]: value });
      triggerInProgressFromModal();
  };
   // Hàm xử lý cho search input
   const handleSearchChange = (e) => {
      onMedicineSearch(e, 'new'); // Vẫn gọi hàm search gốc
      triggerInProgressFromModal(); // Gọi trigger
   };
   // Hàm xử lý chọn thuốc
   const handleMedicineSelect = (med) => {
       onSelectMedicine(med, 'new'); // Gọi hàm chọn gốc
       triggerInProgressFromModal(); // Gọi trigger
   };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={{ marginTop: 0 }}
      onClick={onClose} // Thêm đóng khi click ra ngoài
    >
      {/* Giảm max-w một chút nếu cần */}
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-xl max-h-[90vh] flex flex-col" // Thêm flex flex-col
        onClick={e => e.stopPropagation()} // Ngăn đóng khi click bên trong
       >
        {/* --- Header --- */}
        <div className="flex justify-between items-center pb-3 mb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"> {/* Giảm kích thước font */}
            <Pill className="w-5 h-5 text-green-600" /> Tạo Đơn Thuốc Mới
            </h2>
            <button
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700" // Style lại nút X
            onClick={onClose}
            >
            <X className="w-5 h-5" />
            </button>
        </div>

        {/* --- Form thêm thuốc --- */}
        {/* Style lại form section */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/70 mb-4">
          {/* Thuốc */}
          <div className="relative" ref={newPrescriptionSearchRef}>
            <label htmlFor="medicineSearch" className="block text-sm font-medium text-gray-700 mb-1">Thuốc</label>
            <div className="relative">
              <input
                type="text"
                id="medicineSearch"
                // Hiển thị tên thuốc đã chọn (nếu có) hoặc search term
                value={newPrescriptionDetail.medicineId ? newPrescriptionDetail.medicineName : newPrescriptionSearchTerm}
                onChange={handleSearchChange} // Dùng hàm xử lý mới
                onFocus={() => onShowNewPrescriptionSearchResults(true)}
                placeholder="Gõ để tìm kiếm thuốc..."
                // Style input gọn hơn
                className="block w-full rounded-md border-gray-300 py-1.5 px-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
                // Vô hiệu hóa nếu đã chọn thuốc, khuyến khích clear form
                disabled={!!newPrescriptionDetail.medicineId}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /> {/* Icon nhỏ hơn */}
              {/* Nút clear thuốc đã chọn */}
              {newPrescriptionDetail.medicineId && (
                  <button
                      type="button"
                      onClick={onClearForm} // Clear form khi nhấn X
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  >
                      <XCircle className="w-4 h-4"/>
                  </button>
              )}
            </div>
            {/* Kết quả tìm kiếm (style lại) */}
            {showNewPrescriptionSearchResults && newPrescriptionSearchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg py-1">
                {newPrescriptionSearchResults.map(med => (
                  <li
                    key={med.id}
                    className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm"
                    onClick={() => handleMedicineSelect(med)} // Dùng hàm xử lý mới
                  >
                    {med.name} <span className="text-gray-500 text-xs">({med.category})</span>
                  </li>
                ))}
              </ul>
            )}
             {showNewPrescriptionSearchResults && newPrescriptionSearchResults.length === 0 && newPrescriptionSearchTerm && !newPrescriptionDetail.medicineId && (
                 <p className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 p-2 text-sm text-gray-500 italic shadow-lg">Không tìm thấy thuốc.</p>
             )}
          </div>
          {/* Grid Số lượng, Liều lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input
                type="number"
                id="quantity"
                value={newPrescriptionDetail.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)} // Dùng hàm xử lý mới
                // Style input gọn hơn
                className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
                min="1" // Thêm min
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Liều lượng</label>
              <input
                type="text"
                id="dosage"
                value={newPrescriptionDetail.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)} // Dùng hàm xử lý mới
                placeholder="VD: 1 viên/lần, 2 lần/ngày" // Thêm placeholder
                // Style input gọn hơn
                className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
              />
            </div>
          </div>
          {/* Tần suất */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Cách dùng / Tần suất</label>
            <input
              type="text"
              id="frequency"
              value={newPrescriptionDetail.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)} // Dùng hàm xử lý mới
              placeholder="VD: Uống sau ăn no" // Thêm placeholder
              // Style input gọn hơn
              className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
          {/* Nút "Thêm vào đơn" (style lại) */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleAddToList}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm shadow-sm" // Style nút nhỏ hơn
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>
        </div>

        {/* --- Danh sách thuốc đã thêm --- */}
        <div className="mt-4 flex-1 flex flex-col min-h-0"> {/* Thêm flex-1 flex flex-col min-h-0 */}
          <h3 className="text-base font-semibold text-gray-800 mb-2">Chi tiết đơn thuốc ({detailsList.length})</h3>
          {/* Style lại danh sách */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border rounded-lg p-2 bg-gray-50/70 min-h-[50px]"> {/* Thêm flex-1 min-h */}
            {detailsList.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-3">Chưa có thuốc nào.</p>
            ) : (
              detailsList.map((detail, index) => (
                // Style lại item thuốc
                <div key={index} className="group flex justify-between items-center p-2 rounded-md bg-white border border-gray-200/80 hover:bg-gray-50">
                  <div className="text-sm flex-1 mr-2">
                    <p className="font-medium text-gray-800">{detail.medicineName}</p>
                    <p className="text-gray-600 text-xs">SL: {detail.quantity} | {detail.dosage} | {detail.frequency}</p>
                  </div>
                  {/* Style lại nút xóa, hiện khi hover */}
                  <button
                    onClick={() => handleRemoveFromList(detail.medicineId)}
                    className="p-1 rounded text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    title="Xóa thuốc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Các nút cuối cùng (style lại) --- */}
        <div className="mt-5 pt-4 border-t flex justify-end gap-3"> {/* Giảm mt, thêm pt, border-t */}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-1.5" // Style lại nút Hủy
          >
            <XCircle className="w-4 h-4" /> Hủy
          </button>
          <button
            onClick={() => onSavePrescription(detailsList)}
            className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" // Style lại nút Lưu
            disabled={detailsList.length === 0} // Disable nếu chưa có thuốc
          >
            <Save className="w-4 h-4" /> Lưu Đơn Thuốc
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;