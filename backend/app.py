from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

@app.route("/api/test", methods=["GET"])
def hello():
    return jsonify({"message": "Hello World"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
