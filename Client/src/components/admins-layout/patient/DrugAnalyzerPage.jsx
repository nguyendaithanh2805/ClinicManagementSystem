// DrugAnalyzerPage.js
import React, { useState, useRef } from 'react';
import { Camera, Upload, Pill, FileText, FlaskConical, Info, X, Loader2, AlertTriangle } from 'lucide-react'; // Thêm AlertTriangle cho disclaimer
import { toast } from "react-toastify";
import axios from 'axios'; // Import axios để gọi API

const DrugAnalyzerPage = () => {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL_AI;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Giới hạn kích thước file (ví dụ: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
        setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
        setImage(null);
        setImagePreviewUrl('');
        return;
      }
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setError(null);
      setAnalysisResult(null);
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const openCamera = () => {
    // Kiểm tra hỗ trợ của trình duyệt cho MediaDevices
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment'; // Ưu tiên camera sau
      cameraInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Giới hạn kích thước file
          if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
            setError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
            setImage(null);
            setImagePreviewUrl('');
            return;
          }
          setImage(file);
          setImagePreviewUrl(URL.createObjectURL(file));
          setError(null);
          setAnalysisResult(null);
        }
      };
      cameraInput.click();
    } else {
      toast.error('Trình duyệt của bạn không hỗ trợ truy cập camera trực tiếp. Vui lòng chọn ảnh từ thư viện.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Vui lòng tải lên hoặc chụp ảnh thuốc.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', prompt);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000
      });
      setAnalysisResult(response.data);
      toast.success('Phân tích thuốc thành công!');

    } catch (err) {
      console.error('Lỗi phân tích thuốc:', err);
      if (err.response) {
        setError(`Lỗi: ${err.response.data.error || 'Đã có lỗi xảy ra từ máy chủ.'}`);
        toast.error(`Lỗi: ${err.response.data.error || 'Không thể phân tích thuốc.'}`);
      } else if (err.request) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo máy chủ đang hoạt động.');
        toast.error('Mất kết nối với máy chủ.');
      } else {
        setError('Đã xảy ra lỗi không xác định khi gửi yêu cầu.');
        toast.error('Lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const DrugCard = ({ thuoc }) => (
    <div className="border border-medical-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200 bg-white">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Pill className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-medical-900 mb-1 flex items-center gap-2">
            {thuoc.ten}
            {(thuoc.ten.includes('Có thể là') || thuoc.ten.includes('Không xác định')) && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                Suy đoán
              </span>
            )}
          </h3>
          <p className="text-sm text-medical-600 mb-1">
            <span className="font-medium">Hoạt chất:</span> {thuoc.hoat_chat || 'Đang cập nhật'}
          </p>
          <p className="text-sm text-medical-600">
            <span className="font-medium">Công dụng:</span> {thuoc.cong_dung || 'Đang cập nhật'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="glass-effect rounded-2xl p-6 bg-white/80 backdrop-blur-md shadow-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold text-medical-900 mb-3 text-center">
          <FlaskConical className="inline-block w-8 h-8 mr-2 text-medical-500" />
          Phân tích thuốc của bạn
        </h1>
        <p className="text-medical-600 text-center mb-6 text-lg">
          Tải ảnh thuốc lên hoặc chụp trực tiếp để nhận thông tin chi tiết về thành phần và công dụng.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {imagePreviewUrl && (
            <div className="relative w-60 h-60 mx-auto mb-6 border-2 border-medical-300 rounded-xl overflow-hidden shadow-md group">
              <img src={imagePreviewUrl} alt="Xem trước ảnh thuốc" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreviewUrl(''); setAnalysisResult(null); setError(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Xóa ảnh này"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <button
              type="button"
              onClick={openFilePicker}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg text-base font-semibold transform hover:-translate-y-0.5"
            >
              <Upload className="w-5 h-5 mr-3" /> Chọn ảnh từ thư viện
            </button>
            <button
              type="button"
              onClick={openCamera}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-lg text-base font-semibold transform hover:-translate-y-0.5"
            >
              <Camera className="w-5 h-5 mr-3" /> Chụp ảnh từ Camera
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="prompt" className="block text-medical-700 text-sm font-semibold mb-2">
              Gợi ý / Yêu cầu thêm (Tùy chọn):
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              rows="3"
              placeholder="Ví dụ: 'Thuốc này dùng để chữa ho phải không?', 'Hãy xác định rõ các viên màu đỏ.', 'Cho tôi biết tác dụng phụ của chúng.'"
              className="w-full px-4 py-3 border border-medical-200 rounded-lg focus:ring-3 focus:ring-primary-400 focus:border-primary-500 text-base resize-y transition-all duration-200"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-4 bg-medical-500 text-white rounded-xl hover:bg-medical-600 transition-colors duration-200 shadow-xl text-xl font-bold transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" /> Đang phân tích...
              </>
            ) : (
              <>
                <FlaskConical className="w-6 h-6 mr-3" /> Phân tích thuốc
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-effect rounded-2xl p-6 text-center text-red-700 bg-red-50 border border-red-200 shadow-md flex items-center justify-center gap-3">
          <AlertTriangle className="w-7 h-7 text-red-500" />
          <p className="font-semibold text-lg">
            Lỗi: {error}
          </p>
        </div>
      )}

      {analysisResult && (
        <div className="glass-effect rounded-2xl p-6 bg-white/80 backdrop-blur-md shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-medical-900 mb-6 flex items-center gap-3 border-b pb-4 border-medical-100">
            <FileText className="w-7 h-7 text-medical-500" /> Kết quả phân tích
          </h2>

          <div className="space-y-4 mb-6">
            {analysisResult.thuoc && analysisResult.thuoc.length > 0 ? (
                analysisResult.thuoc.map((thuoc, index) => (
                <DrugCard key={index} thuoc={thuoc} />
                ))
            ) : (
                <div className="text-center py-8 rounded-lg border bg-gray-50 border-gray-200">
                {analysisResult.ket_luan?.includes("không thuộc lĩnh vực dược phẩm") ? (
                    <>
                    <div className="flex justify-center mb-4">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-14 h-14 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M5.07 19h13.86c.89 0 1.34-1.08.71-1.71L12.71 5.29a1 1 0 00-1.42 0L4.36 17.29c-.63.63-.18 1.71.71 1.71z"
                        />
                        </svg>
                    </div>
                    <p className="text-yellow-700 text-lg font-medium">
                        {analysisResult.ket_luan}
                    </p>
                    </>
                ) : (
                    <>
                    <Pill className="w-14 h-14 text-medical-300 mx-auto mb-4" />
                    <p className="text-medical-600 text-lg font-medium">
                        {analysisResult.ket_luan
                        ? analysisResult.ket_luan
                        : "Không tìm thấy thuốc nào rõ ràng trong ảnh. Vui lòng thử lại với ảnh rõ hơn và đủ ánh sáng."}
                    </p>
                    </>
                )}
                </div>
            )}
            </div>


          {analysisResult.ket_luan &&
            !analysisResult.ket_luan.includes("không thuộc lĩnh vực dược phẩm") && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" /> Kết luận chung:
                </h3>
                <p>{analysisResult.ket_luan}</p>
                </div>
            )}

          {/* Tuyên bố miễn trừ trách nhiệm */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm shadow-inner">
            <h3 className="font-bold text-base flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" /> Tuyên bố miễn trừ trách nhiệm:
            </h3>
            <p>
              Thông tin được cung cấp bởi công cụ phân tích này chỉ mang tính chất tham khảo và giáo dục.
              Nó không thay thế cho lời khuyên, chẩn đoán hoặc điều trị y tế chuyên nghiệp.
              **Luôn luôn tham khảo ý kiến bác sĩ hoặc dược sĩ có chuyên môn trước khi sử dụng bất kỳ loại thuốc nào.**
              Không tự ý chẩn đoán hoặc điều trị dựa trên thông tin từ ứng dụng này.
              Chúng tôi không chịu trách nhiệm cho bất kỳ hậu quả nào phát sinh từ việc sử dụng sai mục đích thông tin này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugAnalyzerPage;