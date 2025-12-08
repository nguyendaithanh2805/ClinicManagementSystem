import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib 
import warnings

warnings.filterwarnings('ignore')

import sys
current_dir = os.path.dirname(os.path.abspath(__file__))

sys.path.append(os.path.join(current_dir, 'DL'))
sys.path.append(os.path.join(current_dir, 'ML'))

analyze_medicine_image = None
chat_health_consultation = None
CHATBOT_ENABLED = False

# Import hàm phân tích ảnh từ module DL
try:
    from medicine_analyzer import analyze_medicine_image
except ImportError:
    print("Cảnh báo: Không tìm thấy module 'medicine_analyzer'. Endpoint /analyze sẽ không hoạt động.")

try:
    # 2. Import hàm chatbot
    from chatbot import chat_health_consultation
    CHATBOT_ENABLED = True
except ImportError:
    print("Cảnh báo: Không tìm thấy module 'chatbot'. Endpoint /consult sẽ không hoạt động.")
    
app = Flask(__name__)
CORS(app)

# --- CẤU HÌNH ĐƯỜNG DẪN & TẢI MÔ HÌNH ML ---
MODEL_FILE = os.path.join(current_dir, 'ML', 'random_forest_model.joblib')
ENCODER_FILE = os.path.join(current_dir, 'ML', 'label_encoder.joblib')
TREATMENT_MAP_FILE = os.path.join(current_dir, 'ML', 'diagnosis_treatment_map.joblib')

# Khởi tạo biến toàn cục
model = None
label_encoder = None
diagnosis_treatment_map = None

# Kiểm tra sự tồn tại và tải các file mô hình khi khởi động
MODEL_FILES_EXIST = os.path.exists(MODEL_FILE) and \
                    os.path.exists(ENCODER_FILE) and \
                    os.path.exists(TREATMENT_MAP_FILE)

if MODEL_FILES_EXIST:
    try:
        model = joblib.load(MODEL_FILE)
        label_encoder = joblib.load(ENCODER_FILE)
        diagnosis_treatment_map = joblib.load(TREATMENT_MAP_FILE)
        print("✅ Tải mô hình và dữ liệu hỗ trợ thành công.")
    except Exception as e:
        print(f"❌ LỖI: Không thể tải các file mô hình. Chi tiết: {e}")
        model = label_encoder = diagnosis_treatment_map = None 
else:
    print("❌ LỖI: Không tìm thấy các file mô hình (.joblib). Vui lòng kiểm tra thư mục ML/.")

# Danh sách cột dữ liệu đầu vào mong đợi của mô hình
EXPECTED_COLUMNS = [
    'Tuổi', 'Giới_tính', 'Ho', 'Khó_thở', 'Sốt', 'Đau_ngực', 'Mệt_mỏi', 'Buồn_nôn', 
    'Nôn', 'Đau_bụng', 'Tiêu_chảy', 'Táo_bón', 'Phát_ban', 'Ngứa', 'Mụn_mủ', 
    'Vảy_da', 'Đỏ_da', 'Vàng_da', 'Chảy_máu', 'Đau_khớp', 'Sưng_khớp', 
    'Quấy_khóc', 'Đau_bụng_khu_trú', 'Ăn_không_tiêu', 'Sụt_cân', 'Đau_đầu', 
    'Chóng_mặt', 'Chuyên_khoa'
]

# Ngưỡng độ tin cậy thấp (thí dụ: 70%)
CONFIDENCE_THRESHOLD = 70.0 

# --- API ENDPOINT CHÍNH ---

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    """Trả về danh sách các triệu chứng nhị phân (0/1) mà mô hình sử dụng."""
    
    # Loại bỏ các cột không phải là triệu chứng
    non_symptom_cols = ['Tuổi', 'Giới_tính', 'Chuyên_khoa']
    symptoms_list_with_underscore = [col for col in EXPECTED_COLUMNS if col not in non_symptom_cols]
    
    # Loại bỏ dấu gạch dưới để hiển thị trên frontend
    symptoms_list_for_fe = [col.replace('_', ' ') for col in symptoms_list_with_underscore]
    
    return jsonify({
        'status': 'success',
        'symptoms': symptoms_list_for_fe, 
    })
    
