# Human Development Index (HDI) Prediction System

A machine learning web application that predicts a country's HDI category based on health, education, and income indicators.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3.10+, Flask 3.0             |
| ML         | Scikit-learn, Pandas, NumPy         |
| Viz        | Matplotlib, Seaborn                 |
| Frontend   | HTML5, CSS3, Bootstrap 5, JavaScript|

## Project Structure

```
HDI_Project/
├── app.py               # Flask application & routes
├── train_model.py       # Model training & evaluation
├── preprocess.py        # Data preprocessing pipeline
├── requirements.txt
├── model.pkl            # Trained model (generated)
├── scaler.pkl           # Feature scaler (generated)
├── label_encoder.pkl    # Label encoder (generated)
├── static/
│   ├── css/style.css
│   └── js/script.js
├── templates/index.html
├── dataset/hdi_dataset.csv
└── README.md
```

## Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the model
```bash
python train_model.py
```

### 3. Start the Flask server
```bash
python app.py
```

### 4. Open in browser
```
http://localhost:5000
```

## HDI Categories

| Category  | HDI Score   | Examples                  |
|-----------|-------------|---------------------------|
| Very High | ≥ 0.800     | Norway, Switzerland, USA  |
| High      | 0.700–0.799 | Brazil, China, Malaysia   |
| Medium    | 0.550–0.699 | India, Kenya, Bangladesh  |
| Low       | < 0.550     | Niger, Mali, Chad         |

## Input Features

| Feature                    | Range           | Description                        |
|----------------------------|-----------------|------------------------------------|
| Life Expectancy            | 20 – 90 years   | Average lifespan at birth          |
| Mean Years of Schooling    | 0 – 20 years    | Average education years for adults |
| Expected Years of Schooling| 0 – 25 years    | Expected education for children    |
| GNI Per Capita             | $100 – $150,000 | Gross National Income (PPP $)      |

## Model

- Algorithm: Random Forest Classifier (200 estimators)
- Preprocessing: StandardScaler + LabelEncoder
- Split: 80% train / 20% test
- Evaluation: Accuracy, Classification Report, Confusion Matrix
