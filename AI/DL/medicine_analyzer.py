from google import genai
from google.genai import types
import json, os

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ LỖI: Không tìm thấy biến môi trường 'GEMINI_API_KEY'. Chatbot sẽ không hoạt động.")


def analyze_medicine_image(image_bytes: bytes, user_prompt: str):
    """
    Phân tích hình ảnh thuốc và trả về kết quả dạng JSON.
    """
    client = genai.Client(api_key=API_KEY)

    try:
        prompt = f"""
            You are a **licensed pharmacist and AI visual analyst** specializing in **pharmaceutical image recognition**.

            Your only responsibility is to **analyze images of medicine, pills, capsules, blister packs, or drug packaging**.

            STRICT RULES:
            - If the user's request is **not related to pharmaceuticals** (e.g., politics, personal questions, news, religion, programming, or anything unrelated to medicine),
            you **must politely refuse** and respond exactly as follows:
            {{
                "thuoc": [],
                "ket_luan": "Yêu cầu của bạn không thuộc lĩnh vực dược phẩm, tôi chỉ có thể hỗ trợ phân tích thuốc hoặc dược chất. Vui lòng sửa lại gợi ý."
            }}
            - If the image does not contain any medicine, respond in the same format as above.

            When the image and request are valid:
            1. List all visible pills, capsules, or drug forms in the image.
            - If multiple types appear, list each one separately in the "thuoc" array.
            2. If the image is unclear or identification is uncertain:
            - Make an informed guess about the medicine name based on shape, color, imprints, markings, or resemblance to common drugs.
            - Clearly state that it is a guess, e.g. "Có thể là Paracetamol" or "Có thể thuộc nhóm kháng sinh Amoxicillin".
            3. Specify the main active ingredient if known; otherwise write "không xác định".
            4. Describe the main use or pharmacological group of each medicine.
            5. Conclude with a short summary describing what kind of illness or condition these drugs likely treat.

            User hint: "{user_prompt}"

            Output requirements:
            - Response must be written in **Vietnamese**.
            - Return **ONLY** the JSON object below — no extra text, no markdown, no explanations.

            JSON format:
            {{
                "thuoc": [
                    {{
                        "ten": "tên thuốc (hoặc suy đoán)",
                        "hoat_chat": "thành phần chính (nếu có)",
                        "cong_dung": "mô tả công dụng của thuốc"
                    }}
                ],
                "ket_luan": "tóm tắt chung các loại thuốc này dùng để điều trị bệnh gì"
            }}
            """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
        )

        # Cắt phần JSON trả về
        text = response.text.strip()
        json_start = text.find("{")
        json_end = text.rfind("}") + 1
        json_str = text[json_start:json_end]
        return json.loads(json_str)

    except Exception as e:
        return {"error": str(e)}

    finally:
        client.close()
