import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const API = 'http://localhost:8000'
const glass = { background: 'rgba(15,15,35,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', padding: '24px' }
const tooltip = { contentStyle: { background: '#0a0a14', border: '1px solid #1e2a4a', borderRadius: '8px', color: 'white', fontSize: '12px' } }

export default function ModelStatsPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function loadStats() {
        setLoading(true); setError(null)
        try {
            const res = await axios.get(`${API}/model/stats`)
            setStats(res.data)
        } catch (e) { setError(e.response?.data?.detail || e.message) }
        finally { setLoading(false) }
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>Model Performance</h1>
                    <p style={{ color: '#475569', fontSize: '14px' }}>1D-CNN evaluation on held-out synthetic test set</p>
                </div>
                <button onClick={loadStats} disabled={loading} style={{ padding: '10px 22px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                    {loading ? '⏳ Evaluating...' : '▶ Run Evaluation'}
                </button>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px' }}>⚠️ {error}</div>}

            {!stats && !loading && (
                <div style={{ ...glass, textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
                    <div style={{ color: '#334155', fontSize: '15px' }}>Click "Run Evaluation" to test the model on 100 fresh synthetic light curves</div>
                    <div style={{ color: '#1e293b', fontSize: '12px', marginTop: '6px' }}>Takes ~30 seconds</div>
                </div>
            )}

            {stats && (
                <>
                    {/* Key metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { label: 'Accuracy', value: `${(stats.accuracy * 100).toFixed(1)}%`, color: '#34d399' },
                            { label: 'Precision', value: `${(stats.precision * 100).toFixed(1)}%`, color: '#60a5fa' },
                            { label: 'Recall', value: `${(stats.recall * 100).toFixed(1)}%`, color: '#a78bfa' },
                            { label: 'F1 Score', value: `${(stats.f1 * 100).toFixed(1)}%`, color: '#f59e0b' },
                            { label: 'ROC-AUC', value: stats.auc.toFixed(3), color: '#fb7185' },
                        ].map(m => (
                            <div key={m.label} style={{ ...glass, textAlign: 'center' }}>
                                <div style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{m.label}</div>
                                <div style={{ color: m.color, fontSize: '28px', fontWeight: '900' }}>{m.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* Confusion Matrix */}
                        <div style={glass}>
                            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>Confusion Matrix</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { label: 'True Positive', value: stats.confusion_matrix.tp, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
                                    { label: 'False Positive', value: stats.confusion_matrix.fp, color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
                                    { label: 'False Negative', value: stats.confusion_matrix.fn, color: '#fbbf24', bg: 'rgba(234,179,8,0.1)' },
                                    { label: 'True Negative', value: stats.confusion_matrix.tn, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                                ].map(m => (
                                    <div key={m.label} style={{ background: m.bg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                                        <div style={{ color: m.color, fontSize: '32px', fontWeight: '900' }}>{m.value}</div>
                                        <div style={{ color: '#475569', fontSize: '11px', marginTop: '4px' }}>{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ROC Curve */}
                        <div style={glass}>
                            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>ROC Curve</div>
                            <div style={{ color: '#475569', fontSize: '12px', marginBottom: '12px' }}>AUC = {stats.auc.toFixed(3)}</div>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={stats.roc_curve}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#0f1729" />
                                    <XAxis dataKey="fpr" stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} label={{ value: 'FPR', fill: '#475569', position: 'insideBottom', offset: -2 }} />
                                    <YAxis stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} width={35} />
                                    <Tooltip {...tooltip} />
                                    <Line type="monotone" dataKey="tpr" stroke="#fb7185" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Probability distribution */}
                    <div style={glass}>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>Prediction Probability Distribution</div>
                        <div style={{ color: '#475569', fontSize: '12px', marginBottom: '14px' }}>Histogram of model output probabilities on test set</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={stats.prob_distribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#0f1729" />
                                <XAxis dataKey="bin" stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} />
                                <YAxis stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569' }} width={35} />
                                <Tooltip {...tooltip} />
                                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    )
}