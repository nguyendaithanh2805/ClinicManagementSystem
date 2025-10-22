import React, { useState } from 'react';
import { Pill, X, Search, XCircle, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AddPrescriptionModal = ({
  onClose,
  onSavePrescription, // Đổi tên từ onAdd
  onClearForm, // Prop mới để reset form
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
}) => {
  // State nội bộ để lưu danh sách thuốc sẽ thêm
  const [detailsList, setDetailsList] = useState([]);

  // Hàm xử lý khi nhấn nút "Thêm vào đơn"
  const handleAddToList = () => {
    const { medicineId, medicineName, quantity, dosage, frequency } = newPrescriptionDetail;

    // Kiểm tra thông tin
    if (!medicineId || !quantity || !dosage || !frequency) {
      toast.warn('Vui lòng điền đầy đủ thông tin thuốc.');
      return;
    }
    
    // Kiểm tra trùng lặp
    if (detailsList.find(detail => detail.medicineId === medicineId)) {
        toast.warn('Thuốc này đã có trong đơn.');
        return;
    }

    // Thêm vào danh sách nội bộ
    // Chúng ta cần cả medicineName (từ onSelectMedicine) để hiển thị
    const medicineNameForDisplay = newPrescriptionDetail.medicineName || 
                                   (medicines.find(m => m.id === medicineId)?.name || 'Không rõ');
                                   
    setDetailsList(prev => [...prev, { ...newPrescriptionDetail, medicineName: medicineNameForDisplay }]);
    
    // Gọi hàm của cha để reset form
    onClearForm(); 
  };

  // Hàm xóa thuốc khỏi danh sách tạm
  const handleRemoveFromList = (medicineId) => {
    setDetailsList(prev => prev.filter(detail => detail.medicineId !== medicineId));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={{ marginTop: 0 }}
    >
      {/* Tăng kích thước modal để có thêm không gian */}
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
          <Pill className="w-6 h-6 text-green-600" /> Tạo Đơn Thuốc Mới
        </h2>

        {/* --- Form để thêm 1 thuốc vào danh sách --- */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
          <h3 className="font-semibold text-gray-700">Thông tin thuốc</h3>
          <div className="relative" ref={newPrescriptionSearchRef}>
            <label htmlFor="medicineSearch" className="block text-sm font-medium text-gray-700">Thuốc</label>
            <div className="relative">
              <input
                type="text"
                id="medicineSearch"
                value={newPrescriptionDetail.medicineName || newPrescriptionSearchTerm}
                onChange={(e) => onMedicineSearch(e, 'new')}
                onFocus={() => onShowNewPrescriptionSearchResults(true)}
                placeholder="Tìm kiếm thuốc..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-10 p-2"
                required
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {showNewPrescriptionSearchResults && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                {newPrescriptionSearchResults.length > 0 ? (
                  newPrescriptionSearchResults.map(med => (
                    <li
                      key={med.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                      onClick={() => onSelectMedicine(med, 'new')}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
              <input
                type="number"
                id="quantity"
                value={newPrescriptionDetail.quantity}
                onChange={(e) => onNewPrescriptionDetailChange({ ...newPrescriptionDetail, quantity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Liều lượng</label>
              <input
                type="text"
                id="dosage"
                value={newPrescriptionDetail.dosage}
                onChange={(e) => onNewPrescriptionDetailChange({ ...newPrescriptionDetail, dosage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Tần suất</label>
            <input
              type="text"
              id="frequency"
              value={newPrescriptionDetail.frequency}
              onChange={(e) => onNewPrescriptionDetailChange({ ...newPrescriptionDetail, frequency: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              required
            />
          </div>
          {/* Nút "Thêm vào đơn" */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAddToList}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" /> Thêm vào đơn
            </button>
          </div>
        </div>

        {/* --- Danh sách thuốc đã thêm --- */}
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 mb-2">Chi tiết đơn thuốc ({detailsList.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border rounded-lg p-2 bg-gray-50">
            {detailsList.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4">Chưa có thuốc nào trong đơn.</p>
            ) : (
              detailsList.map((detail, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="text-sm flex-1">
                    <p className="font-medium text-gray-900">{detail.medicineName}</p>
                    <p className="text-gray-600">SL: {detail.quantity} | {detail.dosage} | {detail.frequency}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromList(detail.medicineId)}
                    className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 ml-2"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Các nút cuối cùng --- */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" /> Hủy
          </button>
          <button
            onClick={() => onSavePrescription(detailsList)} // Gửi cả danh sách đi
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" /> Lưu Đơn Thuốc
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;