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


# Test to see if new user can register successfully
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