from flask import Flask, request, jsonify
from medicine_analyzer import analyze_medicine_image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Endpoint nhận ảnh thuốc và prompt từ client React.
    """
    try:
        if "image" not in request.files:
            return jsonify({"error": "Thiếu file ảnh 'image'"}), 400

        image_file = request.files["image"]
        user_prompt = request.form.get("prompt", "")

        image_bytes = image_file.read()

        result = analyze_medicine_image(image_bytes, user_prompt)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)