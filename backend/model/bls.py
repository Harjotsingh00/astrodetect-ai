import numpy as np
from scipy.signal import find_peaks

def box_least_squares(time, flux, min_period=0.5, max_period=50.0, n_periods=5000):
    """
    Box Least Squares (BLS) periodogram.
    Gold-standard algorithm for detecting transit-like signals.
    Returns periods, power spectrum, and best-fit parameters.
    """
    time = np.array(time)
    flux = np.array(flux)
    flux = flux - np.median(flux)

    periods = np.linspace(min_period, max_period, n_periods)
    power = np.zeros(n_periods)

    duration_fracs = [0.01, 0.02, 0.05, 0.1]

    for i, period in enumerate(periods):
        phase = (time % period) / period
        best_snr = 0

        for dur_frac in duration_fracs:
            for phase_offset in np.linspace(0, 1, 20):
                in_transit = (
                    ((phase - phase_offset) % 1 < dur_frac) |
                    ((phase - phase_offset) % 1 > 1 - dur_frac)
                )
                if in_transit.sum() < 3:
                    continue

                depth = np.mean(flux[in_transit]) - np.mean(flux[~in_transit])
                n_in = in_transit.sum()
                n_out = (~in_transit).sum()

                if n_out == 0:
                    continue

                sigma_in = np.std(flux[in_transit]) / np.sqrt(n_in)
                sigma_out = np.std(flux[~in_transit]) / np.sqrt(n_out)
                denom = np.sqrt(sigma_in**2 + sigma_out**2)

                if denom > 0:
                    snr = abs(depth) / denom
                    if snr > best_snr:
                        best_snr = snr

        power[i] = best_snr

    # Find best period
    best_idx = np.argmax(power)
    best_period = float(periods[best_idx])
    best_power = float(power[best_idx])

    # Find peaks in periodogram
    peaks, props = find_peaks(power, height=np.percentile(power, 90), distance=30)
    top_periods = [(float(periods[p]), float(power[p])) for p in peaks[:5]]
    top_periods.sort(key=lambda x: -x[1])

    # Phase fold at best period
    phase_fold = ((time - time[0]) % best_period) / best_period
    sort_idx = np.argsort(phase_fold)
    folded_phase = phase_fold[sort_idx].tolist()
    folded_flux = flux[sort_idx].tolist()

    # Bin the folded curve
    n_bins = 50
    bin_edges = np.linspace(0, 1, n_bins + 1)
    bin_centers = 0.5 * (bin_edges[:-1] + bin_edges[1:])
    binned_flux = []
    for j in range(n_bins):
        mask = (phase_fold >= bin_edges[j]) & (phase_fold < bin_edges[j+1])
        binned_flux.append(float(np.mean(flux[mask])) if mask.sum() > 0 else 0.0)

    return {
        "periods": periods[::10].tolist(),
        "power": power[::10].tolist(),
        "best_period": round(best_period, 4),
        "best_power": round(best_power, 4),
        "top_periods": top_periods,
        "folded_phase": folded_phase[:300],
        "folded_flux": folded_flux[:300],
        "binned_phase": bin_centers.tolist(),
        "binned_flux": binned_flux,
        "snr": round(best_power, 2)
    }


def compute_confidence_intervals(time, flux, flux_err, predict_fn, n_bootstrap=50):
    """
    Bootstrap confidence intervals on the exoplanet probability.
    Resamples the light curve with noise perturbation n_bootstrap times.
    """
    n = len(flux)
    probs = []

    for _ in range(n_bootstrap):
        noise = np.random.normal(0, np.array(flux_err))
        flux_boot = np.array(flux) + noise
        try:
            result = predict_fn(time, flux_boot.tolist(), flux_err)
            probs.append(result["probability"])
        except Exception:
            continue

    if not probs:
        return {"mean": 0.5, "std": 0.1, "ci_low": 0.4, "ci_high": 0.6, "n_bootstrap": 0}

    probs = np.array(probs)
    return {
        "mean": round(float(np.mean(probs)), 4),
        "std": round(float(np.std(probs)), 4),
        "ci_low": round(float(np.percentile(probs, 5)), 4),
        "ci_high": round(float(np.percentile(probs, 95)), 4),
        "n_bootstrap": len(probs)
    }