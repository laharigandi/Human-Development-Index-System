"""
train_model.py - Train and evaluate the HDI classification model
"""

import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from preprocess import preprocess, save_artifacts, CATEGORY_ORDER


def train(X_train, y_train):
    """Train a Random Forest classifier."""
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=2,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)
    return model


def evaluate(model, X_test, y_test):
    """Print evaluation metrics."""
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n{'='*50}")
    print(f"  Model Accuracy: {acc * 100:.2f}%")
    print(f"{'='*50}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=CATEGORY_ORDER))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    return acc


def save_model(model, path="model.pkl"):
    """Save trained model to disk."""
    with open(path, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved: {path}")


def main():
    print("Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, scaler, le = preprocess()

    print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")
    print("\nTraining Random Forest model...")
    model = train(X_train, y_train)

    evaluate(model, X_test, y_test)
    save_model(model)
    save_artifacts(scaler, le)
    print("\nTraining complete. All artifacts saved.")


if __name__ == "__main__":
    main()
