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
        return jsonify({"success": False, "message": "Please fill out all fields!"}), 400
    
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
        return jsonify({"success": False, "message": "Please fill out all fields!"}), 400
    
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


# Get current user profile
@app.route("/api/user", methods=["GET"])
def get_user():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    user_id = session["user_id"]
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT userID, name, email FROM User WHERE userID=%s", (user_id,))
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({"success": True, "user": {"id": user["userID"], "name": user["name"], "email": user["email"]}}), 200


# Update current user (name and/or password)
@app.route("/api/user", methods=["PUT"])
def update_user():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json(silent=True) or {}
    new_name = data.get("name")
    new_password = data.get("password")

    user_id = session["user_id"]

    if not new_name and not new_password:
        return jsonify({"success": False, "message": "Nothing to update"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # If changing name, ensure not already taken by another user
        if new_name:
            cursor.execute("SELECT userID FROM User WHERE name=%s AND userID<>%s", (new_name, user_id))
            if cursor.fetchone():
                return jsonify({"success": False, "message": "Name already in use"}), 400

        # If changing password, validate strength
        if new_password:
            password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$"
            if not re.match(password_regex, new_password):
                return jsonify({"success": False, "message": "Password does not meet requirements"}), 400

        # Build update query
        updates = []
        params = []
        if new_name:
            updates.append("name=%s")
            params.append(new_name)
        if new_password:
            hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            updates.append("password=%s")
            params.append(hashed)

        params.append(user_id)
        query = f"UPDATE User SET {', '.join(updates)} WHERE userID=%s"
        cursor.execute(query, tuple(params))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Profile updated"}), 200


# Get user's water bottle
@app.route("/api/user/water_bottle", methods=["GET"])
def get_water_bottle():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    user_id = session["user_id"]
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT bottleName FROM Bottle WHERE userID=%s", (user_id,))
        bottle_name = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
    
    if not bottle_name:
        return jsonify({"success" : False, "message": "Bottle not found"}), 404
    
    return jsonify({"success" : True, "bottleName": bottle_name["bottleName"]}), 200


# Get user's goal and today's intake
@app.route("/api/user/water_bottle/intake/today", methods=["GET"])
def get_today_intake():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
        
    user_id = session["user_id"]
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # left join ensures if there is no intake today, goal value is still retrieved
        cursor.execute("""
            SELECT 
                COALESCE(i.totalIntake, 0) AS totalIntake,
                b.goal AS goal
            FROM Bottle b
            LEFT JOIN Intake i 
                ON b.bottleID = i.bottleID 
                AND i.intakeDate = CURDATE()
            WHERE b.userID = %s
        """, (user_id,))
        result = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not result:
        return jsonify({"success": False, "message": "Error getting intake and goal"}), 404
    
    return jsonify({"success": True, "totalIntake": float(result["totalIntake"]), "goal": float(result["goal"])}), 200






# Add water intake and update totalIntake to user's water bottle (waiting on working hardware)
# Disconnect water bottle (waiting on working hardware)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
