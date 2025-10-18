# Cách xem danh sách bệnh mà mô hình hỗ trợ
import pickle

with open(r"D:\KhoaLuanTotNghiep\ClinicManagementSystem\AI\ML\models\diagnosis_map_vn.pkl", "rb") as f:
    diagnosis_map = pickle.load(f)

print(list(diagnosis_map.values()))
