export default function AboutPage() {
    const glass = { background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>About AstroDetect AI</h1>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '28px' }}>Bharatiya Antariksh Hackathon 2026 · Challenge 07 · ISRO</p>

            <div style={glass}>
                <h2 style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>🎯 Problem Statement</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8 }}>
                    Challenge 07 of BAH 2026 tasks participants with building an AI system capable of detecting exoplanets from noisy astronomical light curves.
                    The transit method — detecting the tiny dip in stellar brightness as a planet crosses its star — is the most successful exoplanet discovery technique,
                    responsible for over 3,800 confirmed discoveries via NASA's Kepler mission alone. The challenge is that real light curves contain significant noise
                    from stellar variability, instrument systematics, and cosmic ray impacts.
                </p>
            </div>

            <div style={glass}>
                <h2 style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>🧠 Model Architecture</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                        { layer: 'Input', detail: '200-point flux segment', color: '#6366f1' },
                        { layer: 'Conv1D ×4', detail: '16→32→64→128 filters', color: '#8b5cf6' },
                        { layer: 'MaxPool ×3', detail: 'Stride 2, dim reduction', color: '#a855f7' },
                        { layer: 'GlobalAvgPool', detail: 'Spatial aggregation', color: '#c084fc' },
                        { layer: 'Dense ×2', detail: '256 → 128 neurons', color: '#d946ef' },
                        { layer: 'Sigmoid', detail: 'Planet probability', color: '#ec4899' },
                    ].map(l => (
                        <div key={l.layer} style={{ background: `${l.color}11`, border: `1px solid ${l.color}33`, borderRadius: '10px', padding: '14px' }}>
                            <div style={{ color: l.color, fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{l.layer}</div>
                            <div style={{ color: '#475569', fontSize: '12px' }}>{l.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={glass}>
                <h2 style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>📚 References</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { title: 'Shallue & Vanderburg (2018)', detail: '"Identifying Exoplanets with Deep Learning: A Five-planet Resonant Chain around Kepler-80" — The Astronomical Journal', color: '#60a5fa' },
                        { title: 'NASA Kepler Mission', detail: 'Primary data source — 4 years of continuous photometry on 150,000+ stars', color: '#34d399' },
                        { title: 'NASA TESS Mission', detail: 'Transiting Exoplanet Survey Satellite — successor to Kepler, all-sky survey', color: '#f59e0b' },
                        { title: 'Lightkurve (2018)', detail: 'Python package for Kepler & TESS time series analysis — Barentsen et al.', color: '#c084fc' },
                        { title: 'BLS Algorithm — Kovács et al. (2002)', detail: 'Box Least Squares — gold standard for periodic transit detection in photometric data', color: '#fb7185' },
                    ].map(r => (
                        <div key={r.title} style={{ borderLeft: `3px solid ${r.color}`, paddingLeft: '14px' }}>
                            <div style={{ color: r.color, fontWeight: '600', fontSize: '13px' }}>{r.title}</div>
                            <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>{r.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={glass}>
                <h2 style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>⚙️ Tech Stack</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                        { cat: 'ML Framework', val: 'TensorFlow 2.17 + Keras' },
                        { cat: 'Backend API', val: 'FastAPI + Uvicorn' },
                        { cat: 'Frontend', val: 'React + Vite + Recharts' },
                        { cat: 'Data Source', val: 'NASA Kepler/TESS via Lightkurve' },
                        { cat: 'Period Search', val: 'Box Least Squares (BLS)' },
                        { cat: 'Uncertainty', val: 'Bootstrap CI (50 samples)' },
                    ].map(t => (
                        <div key={t.cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(99,102,241,0.05)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.1)' }}>
                            <span style={{ color: '#475569', fontSize: '12px' }}>{t.cat}</span>
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{t.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}