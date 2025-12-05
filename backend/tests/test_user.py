import sys
import os
from flask.sessions import SecureCookieSessionInterface

# Path for app.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "test_secret"
        
    with app.test_client() as client:
        yield client


# Test to see if user was authenticated
def test_get_user_not_authenticated(client):
    response = client.get("/user")

    assert response.status_code == 401
    assert response.json["success"] is False
    assert response.json["message"] == "Not authenticated"