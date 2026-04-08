"""
XGBoost Eğitimi — Issue AI-009
================================
Rapor §3.3:
  7 özellik → 0-100 öncelik skoru
  Grid Search + 5-katlı çapraz doğrulama
  Hedef: R² ≥ 0.85, MAE < 10
  Veri: Kahramanmaraş retrospektif + uzman senaryoları (≥1500 kayıt)
"""
import joblib, pandas as pd
from sklearn.model_selection import GridSearchCV, KFold
from xgboost import XGBRegressor

FEATURES = ["urgency_level","waiting_time_min","distance_km",
            "need_type_enc","weather_score","population","damage_score"]

def train(csv="datasets/xgboost_train.csv"):
    df = pd.read_csv(csv)
    X, y = df[FEATURES], df["priority_score"]
    params = {
        "n_estimators":     [100, 200, 300],
        "max_depth":        [4, 6, 8],
        "learning_rate":    [0.01, 0.05, 0.1],
        "subsample":        [0.8, 1.0],
        "colsample_bytree": [0.8, 1.0],
    }
    gs = GridSearchCV(
        XGBRegressor(objective="reg:squarederror", random_state=42),
        params, cv=KFold(5, shuffle=True, random_state=42),
        scoring="r2", n_jobs=-1, verbose=2,
    )
    gs.fit(X, y)
    print(f"En iyi R²: {gs.best_score_:.4f}")
    joblib.dump(gs.best_estimator_, "../../ml_models/xgboost_priority.pkl")
    print("Kaydedildi: ml_models/xgboost_priority.pkl")
    return gs.best_estimator_

if __name__ == "__main__":
    train()
