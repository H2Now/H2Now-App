from flask import Flask, jsonify, request, session, redirect
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
import os
import bcrypt
import re
from flask_session import Session
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from google.auth.transport import requests as google_requests

# ONLY FOR DEV - comment this line if app is in PROD
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

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
# for prod
# app.config["SESSION_COOKIE_DOMAIN"] = "h2now.online"

Session(app)

# Dev mode: use BACKEND_URL and FRONTEND_URL
# Prod mode: use PROD URL to replace BACKEND_URL and FRONTEND_URL
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:5173"
PROD_URL="https://h2now.online"

# Get Google's credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

client_config = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [
            "http://localhost:5000/auth/login/google/callback",
            "https://h2now.online/auth/login/google/callback"
        ]
    }
}

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


# Google Login endpoint
@app.route("/auth/login/google", methods=["GET"])
def google_login():
    flow = Flow.from_client_config(
        client_config,
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", 
            "https://www.googleapis.com/auth/userinfo.profile"],
        redirect_uri=f"{BACKEND_URL}/auth/login/google/callback"
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session["oauth_state"] = state

    print(authorization_url)
    return jsonify({"url": authorization_url}), 200


# Google Login callback endpoint
@app.route("/auth/login/google/callback", methods=["GET"])
def google_callback():
    state = session.get("oauth_state")

    if not state:
        print("error here")
        return redirect(f"{FRONTEND_URL}/login?error=invalid_state")
    
    flow = Flow.from_client_config(
        client_config,
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"],
        state=state,
        redirect_uri=f"{BACKEND_URL}/auth/login/google/callback"
    )

    try:
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        google_id = id_info["sub"]
        email = id_info["email"]
        name = id_info.get("name", "User")
        profile_pic = id_info.get("picture")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Check if user exists by google_id
            cursor.execute("SELECT * FROM User WHERE google_id=%s", [google_id])
            user = cursor.fetchone()
            
            if not user:
                # Check by email
                cursor.execute("SELECT * FROM User WHERE email=%s", [email])
                user = cursor.fetchone()
                
                if user:
                    # Link existing account to Google
                    cursor.execute(
                        "UPDATE User SET google_id=%s, auth_provider='google', profilePic=%s WHERE userID=%s",
                        [google_id, profile_pic, user["userID"]]
                    )
                    conn.commit()
                else:
                    # Create new user
                    cursor.execute(
                        """INSERT INTO User (email, google_id, auth_provider, name, profilePic) 
                           VALUES (%s, %s, 'google', %s, %s)""",
                        [email, google_id, name, profile_pic]
                    )
                    conn.commit()
                    user_id = cursor.lastrowid
                    user = {"userID": user_id, "email": email}
            
            # Set session
            session["user_id"] = user["userID"]
            session["email"] = user["email"]
            print(f"Session set: user_id={session.get('user_id')}, email={session.get('email')}")  # DEBUG
            
            return redirect(f"{FRONTEND_URL}/hub")
        finally:
            cursor.close()
            conn.close()
    except Exception as e:
        print(f"OAuth error: {e}")
        return redirect(f"{FRONTEND_URL}/login?error=auth_failed")

# Logout endpoint
@app.route("/auth/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"}), 200


