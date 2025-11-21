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
    app.config["SECRET_KEY"] = "test_secret"
    with app.test_client() as client:
        yield client


# Test to see if new user can REGISTER SUCCESSFULLY
def test_register_valid_credentials(client, monkeypatch):
    def mock_get_db_connection():
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self):return None
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def commit(self): pass
            def close(self): pass

        return MockConn()

    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/register", json={
        "name": "Theo Picar",
        "email": "nonexistant@email.com",
        "password": "Password123!"
    })

    # Pass test if following are matched
    assert response.status_code == 201
    assert response.json["success"] == True
    assert response.json["message"] == "Registration successful! Please login.."


# Test to see if register blocks users who ALREADY HAVE AN ACCOUNT set up
def test_register_existing_user(client, monkeypatch):
    def mock_get_db_connection():
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            # Return a user, simulating already existing user
            def fetchone(self): return {
                "userID": 1,
                "name": "Existing User",
                "email": "thisuseralreadyexists@email.com"
            }
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def commit(self): pass
            def close(self): pass

        return MockConn()

    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/register", json={
        "name": "Existing User",
        "email": "thisuseralreadyexists@email.com",
        "password": "Password123!"
    })

    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Something went wrong.. Please try again!"


# Test to see if register blocks user if NO CREDENTIALS are filled
def test_register_no_credentials(client, monkeypatch):
    def mock_get_db_connection():
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return None
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def commit(self): pass
            def close(self): pass

        return MockConn()
    
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/register", json={
        "name": "",
        "email": "",
        "password": ""
    })

    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"


# Test to see if register blocks user if NO NAME is provided
def test_register_no_name(client, monkeypatch):
    def mock_get_db_connection():
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return None
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def commit(self): pass
            def close(self): pass

        return MockConn()
    
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/register", json={
        "name": "",
        "email": "validatedEmail@email.com",
        "password": "Password123!"
    })

    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"


# Test to see if register blocks user if NO EMAIL is provided
def test_register_no_email(client, monkeypatch):
    def mock_get_db_connection():
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return None
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def commit(self): pass
            def close(self): pass

        return MockConn()
    
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/register", json={
        "name": "New User",
        "email": "",
        "password": "Password123!"
    })

    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"


# Test to see if register blocks user if NO PASSWORD is provided
def test_register_no_password(client, monkeypatch):
    def mock_get_db_connection():
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return None
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def commit(self): pass
            def close(self): pass

        return MockConn()
    
    import app
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/register", json={
        "name": "VALID USER",
        "email": "validatedEmail@email.com",
        "password": ""
    })

    assert response.status_code == 400
    assert response.json["success"] == False
    assert response.json["message"] == "Please fill out all fields!"