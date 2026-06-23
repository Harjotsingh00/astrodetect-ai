import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Add parent dir to path
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.fetch_data import generate_synthetic_lightcurve
from model.preprocess import preprocess_pipeline

SEGMENT_LENGTH = 200
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'models')

def build_1d_cnn(input_length: int = 200):
    """
    1D-CNN architecture inspired by Shallue & Vanderburg (2018)
    'Identifying Exoplanets with Deep Learning' — Google Brain / Harvard paper.
    """
    inputs = keras.Input(shape=(input_length, 1))
    
    # Local view processing
    x = layers.Conv1D(16, 5, activation='relu', padding='same')(inputs)
    x = layers.MaxPooling1D(2)(x)
    x = layers.Conv1D(32, 5, activation='relu', padding='same')(x)
    x = layers.MaxPooling1D(2)(x)
    x = layers.Conv1D(64, 5, activation='relu', padding='same')(x)
    x = layers.MaxPooling1D(2)(x)
    x = layers.Conv1D(128, 3, activation='relu', padding='same')(x)
    x = layers.GlobalAveragePooling1D()(x)
    
    # Fully connected
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    output = layers.Dense(1, activation='sigmoid')(x)
    
    model = keras.Model(inputs, output)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='binary_crossentropy',
        metrics=['accuracy', keras.metrics.AUC(name='auc')]
    )
    return model


def generate_training_data(n_samples: int = 2000):
    """Generate balanced synthetic dataset for training."""
    print(f"Generating {n_samples} synthetic light curves...")
    X, y = [], []
    
    for i in range(n_samples):
        has_planet = (i % 2 == 0)
        noise = np.random.uniform(0.0005, 0.003)
        lc = generate_synthetic_lightcurve(has_planet=has_planet, noise_level=noise)
        
        segments, _, _ = preprocess_pipeline(lc['time'], lc['flux'], lc['flux_err'])
        
        for seg in segments:
            X.append(seg)
            y.append(1 if has_planet else 0)
        
        if i % 200 == 0:
            print(f"  {i}/{n_samples} generated...")
    
    return np.array(X), np.array(y)


def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    X, y = generate_training_data(n_samples=2000)
    print(f"Dataset: {X.shape}, Labels: {np.bincount(y)}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = build_1d_cnn(input_length=SEGMENT_LENGTH)
    model.summary()
    
    callbacks = [
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3),
        keras.callbacks.ModelCheckpoint(
            os.path.join(MODEL_DIR, 'exoplanet_cnn.keras'),
            save_best_only=True
        )
    ]
    
    history = model.fit(
        X_train, y_train,
        validation_split=0.15,
        epochs=30,
        batch_size=64,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate
    y_pred_prob = model.predict(X_test).flatten()
    y_pred = (y_pred_prob > 0.5).astype(int)
    
    print("\n=== TEST RESULTS ===")
    print(classification_report(y_test, y_pred, target_names=['No Planet', 'Planet']))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_pred_prob):.4f}")
    
    model.save(os.path.join(MODEL_DIR, 'exoplanet_cnn.keras'))
    print(f"\nModel saved to {MODEL_DIR}/exoplanet_cnn.keras")
    return model


if __name__ == '__main__':
    train_model()