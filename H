"""
config.py - Configuration for HDI Prediction System
"""

import os
from datetime import timedelta

# Secret key for session management - should be set via environment variable in production
SECRET_KEY = os.environ.get('SECRET_KEY', 'HDI_SECRET_KEY_2026_FIXED')

# Session configuration
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'  # 'Lax' is safe for local development; 'None' requires Secure=True
PERMANENT_SESSION_LIFETIME = timedelta(days=7)

# Database configuration
DATABASE = 'hdi_predictions.db'