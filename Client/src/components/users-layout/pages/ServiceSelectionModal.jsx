import React, { useState, useMemo } from 'react';
import { X, Search, BriefcaseMedical, Filter } from 'lucide-react';

const ServiceSelectionModal = ({
    isOpen,
    onClose,
    services,
    specialties,
    onSelectService,
    currentServiceId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('all');

  // Get specialty name helper
  const getSpecialtyName = (id) => {
      if (!specialties || specialties.length === 0) return '';
      return specialties.find(s => s.id === id)?.name || 'Khác';
  }

  // Filter services based on search term and selected specialty
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const nameMatches = service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const specialtyMatches = selectedSpecialtyId === 'all' || service.specialtyId === selectedSpecialtyId;
      return nameMatches && specialtyMatches;
    });
  }, [services, searchTerm, selectedSpecialtyId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" // Ensure z-index is high enough
      style={{ marginTop: 0 }}
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-xl relative shadow-xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BriefcaseMedical className="w-5 h-5 text-blue-600" /> Chọn Dịch vụ Khám
            </h2>
            <button
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
            >
            <X className="w-5 h-5" />
            </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm dịch vụ theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-1.5 px-3 pl-9 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full sm:w-auto appearance-none border border-gray-300 rounded-md py-1.5 px-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={!specialties || specialties.length === 0}
            >
              <option value="all">Tất cả chuyên khoa</option>
              {specialties && specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>
        </div>

        {/* Service List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border-t pt-2">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className={`flex items-center justify-between gap-3 p-2.5 border rounded-lg cursor-pointer transition-colors duration-150 ${currentServiceId === service.id ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' : 'bg-white border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'}`}
              >
                {/* Service Info */}
                <div className='flex-1'>
                    <p className="font-medium text-gray-800 text-sm">{service.name}</p>
                    <p className="text-xs text-gray-500">{getSpecialtyName(service.specialtyId)}</p>
                </div>
                {/* Cost */}
                 <span className="text-sm font-semibold text-primary-700 flex-shrink-0">
                     {service.cost?.toLocaleString('vi-VN')} đ
                 </span>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500 py-6 italic">Không tìm thấy dịch vụ phù hợp.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;