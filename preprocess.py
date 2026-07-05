"""
preprocess.py - Data preprocessing utilities for HDI Prediction System
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import pickle
import os

DATASET_PATH = os.path.join("dataset", "hdi_dataset.csv")
FEATURES = ["life_expectancy", "mean_years_schooling", "expected_years_schooling", "gni_per_capita"]
TARGET = "hdi_category"
CATEGORY_ORDER = ["Low", "Medium", "High", "Very High"]


def load_data(path=DATASET_PATH):
    """Load dataset from CSV."""
    df = pd.read_csv(path)
    return df


def clean_data(df):
    """Handle missing values and remove duplicates."""
    df = df.drop_duplicates()
    df[FEATURES] = df[FEATURES].fillna(df[FEATURES].median())
    df[TARGET] = df[TARGET].fillna(df[TARGET].mode()[0])
    return df


def encode_labels(df):
    """Encode target labels using LabelEncoder."""
    le = LabelEncoder()
    le.fit(CATEGORY_ORDER)
    df["hdi_encoded"] = le.transform(df[TARGET])
    return df, le


def scale_features(X_train, X_test):
    """Fit scaler on training data and transform both sets."""
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, scaler


def preprocess(path=DATASET_PATH, test_size=0.2, random_state=42):
    """
    Full preprocessing pipeline.
    Returns: X_train, X_test, y_train, y_test, scaler, label_encoder
    """
    df = load_data(path)
    df = clean_data(df)
    df, le = encode_labels(df)

    X = df[FEATURES].values
    y = df["hdi_encoded"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test)

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, le


def save_artifacts(scaler, le):
    """Persist scaler and label encoder to disk."""
    with open("scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    with open("label_encoder.pkl", "wb") as f:
        pickle.dump(le, f)
    print("Artifacts saved: scaler.pkl, label_encoder.pkl")


def load_artifacts():
    """Load scaler and label encoder from disk."""
    with open("scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    with open("label_encoder.pkl", "rb") as f:
        le = pickle.load(f)
    return scaler, le
