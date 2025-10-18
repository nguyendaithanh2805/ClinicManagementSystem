import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import classification_report, accuracy_score
import pickle
import os

# Đường dẫn đến dataset mới
DATASET_PATH = "../data/medical_data_from_sql_v2.csv"
MODELS_DIR = "../models"

# Đảm bảo thư mục models tồn tại
os.makedirs(MODELS_DIR, exist_ok=True)

# Đọc dataset
df = pd.read_csv(DATASET_PATH, encoding="utf-8-sig")

# Tải các mappings đã lưu
with open(os.path.join(MODELS_DIR, "diagnosis_map_vn.pkl"), "rb") as f:
    diagnosis_map = pickle.load(f)
with open(os.path.join(MODELS_DIR, "treatment_map_vn.pkl"), "rb") as f:
    treatment_map = pickle.load(f)
with open(os.path.join(MODELS_DIR, "gender_map_vn.pkl"), "rb") as f:
    gender_map = pickle.load(f)
with open(os.path.join(MODELS_DIR, "symptoms_list_vn.pkl"), "rb") as f:
    all_symptoms = pickle.load(f)
with open(os.path.join(MODELS_DIR, "risk_factors_list_vn.pkl"), "rb") as f:
    all_risk_factors = pickle.load(f)
with open(os.path.join(MODELS_DIR, "medicine_details_map.pkl"), "rb") as f:
    treatment_medicine_map = pickle.load(f)

# Lấy danh sách tất cả các thuốc duy nhất từ medicine_details_map
all_medicines_from_map = sorted(set(med["name"] for treatments_list in treatment_medicine_map.values() for med in treatments_list))
medicine_cols = [f"Thuốc_{med}" for med in all_medicines_from_map]


# --- Định nghĩa các cột đặc trưng (features) ---
# Sử dụng Giới tính, Tuổi, Triệu chứng và Yếu tố nguy cơ
feature_cols = (
    [f"Triệu chứng_{s}" for s in all_symptoms] +
    [f"Yếu tố nguy cơ_{rf}" for rf in all_risk_factors] +
    ["Mã giới tính", "Tuổi"]
)

# Kiểm tra xem tất cả các cột đặc trưng có tồn tại trong DataFrame không
missing_features = [col for col in feature_cols if col not in df.columns]
if missing_features:
    print(f"Cảnh báo: Các cột đặc trưng sau không tìm thấy trong DataFrame: {missing_features}")
    # Loại bỏ các cột bị thiếu khỏi feature_cols
    feature_cols = [col for col in feature_cols if col in df.columns]

X = df[feature_cols]

# --- Định nghĩa nhãn (labels) ---
y_diagnosis = df["Mã chẩn đoán"]
y_treatment = df["Mã phương pháp điều trị"]
y_medicines = df[medicine_cols] # Đây là tập nhãn cho multi-label classification

# --- Cấu hình GridSearchCV cho tối ưu tham số ---
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [10, 20, None], # None nghĩa là không giới hạn độ sâu
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2]
}
base_rf_model = RandomForestClassifier(random_state=42, n_jobs=-1) # n_jobs=-1 để sử dụng tất cả các core CPU

# --- Huấn luyện mô hình cho Chẩn đoán ---
print("\n--- Huấn luyện mô hình Chẩn đoán ---")
X_train_diag, X_test_diag, y_diag_train, y_diag_test = train_test_split(X, y_diagnosis, test_size=0.2, random_state=42, stratify=y_diagnosis)

print("Bắt đầu tìm kiếm tham số tốt nhất cho Chẩn đoán...")
grid_search_diag = GridSearchCV(estimator=base_rf_model, param_grid=param_grid, cv=3, n_jobs=-1, verbose=1, scoring='accuracy')
grid_search_diag.fit(X_train_diag, y_diag_train)
model_diagnosis = grid_search_diag.best_estimator_
print(f"Tham số tốt nhất cho Chẩn đoán: {grid_search_diag.best_params_}")

y_pred_diag = model_diagnosis.predict(X_test_diag)
print("\nBáo cáo phân loại Chẩn đoán trên tập kiểm tra:")
print(classification_report(y_diag_test, y_pred_diag, target_names=[diagnosis_map[i] for i in sorted(diagnosis_map.keys())], zero_division=0))
print(f"Độ chính xác trên tập kiểm tra: {accuracy_score(y_diag_test, y_pred_diag):.4f}")

