<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&pause=1000&color=6366F1&center=true&vCenter=true&width=700&lines=🪐+AstroDetect+AI;AI-Powered+Exoplanet+Detection;Bharatiya+Antariksh+Hackathon+2026" alt="Typing SVG" />

<br/>

[![ISRO BAH 2026](https://img.shields.io/badge/ISRO-BAH%202026-indigo?style=for-the-badge&logo=nasa&logoColor=white)](https://hack2skill.com/event/bah2026/)
[![Challenge](https://img.shields.io/badge/Challenge-07%20Exoplanet%20Detection-purple?style=for-the-badge)](https://hack2skill.com/event/bah2026/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17-orange?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)

<br/>

> **Detecting worlds beyond our solar system using deep learning on noisy stellar light curves**  
> Built for the Bharatiya Antariksh Hackathon 2026 by ISRO · Challenge 07

<br/>

![Demo Screenshot](https://via.placeholder.com/900x480/0a0a14/6366f1?text=AstroDetect+AI+Dashboard)

</div>

---

## 🌌 The Problem

Every planet discovered outside our solar system represents a monumental achievement. The **transit method** — detecting the minuscule dip in a star's brightness as a planet passes in front of it — has uncovered over **5,500 confirmed exoplanets**. NASA's Kepler mission alone monitored **150,000+ stars** continuously for 4 years, generating terabytes of light curve data.

**The challenge?** Real stellar light curves are brutally noisy:
- Intrinsic stellar variability (starspots, pulsations, flares)
- Instrument systematics and pointing jitter
- Cosmic ray impacts
- Transit depth as tiny as **84 parts per million** (Earth transiting the Sun)

Manual inspection is impossible at scale. Human astronomers simply cannot review 150,000 stars. **We need AI.**

---

## 🚀 Our Solution — AstroDetect AI

A **full-stack AI system** that automatically scans stellar light curves, extracts transit signatures, and classifies exoplanet candidates with confidence — all in real-time.

```
Light Curve Data  →  Preprocessing  →  BLS Period Search  →  1D-CNN  →  Planet / No Planet
   (Kepler/TESS)     (Detrend+Norm)     (BLS Periodogram)    (Deep Learning)   + Confidence %
```

### Why This Approach Works

| Component | Purpose | Why It's the Right Choice |
|-----------|---------|--------------------------|
| **Lightkurve** | Data ingestion | Official NASA-endorsed Python package for Kepler/TESS |
| **Median Filter Detrending** | Stellar variability removal | Preserves transit shape while removing long-term trends |
| **Box Least Squares (BLS)** | Period detection | Gold-standard algorithm (Kovács et al. 2002) used by professional astronomers |
| **1D-CNN** | Classification | Directly processes flux time series; captures local transit morphology |
| **Bootstrap CI** | Uncertainty quantification | Rigorous statistical confidence via 50-sample resampling |
| **Ensemble Voting** | Final prediction | Averages predictions across overlapping windows for robustness |

---

## 🧠 Model Architecture

Inspired by **Shallue & Vanderburg (2018)** — *"Identifying Exoplanets with Deep Learning"* (Google Brain × Harvard CfA):

```
Input: 200-point flux segment (normalized, detrended)
    │
    ▼
┌─────────────────────────────────────┐
│  Conv1D(16 filters, k=5) + ReLU     │  ← Local pattern detection
│  MaxPool1D(stride=2)                │
│  Conv1D(32 filters, k=5) + ReLU     │  ← Mid-scale features
│  MaxPool1D(stride=2)                │
│  Conv1D(64 filters, k=5) + ReLU     │  ← Abstract representations
│  MaxPool1D(stride=2)                │
│  Conv1D(128 filters, k=3) + ReLU    │  ← High-level transit features
│  GlobalAveragePooling1D             │  ← Spatial aggregation
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Dense(256) + ReLU + Dropout(0.4)   │  ← Feature combination
│  Dense(128) + ReLU + Dropout(0.3)   │
│  Dense(1)   + Sigmoid               │  ← Planet probability [0, 1]
└─────────────────────────────────────┘
    │
    ▼
Output: P(exoplanet) → Classification + Confidence Interval
```

**Segmentation strategy:** A single light curve (~1000 points) is split into overlapping 200-point windows (50-point overlap). Each window is independently classified. The final prediction is a **weighted ensemble vote** across all windows — this makes the model robust to partial transit data and irregular cadence gaps.

---

## ✨ Key Features

### 🔬 Advanced Signal Processing Pipeline
- **Median filter detrending** — removes stellar variability without distorting transit shape
- **Gap interpolation** — handles missing cadences via linear interpolation
- **Sigma clipping** — removes cosmic ray outliers (5σ threshold)
- **Flux normalization** — zero-mean, unit-variance standardization per segment

### 📡 Box Least Squares (BLS) Periodogram
- Searches 5,000 trial periods from 0.5–50 days
- Multiple transit duration fractions tested per period
- **Phase-folded light curve** at best period — visually confirms transit signal
- Returns top-5 candidate periods with SNR scores

### 📊 Bootstrap Confidence Intervals
- 50-sample resampling with Gaussian noise perturbation
- 90% confidence interval on detection probability
- Reports mean ± std of bootstrap distribution

### 🌐 Full-Stack Production Application
- **REST API** with 10 endpoints (FastAPI + auto-generated Swagger docs)
- **React dashboard** with 4 pages: Detect / Model Stats / History / About
- **NASA archive integration** via Lightkurve (Kepler + TESS real data)
- **CSV upload** for any custom light curve data
- **Animated star-field UI** with glassmorphism design
- **Detection history** with CSV export
- **Live model evaluation** — accuracy, ROC-AUC, confusion matrix, probability distribution

---

## 📈 Results

| Metric | Score |
|--------|-------|
| **Accuracy** | ~95% |
| **ROC-AUC** | ~0.97 |
| **Precision** | ~94% |
| **Recall** | ~96% |
| **F1 Score** | ~95% |

*Evaluated on 200 held-out synthetic light curves balanced between planet / no-planet classes, spanning noise levels from 0.05% to 0.3% (realistic Kepler/TESS range).*

---

## 🛠️ Tech Stack

```
Backend                          Frontend
──────────────────────────────   ──────────────────────────────
Python 3.11                      React 18 + Vite
FastAPI 0.115                    React Router DOM
TensorFlow 2.17 / Keras          Recharts (visualization)
Lightkurve 2.4                   Tailwind CSS
SciPy (BLS + signal processing)  Axios
NumPy / Pandas                   Canvas API (star field)
Astropy                          LocalStorage (history)
Uvicorn (ASGI server)
```

---

## 📁 Project Structure

```
astrodetect/
├── 📂 backend/
│   ├── main.py                    # FastAPI app — 10 REST endpoints
│   ├── requirements.txt
│   ├── 📂 data/
│   │   └── fetch_data.py          # NASA Kepler/TESS fetcher + synthetic generator
│   ├── 📂 model/
│   │   ├── train.py               # 1D-CNN training script
│   │   ├── predict.py             # Inference engine + ensemble voting
│   │   ├── preprocess.py          # Full signal processing pipeline
│   │   ├── bls.py                 # Box Least Squares periodogram
│   │   └── model_stats.py         # Evaluation — ROC, confusion matrix, F1
│   └── 📂 models/
│       └── exoplanet_cnn.keras    # Trained model weights
│
└── 📂 frontend/
    └── 📂 src/
        ├── App.jsx                # Router + layout
        ├── 📂 pages/
        │   ├── HomePage.jsx       # Main detection dashboard
        │   ├── ModelStatsPage.jsx # Live model evaluation
        │   ├── HistoryPage.jsx    # Detection log + CSV export
        │   └── AboutPage.jsx      # Architecture + references
        └── 📂 components/
            ├── NavBar.jsx
            ├── StarField.jsx      # Animated canvas background
            ├── StatsPanel.jsx
            ├── UploadPanel.jsx    # Demo / Fetch / Upload tabs
            ├── ResultCard.jsx     # Detection result display
            ├── LightCurveChart.jsx
            ├── BLSChart.jsx       # Periodogram + phase fold
            └── ConfidenceBar.jsx  # Bootstrap CI visualization
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone & Setup Backend

```bash
git clone <your-repo-url>
cd astrodetect/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Train the Model

```bash
# Inside backend/ with venv active
python model/train.py
```

> ⏱️ Takes ~5–10 minutes. Trains on 2,000 synthetic light curves.  
> Saves `models/exoplanet_cnn.keras` when complete.

### 3. Start the Backend

```bash
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 4. Setup & Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open: **`http://localhost:5173`** 🚀

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/demo/{scenario}` | Generate synthetic light curve (`planet` / `no_planet` / `noisy`) |
| `POST` | `/predict` | Run CNN detection on provided light curve data |
| `POST` | `/predict/demo/{scenario}` | Generate + detect in one call |
| `POST` | `/predict/upload` | Upload CSV file for detection |
| `POST` | `/fetch` | Fetch real Kepler/TESS light curve by target name |
| `POST` | `/bls` | Run BLS periodogram on light curve |
| `POST` | `/bls/demo/{scenario}` | BLS on synthetic data |
| `POST` | `/confidence` | Bootstrap confidence intervals |
| `GET` | `/model/stats` | Full model evaluation (accuracy, ROC, confusion matrix) |
| `GET` | `/health` | Health check |

---

## 🎯 How to Use

### Option 1 — Demo Mode
Click **"Run Full Analysis"** with any synthetic scenario. Instantly runs detection + BLS + confidence estimation with ground truth comparison.

### Option 2 — Fetch Real Star
Enter any Kepler/TESS target name (e.g. `Kepler-22`, `K2-18`, `Kepler-452`) and click **"Fetch & Analyze"**. Downloads real NASA archive data and runs the full pipeline.

### Option 3 — Upload CSV
Upload any CSV with `time`, `flux`, `flux_err` columns — works with Kepler FITS-exported data or any custom photometry.

---

## 🔭 Real Exoplanets to Try

| Target | Planet | Period | Notes |
|--------|--------|--------|-------|
| `Kepler-22` | Kepler-22b | 289.9 days | First potentially habitable-zone planet |
| `Kepler-452` | Kepler-452b | 384.8 days | Earth's "older cousin" |
| `K2-18` | K2-18b | 32.9 days | Sub-Neptune with detected water vapor |
| `Kepler-7` | Kepler-7b | 4.9 days | Hot Jupiter, highly reflective |

---

## 📚 Scientific References

1. **Shallue & Vanderburg (2018)** — *"Identifying Exoplanets with Deep Learning: A Five-planet Resonant Chain around Kepler-80"* — The Astronomical Journal, 155, 94. The foundational paper this architecture is based on.

2. **Kovács, Zucker & Mazeh (2002)** — *"A box-fitting algorithm in the search for periodic transits"* — Astronomy & Astrophysics. The original BLS paper.

3. **Borucki et al. (2010)** — *"Kepler Planet-Detection Mission: Introduction and First Results"* — Science, 327, 977.

4. **Lightkurve Collaboration (2018)** — *"Lightkurve: Kepler and TESS time series analysis in Python"* — Astrophysics Source Code Library.

5. **Ricker et al. (2015)** — *"Transiting Exoplanet Survey Satellite (TESS)"* — Journal of Astronomical Telescopes, Instruments, and Systems.

---

## 🙏 Acknowledgements

- **ISRO** for organizing the Bharatiya Antariksh Hackathon 2026 and providing this incredible opportunity
- **NASA** for the Kepler and TESS missions and open data policy
- **Hack2Skill** for the platform and support
- The open-source Python astronomy community — Lightkurve, Astropy, SciPy

---

<div align="center">

**Built with ❤️ for India's space future**

*Bharatiya Antariksh Hackathon 2026 · Challenge 07 · ISRO*

[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange?style=for-the-badge)](https://isro.gov.in)
[![BAH 2026](https://img.shields.io/badge/BAH-2026-indigo?style=for-the-badge)](https://hack2skill.com/event/bah2026/)

</div>
