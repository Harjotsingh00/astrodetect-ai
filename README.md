# 🪐 AstroDetect AI — Exoplanet Detection from Light Curves
### Bharatiya Antariksh Hackathon 2026 | Challenge 07 | ISRO

## Problem Statement
Detect exoplanets from noisy astronomical light curves using AI/ML.

## Solution
A full-stack AI system using a 1D-CNN (Shallue & Vanderburg architecture)
to classify stellar light curves from NASA Kepler and TESS missions.

## Key Features
- 1D-CNN trained on realistic synthetic + Kepler light curves
- Stellar detrending, normalization, gap interpolation preprocessing
- Transit time detection via peak-finding on processed flux
- Period estimation from multi-transit spacing
- Real-time NASA Kepler/TESS data fetch via Lightkurve
- CSV upload support for custom light curves
- Interactive React dashboard with live charts

## Architecture
- Backend: Python, FastAPI, TensorFlow, Lightkurve, SciPy
- Frontend: React, Vite, Recharts, Tailwind CSS
- Model: 1D-CNN → 128-node FC → Sigmoid (binary classification)

## Results
- ROC-AUC: ~0.95+ on synthetic test set
- Trained on 2000 synthetic Kepler-like light curves (balanced)

## How to Run
See full setup guide in project documentation.

## References
- Shallue & Vanderburg (2018) — "Identifying Exoplanets with Deep Learning"
- NASA Kepler Mission data
- Lightkurve Python package