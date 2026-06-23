from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import json, io, csv, os

from data.fetch_data import generate_synthetic_lightcurve, fetch_kepler_lightcurve
from model.predict import predict_exoplanet
from model.bls import box_least_squares, compute_confidence_intervals
from model.model_stats import evaluate_model

app = FastAPI(
    title="AstroDetect AI Pro",
    description="AI Exoplanet Detection — Bharatiya Antariksh Hackathon 2026",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LightCurveInput(BaseModel):
    time: List[float]
    flux: List[float]
    flux_err: Optional[List[float]] = None
    target_name: Optional[str] = "Unknown"

class TargetQuery(BaseModel):
    target_name: str
    quarter: Optional[int] = None


@app.get("/")
def root():
    return {"message": "AstroDetect AI Pro v2.0", "status": "running", "hackathon": "BAH 2026"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/demo/{scenario}")
def get_demo(scenario: str):
    mapping = {
        "planet": (True, 0.001),
        "no_planet": (False, 0.001),
        "noisy": (True, 0.005)
    }
    if scenario not in mapping:
        raise HTTPException(status_code=400, detail="scenario must be: planet, no_planet, or noisy")
    has_planet, noise = mapping[scenario]
    return generate_synthetic_lightcurve(has_planet=has_planet, noise_level=noise)

@app.post("/predict")
def predict(data: LightCurveInput):
    try:
        flux_err = data.flux_err or [0.001] * len(data.flux)
        result = predict_exoplanet(data.time, data.flux, flux_err)
        result["target_name"] = data.target_name
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/demo/{scenario}")
def predict_demo(scenario: str):
    mapping = {
        "planet": (True, 0.001),
        "no_planet": (False, 0.001),
        "noisy": (True, 0.005)
    }
    if scenario not in mapping:
        raise HTTPException(status_code=400, detail="Invalid scenario")
    has_planet, noise = mapping[scenario]
    lc = generate_synthetic_lightcurve(has_planet=has_planet, noise_level=noise)
    result = predict_exoplanet(lc['time'], lc['flux'], lc['flux_err'])
    result["ground_truth"] = lc.get('has_planet')
    result["true_metadata"] = lc.get('metadata', {})
    result["target_name"] = f"Synthetic-{scenario}"
    return result

@app.post("/predict/upload")
async def predict_upload(file: UploadFile = File(...)):
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    time, flux, flux_err = [], [], []
    for row in reader:
        try:
            time.append(float(row.get('time', row.get('TIME', 0))))
            flux.append(float(row.get('flux', row.get('FLUX', 1))))
            err_val = row.get('flux_err', row.get('FLUX_ERR', 0.001))
            flux_err.append(float(err_val) if err_val else 0.001)
        except (ValueError, KeyError):
            continue
    if len(flux) < 50:
        raise HTTPException(status_code=400, detail="Need at least 50 data points.")
    result = predict_exoplanet(time, flux, flux_err)
    result["target_name"] = file.filename
    return result

@app.post("/fetch")
def fetch_target(query: TargetQuery):
    data, error = fetch_kepler_lightcurve(query.target_name, query.quarter)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return data

@app.post("/bls")
def run_bls(data: LightCurveInput):
    """Run Box Least Squares periodogram on a light curve."""
    try:
        flux_err = data.flux_err or [0.001] * len(data.flux)
        result = box_least_squares(data.time, data.flux)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bls/demo/{scenario}")
def run_bls_demo(scenario: str):
    mapping = {"planet": (True, 0.001), "no_planet": (False, 0.001), "noisy": (True, 0.005)}
    if scenario not in mapping:
        raise HTTPException(status_code=400, detail="Invalid scenario")
    has_planet, noise = mapping[scenario]
    lc = generate_synthetic_lightcurve(has_planet=has_planet, noise_level=noise)
    return box_least_squares(lc['time'], lc['flux'])

@app.post("/confidence")
def run_confidence(data: LightCurveInput):
    """Bootstrap confidence intervals on detection probability."""
    try:
        flux_err = data.flux_err or [0.001] * len(data.flux)
        ci = compute_confidence_intervals(data.time, data.flux, flux_err, predict_exoplanet, n_bootstrap=30)
        return ci
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/stats")
def get_model_stats():
    """Evaluate model and return performance metrics."""
    try:
        stats = evaluate_model(n_samples=100)
        if not stats:
            raise HTTPException(status_code=503, detail="Model not trained yet.")
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    return {
        "model": "1D-CNN (Shallue & Vanderburg 2018)",
        "version": "2.0.0",
        "features": ["BLS Periodogram", "Transit Folding", "Bootstrap CI", "Model Evaluation"],
        "missions": ["Kepler", "TESS"],
        "hackathon": "BAH 2026 — Challenge 07"
    }