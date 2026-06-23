import numpy as np
from scipy.signal import medfilt
from scipy.interpolate import interp1d

def normalize_flux(flux: np.ndarray) -> np.ndarray:
    """Normalize flux to zero mean, unit std."""
    median = np.median(flux)
    std = np.std(flux)
    if std == 0:
        return flux - median
    return (flux - median) / std

def remove_stellar_trend(flux: np.ndarray, window: int = 51) -> np.ndarray:
    """Remove long-term stellar variability using median filter."""
    if window % 2 == 0:
        window += 1
    trend = medfilt(flux, kernel_size=min(window, len(flux) if len(flux) % 2 == 1 else len(flux)-1))
    return flux / (trend + 1e-10)

def interpolate_gaps(time: np.ndarray, flux: np.ndarray, flux_err: np.ndarray):
    """Fill in gaps in the time series via linear interpolation."""
    dt = np.median(np.diff(time))
    t_uniform = np.arange(time[0], time[-1], dt)
    
    f_interp = interp1d(time, flux, kind='linear', fill_value='extrapolate')
    e_interp = interp1d(time, flux_err, kind='linear', fill_value='extrapolate')
    
    flux_uniform = f_interp(t_uniform)
    err_uniform = e_interp(t_uniform)
    
    return t_uniform, flux_uniform, err_uniform

def segment_lightcurve(flux: np.ndarray, segment_length: int = 200, overlap: int = 50):
    """
    Split flux into overlapping segments for CNN input.
    Returns array of shape (n_segments, segment_length, 1)
    """
    segments = []
    step = segment_length - overlap
    for start in range(0, len(flux) - segment_length + 1, step):
        seg = flux[start:start + segment_length]
        seg_norm = normalize_flux(seg)
        segments.append(seg_norm)
    
    if not segments:
        # Pad if too short
        padded = np.zeros(segment_length)
        padded[:len(flux)] = normalize_flux(flux)
        segments.append(padded)
    
    return np.array(segments).reshape(-1, segment_length, 1)

def preprocess_pipeline(time_list, flux_list, flux_err_list):
    """Full preprocessing pipeline."""
    time = np.array(time_list)
    flux = np.array(flux_list)
    flux_err = np.array(flux_err_list)
    
    # Remove NaNs
    mask = ~(np.isnan(flux) | np.isnan(time))
    time, flux, flux_err = time[mask], flux[mask], flux_err[mask]
    
    # Remove stellar trends
    flux_detrended = remove_stellar_trend(flux)
    
    # Normalize
    flux_norm = normalize_flux(flux_detrended)
    
    # Segment
    segments = segment_lightcurve(flux_norm)
    
    return segments, flux_norm.tolist(), time.tolist()