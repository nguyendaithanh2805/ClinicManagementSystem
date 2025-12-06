import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

# Đường dẫn đến file dữ liệu và tên file lưu mô hình
file_path = 'ML/medical_dataset.csv' 
MODEL_FILE = 'random_forest_model.joblib'
ENCODER_FILE = 'label_encoder.joblib'
TREATMENT_MAP_FILE = 'diagnosis_treatment_map.joblib'


# --- Tải dữ liệu ---
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"LỖI: Không tìm thấy file dữ liệu tại đường dẫn: {file_path}")
    exit()

# --- Tiền xử lý và Lưu các thành phần hỗ trợ ---

# 1. Mã hóa nhãn cho biến mục tiêu 'Chẩn_đoán' và lưu LabelEncoder
label_encoder = LabelEncoder()
df['Chẩn_đoán_Encoded'] = label_encoder.fit_transform(df['Chẩn_đoán'])
joblib.dump(label_encoder, ENCODER_FILE)
print(f"Đã lưu LabelEncoder vào {ENCODER_FILE}")

# 2. Tạo bản đồ tra cứu Gợi ý Điều trị và lưu
df_treatment = pd.read_csv(file_path)[['Chẩn_đoán', 'Gợi_ý_Điều_trị']].drop_duplicates()
diagnosis_treatment_map = df_treatment.set_index('Chẩn_đoán').to_dict()['Gợi_ý_Điều_trị']
joblib.dump(diagnosis_treatment_map, TREATMENT_MAP_FILE)
print(f"Đã lưu bản đồ điều trị vào {TREATMENT_MAP_FILE}")

# --- Chuẩn bị dữ liệu cho huấn luyện ---

# 3. Định nghĩa Features (X) và Target (y)
X = df.drop(columns=['Chẩn_đoán', 'Gợi_ý_Điều_trị', 'Chẩn_đoán_Encoded'])
y = df['Chẩn_đoán_Encoded']

# 4. Phân chia tập dữ liệu thành tập huấn luyện và kiểm tra (80/20)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 5. Xác định các cột phân loại ('Chuyên_khoa') và cột số (còn lại)
categorical_features = ['Chuyên_khoa']
numerical_features = X_train.columns.drop(categorical_features).tolist()


# --- Xây dựng Pipeline tiền xử lý và mô hình ---

# 6. Xây dựng các bước tiền xử lý
# Transformer cho cột số: Điền giá trị thiếu (NaN) bằng giá trị mode
numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')) 
])

# Transformer cho cột phân loại: Điền giá trị thiếu bằng 'missing' và sau đó One-Hot Encoding
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Kết hợp các bước tiền xử lý bằng ColumnTransformer
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ],
    remainder='passthrough'
)

# 7. Xây dựng Pipeline hoàn chỉnh: Tiền xử lý + Mô hình Random Forest
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
])

# --- Huấn luyện và Lưu mô hình ---

# 8. Huấn luyện mô hình
print("Bắt đầu huấn luyện mô hình Random Forest...")
model_pipeline.fit(X_train, y_train)
print("Huấn luyện mô hình hoàn tất.")

# 9. Đánh giá mô hình
accuracy = model_pipeline.score(X_test, y_test)
print(f"Độ chính xác trên tập kiểm tra: {accuracy*100:.2f}%")

# 10. Lưu mô hình đã huấn luyện (bao gồm cả preprocessor)
joblib.dump(model_pipeline, MODEL_FILE)
print(f"Mô hình đã được lưu thành công vào file '{MODEL_FILE}'.")