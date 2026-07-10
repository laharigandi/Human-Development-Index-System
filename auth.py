"""
auth.py - Authentication routes and decorators for HDI Prediction System
"""

import re
from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import (
    create_user, get_user_by_email, get_user_by_username, get_user_by_id,
    create_prediction, get_user_predictions, get_prediction_count, get_recent_predictions,
    delete_prediction, get_prediction_by_id, update_user, update_password
)

auth_bp = Blueprint('auth', __name__)


# ── Validation Helpers ──────────────────────────────────────────────────────────
def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength. Returns (is_valid, error_message)."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit."
    return True, None


def validate_username(username):
    """Validate username format."""
    if len(username) < 3:
        return False, "Username must be at least 3 characters long."
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores."
    return True, None


# ── Login Required Decorator ───────────────────────────────────────────────────
def login_required(f):
    """Decorator to require login for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print(f"[DEBUG] login_required check - user_id in session: {'user_id' in session}")
        if 'user_id' not in session:
            if request.is_json or request.headers.get('Content-Type') == 'application/json':
                return jsonify({'error': 'Please login to access this feature.'}), 401
            flash('Please login to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


# ── Routes ────────────────────────────────────────────────────────────────────
@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration page."""
    if request.method == 'POST':
        print("[DEBUG] Received registration request")
        print(f"[DEBUG] Session before registration: {dict(session)}")
        fullname = request.form.get('fullname', '').strip()
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        print(f"[DEBUG] Form data: fullname={fullname}, username={username}, email={email}")
        
        # Validate required fields
        if not all([fullname, username, email, password, confirm_password]):
            print("[DEBUG] Validation failed: All fields are required")
            flash('All fields are required.', 'danger')
            return redirect(url_for('auth.register'))
        
        # Validate email
        if not validate_email(email):
            print(f"[DEBUG] Validation failed: Invalid email format for {email}")
            flash('Please enter a valid email address.', 'danger')
            return redirect(url_for('auth.register'))
        
        # Validate username
        valid, error = validate_username(username)
        if not valid:
            print(f"[DEBUG] Validation failed: {error}")
            flash(error, 'danger')
            return redirect(url_for('auth.register'))
        
        # Validate password
        valid, error = validate_password(password)
        if not valid:
            print(f"[DEBUG] Validation failed: {error}")
            flash(error, 'danger')
            return redirect(url_for('auth.register'))
        
        # Check password match
        if password != confirm_password:
            print("[DEBUG] Validation failed: Passwords do not match")
            flash('Passwords do not match.', 'danger')
            return redirect(url_for('auth.register'))
        
        # Check if username exists
        if get_user_by_username(username):
            print(f"[DEBUG] Validation failed: Username {username} already exists")
            flash('Username already exists.', 'danger')
            return redirect(url_for('auth.register'))
        
        # Check if email exists
        if get_user_by_email(email):
            print(f"[DEBUG] Validation failed: Email {email} already registered")
            flash('Email already registered.', 'danger')
            return redirect(url_for('auth.register'))
        
        # Create user
        print("[DEBUG] All validations passed, creating user...")
        password_hash = generate_password_hash(password)
        user_id = create_user(fullname, username, email, password_hash)
        
        if user_id:
            print(f"[DEBUG] User inserted successfully with ID: {user_id}")
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('auth.login'))
        else:
            print("[DEBUG] Registration failed: create_user returned None")
            flash('Registration failed. Please try again.', 'danger')
            return redirect(url_for('auth.register'))
    
    return render_template('register.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login page."""
    if request.method == 'POST':
        print("[DEBUG] Login POST request received")
        print(f"[DEBUG] Session before login: {dict(session)}")
        
        login_input = request.form.get('login_input', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember') == 'on'
        
        print(f"[DEBUG] Login input: {login_input}, password length: {len(password)}")
        
        if not all([login_input, password]):
            print("[DEBUG] Validation failed: All fields are required")
            flash('All fields are required.', 'danger')
            return redirect(url_for('auth.login'))
        
        # Find user by email or username
        user = get_user_by_email(login_input) or get_user_by_username(login_input)
        
        if not user:
            print(f"[DEBUG] User not found for: {login_input}")
            flash('Invalid email or username.', 'danger')
            return redirect(url_for('auth.login'))
        
        print(f"[DEBUG] User found: id={user['id']}, username={user['username']}, email={user['email']}")
        
        if not check_password_hash(user['password_hash'], password):
            print(f"[DEBUG] Password check failed for user: {login_input}")
            flash('Incorrect password. Please try again.', 'danger')
            return redirect(url_for('auth.login'))
        
        print(f"[DEBUG] Password verified successfully")
        
        # Set session
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['fullname'] = user['fullname']
        session['logged_in'] = True

        print(f"[DEBUG] Session set: user_id={user['id']}, username={user['username']}")
        print(f"[DEBUG] Session after login: {dict(session)}")
        print(f"[DEBUG] Session contains user_id: {'user_id' in session}")

        if remember:
            session.permanent = True

        flash(f'Welcome back, {user["fullname"]}!', 'success')
        print(f"[DEBUG] Redirecting to dashboard")
        return redirect(url_for('auth.dashboard'))
    
    return render_template('login.html')


@auth_bp.route('/logout')
def logout():
    """User logout."""
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('index'))


@auth_bp.route('/prediction-history')
@login_required
def prediction_history():
    """User prediction history page."""
    print(f"[DEBUG] Prediction history accessed - user_id: {session.get('user_id')}")
    return render_template('prediction_history.html')


@auth_bp.route('/dashboard')
@login_required
def dashboard():
    """User dashboard page."""
    print(f"[DEBUG] Dashboard accessed - user_id: {session.get('user_id')}")
    user = get_user_by_id(session['user_id'])
    prediction_count = get_prediction_count(session['user_id'])
    recent_predictions = get_recent_predictions(session['user_id'], 5)
    
    return render_template('dashboard.html', 
                           user=user, 
                           prediction_count=prediction_count,
                           recent_predictions=recent_predictions)


@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile page."""
    user = get_user_by_id(session['user_id'])
    prediction_count = get_prediction_count(session['user_id'])
    
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'update_profile':
            fullname = request.form.get('fullname', '').strip()
            username = request.form.get('username', '').strip()
            email = request.form.get('email', '').strip()
            
            if not all([fullname, username, email]):
                flash('All fields are required.', 'danger')
            else:
                # Check for username uniqueness (if changed)
                if username != user['username'] and get_user_by_username(username):
                    flash('Username already exists.', 'danger')
                # Check for email uniqueness (if changed)
                elif email != user['email'] and get_user_by_email(email):
                    flash('Email already registered.', 'danger')
                else:
                    update_user(session['user_id'], fullname, username, email)
                    session['username'] = username
                    session['fullname'] = fullname
                    flash('Profile updated successfully.', 'success')
                    return redirect(url_for('auth.profile'))
        
        elif action == 'change_password':
            current_password = request.form.get('current_password', '')
            new_password = request.form.get('new_password', '')
            confirm_password = request.form.get('confirm_password', '')
            
            if not check_password_hash(user['password_hash'], current_password):
                flash('Current password is incorrect.', 'danger')
            elif new_password != confirm_password:
                flash('New passwords do not match.', 'danger')
            else:
                valid, error = validate_password(new_password)
                if not valid:
                    flash(error, 'danger')
                else:
                    update_password(session['user_id'], generate_password_hash(new_password))
                    flash('Password changed successfully.', 'success')
                    return redirect(url_for('auth.profile'))
    
    return render_template('profile.html', user=user, prediction_count=prediction_count)


@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Forgot password page (UI only, no email integration)."""
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        
        if not email:
            flash('Please enter your email address.', 'danger')
        elif not validate_email(email):
            flash('Please enter a valid email address.', 'danger')
        else:
            # Check if email exists
            user = get_user_by_email(email)
            if user:
                flash('If this email exists in our system, a password reset link will be sent.', 'success')
            else:
                flash('If this email exists in our system, a password reset link will be sent.', 'success')
            return redirect(url_for('auth.forgot_password'))
    
    return render_template('forgot_password.html')


@auth_bp.route('/api/predictions', methods=['GET', 'POST'])
@login_required
def api_predictions():
    """API endpoint for user predictions (authenticated)."""
    if request.method == 'GET':
        predictions = get_user_predictions(session['user_id'])
        return jsonify({
            'predictions': [dict(p) for p in predictions]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided.'}), 400
        
# Create prediction record
        pred_id = create_prediction(
            user_id=session['user_id'],
            country=data.get('country', ''),
            life_expectancy=data.get('life_expectancy'),
            mean_schooling=data.get('mean_schooling'),
            expected_schooling=data.get('expected_schooling'),
            gni=data.get('gni'),
            prediction=data.get('prediction'),
            score=data.get('score'),
            confidence=str(data.get('confidence', {})),
            model_name=data.get('model_name', 'Random Forest')
        )
        
        return jsonify({'success': True, 'prediction_id': pred_id})


@auth_bp.route('/api/predictions/<int:prediction_id>', methods=['GET', 'DELETE'])
@login_required
def api_prediction_detail(prediction_id):
    """Get or delete a specific prediction (authenticated)."""
    if request.method == 'GET':
        prediction = get_prediction_by_id(session['user_id'], prediction_id)
        if prediction is None:
            return jsonify({'error': 'Prediction not found or access denied.'}), 404
        return jsonify({'prediction': dict(prediction)})
    elif request.method == 'DELETE':
        delete_prediction(session['user_id'], prediction_id)
        return jsonify({'success': True})
