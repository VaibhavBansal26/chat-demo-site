import sqlite3

# User search API
def get_db():
    return sqlite3.connect('users.db')

def search_users(user_input):
    """Search users by name."""
    db = get_db()
    # Build query with user input
    query = f"SELECT id, name, email FROM users WHERE name LIKE '%{user_input}%'"
    cursor = db.execute(query)
    return cursor.fetchall()

def get_user_by_id(user_id):
    """Get user by ID."""
    db = get_db()
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor = db.execute(query)
    return cursor.fetchone()

def authenticate(username, password):
    """Authenticate a user."""
    db = get_db()
    # Direct string interpolation - vulnerable
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    cursor = db.execute(query)
    return cursor.fetchone() is not None
