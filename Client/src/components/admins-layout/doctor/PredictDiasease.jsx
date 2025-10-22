import React, { useState, useEffect, useRef, useMemo } from 'react'; // Added useMemo
import {
  Brain, Bandage, Info, XCircle, ListTodo, Search, X, ClipboardCheck, User, CalendarDays,
  ChevronDown // Added ChevronDown
} from 'lucide-react';
import { toast } from "react-toastify";
import axios from 'axios';

const PredictDiasease = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL_AI;

  const [supportedSymptoms, setSupportedSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [newSymptomInput, setNewSymptomInput] = useState('');
  const [showSymptomSearchResults, setShowSymptomSearchResults] = useState(false);
  const symptomSearchRef = useRef(null);

  const [riskFactorsInput, setRiskFactorsInput] = useState('');
  const [genderInput, setGenderInput] = useState('Nam');
  const [ageInput, setAgeInput] = useState(''); // Store as string for controlled select

  const [predictedDiagnosis, setPredictedDiagnosis] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // --- Effects ---
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

  // --- Data Fetching ---
  const fetchSupportedSymptoms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/symptoms`);
      if (response.data?.supported_symptoms) {
        setSupportedSymptoms(response.data.supported_symptoms);
      } else {
        toast.error('Không thể tải danh sách triệu chứng hỗ trợ.');
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ AI để tải triệu chứng.');
      console.error('Error fetching supported symptoms:', error);
    }
  };

  // --- Symptom Handling ---
  const handleSymptomSearchInputChange = (e) => {
    const value = e.target.value;
    setNewSymptomInput(value);
    setShowSymptomSearchResults(value.length > 0); // Show results if input is not empty
  };

  // Memoize search results for performance
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

  // --- Prediction Handling ---
  const handlePredictDiagnosis = async () => {
    // Validation (giữ nguyên)
    if (selectedSymptoms.length === 0) { /* ... */ return; }
    if (!ageInput || isNaN(ageInput) || +ageInput < 1 || +ageInput > 100) { /* ... */ return; }


    setLoadingPrediction(true);
    setPredictedDiagnosis(null);

    try {
      const riskFactorsArray = riskFactorsInput.trim().length > 0
        ? riskFactorsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const payload = {
        symptoms: selectedSymptoms,
        risk_factors: riskFactorsArray,
        gender: genderInput,
        age: parseInt(ageInput)
      };

      const response = await axios.post(`${API_BASE_URL}/predict_diagnosis`, payload);

      if (response.data) {
        setPredictedDiagnosis(response.data);
        toast.success('Dự đoán chẩn đoán thành công!');
      } else {
        toast.error('Không thể dự đoán chẩn đoán.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi kết nối đến máy chủ AI.');
      console.error('Error predicting diagnosis:', error);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // --- Render ---
  return (
    // Main Card Style
    <div className="bg-white rounded-xl shadow-sm p-5 mt-6 border border-gray-200">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2 border-b pb-3"> {/* Smaller font, border-b */}
        <Brain className="w-5 h-5 text-blue-600" /> Công cụ Chẩn đoán & Gợi ý Điều trị
      </h3>

      {/* Input Area Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* --- Section: Triệu chứng --- */}
        <div className="space-y-3 p-4 bg-gray-50/70 border border-gray-100 rounded-lg">
          <label htmlFor="symptoms-search" className="block sm:text-base font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <ListTodo className="w-4 h-4 text-gray-500" /> Triệu chứng <span className="text-red-500">*</span>
          </label>
          {/* Search Input */}
          <div className="relative" ref={symptomSearchRef}>
            <div className="relative">
                <input
                    type="text"
                    id="symptoms-search"
                    value={newSymptomInput}
                    onChange={handleSymptomSearchInputChange}
                    onFocus={() => setShowSymptomSearchResults(true)} // Show on focus if needed
                    placeholder="Gõ để tìm triệu chứng..."
                    // Consistent input style
                    className="block w-full rounded-md border-gray-300 py-1.5 px-3 pl-9 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:sm:text-base"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
             {/* Search Results */}
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
          {/* Selected Symptoms Badges */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px]"> {/* Min height to prevent jumping */}
            {selectedSymptoms.length > 0 ? (
              selectedSymptoms.map((symptom, index) => (
                // Refined badge style
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

        {/* --- Section: Thông tin Bổ sung --- */}
        <div className="space-y-3 p-4 bg-gray-50/70 border border-gray-100 rounded-lg">
           <label htmlFor="riskFactors" className="block sm:text-base font-medium text-gray-700 mb-1 flex items-center gap-1.5">
             <ClipboardCheck className="w-4 h-4 text-gray-500" /> Yếu tố nguy cơ <span className="text-xs font-normal text-gray-500">(phẩy nếu nhiều)</span>
           </label>
           {/* Risk Factors Input */}
           <textarea // Changed to textarea
             id="riskFactors"
             value={riskFactorsInput}
             onChange={(e) => setRiskFactorsInput(e.target.value)}
             placeholder="VD: Hút thuốc, Tiểu đường, Béo phì,..."
             rows={2} // Smaller initial height
             className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:sm:text-base" // Consistent style
           />

           {/* Grid for Gender and Age */}
           <div className="grid grid-cols-2 gap-3 pt-1">
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
                   // Consistent select style
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
                    value={ageInput} // Value is string
                    onChange={(e) => setAgeInput(e.target.value)} // Set as string
                    required
                    // Consistent select style
                    className="w-full appearance-none border border-gray-300 rounded-md py-1.5 px-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:sm:text-base"
                   >
                    <option value="" disabled>Chọn</option> {/* Default empty option */}
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
        </div>
      </div>

      {/* --- Action Button --- */}
      <div className="mt-4 flex justify-center border-t pt-5"> {/* Adjusted spacing */}
        <button
          onClick={handlePredictDiagnosis}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base font-medium" // Slightly smaller button
          disabled={loadingPrediction || selectedSymptoms.length === 0 || !ageInput} // Simplified disabled check
        >
          {loadingPrediction ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" /* ... spinner SVG ... */ > {/* ... */} </svg>
              Đang phân tích...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" /> Dự đoán
            </>
          )}
        </button>
      </div>

      {/* --- Output Section --- */}
      {predictedDiagnosis && (
        // Styled output box
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

            {/* Warning */}
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