# Check if session cookie exists
@app.route("/auth/check_session", methods=["GET"])
def check_session():
    if "user_id" in session:
        print("User is already logged in")
        return jsonify({"logged_in": True, "user_id": session["user_id"]}), 200
    print("User is not logged in")
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
        cursor.execute("SELECT userID, name, email, profilePic FROM User WHERE userID=%s", (user_id,))
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({"success": True, "user": {"id": user["userID"], "name": user["name"], "email": user["email"], "profilePic": user["profilePic"]}}), 200


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

  
# Make edits to user's intake
@app.route("/user/water_bottle/intake/activity/<int:session_id>", methods=["PATCH"])
def update_drinking_session(session_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    user_id = session["user_id"]
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400
    
    estimated_intake = data.get("estimatedIntake")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT ds.estimatedIntake
            FROM DrinkingSession ds
            JOIN Bottle b ON ds.bottleID = b.bottleID
            WHERE ds.sessionID = %s AND b.userID = %s
            """, (session_id, user_id))
        
        session_record = cursor.fetchone()

        if not session_record:
            return jsonify({"success": False, "message": "Session not found."}), 404
        
        old_intake = float(session_record["estimatedIntake"]) if session_record["estimatedIntake"] else 0
        
        if estimated_intake is not None:
            try:
                estimated_intake = float(estimated_intake)
            except (TypeError, ValueError):
                return jsonify({"success": False, "message": "estimatedIntake must be a number"}), 400
            
            if estimated_intake < 0:
                return jsonify({"success": False, "message": "estimatedIntake cannot be negative"}), 400

        # Update drinking session's estimateIntake
        cursor.execute(
            """
            UPDATE DrinkingSession
            SET estimatedIntake = %s
            WHERE sessionID = %s
            """, (estimated_intake, session_id)
        )

        # Check if there's a difference between updated and old intake
        difference = estimated_intake - old_intake
        if difference != 0:
            # Update daily intake total
            cursor.execute(
                """
                UPDATE Intake i
                JOIN DrinkingSession ds ON i.bottleID = ds.bottleID
                SET i.totalIntake = i.totalIntake + %s
                WHERE ds.sessionID = %s
                AND i.intakeDate = DATE(ds.startTime)
                """, (difference, session_id)
            )

            # Update goalReached status
            cursor.execute(
                """
                UPDATE Intake i
                JOIN Bottle b ON i.bottleID = b.bottleID
                JOIN DrinkingSession ds ON i.bottleID = ds.bottleID
                SET i.goalReached = (i.totalIntake >= b.goal)
                WHERE ds.sessionID = %s
                AND i.intakeDate = DATE(ds.startTime)
                """, (session_id,)
            )

            conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Drinking session was updated successfully"}), 200
  

@app.route("/user/water_bottle/intake/activity/<int:session_id>", methods=["DELETE"])  
def delete_drinking_session(session_id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    user_id = session["user_id"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Verify session belongs to user and get estimatedIntake value
        cursor.execute(
            """
            SELECT ds.estimatedIntake
            FROM DrinkingSession ds
            JOIN Bottle b ON ds.bottleID = b.bottleID
            WHERE ds.sessionID = %s AND b.userID = %s
            """, (session_id, user_id)
        )

        session_record = cursor.fetchone()

        if not session_record:
            return jsonify({"success": False, "message": "Session not found."}), 404
        
        intake_to_remove = float(session_record["estimatedIntake"]) if session_record else 0
        
        # Update the daily intake
        if intake_to_remove > 0:
            cursor.execute(
                """
                UPDATE Intake i 
                JOIN Bottle b ON i.bottleID = b.bottleID
                JOIN DrinkingSession ds ON i.bottleID = ds.bottleID
                SET totalIntake = totalIntake - %s
                WHERE ds.sessionID = %s
                """, (intake_to_remove, session_id)
            )

            # Update goalReached status
            cursor.execute(
                """
                UPDATE Intake i
                JOIN Bottle b ON i.bottleID = b.bottleID
                JOIN DrinkingSession ds ON i.bottleID = ds.bottleID
                SET i.goalReached = (i.totalIntake >= b.goal)
                WHERE ds.sessionID = %s
                AND i.intakeDate = DATE(ds.startTime)
                """, (session_id,)
            )
        
        # Delete drinking session
        cursor.execute("DELETE FROM DrinkingSession WHERE sessionID = %s", (session_id,))

        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Drinking session has been deleted successfully."}), 200


@app.route("/user/preferences", methods=["GET"])
def get_preferences():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    user_id = session["user_id"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT reminderFreq, bottleAlertEnabled
            FROM UserPreferences
            WHERE userID = %s
            """,(user_id,)
        )

        preferences = cursor.fetchone()

        if not preferences:
            cursor.execute(
                """
                INSERT INTO UserPreferences (userID, reminderFreq, bottleAlertEnabled)
                VALUES (%s, 1, FALSE)
                """, (user_id,)
            )
            conn.commit()
            preferences = {"reminderFreq": 1, "bottleAlertEnabled": False}

    finally:
        cursor.close()
        conn.close()

    return jsonify({
        "success": True,
        "preferences": {
            "reminderFreq": preferences["reminderFreq"],
            "bottleAlertEnabled": bool(preferences["bottleAlertEnabled"])
        }
    }), 200


@app.route("/user/preferences", methods=["PATCH"])
def update_preferences():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    user_id = session["user_id"]
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400
    
    reminder_freq = data.get("reminderFreq")
    bottle_alert_enabled = data.get("bottleAlertEnabled")

    updates = []
    params = []

    if reminder_freq is not None:
        try:
            reminder_freq = int(reminder_freq)
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "reminderFreq must be a number"}), 400

        if reminder_freq < 1 or reminder_freq > 24:
            return jsonify({"success": False, "message": "reminderFreq must be between 1 and 24"}), 400
        
        updates.append("reminderFreq = %s")
        params.append(reminder_freq)

    if bottle_alert_enabled is not None:
        updates.append("bottleAlertEnabled = %s")
        params.append(bool(bottle_alert_enabled))

    if not updates:
        return jsonify({"success": False, "message": "No fields to update"}), 400
        
    params.append(user_id)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT userID FROM UserPreferences WHERE userID = %s", (user_id,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO UserPreferences (userID, reminderFreq, bottleAlertEnabled)
                VALUES (%s, 1, FALSE)
            """, (user_id,))

        query = f"UPDATE UserPreferences SET {','.join(updates)} WHERE userID = %s"
        cursor.execute(query, params)
        conn.commit()

    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "User Preferences updated"}), 200
if __name__ == "__main__":
    app.run()
