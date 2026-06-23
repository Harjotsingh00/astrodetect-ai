import { useState } from 'react'
import StatsPanel from '../components/StatsPanel'
import UploadPanel from '../components/UploadPanel'
import LightCurveChart from '../components/LightCurveChart'
import ResultCard from '../components/ResultCard'
import BLSChart from '../components/BLSChart'
import ConfidenceBar from '../components/ConfidenceBar'

export default function HomePage() {
    const [result, setResult] = useState(null)
    const [lightCurve, setLightCurve] = useState(null)
    const [blsResult, setBlsResult] = useState(null)
    const [ciResult, setCiResult] = useState(null)
    const [loading, setLoading] = useState(false)

    return (
        <>
            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '52px 24px 36px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                    padding: '5px 16px', borderRadius: '999px', marginBottom: '20px', textTransform: 'uppercase'
                }}>
                    Bharatiya Antariksh Hackathon 2026 · Challenge 07
                </div>
                <h1 style={{ fontSize: '52px', fontWeight: '900', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                    AI Exoplanet Detection
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
                    1D-CNN model identifying transit signatures in noisy Kepler & TESS stellar light curves
                </p>
            </div>

            <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '32px 32px' }}>
                <StatsPanel />

                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>
                    {/* Left */}
                    <div>
                        <UploadPanel
                            onResult={setResult}
                            onLightCurve={setLightCurve}
                            setLoading={setLoading}
                            setBlsResult={setBlsResult}
                            setCiResult={setCiResult}
                        />
                        <Pipeline />
                    </div>

                    {/* Right */}
                    <div>
                        {loading && <LoadingCard />}
                        {!loading && !result && <EmptyState />}
                        {!loading && result && (
                            <>
                                <ResultCard result={result} />
                                {ciResult && <ConfidenceBar ci={ciResult} />}
                                <LightCurveChart lightCurve={lightCurve} result={result} />
                                {blsResult && <BLSChart bls={blsResult} />}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <footer style={{ textAlign: 'center', padding: '20px', color: '#1e293b', fontSize: '12px', borderTop: '1px solid #0f1729' }}>
                AstroDetect AI v2.0 · BAH 2026 · TensorFlow + FastAPI + React
            </footer>
        </>
    )
}

function LoadingCard() {
    return (
        <div style={{ background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔭</div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Scanning the stars...</div>
            <div style={{ color: '#475569', fontSize: '13px' }}>Running CNN inference · BLS Periodogram · Bootstrap CI</div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1',
                        animation: `bounce 1.2s ${i * 0.2}s infinite`
                    }} />
                ))}
            </div>
            <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
        </div>
    )
}

function EmptyState() {
    return (
        <div style={{ background: 'rgba(15,15,35,0.5)', backdropFilter: 'blur(12px)', border: '1px dashed rgba(99,102,241,0.2)', borderRadius: '16px', padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🪐</div>
            <div style={{ color: '#334155', fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>No analysis yet</div>
            <div style={{ color: '#1e293b', fontSize: '13px' }}>Choose a scenario or upload a light curve to begin detection</div>
        </div>
    )
}

function Pipeline() {
    const steps = [
        { n: '01', title: 'Ingest', desc: 'Kepler, TESS or CSV', color: '#6366f1' },
        { n: '02', title: 'Preprocess', desc: 'Detrend + normalize', color: '#8b5cf6' },
        { n: '03', title: 'BLS Scan', desc: 'Period detection', color: '#a855f7' },
        { n: '04', title: 'CNN Detect', desc: 'Transit classification', color: '#c084fc' },
    ]
    return (
        <div style={{ background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '20px', marginTop: '20px' }}>
            <div style={{ color: '#334155', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Detection Pipeline</div>
            {steps.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', gap: '12px', marginBottom: i < 3 ? '12px' : 0, alignItems: 'center' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: `${s.color}22`, color: s.color, fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</div>
                    <div style={{ flex: 1 }}>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{s.title}</span>
                        <span style={{ color: '#334155', fontSize: '12px', marginLeft: '8px' }}>{s.desc}</span>
                    </div>
                    {i < 3 && <div style={{ color: '#1e293b', fontSize: '16px' }}>↓</div>}
                </div>
            ))}
        </div>
    )
}