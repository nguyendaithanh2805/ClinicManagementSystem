import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Cấu hình PYTHONPATH để import các module từ DL và ML ---
# Điều này giúp Python tìm thấy medicine_analyzer.py
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'DL'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ML'))

# Import logic from medicine_analyzer.py (located in AI/DL/)
from medicine_analyzer import analyze_medicine_image

app = Flask(__name__)
CORS(app)

# ============================================
# 📂 CẤU HÌNH ĐƯỜNG DẪN
# ============================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # AI/
MODELS_DIR = os.path.join(BASE_DIR, "ML", "models") # AI/ML/models/

# ============================================
# 🧠 HÀM TẢI MÔ HÌNH VÀ CÁC FILE MAPPING CHO DỰ ĐOÁN BỆNH
# ============================================
def load_diagnosis_models():
    """
    Tải toàn bộ mô hình, mapping và danh sách đặc trưng phục vụ dự đoán bệnh.
    Trả về tuple chứa mô hình chẩn đoán, điều trị, các map và danh sách đặc trưng.
    """
    try:
        # Bệnh (Diagnosis)
        with open(os.path.join(MODELS_DIR, "diagnosis_map_vn.pkl"), "rb") as f:
            diagnosis_map = pickle.load(f)
        reverse_diagnosis_map = (
            diagnosis_map if all(isinstance(k, (int, np.integer)) for k in diagnosis_map.keys())
            else {v: k for k, v in diagnosis_map.items()}
        )

        # Điều trị (Treatment)
        with open(os.path.join(MODELS_DIR, "treatment_map_vn.pkl"), "rb") as f:
            treatment_map = pickle.load(f)
        reverse_treatment_map = (
            treatment_map if all(isinstance(k, (int, np.integer)) for k in treatment_map.keys())
            else {v: k for k, v in treatment_map.items()}
        )

        # Giới tính
        with open(os.path.join(MODELS_DIR, "gender_map_vn.pkl"), "rb") as f:
            gender_map_loaded = pickle.load(f)
        gender_map = (
            {v: k for k, v in gender_map_loaded.items()}
            if all(isinstance(k, (int, np.integer)) for k in gender_map_loaded.keys())
            else gender_map_loaded
        )

        # Triệu chứng & yếu tố nguy cơ
        with open(os.path.join(MODELS_DIR, "symptoms_list_vn.pkl"), "rb") as f:
            all_symptoms = pickle.load(f)
        with open(os.path.join(MODELS_DIR, "risk_factors_list_vn.pkl"), "rb") as f:
            all_risk_factors = pickle.load(f)

        # Mô hình dự đoán
        with open(os.path.join(MODELS_DIR, "diagnosis_model_v2.pkl"), "rb") as f:
            model_diagnosis = pickle.load(f)
        with open(os.path.join(MODELS_DIR, "treatment_model_v2.pkl"), "rb") as f:
            model_treatment = pickle.load(f)

        print("✅ Đã tải thành công tất cả mô hình và mapping cho dự đoán bệnh.")
        return (
            model_diagnosis, model_treatment,
            reverse_diagnosis_map, reverse_treatment_map,
            gender_map, all_symptoms, all_risk_factors
        )

    except FileNotFoundError as e:
        print(f"❌ Không tìm thấy file mô hình/mapping trong {MODELS_DIR}: {e}")
        exit()
    except Exception as e:
        print(f"❌ Lỗi khi tải mô hình hoặc mapping dự đoán bệnh: {e}")
        exit()

# --- Tải mô hình và dữ liệu cho dự đoán bệnh ---
(
    model_diagnosis, model_treatment,
    reverse_diagnosis_map, reverse_treatment_map,
    gender_map, all_symptoms, all_risk_factors
) = load_diagnosis_models()

# Xác định danh sách cột đặc trưng cho mô hình dự đoán bệnh
feature_cols = (
    [f"Triệu chứng_{s}" for s in all_symptoms] +
    [f"Yếu tố nguy cơ_{r}" for r in all_risk_factors] +
    ["Mã giới tính", "Tuổi"]
)

