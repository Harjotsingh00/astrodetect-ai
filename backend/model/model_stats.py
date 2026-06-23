import numpy as np
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.fetch_data import generate_synthetic_lightcurve
from model.preprocess import preprocess_pipeline

def evaluate_model(n_samples=200):
    """
    Run evaluation on fresh synthetic data.
    Returns accuracy, precision, recall, F1, ROC points.
    """
    import tensorflow as tf
    MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models', 'exoplanet_cnn.keras')

    if not os.path.exists(MODEL_PATH):
        return None

    model = tf.keras.models.load_model(MODEL_PATH)

    y_true, y_pred_prob = [], []

    for i in range(n_samples):
        has_planet = (i % 2 == 0)
        noise = np.random.uniform(0.0005, 0.003)
        lc = generate_synthetic_lightcurve(has_planet=has_planet, noise_level=noise)
        segments, _, _ = preprocess_pipeline(lc['time'], lc['flux'], lc['flux_err'])
        probs = model.predict(segments, verbose=0).flatten()
        prob = float(np.mean(probs))
        y_true.append(1 if has_planet else 0)
        y_pred_prob.append(prob)

    y_true = np.array(y_true)
    y_pred_prob = np.array(y_pred_prob)
    y_pred = (y_pred_prob > 0.5).astype(int)

    tp = int(np.sum((y_pred == 1) & (y_true == 1)))
    tn = int(np.sum((y_pred == 0) & (y_true == 0)))
    fp = int(np.sum((y_pred == 1) & (y_true == 0)))
    fn = int(np.sum((y_pred == 0) & (y_true == 1)))

    accuracy  = round((tp + tn) / n_samples, 4)
    precision = round(tp / (tp + fp + 1e-9), 4)
    recall    = round(tp / (tp + fn + 1e-9), 4)
    f1        = round(2 * precision * recall / (precision + recall + 1e-9), 4)

    # ROC curve
    thresholds = np.linspace(0, 1, 50)
    roc_points = []
    for thresh in thresholds:
        y_t = (y_pred_prob > thresh).astype(int)
        tpr = np.sum((y_t == 1) & (y_true == 1)) / (np.sum(y_true == 1) + 1e-9)
        fpr = np.sum((y_t == 1) & (y_true == 0)) / (np.sum(y_true == 0) + 1e-9)
        roc_points.append({"fpr": round(float(fpr), 3), "tpr": round(float(tpr), 3)})

    # AUC via trapezoidal rule
    fprs = [p["fpr"] for p in roc_points]
    tprs = [p["tpr"] for p in roc_points]
    auc = round(float(np.trapz(tprs[::-1], fprs[::-1])), 4)

    # Probability distribution
    hist, edges = np.histogram(y_pred_prob, bins=20, range=(0, 1))
    prob_dist = [{"bin": round(float(edges[i]), 2), "count": int(hist[i])} for i in range(len(hist))]

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "auc": auc,
        "confusion_matrix": {"tp": tp, "tn": tn, "fp": fp, "fn": fn},
        "roc_curve": roc_points,
        "prob_distribution": prob_dist,
        "n_samples": n_samples
    }