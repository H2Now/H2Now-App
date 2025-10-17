from flask import Flask, jsonify, request, session
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
import os
import bcrypt
import re
from flask_session import Session

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

app.secret_key = os.getenv("SECRET_KEY")

# stores the session id in a file system (folder called flask_session)
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "./flask_session"
# uses secret key to sign the cookies
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_PERMANENT"] = False

Session(app)

# Get DB credentials from .env and connect
def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )


# Register endpoint. Creates user and hashes password
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # check for empty fields
    if not name or not email or not password:
        return jsonify({"success": False, "message": "Something went wrong.. Please try again!"}), 400
    
    # Email validation
    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.match(email_regex, email):
        return jsonify({"success": False, "message": "Something went wrong.. Please try again!"}), 400

    # Password validation (8–32 chars, one uppercase, one lowercase, one special character)
    password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$"
    if not re.match(password_regex, password):
        return jsonify({"success": False, "message": "Something went wrong.. Please try again!"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # check if username or email already exists
        cursor.execute(
            "SELECT userID from User WHERE email=%s OR name=%s", 
            (email, name))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({"success": False, "message": "Something went wrong.. Please try again!"}), 400
        
        # insert new user
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
        return jsonify({"success": False, "message": "Invalid login details"}), 400

    hashed_password = user["password"].encode('utf-8')

    # Compare hashes and continue if valid
    if user and bcrypt.checkpw(password, hashed_password):
        session["user_id"] = user["userID"]
        session["email"] = user["email"]
        return jsonify({"success": True, "message": "Login successfully"}), 201

    return jsonify({"success": False, "message": "Invalid login details"}), 400

# Logout endpoint
@app.route("/api/auth/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"}), 200


# Check if session cookie exists
@app.route("/api/auth/check_session", methods=["GET"])
def check_session():
    if "user_id" in session:
        return jsonify({"logged_in": True, "user_id": session["user_id"]}), 200
    return jsonify({"logged_in": False}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
