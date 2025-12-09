import os
from google import genai
from google.genai import types

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ LỖI: Không tìm thấy biến môi trường 'GEMINI_API_KEY'. Chatbot sẽ không hoạt động.")

def chat_health_consultation(user_message: str):
    """
    Cung cấp tư vấn y tế chung dựa trên tin nhắn người dùng bằng mô hình Gemini.
    """
    if not API_KEY:
        return {
            "status": "error",
            "response": "Lỗi cấu hình: Thiếu GEMINI_API_KEY."
        }
        
    client = genai.Client(api_key=API_KEY)

    system_instruction = """
        Bạn là một **trợ lý AI chuyên môn y tế** được thiết kế để cung cấp thông tin chung về bệnh lý, triệu chứng, và thuốc men. **Mục tiêu của bạn là trả lời trọng tâm và trực tiếp vào câu hỏi của người dùng.**
        
        NGUYÊN TẮC BẮT BUỘC:
        1. **Phạm vi:** Chỉ trả lời các câu hỏi liên quan đến Y tế, Sức khỏe, Bệnh tật, Triệu chứng, Thuốc, hoặc Dược phẩm.
        2. **Từ chối ngoài phạm vi:** Nếu câu hỏi không liên quan đến y tế, bạn phải **từ chối lịch sự** bằng cách nói: "Xin lỗi, tôi chỉ hỗ trợ thông tin y tế. Vui lòng hỏi lại câu hỏi liên quan đến sức khỏe."
        3. **Ưu tiên Câu trả lời:** Bắt đầu câu trả lời bằng thông tin hữu ích nhất, **không cần** bắt đầu bằng cảnh báo dài dòng.

        Hãy trả lời bằng **Tiếng Việt** một cách rõ ràng, ngắn gọn, dễ hiểu và chuyên nghiệp.
    """
    
    full_prompt = f"{system_instruction}\n\nTin nhắn của người dùng: {user_message}"

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[full_prompt]
        )

        return {
            "status": "success",
            "response": response.text
        }
        
    except Exception as e:
        return {
            "status": "error",
            "response": f"Lỗi nội bộ khi gọi API Gemini: {str(e)}"
        }

    finally:
        client.close()