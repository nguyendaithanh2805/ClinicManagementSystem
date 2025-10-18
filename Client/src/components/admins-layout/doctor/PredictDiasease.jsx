import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Bandage, Info, XCircle, ListTodo, Search, X, ClipboardCheck, User, CalendarDays
} from 'lucide-react';
import { toast } from "react-toastify";
import axios from 'axios';

const PredictDiasease = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL_AI;

  // NEW: States cho chức năng chẩn đoán bệnh
  const [supportedSymptoms, setSupportedSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [newSymptomInput, setNewSymptomInput] = useState(''); // Để nhập search cho triệu chứng
  const [symptomSearchResults, setSymptomSearchResults] = useState([]);
  const [showSymptomSearchResults, setShowSymptomSearchResults] = useState(false);
  const symptomSearchRef = useRef(null);

  const [riskFactorsInput, setRiskFactorsInput] = useState('');
  const [genderInput, setGenderInput] = useState('Nam'); // Default
  const [ageInput, setAgeInput] = useState('');

  const [predictedDiagnosis, setPredictedDiagnosis] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  // END NEW Prediction States

  // NEW: Effect to close symptom search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (symptomSearchRef.current && !symptomSearchRef.current.contains(event.target)) {
        setShowSymptomSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NEW: Fetch supported symptoms on component mount
  useEffect(() => {
    fetchSupportedSymptoms();
  }, []);

  const fetchSupportedSymptoms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/symptoms`);
      if (response.data && response.data.supported_symptoms) {
        setSupportedSymptoms(response.data.supported_symptoms);
      } else {
        toast.error('Không thể tải danh sách triệu chứng hỗ trợ.');
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ AI để tải triệu chứng.');
      console.error('Error fetching supported symptoms:', error);
    }
  };

  // NEW: Handle search for supported symptoms
  const handleSymptomSearchInputChange = (e) => {
    const value = e.target.value;
    setNewSymptomInput(value);
    if (value.length > 0) {
      const filtered = supportedSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(value.toLowerCase()) && !selectedSymptoms.includes(symptom)
      );
      setSymptomSearchResults(filtered);
      setShowSymptomSearchResults(true);
    } else {
      setSymptomSearchResults([]);
      setShowSymptomSearchResults(false);
    }
  };

  // NEW: Handle selecting a symptom from search results
  const handleSelectSymptom = (symptom) => {
    setSelectedSymptoms(prev => [...prev, symptom]);
    setNewSymptomInput('');
    setSymptomSearchResults([]);
    setShowSymptomSearchResults(false);
  };

  // NEW: Handle removing a selected symptom
  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms(prev => prev.filter(symptom => symptom !== symptomToRemove));
  };

  // NEW: Handle prediction
  const handlePredictDiagnosis = async () => {
    if (selectedSymptoms.length === 0) {
      toast.warn('Vui lòng chọn ít nhất một triệu chứng.');
      return;
    }
    if (!ageInput || isNaN(ageInput) || parseInt(ageInput) < 1 || parseInt(ageInput) > 100) {
      toast.warn('Vui lòng chọn tuổi hợp lệ từ 1 đến 100.');
      return;
    }

    setLoadingPrediction(true);
    setPredictedDiagnosis(null); // Clear previous prediction

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
        setPredictedDiagnosis(null);
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối đến máy chủ AI để dự đoán chẩn đoán.');
      console.error('Error predicting diagnosis:', error);
      setPredictedDiagnosis(null);
    } finally {
      setLoadingPrediction(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mt-6 border border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-600" /> Công cụ Chẩn đoán bệnh & Gợi ý phương pháp điều trị
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Triệu chứng */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
            <ListTodo className="w-4 h-4 inline-block mr-1 text-gray-500" /> Chọn Triệu chứng:
          </label>
          <div className="relative mb-2" ref={symptomSearchRef}>
            <input
              type="text"
              id="symptoms"
              value={newSymptomInput}
              onChange={handleSymptomSearchInputChange}
              onFocus={() => setShowSymptomSearchResults(true)}
              placeholder="Tìm và chọn triệu chứng..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            {showSymptomSearchResults && symptomSearchResults.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                {symptomSearchResults.map((symptom, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                    onClick={() => handleSelectSymptom(symptom)}
                  >
                    {symptom}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSymptoms.length > 0 ? (
              selectedSymptoms.map((symptom, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {symptom}
                  <button
                    type="button"
                    onClick={() => handleRemoveSymptom(symptom)}
                    className="ml-2 -mr-1 text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có triệu chứng nào được chọn.</p>
            )}
          </div>
        </div>

        {/* Yếu tố nguy cơ, Giới tính, Tuổi */}
        <div>
          <label htmlFor="riskFactors" className="block text-sm font-medium text-gray-700 mb-2">
            <ClipboardCheck className="w-4 h-4 inline-block mr-1 text-gray-500" /> Yếu tố nguy cơ (phân cách bởi dấu phẩy):
          </label>
          <input
            type="text"
            id="riskFactors"
            value={riskFactorsInput}
            onChange={(e) => setRiskFactorsInput(e.target.value)}
            placeholder="VD: Ngồi lâu, Ít vận động"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 mb-4"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline-block mr-1 text-gray-500" /> Giới tính:
              </label>
              <select
                id="gender"
                value={genderInput}
                onChange={(e) => setGenderInput(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="w-4 h-4 inline-block mr-1 text-gray-500" /> Tuổi:
              </label>
              <select
                id="age"
                value={ageInput}
                onChange={(e) => setAgeInput(parseInt(e.target.value, 10))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                required
              >
                <option value="" disabled>Chọn tuổi</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handlePredictDiagnosis}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loadingPrediction || selectedSymptoms.length === 0 || !ageInput || isNaN(ageInput)}
        >
          {loadingPrediction ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang phân tích...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" /> Dự đoán Chẩn đoán
            </>
          )}
        </button>
      </div>

      {predictedDiagnosis && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-inner">
          <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" /> Kết quả
          </h4>
          <div className="space-y-3 text-gray-700">
            <p className="text-lg flex items-start gap-2">
              <Brain className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">Chẩn đoán bệnh:</span> {predictedDiagnosis.predicted_diagnosis_name || 'N/A'}
            </p>
            <p className="text-lg flex items-start gap-2">
              <Bandage className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">Gợi ý phương pháp điều trị:</span> {predictedDiagnosis.predicted_treatment_name || 'N/A'}
            </p>

            {predictedDiagnosis.warning && (
              <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md flex items-center gap-3">
                <XCircle className="w-6 h-6 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="font-semibold text-base">Cảnh báo:</p>
                  <p className="text-sm">{predictedDiagnosis.warning}</p>
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