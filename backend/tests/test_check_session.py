import pytest
import sys
import os

# Path for app.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# Test to see if the user is NOT logged in (no session)
def test_check_session_not_logged_in(client):
    res = client.get("/auth/check_session")
    data = res.get_json()

    assert res.status_code == 200
    assert data["logged_in"] is False
    assert "user_id" not in data


# Test to see if user IS logged in (session has their user_id)
def test_check_session_logged_in(client):
    with client.session_transaction() as sess:
        sess["user_id"] = 123

    res = client.get("/auth/check_session")
    data = res.get_json()

    assert res.status_code == 200
    assert data["logged_in"] is True
    assert data["user_id"] == 123