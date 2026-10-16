import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score

from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb

def run_evaluation():
    # 0. Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "..", "Crop Recommendation dataset", "Crop_recommendation.csv")
    if not os.path.exists(data_path):
        data_path = os.path.abspath("Crop Recommendation dataset/Crop_recommendation.csv")
    
    reports_dir = os.path.join(base_dir, "reports")
    os.makedirs(reports_dir, exist_ok=True)
    report_md_path = os.path.join(reports_dir, "classifier_robustness.md")
    chart_png_path = os.path.join(reports_dir, "noise_robustness.png")

    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_cols].copy()
    y_raw = df['label'].copy()

    # Encode labels to ensure seamless compatibility across all models including XGBoost
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    class_names = le.classes_

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # =========================================================================
    # 1. 5-fold Stratified CV for RandomForestClassifier
    # =========================================================================
    print("Running 1. 5-fold Stratified CV for RandomForestClassifier...")
    rf_pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])

    rf_cv_results = cross_validate(
        rf_pipe, X, y, cv=cv, scoring=['accuracy', 'f1_macro'], n_jobs=-1
    )
    rf_acc_mean = float(np.mean(rf_cv_results['test_accuracy']))
    rf_acc_std = float(np.std(rf_cv_results['test_accuracy']))
    rf_f1_mean = float(np.mean(rf_cv_results['test_f1_macro']))
    rf_f1_std = float(np.std(rf_cv_results['test_f1_macro']))

    print(f"Random Forest CV Accuracy : {rf_acc_mean:.6f} ± {rf_acc_std:.6f}")
    print(f"Random Forest CV Macro-F1 : {rf_f1_mean:.6f} ± {rf_f1_std:.6f}")

    # =========================================================================
    # 2. 5-fold Stratified CV for Baselines
    # =========================================================================
    print("Running 2. 5-fold Stratified CV for Baseline Models...")
    models = {
        "Random Forest (n=100)": RandomForestClassifier(n_estimators=100, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "K-Nearest Neighbors (k=5)": KNeighborsClassifier(n_neighbors=5),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42,
            eval_metric='mlogloss',
            n_jobs=-1
        )
    }

    baseline_results = []
    for name, clf in models.items():
        pipe = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', clf)
        ])
        res = cross_validate(pipe, X, y, cv=cv, scoring=['accuracy', 'f1_macro'], n_jobs=-1)
        acc_m = float(np.mean(res['test_accuracy']))
        acc_s = float(np.std(res['test_accuracy']))
        f1_m = float(np.mean(res['test_f1_macro']))
        f1_s = float(np.std(res['test_f1_macro']))
        baseline_results.append({
            "model": name,
            "acc_mean": acc_m,
            "acc_std": acc_s,
            "f1_mean": f1_m,
            "f1_std": f1_s
        })
        print(f"  {name:<25}: Accuracy = {acc_m:.6f} ± {acc_s:.6f} | Macro-F1 = {f1_m:.6f} ± {f1_s:.6f}")

    # =========================================================================
    # 3. Noise Robustness Evaluation
    # =========================================================================
    print("Running 3. Noise Robustness Evaluation...")
    # Train on clean 80% data, evaluate on noisy 20% test partition
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Fit pipeline strictly on clean training data
    rf_pipe_clean = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    rf_pipe_clean.fit(X_train, y_train)

    train_feature_stds = X_train.std(axis=0).values  # array of std per feature
    noise_fractions = [0.0, 0.05, 0.10, 0.20, 0.30]
    seeds = [42, 101, 202, 303, 404]

    noise_results = []
    for frac in noise_fractions:
        seed_accuracies = []
        for seed in seeds:
            if frac == 0.0:
                X_test_noisy = X_test.copy()
            else:
                rng = np.random.default_rng(seed)
                # Gaussian noise with std = frac * feature_training_std
                noise = rng.normal(
                    loc=0.0,
                    scale=frac * train_feature_stds,
                    size=X_test.shape
                )
                X_test_noisy = pd.DataFrame(
                    X_test.values + noise,
                    columns=feature_cols,
                    index=X_test.index
                )
            
            y_pred = rf_pipe_clean.predict(X_test_noisy)
            acc = float(accuracy_score(y_test, y_pred))
            seed_accuracies.append(acc)

        mean_acc = float(np.mean(seed_accuracies))
        std_acc = float(np.std(seed_accuracies))
        noise_results.append({
            "noise_pct": int(round(frac * 100)),
            "noise_frac": frac,
            "mean_acc": mean_acc,
            "std_acc": std_acc,
            "seed_accuracies": seed_accuracies
        })
        print(f"  Noise {int(round(frac * 100)):>2}%: Accuracy = {mean_acc:.6f} ± {std_acc:.6f}")

    # Plot Noise Robustness Line Chart
    plt.figure(figsize=(8, 5), dpi=300)
    pcts = [nr['noise_pct'] for nr in noise_results]
    accs = [nr['mean_acc'] * 100 for nr in noise_results]
    errs = [nr['std_acc'] * 100 for nr in noise_results]

    plt.plot(pcts, accs, marker='o', linewidth=2.5, color='#059669', label='Random Forest (n=100)')
    plt.fill_between(
        pcts,
        [a - e for a, e in zip(accs, errs)],
        [a + e for a, e in zip(accs, errs)],
        color='#10b981',
        alpha=0.2,
        label='± 1 Std Dev (5 seeds)'
    )
    plt.title('Random Forest Noise Robustness (Gaussian Noise on Test Features)', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Noise Std (% of Training Feature Std Dev)', fontsize=11, labelpad=8)
    plt.ylabel('Held-out Test Accuracy (%)', fontsize=11, labelpad=8)
    plt.ylim([min(accs) - 5, 102])
    plt.grid(True, linestyle='--', alpha=0.5)
    for x, y_val in zip(pcts, accs):
        plt.annotate(f"{y_val:.2f}%", (x, y_val), textcoords="offset points", xytext=(0, 10), ha='center', fontsize=9, fontweight='bold')
    plt.legend(loc='lower left')
    plt.tight_layout()
    plt.savefig(chart_png_path)
    plt.close()
    print(f"Saved noise robustness chart to: {chart_png_path}")

    # =========================================================================
    # 4. Feature Ablation Study
    # =========================================================================
    print("Running 4. Feature Ablation Study (Drop one feature at a time)...")
    ablation_results = []
    
    # Baseline with all features
    ablation_results.append({
        "dropped_feature": "None (All Features)",
        "features_retained": len(feature_cols),
        "acc_mean": rf_acc_mean,
        "acc_std": rf_acc_std,
        "acc_drop": 0.0
    })

    for feat in feature_cols:
        retained = [col for col in feature_cols if col != feat]
        X_sub = X[retained]
        pipe_sub = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        res_sub = cross_validate(pipe_sub, X_sub, y, cv=cv, scoring=['accuracy'], n_jobs=-1)
        sub_acc_m = float(np.mean(res_sub['test_accuracy']))
        sub_acc_s = float(np.std(res_sub['test_accuracy']))
        drop_delta = rf_acc_mean - sub_acc_m
        ablation_results.append({
            "dropped_feature": feat,
            "features_retained": len(retained),
            "acc_mean": sub_acc_m,
            "acc_std": sub_acc_s,
            "acc_drop": drop_delta
        })
        print(f"  Dropped {feat:<12}: Accuracy = {sub_acc_m:.6f} ± {sub_acc_s:.6f} | Drop = {drop_delta:+.6f}")

    # =========================================================================
    # 5. Random Forest Feature Importances
    # =========================================================================
    print("Running 5. Feature Importances Extraction...")
    # Train scaler + RF on full dataset for feature importances
    rf_full = RandomForestClassifier(n_estimators=100, random_state=42)
    scaler_full = StandardScaler()
    X_scaled = scaler_full.fit_transform(X)
    rf_full.fit(X_scaled, y)

    importances = rf_full.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    
    feature_importance_results = []
    for rank, idx in enumerate(sorted_idx, 1):
        feat_name = feature_cols[idx]
        imp = float(importances[idx])
        feature_importance_results.append({
            "rank": rank,
            "feature": feat_name,
            "importance": imp,
            "pct": imp * 100
        })
        print(f"  Rank {rank}: {feat_name:<12} = {imp:.6f} ({imp*100:.2f}%)")

    # =========================================================================
    # 6. Save Markdown Report
    # =========================================================================
    print("Writing markdown report...")
    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write("# Classifier Robustness & Evaluation Report\n\n")
        f.write(f"**Dataset:** `Crop_recommendation.csv` (2,200 samples, 22 crop classes, 7 numeric features)  \n")
        f.write(f"**Random State:** 42  \n")
        f.write(f"**Validation Strategy:** 5-Fold Stratified Cross-Validation with `StandardScaler` encapsulated in `sklearn.pipeline.Pipeline` (zero data leakage).  \n\n")
        f.write("---\n\n")

        # Section 1
        f.write("## 1. 5-Fold Stratified Cross-Validation (Random Forest Classifier)\n\n")
        f.write(f"* **Model:** `RandomForestClassifier(n_estimators=100, random_state=42)`\n")
        f.write(f"* **Preprocessing:** `StandardScaler` inside Pipeline\n")
        f.write(f"* **Mean Accuracy:** **{rf_acc_mean:.6f}** (± {rf_acc_std:.6f}) [{rf_acc_mean*100:.2f}%]\n")
        f.write(f"* **Mean Macro-F1:** **{rf_f1_mean:.6f}** (± {rf_f1_std:.6f}) [{rf_f1_mean*100:.2f}%]\n\n")

        # Section 2
        f.write("## 2. Model Baseline Comparison (5-Fold Stratified CV)\n\n")
        f.write("| Model | Preprocessing | Mean Accuracy | Std Dev | Mean Macro-F1 | Std Dev |\n")
        f.write("| :--- | :--- | :---: | :---: | :---: | :---: |\n")
        for br in baseline_results:
            f.write(f"| **{br['model']}** | StandardScaler (Pipeline) | {br['acc_mean']:.6f} ({br['acc_mean']*100:.2f}%) | ± {br['acc_std']:.6f} | {br['f1_mean']:.6f} ({br['f1_mean']*100:.2f}%) | ± {br['f1_std']:.6f} |\n")
        f.write("\n---\n\n")

        # Section 3
        f.write("## 3. Noise Robustness Analysis\n\n")
        f.write("The model was trained on clean training data (80% split, 1,760 samples). Gaussian noise with standard deviation proportional to each feature's training standard deviation (0%, 5%, 10%, 20%, 30%) was injected into the test features (440 samples) across 5 independent random seeds.\n\n")
        f.write("| Noise Level (% of Feature Std) | Mean Test Accuracy | Std Dev | Individual Seed Accuracies (5 Seeds) |\n")
        f.write("| :---: | :---: | :---: | :--- |\n")
        for nr in noise_results:
            seed_strs = ", ".join([f"{s:.4f}" for s in nr['seed_accuracies']])
            f.write(f"| **{nr['noise_pct']}%** | **{nr['mean_acc']:.6f}** ({nr['mean_acc']*100:.2f}%) | ± {nr['std_acc']:.6f} | [{seed_strs}] |\n")
        f.write("\n")
        f.write(f"![Noise Robustness Curve](noise_robustness.png)\n\n")
        f.write("---\n\n")

        # Section 4
        f.write("## 4. Feature Ablation Study (Drop-One-Feature-Out CV)\n\n")
        f.write("Evaluates the impact on 5-fold cross-validation accuracy when removing each feature individually:\n\n")
        f.write("| Dropped Feature | Features Retained | Mean CV Accuracy | Std Dev | Accuracy Delta vs Baseline |\n")
        f.write("| :--- | :---: | :---: | :---: | :---: |\n")
        for ar in ablation_results:
            delta_str = f"{ar['acc_drop']:+.6f}" if ar['acc_drop'] != 0.0 else "Baseline"
            f.write(f"| **{ar['dropped_feature']}** | {ar['features_retained']}/7 | {ar['acc_mean']:.6f} ({ar['acc_mean']*100:.2f}%) | ± {ar['acc_std']:.6f} | {delta_str} |\n")
        f.write("\n---\n\n")

        # Section 5
        f.write("## 5. Random Forest Feature Importances (MDI)\n\n")
        f.write("| Rank | Feature | Description | Importance Score | Percentage |\n")
        f.write("| :---: | :--- | :--- | :---: | :---: |\n")
        desc_map = {
            'rainfall': 'Rainfall in mm',
            'humidity': 'Relative humidity (%)',
            'K': 'Potassium content in soil (mg/kg)',
            'P': 'Phosphorus content in soil (mg/kg)',
            'N': 'Nitrogen content in soil (mg/kg)',
            'temperature': 'Temperature (°C)',
            'ph': 'Soil pH level'
        }
        for fir in feature_importance_results:
            feat = fir['feature']
            desc = desc_map.get(feat, feat)
            f.write(f"| {fir['rank']} | **`{feat}`** | {desc} | {fir['importance']:.6f} | {fir['pct']:.2f}% |\n")
        f.write("\n")

    print(f"\nCompleted! Saved results to {report_md_path}")

if __name__ == "__main__":
    run_evaluation()