cv_scores_diag = cross_val_score(model_diagnosis, X, y_diagnosis, cv=5, n_jobs=-1, scoring='accuracy')
print(f"Độ chính xác trung bình (cross-validation) cho chẩn đoán: {cv_scores_diag.mean():.4f} (+/- {cv_scores_diag.std() * 2:.4f})")

# --- Huấn luyện mô hình cho Phương pháp điều trị ---
print("\n--- Huấn luyện mô hình Phương pháp điều trị ---")
X_train_treat, X_test_treat, y_treat_train, y_treat_test = train_test_split(X, y_treatment, test_size=0.2, random_state=42, stratify=y_treatment)

print("Bắt đầu tìm kiếm tham số tốt nhất cho Phương pháp điều trị...")
grid_search_treat = GridSearchCV(estimator=base_rf_model, param_grid=param_grid, cv=3, n_jobs=-1, verbose=1, scoring='accuracy')
grid_search_treat.fit(X_train_treat, y_treat_train)
model_treatment = grid_search_treat.best_estimator_
print(f"Tham số tốt nhất cho Phương pháp điều trị: {grid_search_treat.best_params_}")

y_pred_treat = model_treatment.predict(X_test_treat)
print("\nBáo cáo phân loại Phương pháp điều trị trên tập kiểm tra:")
print(classification_report(y_treat_test, y_pred_treat, target_names=[treatment_map[i] for i in sorted(treatment_map.keys())], zero_division=0))
print(f"Độ chính xác trên tập kiểm tra: {accuracy_score(y_treat_test, y_pred_treat):.4f}")

cv_scores_treat = cross_val_score(model_treatment, X, y_treatment, cv=5, n_jobs=-1, scoring='accuracy')
print(f"Độ chính xác trung bình (cross-validation) cho phương pháp điều trị: {cv_scores_treat.mean():.4f} (+/- {cv_scores_treat.std() * 2:.4f})")


# --- Huấn luyện mô hình cho Thuốc (Multi-label classification) ---
print("\n--- Huấn luyện mô hình Thuốc (Multi-label) ---")
# MultiOutputClassifier không hỗ trợ stratify trực tiếp cho multi-label, nhưng vẫn có thể dùng train_test_split
X_train_med, X_test_med, y_med_train, y_med_test = train_test_split(X, y_medicines, test_size=0.2, random_state=42)

best_params_for_rf = grid_search_diag.best_params_

model_medicine = MultiOutputClassifier(RandomForestClassifier(random_state=42, n_jobs=-1, **best_params_for_rf))
model_medicine.fit(X_train_med, y_med_train)

# Đánh giá Multi-label classification đòi hỏi các metrics khác
y_pred_med = model_medicine.predict(X_test_med)

# Chuyển đổi sparse matrix của y_medicines_test thành mảng numpy dày đặc để tính toán metrics
# hoặc sử dụng các hàm metrics của sklearn.metrics.
from sklearn.metrics import jaccard_score, hamming_loss
# Jaccard score (tương tự độ chính xác)
jaccard_micro = jaccard_score(y_med_test, y_pred_med, average='micro')
jaccard_macro = jaccard_score(y_med_test, y_pred_med, average='macro', zero_division=0)
hamming = hamming_loss(y_med_test, y_pred_med)

print(f"\nĐánh giá mô hình Thuốc trên tập kiểm tra (Multi-label):")
print(f"Jaccard Score (Micro): {jaccard_micro:.4f}")
print(f"Jaccard Score (Macro): {jaccard_macro:.4f}")
print(f"Hamming Loss: {hamming:.4f} (Càng thấp càng tốt)")

# Lưu các mô hình đã huấn luyện
with open(os.path.join(MODELS_DIR, "diagnosis_model_v2.pkl"), "wb") as f:
    pickle.dump(model_diagnosis, f)
with open(os.path.join(MODELS_DIR, "treatment_model_v2.pkl"), "wb") as f:
    pickle.dump(model_treatment, f)
with open(os.path.join(MODELS_DIR, "medicine_model_v2.pkl"), "wb") as f:
    pickle.dump(model_medicine, f)

print("\nĐã lưu các mô hình phiên bản V2 thành công!")

# In ra một số thông tin để kiểm tra
print(f"\nKích thước tập X: {X.shape}")
print(f"Số lượng đặc trưng: {len(feature_cols)}")
print(f"Các đặc trưng được sử dụng: {feature_cols[:5]}... và {feature_cols[-5:]}")
print(f"Số lượng nhãn chẩn đoán: {len(diagnosis_map)}")
print(f"Số lượng nhãn phương pháp điều trị: {len(treatment_map)}")
print(f"Số lượng loại thuốc: {len(all_medicines_from_map)}")