from flask import Flask, jsonify, render_template, request, redirect
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
TEST_PASSWORD = os.getenv("TEST_PASSWORD")

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Get DB credentials from .env and connect
def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )


# Test API end-point
@app.route("/api/test", methods=["GET"])
def hello():
    return jsonify({"message": "Hello World"})


# Register endpoint. Creates user and hashes password
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    name = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # error handling
    errors = {}
    if not name:
        errors["username"] = "Username is required"
    if not email:
        errors["email"] = "Email is required"
    elif "@" not in email:
        errors["email"] = "Invalid email format"
    if not password or len(password) < 8 or len(password) > 32:
        errors["password"] = "Password must be 8-32 characters"
    if errors:
        print(errors)
        # returns an array of error/s
        return jsonify({"success": False, "errors": errors}), 400
    
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO User (name, email, password) VALUES(%s, %s, %s)",
            (name, email, hashed_password.decode('utf-8'))
        )

        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Registration successful! Please login.."}), 201

# Login endpoint. Verifies email and password hash
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    email = data.get("email")
    password = data.get("password").encode("utf-8")

    # error handling
    if not email or not password:
        return jsonify({"success": False, "message": "Invalid login details"})
    
    try: 
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) # Return map/dictionary instead of tuple

        cursor.execute(
            "SELECT * FROM User WHERE email=%s", 
            [email]
        )

        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    # if user is not found, return immediately
    if not user:
        return jsonify({"success": False, "message": "Invalid login details"})

    hashed_password = user["password"].encode('utf-8')

    # Compare hashes and continue if valid
    if user and bcrypt.checkpw(password, hashed_password):
        return jsonify({"success": True, "message": "Login successfully"}), 201

    return jsonify({"success": False, "message": "Invalid login details"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
