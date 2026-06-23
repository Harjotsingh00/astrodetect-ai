import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function UploadPanel({ onResult, onLightCurve, setLoading, setBlsResult, setCiResult }) {
  const [activeTab, setActiveTab] = useState('demo')
  const [scenario, setScenario] = useState('planet')
  const [target, setTarget] = useState('Kepler-22')
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  async function runAll(time, flux, flux_err, target_name) {
    const [predRes, blsRes, ciRes] = await Promise.all([
      axios.post(`${API}/predict`, { time, flux, flux_err, target_name }),
      axios.post(`${API}/bls`, { time, flux, flux_err }),
      axios.post(`${API}/confidence`, { time, flux, flux_err })
    ])
    onResult(predRes.data)
    setBlsResult(blsRes.data)
    setCiResult(ciRes.data)

    // Save to history
    const history = JSON.parse(localStorage.getItem('astro_history') || '[]')
    history.unshift({
      id: Date.now(),
      target: target_name,
      probability: predRes.data.probability,
      classification: predRes.data.classification,
      color: predRes.data.color,
      period: blsRes.data.best_period,
      transits: predRes.data.transits_detected,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('astro_history', JSON.stringify(history.slice(0, 50)))
  }

  async function runDemo() {
    setLoading(true); setError(null)
    try {
      const lcRes = await axios.get(`${API}/demo/${scenario}`)
      onLightCurve(lcRes.data)
      await runAll(lcRes.data.time, lcRes.data.flux, lcRes.data.flux_err, `Synthetic-${scenario}`)
    } catch (e) { setError(e.response?.data?.detail || e.message) }
    finally { setLoading(false) }
  }

  async function fetchTarget() {
    setLoading(true); setError(null)
    try {
      const lcRes = await axios.post(`${API}/fetch`, { target_name: target })
      onLightCurve(lcRes.data)
      await runAll(lcRes.data.time, lcRes.data.flux, lcRes.data.flux_err, target)
    } catch (e) { setError(e.response?.data?.detail || e.message) }
    finally { setLoading(false) }
  }

  async function uploadCSV() {
    if (!file) return
    setLoading(true); setError(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const predRes = await axios.post(`${API}/predict/upload`, form)
      onResult(predRes.data)
      setBlsResult(null); setCiResult(null)
    } catch (e) { setError(e.response?.data?.detail || e.message) }
    finally { setLoading(false) }
  }

  const glass = { background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '24px' }
  const btn = (active) => ({ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#475569' })
  const primaryBtn = (color = '#4f46e5') => ({ width: '100%', padding: '12px', borderRadius: '10px', background: color, color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' })
  const inp = { width: '100%', background: 'rgba(4,4,15,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '11px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={glass}>
      <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>🔭 Input Light Curve</div>

      <div style={{ display: 'flex', gap: '3px', background: 'rgba(4,4,15,0.6)', borderRadius: '10px', padding: '3px', marginBottom: '18px' }}>
        {[{ id: 'demo', label: '🎯 Demo' }, { id: 'fetch', label: '🛰️ Fetch' }, { id: 'upload', label: '📂 Upload' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...btn(activeTab === t.id), flex: 1 }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'demo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { val: 'planet', label: '🪐 With Planet', desc: 'Clean transit' },
            { val: 'no_planet', label: '⭐ No Planet', desc: 'Pure noise' },
            { val: 'noisy', label: '📡 Noisy Planet', desc: 'High noise' },
          ].map(s => (
            <div key={s.val} onClick={() => setScenario(s.val)} style={{
              padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
              border: `1px solid ${scenario === s.val ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.1)'}`,
              background: scenario === s.val ? 'rgba(99,102,241,0.1)' : 'rgba(4,4,15,0.4)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{s.label}</span>
              <span style={{ color: '#475569', fontSize: '11px' }}>{s.desc}</span>
            </div>
          ))}
          <button onClick={runDemo} style={primaryBtn()}>Run Full Analysis →</button>
        </div>
      )}

      {activeTab === 'fetch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input value={target} onChange={e => setTarget(e.target.value)} style={inp} placeholder="Kepler-22, K2-18, Kepler-452..." />
          <div style={{ color: '#334155', fontSize: '11px' }}>Try: Kepler-22 · Kepler-7 · K2-18</div>
          <button onClick={fetchTarget} style={primaryBtn('#7c3aed')}>Fetch & Analyze →</button>
        </div>
      )}

      {activeTab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => document.getElementById('csv-up').click()} style={{
            border: '1px dashed rgba(99,102,241,0.25)', borderRadius: '12px', padding: '28px',
            textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(99,102,241,0.06)' : 'transparent'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>📁</div>
            <div style={{ color: file ? '#a5b4fc' : '#334155', fontSize: '13px', fontWeight: '600' }}>{file ? file.name : 'Click to upload CSV'}</div>
            <div style={{ color: '#1e293b', fontSize: '11px', marginTop: '4px' }}>Columns: time, flux, flux_err</div>
            <input id="csv-up" type="file" accept=".csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          </div>
          <button onClick={uploadCSV} disabled={!file} style={primaryBtn(file ? '#059669' : '#1e293b')}>Analyze →</button>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '10px', padding: '11px 14px', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}