# Danh sách triệu chứng cứng cho endpoint /symptoms
SYMPTOMS = [
    "Đau họng", "Mờ mắt", "Chóng mặt", "Sốt cao", "Mệt mỏi", "Đau thượng vị", "Đau tay",
    "Ngứa da", "Đau lưng dưới", "Hắt hơi", "Nghẹt mũi", "Đau lưng", "Khát nước", "Ngứa da tay",
    "Khó thở", "Đau đầu", "Sốt", "Đau dạ dày", "Đau ngực", "Buồn nôn", "Nôn mửa", "Tiêu chảy",
    "Táo bón", "Đau bụng", "Sưng khớp", "Khó tiêu", "Ho khan", "Ho có đờm", "Đau ngực khi thở",
    "Sưng chân", "Mất ngủ", "Đau vai gáy", "Chán ăn", "Sút cân không rõ nguyên nhân", "Da nhợt nhạt",
    "Mỏi mắt", "Phát ban", "Da khô", "Tiểu khó", "Chảy nước mũi", "Cứng lưng", "Tiểu nhiều",
    "Ợ nóng", "Tiểu buốt", "Đau bụng dưới", "Cứng khớp buổi sáng", "Thở khò khè", "Vàng da",
    "Nhạy cảm với ánh sáng", "Yếu một bên cơ thể", "Khó nói", "Đau cơ", "Ớn lạnh", "Nhức mỏi toàn thân",
    "Lo lắng", "Bồn chồn", "Khó tập trung", "Mất hứng thú", "Khóc không rõ lý do", "Đau vùng chậu",
    "Tiểu gắt", "Tiểu ra máu", "Đau bụng kinh dữ dội", "Tiểu đêm", "Khô họng", "Hôi miệng",
    "Đau đầu căng thẳng", "Mất vị giác", "Mất khứu giác", "Khàn tiếng", "Sưng hạch bạch huyết",
    "Tê bì chân tay", "Tăng cân không rõ nguyên nhân", "Móng tay giòn", "Rụng tóc", "Chóng mặt khi đứng lên",
    "Đau khớp gối", "Sưng khớp ngón chân", "Đau hạ sườn phải", "Đau vai", "Đau thần kinh tọa",
    "Ợ hơi", "Đầy bụng", "Rối loạn giấc ngủ", "Thường xuyên cáu kỉnh", "Chảy máu cam", "Ho ra máu",
    "Môi khô", "Lưỡi trắng", "Hơi thở có mùi", "Ù tai", "Nhìn đôi", "Mờ một bên mắt", "Co giật",
    "Liệt mặt", "Mất thăng bằng", "Khó nuốt"
]


# ============================================
# 🌐 CÁC API ENDPOINT CHO DỰ ĐOÁN BỆNH
# ============================================

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    """Trả về danh sách các triệu chứng được hỗ trợ."""
    return jsonify({"supported_symptoms": SYMPTOMS})

@app.route('/predict_diagnosis', methods=['POST'])
def predict_diagnosis_endpoint():
    """
    Dự đoán bệnh và phương pháp điều trị dựa trên:
    - Triệu chứng
    - Yếu tố nguy cơ
    - Giới tính
    - Tuổi
    """
    data = request.get_json(force=True)

    # --- Đọc dữ liệu đầu vào ---
    symptoms = data.get('symptoms', [])
    risks = data.get('risk_factors', [])
    gender = data.get('gender')
    age = data.get('age')

    # --- Kiểm tra hợp lệ ---
    if not gender or age is None:
        return jsonify({"error": "Vui lòng cung cấp giới tính và tuổi."}), 400

    gender_code = gender_map.get(gender)
    if gender_code is None:
        return jsonify({"error": f"Giới tính '{gender}' không hợp lệ. Dùng 'Nam' hoặc 'Nữ'."}), 400

    # --- Chuẩn bị DataFrame ---
    input_df = pd.DataFrame(0, index=[0], columns=feature_cols)

    for s in symptoms:
        col = f"Triệu chứng_{s}"
        if col in input_df.columns:
            input_df[col] = 1

    for r in risks:
        col = f"Yếu tố nguy cơ_{r}"
        if col in input_df.columns:
            input_df[col] = 1

    input_df["Mã giới tính"] = gender_code
    input_df["Tuổi"] = age

    # --- Dự đoán ---
    try:
        # Dự đoán xác suất
        proba = model_diagnosis.predict_proba(input_df)  # shape: (1, n_classes)
        max_prob = np.max(proba)                         # Xác suất nhãn dự đoán cao nhất
        predicted_class = model_diagnosis.classes_[np.argmax(proba)]

        # Cảnh báo theo threshold 0.8 (80%)
        warning = None
        if max_prob < 0.8:
            warning = (
                "Độ tin cậy dự đoán chưa cao (xác suất < 80%). "
                "Kết quả chỉ mang tính tham khảo. "
                "Khuyến nghị xem xét thêm các triệu chứng "
            )

        # Dự đoán điều trị bình thường
        treatment_code = model_treatment.predict(input_df)[0]

        # Trả về kết quả
        result = {
            "predicted_diagnosis_code": int(predicted_class),
            "predicted_diagnosis_name": reverse_diagnosis_map.get(predicted_class, "Không xác định"),
            "predicted_treatment_code": int(treatment_code),
            "predicted_treatment_name": reverse_treatment_map.get(treatment_code, "Không xác định"),
            "warning": warning
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Lỗi khi dự đoán bệnh: {str(e)}"}), 500

# ============================================
# 🌐 CÁC API ENDPOINT CHO PHÂN TÍCH ẢNH THUỐC
# ============================================

@app.route("/analyze_medicine_image", methods=["POST"])
def analyze_medicine_image_endpoint():
    """
    Endpoint nhận ảnh thuốc và prompt từ client React để phân tích.
    """
    try:
        if "image" not in request.files:
            return jsonify({"error": "Thiếu file ảnh 'image'"}), 400

        image_file = request.files["image"]
        user_prompt = request.form.get("prompt", "")

        image_bytes = image_file.read()

        # Gọi hàm analyze_medicine_image từ module medicine_analyzer
        result = analyze_medicine_image(image_bytes, user_prompt)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Lỗi khi phân tích ảnh thuốc: {str(e)}"}), 500

# ============================================
# 🚀 CHẠY ỨNG DỤNG
# ============================================
if __name__ == '__main__':
    """Chạy ứng dụng Flask ở chế độ production."""
    print(f"Starting Flask app from: {BASE_DIR}")
    print(f"Looking for models in: {MODELS_DIR}")
    app.run(host='0.0.0.0', port=5000, debug=False)