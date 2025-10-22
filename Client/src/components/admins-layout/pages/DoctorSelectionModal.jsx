import React, { useState, useMemo } from 'react';
import { X, Search, User, Stethoscope, Filter } from 'lucide-react';

const predefinedSpecialties = [
  { id: 1, name: 'Nội khoa' },
  { id: 2, name: 'Ngoại khoa' },
  { id: 3, name: 'Nhi khoa' },
  { id: 4, name: 'Da liễu' },
];

const DoctorSelectionModal = ({ isOpen, onClose, staffs, onSelectDoctor, currentStaffId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('all'); // 'all' hoặc ID chuyên khoa

  // Lọc danh sách bác sĩ dựa trên tìm kiếm và chuyên khoa
  const filteredStaffs = useMemo(() => {
    return staffs.filter(staff => {
      const nameMatches = staff.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const specialtyMatches = selectedSpecialtyId === 'all' || staff.specialtyId === selectedSpecialtyId;
      return nameMatches && specialtyMatches;
    });
  }, [staffs, searchTerm, selectedSpecialtyId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
      style={{ marginTop: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-xl relative shadow-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-600" /> Chọn Bác sĩ Phân công
        </h2>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm bác sĩ theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Bộ lọc chuyên khoa */}
          <div className="relative">
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="appearance-none w-full sm:w-auto border border-gray-300 rounded-lg pl-4 pr-10 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả chuyên khoa</option>
              {predefinedSpecialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Danh sách bác sĩ */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2"> {/* Thêm pr/-mr để scrollbar đẹp hơn */}
          {filteredStaffs.length > 0 ? (
            filteredStaffs.map(staff => (
              <div
                key={staff.id}
                onClick={() => onSelectDoctor(staff.id)}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors duration-150
                            ${currentStaffId === staff.id
                              ? 'bg-blue-100 border-blue-300 hover:bg-blue-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{staff.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {staff.expertise || 'Chưa có chuyên môn'}
                    {staff.specialtyId && ` - ${predefinedSpecialties.find(s => s.id === staff.specialtyId)?.name || 'Khác'}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6 italic">Không tìm thấy bác sĩ phù hợp.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSelectionModal;