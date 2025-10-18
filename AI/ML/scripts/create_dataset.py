import pandas as pd
import numpy as np
import pickle

# --- Cập nhật danh sách Bệnh và Phương pháp điều trị (đa dạng hơn) ---
diseases_info = [
    {"name": "Viêm họng cấp", "gender_pref": "any", "age_range": (5, 60)},
    {"name": "Cận thị", "gender_pref": "any", "age_range": (6, 50)},
    {"name": "Tăng huyết áp", "gender_pref": "any", "age_range": (30, 80)},
    {"name": "Sốt xuất huyết", "gender_pref": "any", "age_range": (1, 70)},
    {"name": "Thiếu máu do thiếu sắt", "gender_pref": "female", "age_range": (15, 50)}, # Thường gặp ở nữ hơn
    {"name": "Viêm dạ dày cấp", "gender_pref": "any", "age_range": (18, 70)},
    {"name": "Gãy xương cẳng tay", "gender_pref": "any", "age_range": (5, 80)},
    {"name": "Viêm da dị ứng", "gender_pref": "any", "age_range": (0, 70)},
    {"name": "Viêm thận cấp", "gender_pref": "any", "age_range": (20, 70)},
    {"name": "Sốt virus", "gender_pref": "any", "age_range": (0, 80)},
    {"name": "Viêm xoang mạn", "gender_pref": "any", "age_range": (10, 60)},
    {"name": "Đau lưng cơ học", "gender_pref": "any", "age_range": (25, 80)},
    {"name": "Tiểu đường type 2", "gender_pref": "any", "age_range": (35, 90)},
    {"name": "Chàm (eczema)", "gender_pref": "any", "age_range": (0, 70)},
    {"name": "Suy tim nhẹ", "gender_pref": "any", "age_range": (50, 90)},
    {"name": "Viêm phổi cộng đồng", "gender_pref": "any", "age_range": (0, 90)},
    {"name": "Sỏi thận", "gender_pref": "male", "age_range": (20, 70)}, # Thường gặp ở nam hơn
    {"name": "Viêm gan B mạn", "gender_pref": "any", "age_range": (10, 80)},
    {"name": "Đau nửa đầu (migraine)", "gender_pref": "female", "age_range": (15, 60)}, # Thường gặp ở nữ hơn
    {"name": "Viêm khớp dạng thấp", "gender_pref": "female", "age_range": (30, 70)}, # Thường gặp ở nữ hơn
    {"name": "Hen suyễn", "gender_pref": "any", "age_range": (0, 70)},
    {"name": "Loét dạ dày tá tràng", "gender_pref": "male", "age_range": (20, 70)}, # Thường gặp ở nam hơn
    {"name": "Nhiễm trùng đường tiểu (UTI)", "gender_pref": "female", "age_range": (1, 80)}, # Rất thường gặp ở nữ
    {"name": "Viêm ruột thừa cấp", "gender_pref": "any", "age_range": (5, 40)},
    {"name": "Đột quỵ thiếu máu não", "gender_pref": "any", "age_range": (50, 90)},
    {"name": "Cúm mùa", "gender_pref": "any", "age_range": (0, 90)},
    {"name": "Trầm cảm", "gender_pref": "female", "age_range": (15, 70)}, # Nữ giới có tỷ lệ cao hơn
    {"name": "Rối loạn lo âu lan tỏa", "gender_pref": "female", "age_range": (18, 60)},
    {"name": "U xơ tử cung", "gender_pref": "female", "age_range": (30, 50)}, # Chỉ có ở nữ
    {"name": "Viêm tiền liệt tuyến", "gender_pref": "male", "age_range": (40, 80)}, # Chỉ có ở nam
    {"name": "Thoái hóa khớp gối", "gender_pref": "any", "age_range": (50, 90)},
    {"name": "Gout cấp", "gender_pref": "male", "age_range": (30, 70)}, # Rất thường gặp ở nam
    {"name": "Viêm gan A", "gender_pref": "any", "age_range": (0, 90)},
    {"name": "Sỏi mật", "gender_pref": "female", "age_range": (30, 70)}, # Nữ có tỷ lệ cao hơn
    {"name": "Đau thần kinh tọa", "gender_pref": "any", "age_range": (30, 70)},
    {"name": "Rối loạn tiêu hóa chức năng", "gender_pref": "any", "age_range": (18, 60)},
    {"name": "Thiểu năng tuần hoàn não", "gender_pref": "any", "age_range": (40, 80)},
    {"name": "Hội chứng ruột kích thích", "gender_pref": "female", "age_range": (20, 50)},
    {"name": "Viêm phế quản cấp", "gender_pref": "any", "age_range": (0, 70)},
    {"name": "Viêm đại tràng mạn", "gender_pref": "any", "age_range": (25, 70)},
]
diseases = [d["name"] for d in diseases_info]