@app.route('/predict_diagnosis', methods=['POST'])
def diagnose_diagnosis_endpoint():
    """Nhận dữ liệu triệu chứng (JSON) và dự đoán bệnh, trả về chẩn đoán và gợi ý điều trị."""
    
    if model is None or label_encoder is None or diagnosis_treatment_map is None:
        return jsonify({'error': 'Mô hình hoặc dữ liệu hỗ trợ chưa được tải.'}), 500

    try:
        data = request.get_json(force=True)
        gender_input = data.get('Giới_tính', 'Nam')
        
        # Mã hóa 'Giới tính' thành giá trị số (1.0 hoặc 0.0)
        encoded_gender = 1.0 if gender_input == 'Nam' else 0.0 
        data['Giới_tính'] = encoded_gender
        
        # Xử lý các khóa triệu chứng: thay thế khoảng trắng bằng dấu gạch dưới để khớp với EXPECTED_COLUMNS
        processed_data_for_df = {}
        for key, value in data.items():
            new_key = key.replace(' ', '_') 
            processed_data_for_df[new_key] = value
        
        data_for_predict = {}
        
        for col in EXPECTED_COLUMNS:
            value = processed_data_for_df.get(col)
            
            # Cấu trúc lại input theo đúng EXPECTED_COLUMNS và điền 0.0 cho các triệu chứng thiếu
            if col in ['Tuổi', 'Giới_tính'] or col in [s.replace(' ', '_') for s in data.keys()]:
                # 1. Nếu cột là Tuổi, Giới tính, hoặc Triệu chứng có trong request: dùng giá trị đó
                # Dữ liệu triệu chứng/số (0/1) đã được gửi lên
                data_for_predict[col] = [value]
            elif col == 'Chuyên_khoa':
                # 2. Cột Chuyên khoa: Lấy giá trị chuỗi và đảm bảo nó là chuỗi/object
                specialty = processed_data_for_df.get('Chuyên_khoa', 'missing')
                data_for_predict[col] = [specialty] 
            else:
                # 3. Các triệu chứng nhị phân bị thiếu (không được gửi lên): mặc định là 0.0
                data_for_predict[col] = [0.0]

        # Tạo DataFrame cuối cùng với thứ tự cột và kiểu dữ liệu phù hợp
        input_df_final = pd.DataFrame(data_for_predict, columns=EXPECTED_COLUMNS)
        
        # --- CẬP NHẬT: Thực hiện dự đoán xác suất và tìm độ tin cậy ---
        prediction_proba = model.predict_proba(input_df_final)
        # Lấy xác suất cao nhất (độ tin cậy)
        confidence = np.max(prediction_proba) * 100 
        # Lấy index của xác suất cao nhất
        prediction_index = np.argmax(prediction_proba)
        
        # Giải mã kết quả dự đoán thành tên bệnh
        prediction_diagnosis = label_encoder.inverse_transform([prediction_index])[0]
        
        # Lấy gợi ý điều trị từ map
        treatment_suggestion = diagnosis_treatment_map.get(
            prediction_diagnosis, 
            "Không có gợi ý điều trị cụ thể trong cơ sở dữ liệu."
        )
        
        low_confidence = confidence < CONFIDENCE_THRESHOLD
        response = {
            'diagnosis': prediction_diagnosis,
            'treatment_suggestion': treatment_suggestion,
            'confidence': round(confidence, 2), # Độ tin cậy (ví dụ: 85.50)
            'low_confidence_warning': 1 if low_confidence else 0
        }
        
        return jsonify(response)

    except Exception as e:
        # Xử lý lỗi trong quá trình xử lý dữ liệu hoặc dự đoán
        print(f"Lỗi khi dự đoán: {e}")
        return jsonify({'error': f'Lỗi nội bộ server: {str(e)}. Vui lòng kiểm tra định dạng dữ liệu đầu vào.'}), 500

# --- API ENDPOINT PHÂN TÍCH ẢNH THUỐC ---

@app.route("/analyze", methods=["POST"])
def analyze_medicine_image_endpoint():
    """Nhận ảnh thuốc (multipart/form-data) và prompt để phân tích bằng mô hình Gemini."""
    
    if analyze_medicine_image is None:
        return jsonify({"error": "Chức năng phân tích ảnh thuốc không khả dụng."}), 501

    try:
        if "image" not in request.files:
            return jsonify({"error": "Thiếu file ảnh 'image'"}), 400

        image_file = request.files["image"]
        user_prompt = request.form.get("prompt", "")

        image_bytes = image_file.read()

        # Gọi hàm phân tích ảnh từ module medicine_analyzer
        result = analyze_medicine_image(image_bytes, user_prompt)
        return jsonify(result)

    except Exception as e:
        # Xử lý lỗi trong quá trình phân tích ảnh
        print(f"Lỗi khi phân tích ảnh: {e}")
        return jsonify({"error": f"Lỗi khi phân tích ảnh thuốc: {str(e)}"}), 500

@app.route("/consult", methods=["POST"])
def health_consult_endpoint():
    """Nhận tin nhắn người dùng (JSON) và trả về lời khuyên y tế chung từ chatbot."""
    
    if not CHATBOT_ENABLED or chat_health_consultation is None:
        return jsonify({"error": "Chức năng chatbot tư vấn y tế không khả dụng. Vui lòng kiểm tra file DL/chatbot.py và biến môi trường GEMINI_API_KEY."}), 501

    try:
        data = request.get_json(force=True)
        user_message = data.get("message")

        if not user_message or not isinstance(user_message, str):
            return jsonify({"error": "Thiếu hoặc sai định dạng trường 'message'."}), 400
        
        # Gọi hàm chatbot đã được tách riêng
        result = chat_health_consultation(user_message)
        
        # Kiểm tra lỗi từ hàm
        if result.get("status") == "error":
            # Trả về lỗi đã được xử lý trong hàm chatbot
            return jsonify({"error": result.get("response")}), 500
            
        return jsonify(result)

    except Exception as e:
        print(f"Lỗi khi xử lý request chatbot: {e}")
        return jsonify({"error": f"Lỗi nội bộ server: {str(e)}. Không thể kết nối đến dịch vụ tư vấn."}), 500
    
if __name__ == '__main__':
    """Khởi động ứng dụng Flask."""
    print(f"Starting Flask app from: {current_dir}") 
    print(f"Trạng thái mô hình dự đoán: {'Đã tải' if model else 'Chưa tải'}")
    print(f"API CHẨN ĐOÁN: POST tới /predict_diagnosis")
    print(f"API PHÂN TÍCH ẢNH: POST tới /analyze")
    
    app.run(host='0.0.0.0', port=5000, debug=False)