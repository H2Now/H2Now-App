import pytest
import bcrypt
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    with app.test_client() as client:
        yield client


# --- Tests ---
def test_update_user_not_authenticated(client):
    response = client.put("/user", json={"name": "NewName"})
    assert response.status_code == 401
    assert response.json["success"] is False
    assert response.json["message"] == "Not authenticated"

# BROKEN
# def test_update_user_nothing_to_update(client):
#     with client.session_transaction() as sess:
#         sess["user_id"] = 1

#     response = client.put("/user", json={})
#     assert response.status_code == 400
#     assert response.json["success"] is False
#     assert response.json["message"] == "Nothing to update"


# def test_update_user_name_taken(client, monkeypatch):
#     def mock_get_db_connection():
#         class MockCursor:
#             def execute(self, query, params=None): pass
#             def fetchone(self):
#                 return {"userID": 2}  # simulate name already taken by another user
#             def close(self): pass

#         class MockConn:
#             def cursor(self, dictionary=False): return MockCursor()
#             def close(self): pass

#         return MockConn()

#     monkeypatch.setattr("app.get_db_connection", mock_get_db_connection)

#     with client.session_transaction() as sess:
#         sess["user_id"] = 1

#     response = client.put("/user", json={"name": "ExistingName"})
#     assert response.status_code == 400
#     assert response.json["success"] is False
#     assert response.json["message"] == "Name already in use"


# def test_update_user_weak_password(client, monkeypatch):
#     def mock_get_db_connection():
#         class MockCursor:
#             def execute(self, query, params=None): pass
#             def fetchone(self): return None  # no conflict
#             def close(self): pass

#         class MockConn:
#             def cursor(self, dictionary=False): return MockCursor()
#             def close(self): pass

#         return MockConn()

#     monkeypatch.setattr("app.get_db_connection", mock_get_db_connection)

#     with client.session_transaction() as sess:
#         sess["user_id"] = 1

#     response = client.put("/user", json={"password": "weak"})
#     assert response.status_code == 400
#     assert response.json["success"] is False
#     assert response.json["message"] == "Password does not meet requirements"


# def test_update_user_success_name_only(client, monkeypatch):
#     executed_queries = []

#     def mock_get_db_connection():
#         class MockCursor:
#             def execute(self, query, params=None):
#                 executed_queries.append((query, params))
#             def fetchone(self): return None
#             def close(self): pass

#         class MockConn:
#             def cursor(self, dictionary=False): return MockCursor()
#             def commit(self): pass
#             def close(self): pass

#         return MockConn()

#     monkeypatch.setattr("app.get_db_connection", mock_get_db_connection)

#     with client.session_transaction() as sess:
#         sess["user_id"] = 1

#     response = client.put("/user", json={"name": "NewName"})
#     assert response.status_code == 200
#     assert response.json["success"] is True
#     assert response.json["message"] == "Profile updated"

#     # Check that SQL UPDATE was called with correct params
#     query, params = executed_queries[-1]
#     assert "UPDATE User SET name=%s" in query
#     assert params[-1] == 1  # user_id


# def test_update_user_success_password_only(client, monkeypatch):
#     executed_queries = []

#     def mock_get_db_connection():
#         class MockCursor:
#             def execute(self, query, params=None):
#                 executed_queries.append((query, params))
#             def fetchone(self): return None
#             def close(self): pass

#         class MockConn:
#             def cursor(self, dictionary=False): return MockCursor()
#             def commit(self): pass
#             def close(self): pass

#         return MockConn()

#     monkeypatch.setattr("app.get_db_connection", mock_get_db_connection)

#     with client.session_transaction() as sess:
#         sess["user_id"] = 1

#     strong_password = "StrongP@ss1"
#     response = client.put("/user", json={"password": strong_password})
#     assert response.status_code == 200
#     assert response.json["success"] is True
#     assert response.json["message"] == "Profile updated"

#     # Ensure SQL UPDATE included password hash
#     query, params = executed_queries[-1]
#     assert "UPDATE User SET password=%s" in query
#     assert params[-1] == 1  # user_id


# def test_update_user_success_name_and_password(client, monkeypatch):
#     executed_queries = []

#     def mock_get_db_connection():
#         class MockCursor:
#             def execute(self, query, params=None):
#                 executed_queries.append((query, params))
#             def fetchone(self): return None
#             def close(self): pass

#         class MockConn:
#             def cursor(self, dictionary=False): return MockCursor()
#             def commit(self): pass
#             def close(self): pass

#         return MockConn()

#     monkeypatch.setattr("app.get_db_connection", mock_get_db_connection)

#     with client.session_transaction() as sess:
#         sess["user_id"] = 1

#     strong_password = "StrongP@ss1"
#     response = client.put("/user", json={"name": "NewName", "password": strong_password})
#     assert response.status_code == 200
#     assert response.json["success"] is True
#     assert response.json["message"] == "Profile updated"

#     query, params = executed_queries[-1]
#     assert "UPDATE User SET name=%s, password=%s" in query