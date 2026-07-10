"""
models.py - User and Prediction models for HDI Prediction System
"""

from datetime import datetime


class User:
    """User model class."""
    
    def __init__(self, id, fullname, username, email, password_hash, created_at):
        self.id = id
        self.fullname = fullname
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at
    
    @staticmethod
    def from_row(row):
        """Create User instance from database row."""
        if row is None:
            return None
        return User(
            id=row['id'],
            fullname=row['fullname'],
            username=row['username'],
            email=row['email'],
            password_hash=row['password_hash'],
            created_at=row['created_at']
        )
    
    def to_dict(self):
        """Convert user to dictionary."""
        return {
            'id': self.id,
            'fullname': self.fullname,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at
        }


class Prediction:
    """Prediction model class."""
    
    def __init__(self, id, user_id, country, life_expectancy, mean_schooling,
                 expected_schooling, gni, prediction, score, confidence, model_name, created_at):
        self.id = id
        self.user_id = user_id
        self.country = country
        self.life_expectancy = life_expectancy
        self.mean_schooling = mean_schooling
        self.expected_schooling = expected_schooling
        self.gni = gni
        self.prediction = prediction
        self.score = score
        self.confidence = confidence
        self.model_name = model_name
        self.created_at = created_at
    
    @staticmethod
    def from_row(row):
        """Create Prediction instance from database row."""
        if row is None:
            return None
        return Prediction(
            id=row['id'],
            user_id=row['user_id'],
            country=row['country'],
            life_expectancy=row['life_expectancy'],
            mean_schooling=row['mean_schooling'],
            expected_schooling=row['expected_schooling'],
            gni=row['gni'],
            prediction=row['prediction'],
            score=row['score'],
            confidence=row['confidence'],
            model_name=row['model_name'],
            created_at=row['created_at']
        )
    
    def to_dict(self):
        """Convert prediction to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'country': self.country,
            'life_expectancy': self.life_expectancy,
            'mean_schooling': self.mean_schooling,
            'expected_schooling': self.expected_schooling,
            'gni': self.gni,
            'prediction': self.prediction,
            'score': self.score,
            'confidence': self.confidence,
            'model_name': self.model_name,
            'created_at': self.created_at
        }
