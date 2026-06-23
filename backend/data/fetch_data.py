import lightkurve as lk
import numpy as np
import pandas as pd
import os

def fetch_kepler_lightcurve(target_name: str, quarter: int = None):
    """
    Fetch a Kepler light curve for a given target.
    Returns time, flux, flux_err arrays.
    """
    try:
        search = lk.search_lightcurve(target_name, mission='Kepler', quarter=quarter)
        if len(search) == 0:
            search = lk.search_lightcurve(target_name, mission='TESS')
        if len(search) == 0:
            return None, "No light curve found for this target."
        
        lc = search[0].download()
        lc = lc.remove_nans().remove_outliers(sigma=5)
        lc = lc.normalize()
        
        time = lc.time.value.tolist()
        flux = lc.flux.value.tolist()
        flux_err = lc.flux_err.value.tolist() if lc.flux_err is not None else [0.001]*len(flux)
        
        return {
            "time": time,
            "flux": flux,
            "flux_err": flux_err,
            "target": target_name,
            "mission": "Kepler/TESS"
        }, None
    except Exception as e:
        return None, str(e)


def generate_synthetic_lightcurve(has_planet: bool = True, noise_level: float = 0.001):
    """
    Generate a synthetic light curve for demo/testing.
    Simulates realistic transit dips if has_planet=True.
    """
    np.random.seed(42)
    n_points = 1000
    time = np.linspace(0, 100, n_points)
    
    # Baseline flux with realistic stellar variability
    stellar_variability = 0.0005 * np.sin(2 * np.pi * time / 12.3)
    noise = np.random.normal(0, noise_level, n_points)
    flux = 1.0 + stellar_variability + noise
    
    transit_times = []
    if has_planet:
        period = np.random.uniform(10, 30)
        t0 = np.random.uniform(0, period)
        depth = np.random.uniform(0.005, 0.02)
        duration = np.random.uniform(0.1, 0.3)
        
        for t_center in np.arange(t0, 100, period):
            mask = np.abs(time - t_center) < duration / 2
            # Limb-darkened transit shape
            dt = (time[mask] - t_center) / (duration / 2)
            flux[mask] -= depth * (1 - dt**2)**0.5
            transit_times.append(float(t_center))
        
        metadata = {
            "period_days": round(period, 3),
            "transit_depth_ppm": round(depth * 1e6, 1),
            "transit_duration_hours": round(duration * 24, 2),
            "num_transits": len(transit_times)
        }
    else:
        metadata = {}
    
    flux_err = np.abs(np.random.normal(noise_level, noise_level * 0.1, n_points))
    
    return {
        "time": time.tolist(),
        "flux": flux.tolist(),
        "flux_err": flux_err.tolist(),
        "has_planet": has_planet,
        "metadata": metadata,
        "transit_times": transit_times
    }