import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText, Pill, User, Stethoscope, ListTodo, ClipboardCheck,
  Microscope, Eye, X, Info, Edit, Plus, Trash2, Save, XCircle, Search, CalendarDays, Clock 
} from 'lucide-react';
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

// Helper component for Result Image
function ResultImage({ src, alt, onViewFull, imageUrl }) {
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
        src={`${imageUrl}/${src}`}
        alt={alt}
        className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 object-cover max-h-32 w-48 cursor-pointer transform hover:scale-105 transition-transform duration-200"
        onError={() => setError(true)}
        onClick={() => onViewFull(`${imageUrl}/${src}`)}
      />
      <button
        onClick={() => onViewFull(`${imageUrl}/${src}`)}
        className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
      >
        <Eye className="w-4 h-4" /> Xem ảnh
      </button>
    </div>
  );
}


const MedicalRecordDetailModal = ({
  record,
  isEditing,
  editedRecord,
  onClose,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onEditedRecordChange,
  activeTab,
  onTabChange,
  isCompleted,
  // Symptoms
  newSymptomName,
  onNewSymptomChange,
  onAddSymptom,
  onDeleteSymptom,
  newSymptomInputRef,
  // Prescriptions
  onDeletePrescription,
  onShowAddPrescriptionModal,
  selectedPrescriptionDetail,
  onSelectPrescriptionDetail,
  onDeletePrescriptionDetail,
  onUpdatePrescriptionDetail,
  getAppointmentStatusIcon,
  getAppointmentStatusText,
  getAppointmentStatusColorClass,
  getRevisitStatusText,
  getRevisitStatusColorClass,
  onInteractionStart,
  onViewFullImage,
  format,
  parseISO,
  isValid,
  viLocale,
  formatDbUtcToVnTime,
  imageUrl,
}) => {
  // --- STATE CỤC BỘ MỚI CHO TÌM KIẾM/LỌC ĐƠN THUỐC ---
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const interactionTriggered = useRef(false);

  // 3. Kiểm tra cờ và xem hàm xử lý API (truyền từ cha) có tồn tại không.
    //    - '!interactionTriggered.current': Chỉ tiếp tục nếu cờ vẫn là 'false' (API chưa được gọi).
    //    - 'onInteractionStart': Đảm bảo hàm được truyền từ component cha (prop) tồn tại.
  const triggerInProgressConfirmation = useCallback(() => {
    if (!interactionTriggered.current && onInteractionStart) {
      // 4. Gọi hàm xử lý API được truyền từ component cha (thường là hàm gọi API PUT).
       onInteractionStart(record.id);

       // 5. Đặt cờ thành 'true' ngay sau khi gọi.
       //    Điều này ngăn API bị gọi lại trong các tương tác tiếp theo
       //    (ví dụ: gõ thêm chữ, thay đổi checkbox khác) trong cùng một lần xem modal cho hồ sơ này.
       interactionTriggered.current = true;
    }
  }, [onInteractionStart, record.id]);

  // 6. Reset (đặt lại) cờ khi hồ sơ đang xem thay đổi.
  //    - useEffect này chạy mỗi khi giá trị trong mảng dependencies của nó ([record.id]) thay đổi.
  //    - Nó đảm bảo rằng khi người dùng đóng modal và mở nó cho một hồ sơ *khác*,
  //      hoặc nếu prop 'record' cập nhật sang một ID khác khi modal đang mở,
  //      cờ sẽ được reset về 'false', cho phép gọi API cho tương tác đầu tiên của hồ sơ *mới*.
  useEffect(() => {
      console.log(`Reset cờ tương tác cho hồ sơ ${record.id}.`); // Tùy chọn: dùng để debug
      interactionTriggered.current = false;
      // Dependency: Chạy lại effect này khi record.id thay đổi.
  }, [record.id]);

  // Tìm lịch hẹn liên kết trực tiếp với HSBA này
  const linkedAppointment = record.appointments?.find(
    apt => apt.patientMedicalRecordId === record.id
  );

  const linkedAppointmentStatus = linkedAppointment?.status;

  // (MỚI) Tạo biến điều kiện tổng hợp để vô hiệu hóa
  // Giao diện sẽ chỉ đọc nếu HSBA đã hoàn thành HOẶC LH chỉ mới ở trạng thái "Đã xác nhận" (1)
  const isReadOnly = isCompleted || !linkedAppointment || linkedAppointmentStatus === 1;
  const readOnlyReason = isCompleted
      ? "Hồ sơ đã hoàn thành."
      : (!linkedAppointment
        ? "Không tìm thấy lịch hẹn liên kết."
        : (linkedAppointmentStatus === 1
            ? "Lịch hẹn chưa chuyển sang trạng thái khám."
            : ""
          )
        );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
          <TabButton icon={<Info className="w-5 h-5" />} label="Tổng quan" isActive={activeTab === 'summary'} onClick={() => onTabChange('summary')} />
          <TabButton icon={<Pill className="w-5 h-5" />} label="Đơn thuốc" isActive={activeTab === 'prescriptions'} onClick={() => onTabChange('prescriptions')} />
          <TabButton icon={<ListTodo className="w-5 h-5" />} label="Triệu chứng" isActive={activeTab === 'symptoms'} onClick={() => onTabChange('symptoms')} />
          <TabButton icon={<Microscope className="w-5 h-5" />} label="Kết quả XN" isActive={activeTab === 'testResults'} onClick={() => onTabChange('testResults')} />
          <TabButton icon={<Stethoscope className="w-5 h-5" />} label="Thông tin BS" isActive={activeTab === 'staff'} onClick={() => onTabChange('staff')} />
          <TabButton icon={<CalendarDays className="w-4 h-4" />} label="Lịch hẹn" isActive={activeTab === 'appointments'} onClick={() => onTabChange('appointments')} />
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'summary' && (
            <div className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Chi tiết Hồ sơ Bệnh án</span>

                {linkedAppointment && getAppointmentStatusText && getAppointmentStatusColorClass ? (
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getAppointmentStatusColorClass(linkedAppointment.status)} bg-opacity-80`}>
                    Trạng thái: {getAppointmentStatusText(linkedAppointment.status)}
                    </span>
                ) : (
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">
                        Trạng thái: K.liên kết
                    </span>
                )}

                {!isEditing && (
                  <button
                    onClick={onEdit}
                    className="ml-auto px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-1
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-100"
                    disabled={isReadOnly}
                    title={isReadOnly ? readOnlyReason : "Chỉnh sửa hồ sơ"}
                  >
                    <Edit className="w-4 h-4" /> Chỉnh sửa hồ sơ
                  </button>
                )}
              </h2>
              <DetailItem icon={<User className="w-5 h-5 text-blue-500" />} label="Bệnh nhân">
                <p>{record.patient?.fullName || 'N/A'}</p>
                <p className="text-sm text-gray-500">Ngày sinh: {record.patient?.dateOfBirth ? format(parseISO(record.patient.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}</p>
                <p className="text-sm text-gray-500">Địa chỉ: {record.patient?.address || 'N/A'}</p>
              </DetailItem>
              <DetailItem icon={<ClipboardCheck className="w-5 h-5 text-green-500" />} label="Chẩn đoán">
                {isEditing ? (
                  <textarea
                    value={editedRecord.diagnosis || ''}
                    onChange={(e) => {
                      onEditedRecordChange({ ...editedRecord, diagnosis: e.target.value });
                      triggerInProgressConfirmation();
                    }}
                    disabled={isReadOnly}
                    placeholder={isReadOnly ? "Không thể chỉnh sửa" : "Nhập chẩn đoán..."}
                    className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                    rows="3"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{record.diagnosis || 'Không có'}</p>
                )}
              </DetailItem>
              <DetailItem icon={<ListTodo className="w-5 h-5 text-indigo-500" />} label="Phương pháp điều trị">
                {isEditing ? (
                  <textarea
                    value={editedRecord.treatmentMethod || ''}
                    onChange={(e) => {
                      onEditedRecordChange({ ...editedRecord, treatmentMethod: e.target.value });
                      triggerInProgressConfirmation();
                    }}
                    disabled={isReadOnly}
                    placeholder={isReadOnly ? "Không thể chỉnh sửa" : "Nhập phương pháp điều trị..."}
                    className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                    rows="3"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{record.treatmentMethod || 'Không có'}</p>
                )}
              </DetailItem>
              <DetailItem icon={<Info className="w-5 h-5 text-orange-500" />} label="Yêu cầu xét nghiệm">
                {isEditing ? (
                  <label className="flex items-center space-x-2 mt-1">
                    <input
                      type="checkbox"
                      checked={editedRecord.requiresTest || false}
                      onChange={(e) => {
                        onEditedRecordChange({ ...editedRecord, requiresTest: e.target.checked });
                        triggerInProgressConfirmation();
                      }}
                      disabled={isReadOnly}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Yêu cầu xét nghiệm</span>
                  </label>
                ) : (
                  <p>{record.requiresTest ? 'Có' : 'Không'}</p>
                )}
              </DetailItem>
              {isEditing && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Hủy
                  </button>
                  <button
                    onClick={onSaveEdit}
                    disabled={isReadOnly}
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
                   onClick={onShowAddPrescriptionModal}
                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                   disabled={isReadOnly}
                   title={isReadOnly ? readOnlyReason : "Thêm đơn thuốc mới"}
                 >
                   <Plus className="w-5 h-5" /> Thêm đơn thuốc
                 </button>
               </div>
               
               {/* --- KHUNG TÌM KIẾM VÀ LỌC NGÀY --- */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 {/* Thanh tìm kiếm */}
                 <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                   <Search className="w-5 h-5 text-gray-500 mr-3" />
                   <input
                     type="text"
                     placeholder="Tìm theo Mã ĐT hoặc Tên thuốc..."
                     className="flex-1 border-none focus:ring-0 outline-none text-gray-800 placeholder-gray-500"
                     value={prescriptionSearchTerm}
                     onChange={(e) => setPrescriptionSearchTerm(e.target.value)}
                   />
                   {prescriptionSearchTerm && (
                     <button
                       onClick={() => setPrescriptionSearchTerm('')}
                       className="ml-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                       title="Xóa tìm kiếm"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   )}
                 </div>
                 
                 {/* Ô lọc ngày */}
                 <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                   <CalendarDays className="w-5 h-5 text-gray-500 mr-3" />
                   <input
                     type="date"
                     className="flex-1 border-none focus:ring-0 outline-none text-gray-800"
                     value={filterDate}
                     onChange={(e) => setFilterDate(e.target.value)}
                   />
                   {filterDate && (
                     <button
                       onClick={() => setFilterDate('')}
                       className="ml-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                       title="Xóa ngày"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   )}
                 </div>
               </div>
               {/* --- KẾT THÚC KHUNG TÌM KIẾM --- */}

               {/* --- LOGIC LỌC VÀ RENDER DANH SÁCH ĐƠN THUỐC --- */}
               {(() => {
                 const searchTerm = prescriptionSearchTerm.toLowerCase().trim();
                 
                 // (MỚI) Định dạng ngày lọc sang dd/MM/yyyy nếu có
                 let filterDateFormatted = '';
                 if (filterDate) {
                   try {
                     const parsedFilterDate = parseISO(filterDate); // Input type="date" cho ra 'yyyy-MM-dd'
                     if (isValid(parsedFilterDate)) {
                        filterDateFormatted = format(parsedFilterDate, 'dd/MM/yyyy'); // Chuyển thành 'dd/MM/yyyy'
                     }
                   } catch (e) {
                      console.error("Lỗi parse ngày lọc:", e); 
                   }
                 }
                 
                 const filteredPrescriptions = (record.prescriptions || []).filter(p => {
                    
                   // 1. Lọc theo ngày (nếu có)
                   // So sánh bằng ngày đã format sang VN (dd/MM/yyyy)
                   const vnPrescriptionDateTime = formatDbUtcToVnTime(p.prescriptionDate); // vd: "22/10/2025 01:54"
                   // So sánh phần ngày ('dd/MM/yyyy')
                   const dateMatches = !filterDateFormatted || vnPrescriptionDateTime.startsWith(filterDateFormatted);
                   if (!dateMatches) return false;

                   // 2. Lọc theo search term (logic không đổi)
                   if (!searchTerm) return true; 

                   const idMatches = String(p.id).includes(searchTerm);
                   if (idMatches) return true;

                   const medicineNameMatches = p.prescriptionDetails.some(detail => 
                     detail.medicine?.name.toLowerCase().includes(searchTerm)
                   );
                   
                   return medicineNameMatches;
                 });

                 if (filteredPrescriptions.length > 0) {
                   return filteredPrescriptions.map((prescription, index) => (
                     <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                       <h4 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2 border-b pb-2">
                         <CalendarDays className="w-5 h-5 text-emerald-600" /> Đơn thuốc ngày {
                           formatDbUtcToVnTime(prescription.prescriptionDate)
                         }
                         <span className="text-gray-500 font-medium text-sm">
                           | Mã đơn thuốc: {prescription.id}
                         </span>
                       <button
                           onClick={() => onDeletePrescription(prescription.id)}
                           className="ml-auto p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-100"
                           title="Xóa đơn thuốc"
                           disabled={isReadOnly}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </h4>
                       <div className="space-y-3 pl-2 border-l-2 border-emerald-200 ml-1">
                         {prescription.prescriptionDetails && prescription.prescriptionDetails.length > 0 ? (
                           prescription.prescriptionDetails.map((detail, detIndex) => (
                             <div key={detIndex} className="border-t border-gray-100 pt-3 mt-3 first:border-t-0 first:pt-0">
                               {selectedPrescriptionDetail && selectedPrescriptionDetail.prescriptionId === prescription.id && selectedPrescriptionDetail.medicineId === detail.medicineId ? (
                                 // Edit form
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                   <div className="relative col-span-full">
                                     <label htmlFor={`editMedicineSearch-${prescription.id}-${detail.medicineId}`} className="block text-sm font-medium text-gray-700">Thuốc (Chỉ xem)</label>
                                     <div className="relative">
                                         <input
                                           type="text"
                                           id={`editMedicineSearch-${prescription.id}-${detail.medicineId}`}
                                           value={selectedPrescriptionDetail.medicineName || ''}
                                           disabled
                                           readOnly
                                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-10 p-2
                                                        disabled:bg-gray-100 disabled:cursor-not-allowed" // Thêm style disabled
                                         />
                                         <Pill className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                     </div>
                                   </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                     <input
                                       type="number"
                                       value={selectedPrescriptionDetail.quantity}
                                       onChange={(e) => {
                                        onSelectPrescriptionDetail({ ...selectedPrescriptionDetail, quantity: e.target.value });
                                        triggerInProgressConfirmation();
                                      }}
                                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                     />
                                   </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700">Liều lượng</label>
                                     <input
                                       type="text"
                                       value={selectedPrescriptionDetail.dosage}
                                       onChange={(e) => {
                                        onSelectPrescriptionDetail({ ...selectedPrescriptionDetail, dosage: e.target.value });
                                        triggerInProgressConfirmation();
                                      }}
                                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                     />
                                   </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700">Tần suất</label>
                                     <input
                                       type="text"
                                       value={selectedPrescriptionDetail.frequency}
                                       onChange={(e) => {
                                        onSelectPrescriptionDetail({ ...selectedPrescriptionDetail, frequency: e.target.value });
                                        triggerInProgressConfirmation();
                                      }}
                                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                     />
                                   </div>
                                   <div className="col-span-full flex justify-end gap-2 mt-2">
                                     <button
                                       onClick={() => onSelectPrescriptionDetail(null)}
                                       className="px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm flex items-center gap-1"
                                     >
                                       <XCircle className="w-4 h-4" /> Hủy
                                     </button>
                                     <button
                                       onClick={() => onUpdatePrescriptionDetail(prescription.id, detail.medicineId)}
                                       className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1
                                                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                       disabled={isReadOnly}
                                     >
                                       <Save className="w-4 h-4" /> Lưu
                                     </button>
                                   </div>
                                 </div>
                               ) : (
                                 // Display mode
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
                                       onClick={() => onSelectPrescriptionDetail({ ...detail, prescriptionId: prescription.id, medicineId: detail.medicineId, medicineName: detail.medicine?.name })}
                                       className="p-1.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors
                                                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-yellow-100"
                                       title="Chỉnh sửa chi tiết đơn thuốc"
                                       disabled={isReadOnly}
                                     >
                                       <Edit className="w-4 h-4" />
                                     </button>
                                     <button
                                       onClick={() => onDeletePrescriptionDetail(prescription.id, detail.medicineId)}
                                       className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors
                                                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-100"
                                       title="Xóa chi tiết đơn thuốc"
                                       disabled={isReadOnly}
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
                   ));
                 } else {
                   return (
                     <p className="text-center text-gray-500 py-4">
                       {prescriptionSearchTerm || filterDate
                         ? `Không tìm thấy đơn thuốc nào khớp với tiêu chí.`
                         : "Không có đơn thuốc nào."
                       }
                     </p>
                   );
                 }
               })()}
               {/* --- KẾT THÚC LOGIC LỌC --- */}
             </div>
          )}

          {activeTab === 'symptoms' && (
             <div className="space-y-4">
               <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                 <input
                   ref={newSymptomInputRef}
                   type="text"
                   value={newSymptomName}
                   onChange={(e) => onNewSymptomChange(e.target.value)}
                   onInput={triggerInProgressConfirmation}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter' && !isCompleted) {
                       onAddSymptom();
                       e.preventDefault();
                     }
                   }}
                   placeholder={isCompleted ? "Hồ sơ đã hoàn thành, không thể thêm." : "Thêm triệu chứng mới..."}
                   className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm transition-colors flex items-center gap-2 shadow-md w-full
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                   disabled={isReadOnly}
                 />
                 <button
                   onClick={onAddSymptom}
                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md flex-shrink-0
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                   disabled={isReadOnly}
                 >
                   <Plus className="w-5 h-5" /> Thêm
                 </button>
               </div>

               {record.symptoms && record.symptoms.length > 0 ? (
                 <ul className="list-none pl-0 text-gray-700 space-y-2">
                   {record.symptoms.map((symptom) => (
                     <li key={symptom.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                       <span className="flex items-center gap-3 text-base">
                         <ListTodo className="w-5 h-5 text-purple-600 flex-shrink-0" />
                         <span className="font-medium text-gray-800">{symptom.name}</span>
                       </span>
                       <button
                         onClick={() => onDeleteSymptom(symptom.id)}
                         className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100
                                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-100"
                         title="Xóa triệu chứng"
                         disabled={isReadOnly}
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
               {record.testResults && record.testResults.length > 0 ? (
                 record.testResults.map((result, index) => (
                   <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-lg">
                       <Microscope className="w-5 h-5 text-cyan-600" /> Kết quả xét nghiệm: {result.name || 'N/A'}
                     </h4>
                     <div className="space-y-2 text-sm text-gray-700 pl-7 border-l-2 border-cyan-200 ml-1 pt-1">
                       <p>Mô tả: <span className="font-medium">{result.description || 'N/A'}</span></p>
                       <p>Thực hiện bởi: <span className="font-medium">{result.staff?.fullName || 'N/A'}</span></p>
                       <p>Ngày thực hiện: <span className="font-medium">{result.createdAt && isValid(parseISO(result.createdAt)) ? format(parseISO(result.createdAt), 'dd/MM/yyyy HH:mm', { locale: viLocale }) : 'N/A'}</span></p>
                       {result.image ? (
                         <div>
                           <p className="font-medium mt-2">Hình ảnh:</p>
                           <ResultImage
                             src={result.image}
                             alt={`Kết quả ${result.name}`}
                             onViewFull={onViewFullImage}
                             imageUrl={imageUrl}
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
          
          {activeTab === 'staff' && (
             <div className="space-y-4">
               {/* === Thông tin Bác sĩ điều trị === */}
               {record.staff ? (
                 <DetailItem icon={<Stethoscope className="w-5 h-5 text-purple-500" />} label="Bác sĩ điều trị">
                   <p className="font-medium text-lg text-gray-900">{record.staff.fullName || 'N/A'}</p>
                   <p className="text-sm text-gray-600">Chuyên môn: <span className="font-medium">{record.staff.expertise || 'N/A'}</span></p>
                   <p className="text-sm text-gray-600">Email: <span className="font-medium">{record.staff.account?.email || 'N/A'}</span></p>
                   <p className="text-sm text-gray-600">Số điện thoại: <span className="font-medium">{record.staff.account?.phoneNumber || 'N/A'}</span></p>
                 </DetailItem>
               ) : (
                 <p className="text-center text-gray-500 py-4 italic">Không có thông tin bác sĩ điều trị.</p>
               )}

               {/* === Thông tin Kỹ thuật viên === */}
               {(() => {
                 // Lấy thông tin KTV từ kết quả xét nghiệm đầu tiên có staff
                 const technician = record.testResults?.find(result => result.staff)?.staff;

                 if (technician) {
                   return (
                     <DetailItem icon={<Microscope className="w-5 h-5 text-cyan-500" />} label="Kỹ thuật viên XN">
                       <p className="font-medium text-lg text-gray-900">{technician.fullName || 'N/A'}</p>
                       <p className="text-sm text-gray-600">Chuyên môn: <span className="font-medium">{technician.expertise || 'N/A'}</span></p>
                       <p className="text-sm text-gray-600">Email: <span className="font-medium">{technician.account?.email || 'N/A'}</span></p>
                       <p className="text-sm text-gray-600">Số điện thoại: <span className="font-medium"><b>{technician.account?.phoneNumber || 'N/A'}</b></span></p>
                     </DetailItem>
                   );
                 } else {
                   return (
                     <p className="text-center text-gray-500 py-4 italic">Hồ sơ này không có thông tin kỹ thuật viên xét nghiệm.</p>
                   );
                 }
               })()}
             </div>
          )}

          {activeTab === 'appointments' && (
             <div className="space-y-4">
              {record.appointments && record.appointments.length > 0 ? (
                record.appointments
                  .sort(
                    (a, b) =>
                      parseISO(b.appointmentDate).getTime() -
                        parseISO(a.appointmentDate).getTime() ||
                      a.appointmentTime.localeCompare(b.appointmentTime)
                  )
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                          {getAppointmentStatusIcon ? (
                            getAppointmentStatusIcon(apt.status)
                          ) : (
                            <CalendarDays className="w-4 h-4 text-blue-600" />
                          )}
                          <span>{apt.medicalService?.name || 'Lịch hẹn'}</span>
                          <span className="text-gray-400 font-normal text-xs">
                            (Mã LH: {apt.id})
                          </span>
                        </h4>
                        {/* Nhóm trạng thái */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {apt && getAppointmentStatusText && getAppointmentStatusColorClass ? (
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getAppointmentStatusColorClass(
                                apt.status
                              )} bg-opacity-80`}
                            >
                              {getAppointmentStatusText(apt.status)}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">
                              N/A
                            </span>
                          )}

                          {(apt?.revisit === 1 || apt?.revisit === 2) && (
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getRevisitStatusColorClass(
                                apt?.revisit
                              )}`}
                            >
                              {getRevisitStatusText(apt?.revisit)}
                            </span>
                          )}
                            </div>

                      </div>

                      {/* Details */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p className="flex items-center gap-2 text-gray-700 sm:col-span-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-600 w-20">Bệnh nhân:</span>
                          <span className="text-gray-900 font-semibold">
                            {record.patient?.fullName || 'N/A'}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-gray-700">
                          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-600 w-20">Ngày:</span>
                          <span className="text-gray-900">
                            {format(parseISO(apt.appointmentDate), 'dd/MM/yyyy')}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-600 w-20">Giờ:</span>
                          <span className="text-gray-900">
                            {apt.appointmentTime.substring(0, 5)}
                          </span>
                        </p>

                        {apt.staff && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <Stethoscope className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="font-medium text-gray-600 w-20">Bác sĩ:</span>
                            <span className="text-gray-900 font-medium">
                              {apt.staff.fullName}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))
               ) : (
                 <p className="text-center text-sm text-gray-500 py-4 italic">Không có lịch hẹn nào liên kết với hồ sơ bệnh án này.</p>
               )}
             </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordDetailModal;