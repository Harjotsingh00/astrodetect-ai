import numpy as np
import os
import tensorflow as tf
from scipy.signal import find_peaks
from model.preprocess import preprocess_pipeline

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models', 'exoplanet_cnn.keras')

_model = None

def load_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not found. Please run: python model/train.py first."
            )
        _model = tf.keras.models.load_model(MODEL_PATH)
    return _model


def predict_exoplanet(time_list, flux_list, flux_err_list):
    """
    Full prediction pipeline.
    Returns probability, classification, and analysis details.
    """
    model = load_model()
    
    segments, flux_processed, time_clean = preprocess_pipeline(
        time_list, flux_list, flux_err_list
    )
    
    # Predict on all segments
    probs = model.predict(segments, verbose=0).flatten()
    
    avg_prob = float(np.mean(probs))
    max_prob = float(np.max(probs))
    
    # Ensemble: weighted average (max segments get more weight)
    weights = probs / (probs.sum() + 1e-10)
    ensemble_prob = float(np.sum(probs * weights))
    ensemble_prob = min(ensemble_prob, 0.99)
    
    # Transit detection via dip finding
    flux_arr = np.array(flux_processed)
    inverted = -flux_arr
    peaks, properties = find_peaks(
        inverted,
        height=np.std(flux_arr) * 1.5,
        distance=10,
        prominence=np.std(flux_arr)
    )
    
    transit_indices = peaks.tolist()
    transit_times = [float(np.array(time_clean)[i]) for i in transit_indices if i < len(time_clean)]
    
    # Estimate period if multiple transits found
    estimated_period = None
    if len(transit_times) >= 2:
        diffs = np.diff(transit_times)
        estimated_period = round(float(np.median(diffs)), 3)
    
    # Classification
    is_exoplanet = ensemble_prob > 0.5
    confidence = ensemble_prob if is_exoplanet else (1 - ensemble_prob)
    
    if ensemble_prob > 0.8:
        classification = "Strong Exoplanet Candidate"
        color = "green"
    elif ensemble_prob > 0.5:
        classification = "Possible Exoplanet"
        color = "yellow"
    elif ensemble_prob > 0.3:
        classification = "Uncertain — Likely Noise"
        color = "orange"
    else:
        classification = "No Exoplanet Detected"
        color = "red"
    
    return {
        "probability": round(ensemble_prob, 4),
        "confidence_pct": round(confidence * 100, 1),
        "is_exoplanet": is_exoplanet,
        "classification": classification,
        "color": color,
        "transits_detected": len(transit_times),
        "transit_times": transit_times[:10],
        "estimated_period_days": estimated_period,
        "segments_analyzed": len(segments),
        "flux_processed": flux_processed[:500],
        "time_clean": time_clean[:500],
        "segment_probs": probs.tolist()
    }