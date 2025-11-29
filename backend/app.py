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
CORS(app, origins=[
    "http://localhost:5173", 
    "http://www.h2now.online", 
    "https://www.h2now.online",
    "https://h2now.online",
    "www.h2now.online",
    "h2now.online"
], supports_credentials=True)

app.secret_key = os.getenv("SECRET_KEY")

# stores the session id in a file system (folder called flask_session)
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = os.getenv("SESSION_FILE_DIR")
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
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Please fill out all fields!"}), 400

    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.match(email_regex, email):
        return jsonify({"success": False, "message": "Invalid email"}), 400

    password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$"
    if not re.match(password_regex, password):
        return jsonify({"success": False, "message": "Password does not meet requirements"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Check if user exists
    existing_user = None
    with get_db_connection() as conn:
        with conn.cursor(buffered=True) as cursor:
            cursor.execute(
                "SELECT userID FROM User WHERE email=%s OR name=%s",
                (email, name)
            )
            existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"success": False, "message": "User already exists"}), 400

    # Insert new user
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO User (name, email, password) VALUES(%s, %s, %s)",
                (name, email, hashed_password)
            )
            conn.commit()

    return jsonify({"success": True, "message": "Registration successful! Please login."}), 201


# Login endpoint. Verifies email and password hash
@app.route("/auth/login", methods=["POST"])
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
@app.route("/auth/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"}), 200


# Check if session cookie exists
@app.route("/auth/check_session", methods=["GET"])
def check_session():
    if "user_id" in session:
        return jsonify({"logged_in": True, "user_id": session["user_id"]}), 200
    print("invalid")
    return jsonify({"logged_in": False}), 200


# Get current user profile
@app.route("/user", methods=["GET"])
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
@app.route("/user", methods=["PUT"])
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
@app.route("/user/water_bottle", methods=["GET"])
def get_water_bottle():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    user_id = session["user_id"]
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT bottleName, goal, connected FROM Bottle WHERE userID=%s", (user_id,))
        bottle = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
    
    if not bottle:
        return jsonify({"success" : False, "message": "Bottle not found"}), 404

    return jsonify({"success" : True, "bottleName": bottle["bottleName"], "goal": bottle["goal"], "connected": bottle["connected"]}), 200


# Get user's intake for today 
@app.route("/user/water_bottle/intake/today", methods=["GET"])
def get_today_intake():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    user_id = session["user_id"]
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT totalIntake FROM Intake
            WHERE userID = %s AND intakeDate = CURDATE()
        """, (user_id,))
        result = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    # If no row or null value, treat as 0.0
    if not result or result.get("totalIntake") is None:
        return jsonify({"success": True, "totalIntake": 0.0}), 200

    return jsonify({"success": True, "totalIntake": float(result["totalIntake"])}), 200


# Reset user's intake for today
@app.route("/user/water_bottle/intake/reset", methods=["POST"])
def reset_water_intake():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
        
    user_id = session["user_id"]
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            UPDATE Intake
            SET totalIntake = 0, goalReached = FALSE
            WHERE userID = %s
                AND intakeDate = CURDATE();
            """,
            (user_id,)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Today's water intake has been reset."}), 200


# Make edits to bottle name, bottle capacity, and daily goal
@app.route("/user/water_bottle/settings", methods=["PATCH"])
def update_user_settings():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
        
    user_id = session["user_id"]
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400
    
    bottle_name = data.get("bottleName")
    capacity = data.get("capacity")
    goal = data.get("goal")

    updates = []
    params = []

    if bottle_name is not None:
        bottle_name = bottle_name.strip()
        if bottle_name == "":
            return jsonify({"success": False, "message": "Bottle name cannot be empty."}), 400
        
        params.append(bottle_name)
        updates.append("bottleName = %s")

    if capacity is not None:
        try:
            capacity = float(capacity)
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "Capacity must be a number."}), 400
        
        if capacity <= 0:
            return jsonify({"success": False, "message": "Capacity must be greater than 0."}), 400
    
        updates.append("capacity = %s")
        params.append(capacity)

    if goal is not None:
        try:
            goal = float(goal)
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "Goal must be a number."}), 400
        
        if goal <= 0:
            return jsonify({"success": False, "message": "Goal must be greater than 0."}), 400
        
        updates.append("goal = %s")
        params.append(goal)
    
    if not updates:
        return jsonify({"success": False, "message": "No fields to update."}), 400
    
    params.append(user_id)

    # f-string allows .join to be executed first before being part of the string
    query = f"UPDATE Bottle SET {', '.join(updates)} WHERE userID = %s"

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Bottle settings have been updated successfully."}), 200


# Get user's drinking session activity for a selected date
@app.route("/user/water_bottle/activity", methods=["GET"])
def get_activity():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    user_id = session["user_id"]
    
    # Get the date from query parameters (format: YYYY-MM-DD)
    date = request.args.get("date")
    
    if not date:
        return jsonify({"success": False, "message": "Date parameter is required"}), 400
    
    # Validate date format
    try:
        from datetime import datetime
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"success": False, "message": "Invalid date format. Use YYYY-MM-DD"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get the user's bottle ID
        cursor.execute("SELECT bottleID FROM Bottle WHERE userID = %s", (user_id,))
        bottle = cursor.fetchone()
        
        if not bottle:
            return jsonify({"success": False, "message": "Bottle not found"}), 404
        
        bottle_id = bottle["bottleID"]
        
        # Get all drinking sessions for the selected date
        cursor.execute("""
            SELECT 
                startTime,
                estimatedIntake
            FROM DrinkingSession
            WHERE bottleID = %s 
                AND DATE(startTime) = %s
            ORDER BY startTime DESC
        """, (bottle_id, date))
        
        sessions = cursor.fetchall()
        
        # Get the daily goal and total intake 
        cursor.execute("""
            SELECT goal FROM Bottle WHERE bottleID = %s
        """, (bottle_id,))
        bottle_data = cursor.fetchone()
        
        cursor.execute("""
            SELECT totalIntake FROM Intake
            WHERE userID = %s AND intakeDate = %s
        """, (user_id, date))
        intake_data = cursor.fetchone()
        
    finally:
        cursor.close()
        conn.close()
    
    # Format the response
    activity_list = []
    total_intake = float(intake_data["totalIntake"]) if intake_data and intake_data["totalIntake"] else 0.0
    goal = float(bottle_data["goal"]) if bottle_data and bottle_data["goal"] else 0.0
    
    # Calculate cumulative progress for each session
    # Sessions are ordered DESC (newest first), so we need to calculate progress chronologically
    cumulative = 0.0
    
    # First, reverse the list to go chronologically (oldest first)
    sessions_reversed = list(reversed(sessions))
    
    for drinking_session in sessions_reversed:
        intake = float(drinking_session["estimatedIntake"]) if drinking_session["estimatedIntake"] else 0.0
        
        # Add this intake to get progress after this session
        cumulative += intake
        
        activity_list.append({
            "time": drinking_session["startTime"].strftime("%I:%M %p") if drinking_session["startTime"] else "N/A",
            "intake": intake,
            "progressAfter": cumulative,
            "goal": goal
        })
    
    # Reverse back to show newest first in the UI
    activity_list.reverse()
    
    return jsonify({
        "success": True,
        "date": date,
        "activities": activity_list,
    }), 200


if __name__ == "__main__":
    app.run()
