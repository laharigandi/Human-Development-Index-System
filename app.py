"""
app.py - Flask web application for HDI Prediction System
"""

import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ── Load ML artifacts ──────────────────────────────────────────────────────────
def load_model_artifacts():
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    with open("label_encoder.pkl", "rb") as f:
        le = pickle.load(f)
    return model, scaler, le

try:
    model, scaler, le = load_model_artifacts()
    print("[OK] Model artifacts loaded successfully.")
except FileNotFoundError:
    model = scaler = le = None
    print("[WARN] Model artifacts not found. Run train_model.py first.")

# ── Validation helpers ─────────────────────────────────────────────────────────
VALID_RANGES = {
    "life_expectancy":          (20.0, 90.0),
    "mean_years_schooling":     (0.0,  20.0),
    "expected_years_schooling": (0.0,  25.0),
    "gni_per_capita":           (100.0, 150000.0),
}

CATEGORY_META = {
    "Very High": {
        "color": "#10b981",
        "badge": "success",
        "icon": "bi-star-fill",
        "description": "Countries with very high human development, featuring long life expectancy, high education levels, and strong income.",
    },
    "High": {
        "color": "#3b82f6",
        "badge": "primary",
        "icon": "bi-arrow-up-circle-fill",
        "description": "Countries with high human development showing good progress in health, education, and income indicators.",
    },
    "Medium": {
        "color": "#f59e0b",
        "badge": "warning",
        "icon": "bi-dash-circle-fill",
        "description": "Countries with medium human development that have moderate levels across health, education, and income.",
    },
    "Low": {
        "color": "#ef4444",
        "badge": "danger",
        "icon": "bi-exclamation-circle-fill",
        "description": "Countries with low human development facing significant challenges in health, education, and income.",
    },
}


def validate_inputs(data):
    """Validate and parse form inputs. Returns (values_dict, error_message)."""
    values = {}
    for field, (lo, hi) in VALID_RANGES.items():
        raw = data.get(field, "").strip()
        if not raw:
            return None, f"'{field.replace('_', ' ').title()}' is required."
        try:
            val = float(raw)
        except ValueError:
            return None, f"'{field.replace('_', ' ').title()}' must be a number."
        if not (lo <= val <= hi):
            return None, f"'{field.replace('_', ' ').title()}' must be between {lo} and {hi}."
        values[field] = val
    return values, None


def predict_hdi(values):
    """Run prediction pipeline and return category + metadata."""
    features = np.array([[
        values["life_expectancy"],
        values["mean_years_schooling"],
        values["expected_years_schooling"],
        values["gni_per_capita"],
    ]])
    scaled = scaler.transform(features)
    encoded = model.predict(scaled)[0]
    proba = model.predict_proba(scaled)[0]
    category = le.inverse_transform([encoded])[0]

    # Build confidence dict keyed by category name
    confidence = {
        le.inverse_transform([i])[0]: round(float(p) * 100, 1)
        for i, p in enumerate(proba)
    }
    return category, confidence


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Please run train_model.py first."}), 503

    values, err = validate_inputs(request.form)
    if err:
        return jsonify({"error": err}), 400

    try:
        category, confidence = predict_hdi(values)
        meta = CATEGORY_META[category]
        return jsonify({
            "category":    category,
            "color":       meta["color"],
            "badge":       meta["badge"],
            "icon":        meta["icon"],
            "description": meta["description"],
            "confidence":  confidence,
            "inputs":      values,
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/model-info")
def model_info():
    """Return model metadata for the Model Information section."""
    if model is None:
        return jsonify({"error": "Model not loaded."}), 503
    try:
        from preprocess import preprocess
        X_train, X_test, y_train, y_test, _, _ = preprocess()
        from sklearn.metrics import accuracy_score
        acc = accuracy_score(y_test, model.predict(
            __import__('pickle').load(open('scaler.pkl','rb')).transform(X_test)
        ))
        train_samples = len(X_train)
        test_samples  = len(X_test)
    except Exception:
        acc = None
        train_samples = "N/A"
        test_samples  = "N/A"
    return jsonify({
        "algorithm":      "Random Forest Classifier",
        "estimators":     200,
        "accuracy":       round(acc * 100, 2) if acc else "N/A",
        "train_samples":  train_samples,
        "test_samples":   test_samples,
        "features":       ["Life Expectancy", "Mean Years of Schooling",
                           "Expected Years of Schooling", "GNI Per Capita"],
        "target_classes": ["Very High", "High", "Medium", "Low"],
        "split":          "80% Train / 20% Test",
        "preprocessing":  "StandardScaler + LabelEncoder",
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/contact", methods=["POST"])
def contact():
    """Handle contact form submission."""
    name    = request.form.get("name", "").strip()
    email   = request.form.get("email", "").strip()
    message = request.form.get("message", "").strip()
    if not all([name, email, message]):
        return jsonify({"error": "All fields are required."}), 400
    if "@" not in email:
        return jsonify({"error": "Invalid email address."}), 400
    # In production, send email here
    return jsonify({"success": True, "message": f"Thank you {name}! Your message has been received."})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