# --- Danh sách phương pháp điều trị (có thể liên quan đến nhiều bệnh) ---
treatments = [
    "Uống kháng sinh và giảm đau", "Đeo kính điều chỉnh", "Uống thuốc hạ áp, theo dõi",
    "Truyền dịch, nghỉ ngơi", "Bổ sung sắt, vitamin B12", "Thuốc giảm axit, chế độ ăn",
    "Bó bột, vật lý trị liệu", "Bôi kem chống viêm, dưỡng ẩm", "Kháng sinh, theo dõi chức năng thận",
    "Nghỉ ngơi, hạ sốt, bù nước", "Rửa xoang, kháng sinh tại chỗ", "Vật lý trị liệu, thuốc giảm đau",
    "Thuốc hạ đường huyết, chế độ ăn, tập thể dục", "Bôi kem dưỡng ẩm, tránh kích ứng",
    "Thuốc hỗ trợ tim mạch, chế độ ăn giảm muối", "Kháng sinh đường uống/tiêm, hỗ trợ hô hấp",
    "Uống nhiều nước, thuốc giảm co thắt, tán sỏi", "Thuốc kháng virus, theo dõi chức năng gan định kỳ",
    "Thuốc giảm đau đặc hiệu, tránh yếu tố kích hoạt", "Thuốc chống viêm, DMARDs, vật lý trị liệu",
    "Thuốc giãn phế quản, corticosteroid dạng hít", "Thuốc ức chế bơm proton, chế độ ăn kiêng",
    "Kháng sinh, uống đủ nước, vệ sinh cá nhân", "Phẫu thuật cắt ruột thừa, kháng sinh dự phòng",
    "Thuốc tiêu sợi huyết, phục hồi chức năng vận động", "Thuốc hạ sốt, bù dịch, kháng virus nếu có",
    "Liệu pháp tâm lý, thuốc chống trầm cảm", "Liệu pháp nhận thức hành vi, thuốc giải lo âu",
    "Phẫu thuật bóc u xơ, theo dõi định kỳ", "Kháng sinh, thuốc giãn cơ, chườm ấm",
    "Giảm đau, vật lý trị liệu, bổ sung glucosamine", "Thuốc hạ axit uric, thuốc chống viêm",
    "Hỗ trợ gan, bù nước điện giải", "Thuốc giảm co thắt, thay đổi lối sống",
    "Thuốc giảm đau thần kinh, vật lý trị liệu", "Thuốc điều hòa nhu động ruột, chế độ ăn",
    "Thuốc tăng cường tuần hoàn não, tập thể dục", "Thuốc điều trị triệu chứng, chế độ ăn",
    "Kháng sinh, thuốc giãn phế quản, long đờm", "Thuốc chống viêm, điều hòa miễn dịch"
]


