import sys
import os

# Path for app.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest, bcrypt
from app import app

# Be able to send HTTP request to Flask without running server
@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# Test that checks to see if valid user can login correctly 
def test_login_valid_user(client, monkeypatch):
    def mock_get_db_connection():
        # Simulate and match procedure of db_connection in app.py
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return {"email": "user@test.com", "password": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode("utf-8")}
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def close(self): pass

        return MockConn()

    # Replace original db_connection temporarily with mock_db_connection when called
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": "password123"
    })

    # Pass test if following are matched
    assert response.status_code == 201
    assert response.json["success"] == True
    assert response.json["message"] == "Login successfully"


# Test to make sure invalid user cannot login
def test_login_invalid_user(client, monkeypatch):
    def mock_get_db_connection():
        # Simulate and match procedure of db_connection in app.py
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): None # Return nothing to simulate no user found
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def close(self): pass

        return MockConn()
    
    # Replace original db_connection temporarily with mock_db_connection when called
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": "password123"
    })

    # Pass test if following are matched
    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Invalid login details"


# Test to make sure forms with any unfilled credentials do not pass
def test_login_missing_credentials(client, monkeypatch):
    def mock_get_db_connection():
        # Simulate and match procedure of db_connection in app.py
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return {"email": "user@test.com", "password": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode("utf-8")}
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def close(self): pass

        return MockConn()
    
    # Replace original db_connection temporarily with mock_db_connection when called
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/login", json={
        "email": "",
        "password": ""
    })

    # Pass test if following are matched
    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"


# Test to make sure forms with no given email do not pass
def test_login_missing_email(client, monkeypatch):
    def mock_get_db_connection():
        # Simulate and match procedure of db_connection in app.py
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return {"email": "user@test.com", "password": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode("utf-8")}
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def close(self): pass

        return MockConn()
    
    # Replace original db_connection temporarily with mock_db_connection when called
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/login", json={
        "email": "",
        "password": "password123"
    })

    # Pass test if following are matched
    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"


# Test to make sure forms with no given password do not pass
def test_login_missing_password(client, monkeypatch):
    def mock_get_db_connection():
        # Simulate and match procedure of db_connection in app.py
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return {"email": "user@test.com", "password": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode("utf-8")}
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def close(self): pass

        return MockConn()
    
    # Replace original db_connection temporarily with mock_db_connection when called
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": ""
    })

    # Pass test if following are matched
    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"