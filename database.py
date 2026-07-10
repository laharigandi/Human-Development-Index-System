"""
database.py - Database configuration and helper functions for HDI Prediction System
"""

import sqlite3
from datetime import datetime
from flask import g
from config import DATABASE


def get_db():
    """Get database connection for current request context."""
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    """Close database connection at end of request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    """Initialize database tables."""
    db = get_db()
    
    # Users table
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Predictions table
    db.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            country TEXT,
            life_expectancy REAL NOT NULL,
            mean_schooling REAL NOT NULL,
            expected_schooling REAL NOT NULL,
            gni REAL NOT NULL,
            prediction TEXT NOT NULL,
            score REAL,
            confidence TEXT,
            model_name TEXT DEFAULT 'Random Forest',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    db.commit()


def create_user(fullname, username, email, password_hash):
    """Create a new user."""
    db = get_db()
    try:
        print(f"[DEBUG] Database: Attempting to insert user: {username}, {email}")
        cursor = db.execute(
            'INSERT INTO users (fullname, username, email, password_hash) VALUES (?, ?, ?, ?)',
            (fullname, username, email, password_hash)
        )
        db.commit()
        print(f"[DEBUG] Database: User inserted successfully, lastrowid={cursor.lastrowid}")
        return cursor.lastrowid
    except sqlite3.IntegrityError as e:
        print(f"[DEBUG] Database: IntegrityError - {e}")
        return None
    except Exception as e:
        print(f"[DEBUG] Database: Exception - {e}")
        return None


def get_user_by_email(email):
    """Get user by email."""
    db = get_db()
    return db.execute(
        'SELECT * FROM users WHERE email = ?', (email,)
    ).fetchone()


def get_user_by_username(username):
    """Get user by username."""
    db = get_db()
    return db.execute(
        'SELECT * FROM users WHERE username = ?', (username,)
    ).fetchone()


def get_user_by_id(user_id):
    """Get user by ID."""
    db = get_db()
    return db.execute(
        'SELECT * FROM users WHERE id = ?', (user_id,)
    ).fetchone()


def create_prediction(user_id, country, life_expectancy, mean_schooling, 
                      expected_schooling, gni, prediction, score, confidence, model_name='Random Forest'):
    """Create a new prediction record."""
    db = get_db()
    cursor = db.execute('''
        INSERT INTO predictions 
        (user_id, country, life_expectancy, mean_schooling, expected_schooling, gni, prediction, score, confidence, model_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, country, life_expectancy, mean_schooling, expected_schooling, gni, prediction, score, confidence, model_name))
    db.commit()
    return cursor.lastrowid


def get_user_predictions(user_id, limit=50):
    """Get predictions for a specific user."""
    db = get_db()
    return db.execute('''
        SELECT * FROM predictions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ''', (user_id, limit)).fetchall()


def get_prediction_count(user_id):
    """Get total prediction count for a user."""
    db = get_db()
    result = db.execute(
        'SELECT COUNT(*) as count FROM predictions WHERE user_id = ?', (user_id,)
    ).fetchone()
    return result['count'] if result else 0


def get_recent_predictions(user_id, limit=5):
    """Get recent predictions for a user."""
    db = get_db()
    return db.execute('''
        SELECT * FROM predictions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ''', (user_id, limit)).fetchall()


def get_prediction_by_id(user_id, prediction_id):
    """Get a specific prediction by ID (only if owned by user)."""
    db = get_db()
    return db.execute(
        'SELECT * FROM predictions WHERE id = ? AND user_id = ?',
        (prediction_id, user_id)
    ).fetchone()


def delete_prediction(user_id, prediction_id):
    """Delete a prediction (only if owned by user)."""
    db = get_db()
    db.execute(
        'DELETE FROM predictions WHERE id = ? AND user_id = ?',
        (prediction_id, user_id)
    )
    db.commit()


def update_user(user_id, fullname=None, username=None, email=None):
    """Update user profile."""
    db = get_db()
    updates = []
    values = []
    
    if fullname:
        updates.append('fullname = ?')
        values.append(fullname)
    if username:
        updates.append('username = ?')
        values.append(username)
    if email:
        updates.append('email = ?')
        values.append(email)
    
    if not updates:
        return False
    
    values.append(user_id)
    db.execute(
        f"UPDATE users SET {', '.join(updates)} WHERE id = ?",
        values
    )
    db.commit()
    return True


def update_password(user_id, password_hash):
    """Update user password."""
    db = get_db()
    db.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        (password_hash, user_id)
    )
    db.commit()