# --- Danh sách triệu chứng (đa dạng hơn, thêm mức độ) ---
symptoms = [
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

# --- Yếu tố nguy cơ ---
risk_factors = ["Hút thuốc", "Uống rượu bia", "Tiền sử gia đình", "Ít vận động", "Thừa cân béo phì", "Stress kéo dài", "Chế độ ăn nhiều dầu mỡ"]

# Ánh xạ bệnh-triệu chứng và các yếu tố liên quan (phức tạp hơn)
disease_data_map = {
    "Viêm họng cấp": {"symptoms": ["Đau họng", "Sốt", "Ho khan", "Khó nuốt"], "treatments": ["Uống kháng sinh và giảm đau", "Nghỉ ngơi, hạ sốt, bù nước"], "gender_pref": "any", "age_range": (5, 60)},
    "Cận thị": {"symptoms": ["Mờ mắt", "Đau đầu", "Mỏi mắt"], "treatments": ["Đeo kính điều chỉnh"], "gender_pref": "any", "age_range": (6, 50)},
    "Tăng huyết áp": {"symptoms": ["Chóng mặt", "Đau đầu", "Mệt mỏi", "Mất ngủ", "Đau ngực"], "treatments": ["Uống thuốc hạ áp, theo dõi"], "risk_factors": ["Stress kéo dài", "Thừa cân béo phì", "Tiền sử gia đình", "Uống rượu bia", "Ít vận động"], "gender_pref": "any", "age_range": (30, 80)},
    "Sốt xuất huyết": {"symptoms": ["Sốt cao", "Mệt mỏi", "Đau cơ", "Phát ban", "Buồn nôn", "Đau hốc mắt"], "treatments": ["Truyền dịch, nghỉ ngơi", "Nghỉ ngơi, hạ sốt, bù nước"], "gender_pref": "any", "age_range": (1, 70)},
    "Thiếu máu do thiếu sắt": {"symptoms": ["Mệt mỏi", "Da nhợt nhạt", "Khó thở", "Chóng mặt", "Móng tay giòn", "Rụng tóc"], "treatments": ["Bổ sung sắt, vitamin B12"], "risk_factors": ["Chế độ ăn nhiều dầu mỡ"], "gender_pref": "female", "age_range": (15, 50)},
    "Viêm dạ dày cấp": {"symptoms": ["Đau thượng vị", "Buồn nôn", "Khó tiêu", "Ợ hơi", "Hôi miệng"], "treatments": ["Thuốc giảm axit, chế độ ăn"], "risk_factors": ["Stress kéo dài", "Uống rượu bia"], "gender_pref": "any", "age_range": (18, 70)},
    "Gãy xương cẳng tay": {"symptoms": ["Đau tay", "Sưng", "Khó cử động"], "treatments": ["Bó bột, vật lý trị liệu"], "gender_pref": "any", "age_range": (5, 80)},
    "Viêm da dị ứng": {"symptoms": ["Ngứa da", "Phát ban", "Da khô"], "treatments": ["Bôi kem chống viêm, dưỡng ẩm"], "gender_pref": "any", "age_range": (0, 70)},
    "Viêm thận cấp": {"symptoms": ["Đau lưng dưới", "Tiểu khó", "Sốt", "Tiểu buốt", "Tiểu ra máu"], "treatments": ["Kháng sinh, theo dõi chức năng thận"], "gender_pref": "any", "age_range": (20, 70)},
    "Sốt virus": {"symptoms": ["Sốt", "Hắt hơi", "Chảy nước mũi", "Mệt mỏi", "Đau cơ", "Ớn lạnh"], "treatments": ["Nghỉ ngơi, hạ sốt, bù nước"], "gender_pref": "any", "age_range": (0, 80)},
    "Viêm xoang mạn": {"symptoms": ["Nghẹt mũi", "Đau đầu", "Chảy nước mũi", "Đau vùng mặt", "Mất khứu giác"], "treatments": ["Rửa xoang, kháng sinh tại chỗ"], "gender_pref": "any", "age_range": (10, 60)},
    "Đau lưng cơ học": {"symptoms": ["Đau lưng", "Cứng lưng", "Khó cúi", "Đau vai gáy"], "treatments": ["Vật lý trị liệu, thuốc giảm đau"], "risk_factors": ["Ít vận động", "Thừa cân béo phì"], "gender_pref": "any", "age_range": (25, 80)},
    "Tiểu đường type 2": {"symptoms": ["Khát nước", "Tiểu nhiều", "Mệt mỏi", "Sút cân không rõ nguyên nhân", "Mờ mắt", "Tê bì chân tay"], "treatments": ["Thuốc hạ đường huyết, chế độ ăn, tập thể dục"], "risk_factors": ["Thừa cân béo phì", "Tiền sử gia đình", "Ít vận động", "Chế độ ăn nhiều dầu mỡ"], "gender_pref": "any", "age_range": (35, 90)},
    "Chàm (eczema)": {"symptoms": ["Ngứa da tay", "Da khô", "Phát ban"], "treatments": ["Bôi kem dưỡng ẩm, tránh kích ứng"], "gender_pref": "any", "age_range": (0, 70)},
    "Suy tim nhẹ": {"symptoms": ["Khó thở", "Sưng chân", "Mệt mỏi", "Đau ngực", "Ho khan"], "treatments": ["Thuốc hỗ trợ tim mạch, chế độ ăn giảm muối"], "risk_factors": ["Tăng huyết áp", "Tiểu đường type 2", "Thừa cân béo phì", "Hút thuốc", "Uống rượu bia"], "gender_pref": "any", "age_range": (50, 90)},
    "Viêm phổi cộng đồng": {"symptoms": ["Sốt", "Ho có đờm", "Đau ngực khi thở", "Khó thở", "Mệt mỏi", "Ớn lạnh"], "treatments": ["Kháng sinh đường uống/tiêm, hỗ trợ hô hấp"], "risk_factors": ["Hút thuốc", "Uống rượu bia", "Tuổi cao"], "gender_pref": "any", "age_range": (0, 90)},
    "Sỏi thận": {"symptoms": ["Đau lưng dưới", "Tiểu khó", "Đau bụng", "Buồn nôn", "Tiểu ra máu"], "treatments": ["Uống nhiều nước, thuốc giảm co thắt, tán sỏi"], "risk_factors": ["Chế độ ăn nhiều dầu mỡ", "Ít vận động"], "gender_pref": "male", "age_range": (20, 70)},
    "Viêm gan B mạn": {"symptoms": ["Mệt mỏi", "Vàng da", "Đau bụng", "Chán ăn", "Nôn mửa"], "treatments": ["Thuốc kháng virus, theo dõi chức năng gan định kỳ"], "gender_pref": "any", "age_range": (10, 80)},
    "Đau nửa đầu (migraine)": {"symptoms": ["Đau đầu", "Buồn nôn", "Nhạy cảm với ánh sáng", "Nhìn mờ"], "treatments": ["Thuốc giảm đau đặc hiệu, tránh yếu tố kích hoạt"], "risk_factors": ["Stress kéo dài", "Tiền sử gia đình"], "gender_pref": "female", "age_range": (15, 60)},
    "Viêm khớp dạng thấp": {"symptoms": ["Sưng khớp", "Đau khớp", "Cứng khớp buổi sáng", "Mệt mỏi", "Sút cân không rõ nguyên nhân"], "treatments": ["Thuốc chống viêm, DMARDs, vật lý trị liệu"], "risk_factors": ["Tiền sử gia đình"], "gender_pref": "female", "age_range": (30, 70)},
    "Hen suyễn": {"symptoms": ["Khó thở", "Thở khò khè", "Ho khan", "Nặng ngực"], "treatments": ["Thuốc giãn phế quản, corticosteroid dạng hít"], "risk_factors": ["Tiền sử gia đình"], "gender_pref": "any", "age_range": (0, 70)},
    "Loét dạ dày tá tràng": {"symptoms": ["Đau thượng vị", "Ợ nóng", "Buồn nôn", "Khó tiêu", "Hôi miệng"], "treatments": ["Thuốc ức chế bơm proton, chế độ ăn kiêng"], "risk_factors": ["Stress kéo dài", "Uống rượu bia", "Hút thuốc"], "gender_pref": "male", "age_range": (20, 70)},
    "Nhiễm trùng đường tiểu (UTI)": {"symptoms": ["Tiểu khó", "Tiểu buốt", "Đau bụng dưới", "Tiểu nhiều", "Sốt", "Tiểu gắt"], "treatments": ["Kháng sinh, uống đủ nước, vệ sinh cá nhân"], "gender_pref": "female", "age_range": (1, 80)},
    "Viêm ruột thừa cấp": {"symptoms": ["Đau bụng", "Sốt", "Buồn nôn", "Chán ăn", "Nôn mửa", "Đau bụng dưới"], "treatments": ["Phẫu thuật cắt ruột thừa, kháng sinh dự phòng"], "gender_pref": "any", "age_range": (5, 40)},
    "Đột quỵ thiếu máu não": {"symptoms": ["Đau đầu", "Chóng mặt", "Yếu một bên cơ thể", "Khó nói", "Mờ một bên mắt", "Liệt mặt", "Mất thăng bằng", "Co giật"], "treatments": ["Thuốc tiêu sợi huyết, phục hồi chức năng vận động"], "risk_factors": ["Tăng huyết áp", "Tiểu đường type 2", "Hút thuốc", "Ít vận động", "Thừa cân béo phì", "Tiền sử gia đình"], "gender_pref": "any", "age_range": (50, 90)},
    "Cúm mùa": {"symptoms": ["Sốt", "Ho khan", "Đau họng", "Nhức mỏi toàn thân", "Sổ mũi", "Ớn lạnh", "Mất vị giác", "Mất khứu giác"], "treatments": ["Thuốc hạ sốt, bù dịch, kháng virus nếu có"], "gender_pref": "any", "age_range": (0, 90)},
    "Trầm cảm": {"symptoms": ["Mất hứng thú", "Mệt mỏi", "Rối loạn giấc ngủ", "Chán ăn", "Sút cân không rõ nguyên nhân", "Khó tập trung", "Khóc không rõ lý do", "Lo lắng", "Thường xuyên cáu kỉnh"], "treatments": ["Liệu pháp tâm lý, thuốc chống trầm cảm"], "risk_factors": ["Stress kéo dài", "Tiền sử gia đình"], "gender_pref": "female", "age_range": (15, 70)},
    "Rối loạn lo âu lan tỏa": {"symptoms": ["Lo lắng", "Bồn chồn", "Mất ngủ", "Khó tập trung", "Mệt mỏi", "Đau đầu căng thẳng", "Rối loạn giấc ngủ"], "treatments": ["Liệu pháp nhận thức hành vi, thuốc giải lo âu"], "risk_factors": ["Stress kéo dài", "Tiền sử gia đình"], "gender_pref": "female", "age_range": (18, 60)},
    "U xơ tử cung": {"symptoms": ["Đau vùng chậu", "Đau bụng kinh dữ dội", "Chảy máu âm đạo bất thường", "Tiểu nhiều (do chèn ép)", "Táo bón"], "treatments": ["Phẫu thuật bóc u xơ, theo dõi định kỳ"], "gender_pref": "female", "age_range": (30, 50)},
    "Viêm tiền liệt tuyến": {"symptoms": ["Tiểu khó", "Tiểu buốt", "Tiểu nhiều", "Đau vùng chậu", "Sốt", "Đau lưng dưới", "Tiểu đêm"], "treatments": ["Kháng sinh, thuốc giãn cơ, chườm ấm"], "gender_pref": "male", "age_range": (40, 80)},
    "Thoái hóa khớp gối": {"symptoms": ["Đau khớp gối", "Cứng khớp buổi sáng", "Khó vận động", "Tiếng lạo xạo khớp", "Sưng khớp"], "treatments": ["Giảm đau, vật lý trị liệu, bổ sung glucosamine"], "risk_factors": ["Thừa cân béo phì", "Ít vận động", "Tuổi cao"], "gender_pref": "any", "age_range": (50, 90)},
    "Gout cấp": {"symptoms": ["Đau khớp ngón chân cái", "Sưng khớp", "Nóng đỏ khớp", "Sốt", "Đau khớp gối"], "treatments": ["Thuốc hạ axit uric, thuốc chống viêm"], "risk_factors": ["Uống rượu bia", "Chế độ ăn nhiều dầu mỡ"], "gender_pref": "male", "age_range": (30, 70)},
    "Viêm gan A": {"symptoms": ["Mệt mỏi", "Vàng da", "Buồn nôn", "Chán ăn", "Sốt", "Đau hạ sườn phải"], "treatments": ["Hỗ trợ gan, bù nước điện giải"], "gender_pref": "any", "age_range": (0, 90)},
    "Sỏi mật": {"symptoms": ["Đau hạ sườn phải", "Buồn nôn", "Nôn mửa", "Đau bụng", "Khó tiêu", "Sốt", "Vàng da"], "treatments": ["Thuốc giảm co thắt, thay đổi lối sống"], "risk_factors": ["Thừa cân béo phì", "Chế độ ăn nhiều dầu mỡ"], "gender_pref": "female", "age_range": (30, 70)},
    "Đau thần kinh tọa": {"symptoms": ["Đau thần kinh tọa", "Đau lưng", "Tê bì chân tay", "Yếu một bên cơ thể"], "treatments": ["Thuốc giảm đau thần kinh, vật lý trị liệu"], "risk_factors": ["Ít vận động", "Thừa cân béo phì"], "gender_pref": "any", "age_range": (30, 70)},
    "Rối loạn tiêu hóa chức năng": {"symptoms": ["Đầy bụng", "Ợ hơi", "Khó tiêu", "Táo bón", "Tiêu chảy", "Đau bụng"], "treatments": ["Thuốc điều hòa nhu động ruột, chế độ ăn"], "risk_factors": ["Stress kéo dài"], "gender_pref": "any", "age_range": (18, 60)},
    "Thiểu năng tuần hoàn não": {"symptoms": ["Đau đầu", "Chóng mặt", "Mất ngủ", "Mệt mỏi", "Khó tập trung", "Ù tai"], "treatments": ["Thuốc tăng cường tuần hoàn não, tập thể dục"], "risk_factors": ["Tăng huyết áp", "Tiểu đường type 2", "Hút thuốc", "Ít vận động"], "gender_pref": "any", "age_range": (40, 80)},
    "Hội chứng ruột kích thích": {"symptoms": ["Đau bụng", "Đầy bụng", "Táo bón", "Tiêu chảy", "Rối loạn tiêu hóa chức năng"], "treatments": ["Thuốc điều trị triệu chứng, chế độ ăn"], "risk_factors": ["Stress kéo dài"], "gender_pref": "female", "age_range": (20, 50)},
    "Viêm phế quản cấp": {"symptoms": ["Ho khan", "Ho có đờm", "Khó thở", "Sốt", "Đau ngực khi thở"], "treatments": ["Kháng sinh, thuốc giãn phế quản, long đờm"], "risk_factors": ["Hút thuốc"], "gender_pref": "any", "age_range": (0, 70)},
    "Viêm đại tràng mạn": {"symptoms": ["Đau bụng", "Tiêu chảy", "Táo bón", "Đầy bụng", "Khó tiêu", "Sút cân không rõ nguyên nhân"], "treatments": ["Thuốc chống viêm, điều hòa miễn dịch"], "risk_factors": ["Stress kéo dài", "Tiền sử gia đình"], "gender_pref": "any", "age_range": (25, 70)},
}


# --- Ánh xạ phương pháp điều trị và thuốc cụ thể ---
treatment_medicine_map = {
    "Uống kháng sinh và giảm đau": [
        {"name": "Amoxicillin", "dose": "500mg", "frequency": "3 lần/ngày", "instruction": "Uống sau ăn", "duration": "7 ngày"},
        {"name": "Paracetamol", "dose": "500mg", "frequency": "4-6 giờ/lần khi đau/sốt", "instruction": "Uống khi cần", "duration": "Theo triệu chứng"}
    ],
    "Đeo kính điều chỉnh": [],
    "Uống thuốc hạ áp, theo dõi": [
        {"name": "Amlodipine", "dose": "5mg", "frequency": "1 lần/ngày", "instruction": "Uống tối", "duration": "Lâu dài"},
        {"name": "Valsartan", "dose": "80mg", "frequency": "1 lần/ngày", "instruction": "Uống sáng", "duration": "Lâu dài"}
    ],
    "Truyền dịch, nghỉ ngơi": [
        {"name": "Natri Clorid 0.9%", "dose": "500ml", "frequency": "1-2 lần/ngày", "instruction": "Truyền tĩnh mạch theo chỉ định", "duration": "2-3 ngày"}
    ],
    "Bổ sung sắt, vitamin B12": [
        {"name": "Ferrous Sulfate", "dose": "100mg", "frequency": "1 lần/ngày", "instruction": "Uống sau ăn", "duration": "3-6 tháng"},
        {"name": "Vitamin B12", "dose": "1000mcg", "frequency": "1 lần/ngày", "instruction": "Uống sáng", "duration": "3-6 tháng"}
    ],
    "Thuốc giảm axit, chế độ ăn": [
        {"name": "Omeprazole", "dose": "20mg", "frequency": "2 lần/ngày", "instruction": "Uống trước ăn 30 phút", "duration": "4-8 tuần"},
        {"name": "Gaviscon", "dose": "10ml", "frequency": "3 lần/ngày sau ăn và trước khi đi ngủ", "instruction": "Uống trực tiếp", "duration": "Theo triệu chứng"}
    ],
    "Bó bột, vật lý trị liệu": [], # Không có thuốc cụ thể, chủ yếu là can thiệp vật lý
    "Bôi kem chống viêm, dưỡng ẩm": [
        {"name": "Hydrocortisone 1%", "dose": "Lượng vừa đủ", "frequency": "2 lần/ngày", "instruction": "Bôi ngoài da vùng bị ảnh hưởng", "duration": "1-2 tuần"},
        {"name": "Cetaphil Lotion", "dose": "Lượng vừa đủ", "frequency": "2-3 lần/ngày", "instruction": "Bôi dưỡng ẩm toàn thân", "duration": "Lâu dài"}
    ],
    "Kháng sinh, theo dõi chức năng thận": [
        {"name": "Ciprofloxacin", "dose": "500mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "7-14 ngày"}
    ],
    "Nghỉ ngơi, hạ sốt, bù nước": [
        {"name": "Paracetamol", "dose": "500mg", "frequency": "4-6 giờ/lần khi sốt", "instruction": "Uống khi cần", "duration": "Theo triệu chứng"},
        {"name": "Oresol", "dose": "1 gói pha 200ml nước", "frequency": "Uống thay nước", "instruction": "Uống từng ngụm nhỏ", "duration": "Theo triệu chứng"}
    ],
    "Rửa xoang, kháng sinh tại chỗ": [
        {"name": "Xịt mũi Saline", "dose": "2-3 nhát/lỗ mũi", "frequency": "2-3 lần/ngày", "instruction": "Rửa xoang", "duration": "Lâu dài"},
        {"name": "Fluticasone nasal spray", "dose": "2 nhát/lỗ mũi", "frequency": "1 lần/ngày", "instruction": "Xịt vào mũi", "duration": "4-6 tuần"}
    ],
    "Vật lý trị liệu, thuốc giảm đau": [
        {"name": "Ibuprofen", "dose": "400mg", "frequency": "2-3 lần/ngày sau ăn", "instruction": "Uống khi đau", "duration": "5-7 ngày"}
    ],
    "Thuốc hạ đường huyết, chế độ ăn, tập thể dục": [
        {"name": "Metformin", "dose": "500mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"},
        {"name": "Gliclazide", "dose": "30mg", "frequency": "1 lần/ngày", "instruction": "Uống trước ăn sáng", "duration": "Lâu dài"}
    ],
    "Bôi kem dưỡng ẩm, tránh kích ứng": [
        {"name": "Avene TriXéra NUTRITION Balm", "dose": "Lượng vừa đủ", "frequency": "2 lần/ngày", "instruction": "Bôi ngoài da", "duration": "Lâu dài"}
    ],
    "Thuốc hỗ trợ tim mạch, chế độ ăn giảm muối": [
        {"name": "Furosemide", "dose": "40mg", "frequency": "1 lần/ngày", "instruction": "Uống sáng", "duration": "Lâu dài"},
        {"name": "Ramipril", "dose": "5mg", "frequency": "1 lần/ngày", "instruction": "Uống tối", "duration": "Lâu dài"}
    ],
    "Kháng sinh đường uống/tiêm, hỗ trợ hô hấp": [
        {"name": "Azithromycin", "dose": "500mg", "frequency": "1 lần/ngày", "instruction": "Uống trước ăn 1 giờ", "duration": "5 ngày"},
        {"name": "Cefotaxime", "dose": "1g", "frequency": "2 lần/ngày", "instruction": "Tiêm tĩnh mạch", "duration": "7 ngày"}
    ],
    "Uống nhiều nước, thuốc giảm co thắt, tán sỏi": [
        {"name": "Spasmolyt", "dose": "10mg", "frequency": "2-3 lần/ngày", "instruction": "Uống khi đau", "duration": "Theo triệu chứng"},
        {"name": "Rowatinex", "dose": "1 viên", "frequency": "3 lần/ngày", "instruction": "Uống trước ăn", "duration": "4-6 tuần"}
    ],
    "Thuốc kháng virus, theo dõi chức năng gan định kỳ": [
        {"name": "Tenofovir", "dose": "300mg", "frequency": "1 lần/ngày", "instruction": "Uống tối", "duration": "Lâu dài theo chỉ định"}
    ],
    "Thuốc giảm đau đặc hiệu, tránh yếu tố kích hoạt": [
        {"name": "Sumatriptan", "dose": "50mg", "frequency": "1 lần khi đau, tối đa 2 viên/ngày", "instruction": "Uống ngay khi có dấu hiệu đau nửa đầu", "duration": "Khi cần"}
    ],
    "Thuốc chống viêm, DMARDs, vật lý trị liệu": [
        {"name": "Methotrexate", "dose": "7.5mg", "frequency": "1 lần/tuần", "instruction": "Uống vào cùng một ngày mỗi tuần", "duration": "Lâu dài"},
        {"name": "Meloxicam", "dose": "7.5mg", "frequency": "1 lần/ngày sau ăn", "instruction": "Uống khi đau/viêm", "duration": "Theo chỉ định"}
    ],
    "Thuốc giãn phế quản, corticosteroid dạng hít": [
        {"name": "Salbutamol (Ventolin) HFA", "dose": "2 nhát", "frequency": "Khi khó thở, tối đa 4 lần/ngày", "instruction": "Xịt hít", "duration": "Khi cần"},
        {"name": "Budesonide/Formoterol (Symbicort)", "dose": "2 nhát", "frequency": "2 lần/ngày", "instruction": "Xịt hít dự phòng", "duration": "Lâu dài"}
    ],
    "Thuốc ức chế bơm proton, chế độ ăn kiêng": [
        {"name": "Pantoprazole", "dose": "40mg", "frequency": "1 lần/ngày", "instruction": "Uống trước ăn 30 phút", "duration": "4-8 tuần"}
    ],
    "Kháng sinh, uống đủ nước, vệ sinh cá nhân": [
        {"name": "Nitrofurantoin", "dose": "100mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "7 ngày"}
    ],
    "Phẫu thuật cắt ruột thừa, kháng sinh dự phòng": [
        {"name": "Ceftriaxone", "dose": "1g", "frequency": "1 lần/ngày", "instruction": "Tiêm tĩnh mạch trước/sau phẫu thuật", "duration": "1-3 ngày"}
    ],
    "Thuốc tiêu sợi huyết, phục hồi chức năng vận động": [
        {"name": "Alteplase", "dose": "0.9mg/kg", "frequency": "1 lần", "instruction": "Tiêm tĩnh mạch trong vòng 4.5 giờ sau đột quỵ", "duration": "1 lần duy nhất"},
        {"name": "Aspirin", "dose": "81mg", "frequency": "1 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"}
    ],
    "Thuốc hạ sốt, bù dịch, kháng virus nếu có": [
        {"name": "Paracetamol", "dose": "500mg", "frequency": "4-6 giờ/lần khi sốt", "instruction": "Uống khi cần", "duration": "Theo triệu chứng"},
        {"name": "Oseltamivir (Tamiflu)", "dose": "75mg", "frequency": "2 lần/ngày", "instruction": "Uống trong 48h đầu khi có triệu chứng", "duration": "5 ngày"}
    ],
    "Liệu pháp tâm lý, thuốc chống trầm cảm": [
        {"name": "Sertraline", "dose": "50mg", "frequency": "1 lần/ngày", "instruction": "Uống sáng hoặc tối", "duration": "Lâu dài theo chỉ định"},
        {"name": "Escitalopram", "dose": "10mg", "frequency": "1 lần/ngày", "instruction": "Uống bất kỳ lúc nào trong ngày", "duration": "Lâu dài theo chỉ định"}
    ],
    "Liệu pháp nhận thức hành vi, thuốc giải lo âu": [
        {"name": "Alprazolam", "dose": "0.25mg", "frequency": "Khi cần, tối đa 3 lần/ngày", "instruction": "Uống khi lo lắng", "duration": "Ngắn hạn"},
        {"name": "Buspirone", "dose": "5mg", "frequency": "2-3 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"}
    ],
    "Phẫu thuật bóc u xơ, theo dõi định kỳ": [],
    "Kháng sinh, thuốc giãn cơ, chườm ấm": [
        {"name": "Levofloxacin", "dose": "500mg", "frequency": "1 lần/ngày", "instruction": "Uống sau ăn", "duration": "10-14 ngày"},
        {"name": "Tolperisone", "dose": "50mg", "frequency": "3 lần/ngày", "instruction": "Uống sau ăn", "duration": "5-7 ngày"}
    ],
    "Giảm đau, vật lý trị liệu, bổ sung glucosamine": [
        {"name": "Glucosamine Sulfate", "dose": "1500mg", "frequency": "1 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"},
        {"name": "Diacerein", "dose": "50mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"}
    ],
    "Thuốc hạ axit uric, thuốc chống viêm": [
        {"name": "Allopurinol", "dose": "300mg", "frequency": "1 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"},
        {"name": "Colchicine", "dose": "0.6mg", "frequency": "Khi có đợt cấp", "instruction": "Uống khi đau", "duration": "Tối đa 3 ngày"}
    ],
    "Hỗ trợ gan, bù nước điện giải": [
        {"name": "Fumarate Arginine", "dose": "1g", "frequency": "2 lần/ngày", "instruction": "Uống trước ăn", "duration": "7-10 ngày"},
        {"name": "Oresol", "dose": "1 gói pha 200ml nước", "frequency": "Uống thay nước", "instruction": "Uống từng ngụm nhỏ", "duration": "Theo triệu chứng"}
    ],
    "Thuốc giảm co thắt, thay đổi lối sống": [
        {"name": "Mebeverine", "dose": "135mg", "frequency": "3 lần/ngày", "instruction": "Uống trước ăn 20 phút", "duration": "Theo triệu chứng"},
        {"name": "Ursodeoxycholic Acid", "dose": "250mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài theo chỉ định"}
    ],
    "Thuốc giảm đau thần kinh, vật lý trị liệu": [
        {"name": "Gabapentin", "dose": "300mg", "frequency": "3 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"},
        {"name": "Pregabalin", "dose": "75mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"}
    ],
    "Thuốc điều hòa nhu động ruột, chế độ ăn": [
        {"name": "Trimebutine", "dose": "100mg", "frequency": "2-3 lần/ngày", "instruction": "Uống trước ăn", "duration": "Theo triệu chứng"},
        {"name": "Probiotic", "dose": "1 gói", "frequency": "1 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"}
    ],
    "Thuốc tăng cường tuần hoàn não, tập thể dục": [
        {"name": "Ginkgo Biloba", "dose": "120mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "2-3 tháng"},
        {"name": "Piracetam", "dose": "800mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "Theo chỉ định"}
    ],
    "Thuốc điều trị triệu chứng, chế độ ăn": [
        {"name": "Loperamide", "dose": "2mg", "frequency": "Khi tiêu chảy, tối đa 4 viên/ngày", "instruction": "Uống sau mỗi lần đi ngoài", "duration": "Khi cần"},
        {"name": "Fiber Supplement", "dose": "1 gói", "frequency": "1 lần/ngày", "instruction": "Pha với nước uống", "duration": "Lâu dài"}
    ],
    "Kháng sinh, thuốc giãn phế quản, long đờm": [
        {"name": "Cefixime", "dose": "200mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "7-10 ngày"},
        {"name": "Acetylcysteine", "dose": "200mg", "frequency": "3 lần/ngày", "instruction": "Uống sau ăn", "duration": "5-7 ngày"},
        {"name": "Theophylline", "dose": "200mg", "frequency": "2 lần/ngày", "instruction": "Uống sau ăn", "duration": "Theo chỉ định"}
    ],
    "Thuốc chống viêm, điều hòa miễn dịch": [
        {"name": "Mesalamine", "dose": "800mg", "frequency": "3 lần/ngày", "instruction": "Uống sau ăn", "duration": "Lâu dài"},
        {"name": "Prednisolone", "dose": "5mg", "frequency": "1 lần/ngày", "instruction": "Uống sáng sau ăn", "duration": "Giảm liều dần theo chỉ định"}
    ]
}


# Tạo danh sách tất cả các thuốc duy nhất
all_medicines = sorted(set(med["name"] for treatments_list in treatment_medicine_map.values() for med in treatments_list))
all_symptoms = sorted(symptoms)
all_risk_factors = sorted(risk_factors)

# Tạo dữ liệu giả lập
np.random.seed(42)
num_records = 50000
data = []
genders = ["Nam", "Nữ"]

for i in range(num_records):
    ma_ho_so_y_te = i + 1
    
    # Chọn giới tính ngẫu nhiên
    gender = np.random.choice(genders)

    # Chọn bệnh phù hợp với giới tính và tuổi
    eligible_diseases_for_gender = []
    for d_info in diseases_info:
        if d_info["gender_pref"] == "any" or d_info["gender_pref"] == gender.lower():
            eligible_diseases_for_gender.append(d_info)
    
    if not eligible_diseases_for_gender: # Trường hợp không tìm thấy bệnh phù hợp (rất hiếm)
        chuan_doan_info = np.random.choice(diseases_info)
    else:
        chuan_doan_info = np.random.choice(eligible_diseases_for_gender)
    
    chuan_doan = chuan_doan_info["name"]

    # Tạo tuổi trong khoảng phù hợp
    min_age, max_age = chuan_doan_info["age_range"]
    age = np.random.randint(min_age, max_age + 1)

    # Lấy phương pháp điều trị từ disease_data_map
    possible_treatments = disease_data_map[chuan_doan]["treatments"]
    phuong_phap_dieu_tri = np.random.choice(possible_treatments) # Chọn ngẫu nhiên 1 trong các pp điều trị

    # Lấy triệu chứng liên quan từ disease_data_map
    related_symptoms = disease_data_map[chuan_doan]["symptoms"]
    num_symptoms = np.random.randint(1, min(4, len(related_symptoms) + 1))  # Chọn ngẫu nhiên 1-3 triệu chứng
    selected_symptoms = np.random.choice(related_symptoms, num_symptoms, replace=False).tolist()

    # Thêm triệu chứng không liên quan (ít hơn, và không trùng)
    if np.random.random() < 0.15: # 15% khả năng có 1 triệu chứng không liên quan
        unrelated_symptoms_pool = [s for s in all_symptoms if s not in selected_symptoms and s not in related_symptoms]
        if unrelated_symptoms_pool:
            selected_symptoms.append(np.random.choice(unrelated_symptoms_pool))
    
    # Lấy yếu tố nguy cơ
    related_risk_factors = disease_data_map[chuan_doan].get("risk_factors", [])
    selected_risk_factors = []
    for rf in all_risk_factors:
        if rf in related_risk_factors and np.random.random() < 0.4: # 40% khả năng có yếu tố nguy cơ liên quan
            selected_risk_factors.append(rf)
        elif rf not in related_risk_factors and np.random.random() < 0.05: # 5% khả năng có yếu tố nguy cơ không liên quan
            selected_risk_factors.append(rf)


    # Tạo bản ghi
    record = {
        "Mã hồ sơ y tế": ma_ho_so_y_te,
        "Giới tính": gender,
        "Tuổi": age,
        "Chẩn đoán": chuan_doan,
        "Phương pháp điều trị": phuong_phap_dieu_tri,
    }

    # Thêm cột triệu chứng với mức độ (0: không, 1: nhẹ, 2: vừa, 3: nặng)
    for symptom in all_symptoms:
        if symptom in selected_symptoms:
            # Random mức độ nếu triệu chứng được chọn
            record[f"Triệu chứng_{symptom}"] = np.random.randint(1, 4) # Mức độ 1, 2, 3
        else:
            record[f"Triệu chứng_{symptom}"] = 0
    
    # Thêm cột yếu tố nguy cơ (0: không, 1: có)
    for rf in all_risk_factors:
        record[f"Yếu tố nguy cơ_{rf}"] = 1 if rf in selected_risk_factors else 0

    # Thêm cột thuốc
    for medicine in all_medicines:
        record[f"Thuốc_{medicine}"] = 1 if medicine in [m["name"] for m in treatment_medicine_map.get(phuong_phap_dieu_tri, [])] else 0
    
    data.append(record)

# Tạo DataFrame
df = pd.DataFrame(data)

# Mã hóa các cột Chẩn đoán và Phương pháp điều trị
encoded_cols = pd.DataFrame({
    "Mã chẩn đoán": df["Chẩn đoán"].astype("category").cat.codes,
    "Mã phương pháp điều trị": df["Phương pháp điều trị"].astype("category").cat.codes,
    "Mã giới tính": df["Giới tính"].astype("category").cat.codes
})
df = pd.concat([df, encoded_cols], axis=1)

# Tối ưu bộ nhớ
df["Tuổi"] = df["Tuổi"].astype("int16")
for symptom in all_symptoms:
    df[f"Triệu chứng_{symptom}"] = df[f"Triệu chứng_{symptom}"].astype("int8")
for medicine in all_medicines:
    df[f"Thuốc_{medicine}"] = df[f"Thuốc_{medicine}"].astype("int8")
for rf in all_risk_factors:
    df[f"Yếu tố nguy cơ_{rf}"] = df[f"Yếu tố nguy cơ_{rf}"].astype("int8")

# Lưu ánh xạ
diagnosis_map = dict(enumerate(df["Chẩn đoán"].astype("category").cat.categories))
treatment_map = dict(enumerate(df["Phương pháp điều trị"].astype("category").cat.categories))
gender_map = dict(enumerate(df["Giới tính"].astype("category").cat.categories))

# Tạo thư mục nếu chưa có
import os
os.makedirs("../models", exist_ok=True)
os.makedirs("../data", exist_ok=True)


with open("../models/diagnosis_map_vn.pkl", "wb") as f:
    pickle.dump(diagnosis_map, f)
with open("../models/treatment_map_vn.pkl", "wb") as f:
    pickle.dump(treatment_map, f)
with open("../models/medicine_details_map.pkl", "wb") as f:
    pickle.dump(treatment_medicine_map, f)  # Lưu ánh xạ thuốc chi tiết
with open("../models/gender_map_vn.pkl", "wb") as f:
    pickle.dump(gender_map, f)
with open("../models/symptoms_list_vn.pkl", "wb") as f:
    pickle.dump(all_symptoms, f)
with open("../models/risk_factors_list_vn.pkl", "wb") as f:
    pickle.dump(all_risk_factors, f)


# Lưu dataset
df.to_csv("../data/medical_data_from_sql_v2.csv", index=False, encoding="utf-8-sig")
print("Đã tạo dataset đa dạng hơn thành công và lưu tại ../data/medical_data_from_sql_v2.csv")