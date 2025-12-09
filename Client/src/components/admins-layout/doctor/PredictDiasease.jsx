import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Brain, Bandage, Info, ListTodo, Search, X, User, CalendarDays,
  ChevronDown, XCircle, Stethoscope, AlertTriangle
} from 'lucide-react';
import { toast } from "react-toastify";
import axios from 'axios';

// Danh sách chuyên khoa
const SPECIALTIES = [
  'Nội khoa', 
  'Ngoại khoa', 
  'Nhi khoa', 
  'Da liễu', 
];

const PredictDiasease = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL_AI;
  
  // --- States ---
  const [supportedSymptoms, setSupportedSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [newSymptomInput, setNewSymptomInput] = useState('');
  const [showSymptomSearchResults, setShowSymptomSearchResults] = useState(false);
  const symptomSearchRef = useRef(null);

  // THÔNG TIN CƠ BẢN
  const [genderInput, setGenderInput] = useState('Nam');
  const [ageInput, setAgeInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('Nội khoa'); 

  // CẬP NHẬT STATE: Bổ sung confidence và lowConfidenceWarning
  const [predictedDiagnosis, setPredictedDiagnosis] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // --- Effects (Giữ nguyên) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (symptomSearchRef.current && !symptomSearchRef.current.contains(event.target)) {
        setShowSymptomSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSupportedSymptoms();
  }, []);

  // --- Data Fetching (Giữ nguyên) ---
  const fetchSupportedSymptoms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/symptoms`);
      if (response.data?.symptoms) {
        const filteredSymptoms = response.data.symptoms.filter(s => s !== 'Chuyên khoa');
        setSupportedSymptoms(filteredSymptoms);
      } else {
        toast.error('Không thể tải danh sách triệu chứng hỗ trợ.');
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ AI để tải triệu chứng.');
      console.error('Error fetching supported symptoms:', error);
    }
  };

  // --- Symptom Handling (Giữ nguyên) ---
  const handleSymptomSearchInputChange = (e) => {
    const value = e.target.value;
    setNewSymptomInput(value);
    setShowSymptomSearchResults(value.length > 0); 
  };

  const symptomSearchResults = useMemo(() => {
    if (newSymptomInput.length === 0) return [];
    const lowerCaseInput = newSymptomInput.toLowerCase();
    return supportedSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(lowerCaseInput) && !selectedSymptoms.includes(symptom)
    );
  }, [newSymptomInput, supportedSymptoms, selectedSymptoms]);


  const handleSelectSymptom = (symptom) => {
    setSelectedSymptoms(prev => [...prev, symptom]);
    setNewSymptomInput('');
    setShowSymptomSearchResults(false);
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms(prev => prev.filter(symptom => symptom !== symptomToRemove));
  };

  // --- Prediction Handling (CẬP NHẬT: Nhận thêm Confidence/Warning) ---
  const handlePredictDiagnosis = async () => {
    // Validation (Giữ nguyên)
    if (selectedSymptoms.length === 0) {
      toast.error('Vui lòng chọn ít nhất một triệu chứng.');
      return;
    }
    if (!ageInput || isNaN(ageInput) || +ageInput < 1 || +ageInput > 100) {
      toast.error('Tuổi không hợp lệ. Vui lòng chọn tuổi từ 1 đến 100.');
      return;
    }
    if (!specialtyInput) {
        toast.error('Vui lòng chọn một chuyên khoa.');
        return;
    }


    setLoadingPrediction(true);
    setPredictedDiagnosis(null);

    try {
      // Xây dựng Payload (Giữ nguyên)
      const payload = {
        'Tuổi': parseInt(ageInput),
        'Giới_tính': genderInput,
        'Chuyên_khoa': specialtyInput, 
      };

      supportedSymptoms.forEach(symptom => {
        const symptomKey = symptom.replace(' ', '_'); 
        payload[symptomKey] = selectedSymptoms.includes(symptom) ? 1.0 : 0.0;
      });
      
      const response = await axios.post(`${API_BASE_URL}/predict_diagnosis`, payload);

      if (response.data) {
        const isLowConfidence = response.data.low_confidence_warning === 1;
        setPredictedDiagnosis({
          predicted_diagnosis_name: response.data.diagnosis,
          predicted_treatment_name: response.data.treatment_suggestion,
          confidence: response.data.confidence,
          low_confidence_warning: isLowConfidence,
          warning: "Đây là gợi ý chẩn đoán dựa trên AI và không thay thế cho lời khuyên của bác sĩ chuyên môn."
        });
        toast.success('Dự đoán chẩn đoán thành công!');
      } else {
        toast.error('Không thể dự đoán chẩn đoán.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Lỗi khi kết nối đến máy chủ AI.';
      toast.error(errorMessage);
      console.error('Error predicting diagnosis:', error.response || error);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // --- Render (CẬP NHẬT: Thêm hiển thị độ tin cậy và cảnh báo) ---
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mt-6 border border-gray-200">
      
      <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-3">
        <Brain className="w-5 h-5 text-blue-600" /> Công cụ Chẩn đoán & Gợi ý Điều trị
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"> 
        {/* --- Section 1: Triệu chứng (Giữ nguyên) --- */}
        <div className="space-y-3 p-4 bg-gray-50/70 border border-gray-100 rounded-lg md:col-span-2">
            {/* ... Phần tìm kiếm và chọn triệu chứng ... */}
            <label htmlFor="symptoms-search" className="block sm:text-base font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-gray-500" /> Triệu chứng <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={symptomSearchRef}>
              <div className="relative">
                <input
                  type="text"
                  id="symptoms-search"
                  value={newSymptomInput}
                  onChange={handleSymptomSearchInputChange}
                  onFocus={() => setShowSymptomSearchResults(true)}
                  placeholder="Gõ để tìm triệu chứng..."
                  className="block w-full rounded-md border-gray-300 py-1.5 px-3 pl-9 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:sm:text-base"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              {showSymptomSearchResults && (
                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg py-1">
                  {symptomSearchResults.length > 0 ? (
                    symptomSearchResults.map((symptom, index) => (
                      <li
                        key={index}
                        className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-gray-700 sm:text-base"
                        onClick={() => handleSelectSymptom(symptom)}
                      >
                        {symptom}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-1.5 sm:text-base text-gray-500 italic">Không tìm thấy hoặc đã chọn.</li>
                  )}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px] pt-1"> 
              {selectedSymptoms.length > 0 ? (
                selectedSymptoms.map((symptom, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {symptom}
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(symptom)}
                      className="ml-1.5 -mr-0.5 p-0.5 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="sm:text-base text-gray-500 italic px-1 py-0.5">Chưa chọn triệu chứng nào.</p>
              )}
            </div>
        </div>
        
        {/* --- Section 2: Thông tin Cơ bản & Chuyên khoa (Giữ nguyên) --- */}
        <div className="space-y-3 p-4 bg-gray-50/70 border border-gray-100 rounded-lg flex flex-col justify-start">
          
          {/* Grid for Gender and Age */}
          <div className="grid grid-cols-2 gap-3">
            {/* Gender Select */}
            <div>
              <label htmlFor="gender" className="block sm:text-base font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-500" /> Giới tính <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={genderInput}
                  onChange={(e) => setGenderInput(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-1.5 px-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:sm:text-base"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>
            {/* Age Select */}
            <div>
              <label htmlFor="age" className="block sm:text-base font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gray-500" /> Tuổi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="age"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  required
                  className="w-full appearance-none border border-gray-300 rounded-md py-1.5 px-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:sm:text-base"
                >
                  <option value="" disabled>Chọn</option>
                  {Array.from({ length: 100 }, (_, i) => i + 1).map(age => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Specialty Select (Giữ nguyên) */}
          <div className='pt-2'> 
              <label htmlFor="specialty" className="block sm:text-base font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-gray-500" /> Chuyên khoa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="specialty"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-md py-1.5 px-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:sm:text-base"
                >
                  {SPECIALTIES.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
          </div>
        </div>
      </div>

      {/* --- Action Button (Giữ nguyên) --- */}
      <div className="mt-4 flex justify-center border-t pt-5">
        <button
          onClick={handlePredictDiagnosis}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base font-medium"
          disabled={loadingPrediction || selectedSymptoms.length === 0 || !ageInput || !specialtyInput}
        >
          {loadingPrediction ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang phân tích...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" /> Dự đoán
            </>
          )}
        </button>
      </div>

      {/* --- Output Section (CẬP NHẬT: Hiển thị độ tin cậy và cảnh báo) --- */}
      {predictedDiagnosis && (
        <div className="mt-6 p-5 bg-green-50/60 rounded-lg border border-green-200 shadow-sm">
            <h4 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2 border-b border-green-200 pb-2">
              <Info className="w-5 h-5" /> Kết quả Dự đoán
            </h4>
            <div className="space-y-2.5 text-gray-800">
              
              {/* Diagnosis Result */}
              <div className="flex items-start gap-2.5">
                <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block sm:text-base font-medium text-gray-600">Chẩn đoán (Gợi ý):</span>
                  <span className="text-base font-semibold text-indigo-800">{predictedDiagnosis.predicted_diagnosis_name || 'N/A'}</span>
                </div>
              </div>
              
              {/* Treatment Result */}
              <div className="flex items-start gap-2.5">
                <Bandage className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block sm:text-base font-medium text-gray-600">Điều trị (Gợi ý):</span>
                  <span className="text-base font-semibold text-emerald-800">{predictedDiagnosis.predicted_treatment_name || 'N/A'}</span>
                </div>
              </div>

              {/* Confidence Level (Mới) */}
              <div className="flex items-start gap-2.5">
                <Brain className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block sm:text-base font-medium text-gray-600">Độ tin cậy:</span>
                  <span 
                    className={`text-base font-semibold ${predictedDiagnosis.low_confidence_warning ? 'text-orange-600' : 'text-green-700'}`}
                  >
                    {predictedDiagnosis.confidence?.toFixed(2) || 'N/A'}%
                  </span>
                </div>
              </div>
              
              {/* Low Confidence Warning (Mới) */}
              {predictedDiagnosis.low_confidence_warning && (
                <div className="mt-3 p-3 bg-red-100/70 border-l-4 border-red-500 text-red-900 rounded-r-md flex items-start gap-2.5 sm:text-base">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Cảnh báo Độ tin cậy Thấp:</p>
                    <p>Độ tin cậy của dự đoán thấp hơn 70%. Kết quả này có thể không chính xác. Vui lòng cung cấp thêm triệu chứng.</p>
                  </div>
                </div>
              )}
              
              {/* General Disclaimer Warning */}
              {predictedDiagnosis.warning && (
                <div className="mt-3 p-3 bg-yellow-100/70 border-l-4 border-yellow-500 text-yellow-900 rounded-r-md flex items-start gap-2.5 sm:text-base">
                  <XCircle className="w-5 h-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Lưu ý quan trọng:</p>
                    <p>{predictedDiagnosis.warning}</p>
                  </div>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

export default PredictDiasease;