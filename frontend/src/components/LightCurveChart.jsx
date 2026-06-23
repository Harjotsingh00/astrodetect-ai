import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const card = {
  background: '#0f0f23',
  border: '1px solid #1e1e3a',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px'
}

export default function LightCurveChart({ lightCurve, result }) {
  if (!lightCurve) return null

  const { time, flux } = lightCurve
  const processedFlux = result?.flux_processed
  const cleanTime = result?.time_clean
  const transitTimes = result?.transit_times || []

  const rawData = time.slice(0, 500).map((t, i) => ({
    time: parseFloat(t.toFixed(2)),
    flux: parseFloat((flux[i] || 1).toFixed(5)),
  }))

  const processedData = processedFlux && cleanTime
    ? cleanTime.map((t, i) => ({
      time: parseFloat(t.toFixed(2)),
      processed: parseFloat((processedFlux[i] || 0).toFixed(5)),
    }))
    : []

  const tooltipStyle = {
    contentStyle: { background: '#0a0a14', border: '1px solid #1e2a4a', borderRadius: '8px', color: 'white', fontSize: '12px' }
  }

  return (
    <>
      <div style={card}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Raw Light Curve</div>
          <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>{time.length} data points · Flux vs Time (days)</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rawData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="time" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} />
            <YAxis stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} width={60} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="flux" stroke="#6366f1" dot={false} strokeWidth={1.5} />
            {transitTimes.map(t => (
              <ReferenceLine key={t} x={parseFloat(t.toFixed(2))} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {transitTimes.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '1px', background: '#fbbf24', borderTop: '1px dashed #fbbf24' }} />
            <span style={{ color: '#64748b', fontSize: '11px' }}>Transit events detected</span>
          </div>
        )}
      </div>

      {processedData.length > 0 && (
        <div style={card}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Detrended Signal</div>
            <div style={{ color: '#475569', fontSize: '12px', marginTop: '2px' }}>After stellar variability removal — CNN input</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="time" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} width={60} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="processed" stroke="#10b981" dot={false} strokeWidth={1.5} />
              {transitTimes.map(t => (
                <ReferenceLine key={t} x={parseFloat(t.toFixed(2))} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}