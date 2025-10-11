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


# For rendering index.html 
@app.route("/")
def index():
    return render_template("index.html")


# Create an initial test user 
def create_test_user():
    conn = get_db_connection()
    cursor = conn.cursor()

    name = "Test User"
    email = "test@example.com"
    password = TEST_PASSWORD.encode('utf-8') # Convert into bytes for hashing to work

    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    cursor.execute(
        "INSERT INTO User (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password.decode('utf-8'))  # Decode password beforehand
    )

    conn.commit()
    cursor.close()
    conn.close()


# create_test_user() # Comment if test user already created


# Login endpoint. Verifies email and password hash
@app.route("/api/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html") # Backend
    
    inputted_email = request.form.get("email")
    inputted_password = request.form.get("password").encode('utf-8') # Turn into bytes for comparing hash

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) # Return map/dictionary instead of tuple

    cursor.execute(
        "SELECT * FROM User WHERE email=%s", 
        [inputted_email]
    )

    user = cursor.fetchone()
    cursor.close()
    conn.close()

    hashed_password = user["password"].encode('utf-8')

    # Compare hashes and continue if valid
    if user and bcrypt.checkpw(inputted_password, hashed_password):
        print("Valid")
        return render_template("index.html", name=user["name"], email=user["email"], password=user["password"])
    
    print("Invalid")
    return redirect("/api/login")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
