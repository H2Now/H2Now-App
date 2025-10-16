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


# Test that checks to see if logic functionality is correct
def test_login_valid_user(client, monkeypatch):
    def mock_get_db_connection():
        # Simulate and match procedure of db_connection in app.py
        class MockCursor:
            def cursor(self, dictionary=True): return self
            def execute(self, query, params): pass
            def fetchone(self): return {"email": "user@test.com", "password": bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode("utf-8")}
            def close(self): pass

        class MockConn:
            def cursor(self, dictionary=True): return MockCursor()
            def close(self): pass

        return MockConn()

    import app
    # Replace original db_connection temporarily with mock_db_connection when called
    monkeypatch.setattr(app, "get_db_connection", mock_get_db_connection)

    response = client.post("/api/auth/login", json={
        "email": "user@test.com",
        "password": "password123"
    })

    # Must return 201 and a JSON with "success" == true
    assert response.status_code == 201
    assert response.json["success"] == True