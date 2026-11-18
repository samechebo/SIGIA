import { useState, useEffect } from 'react';
import { api } from '../api/client';

const HANDLERS = [
  {
    id: 'Operario',
    icon: '👷',
    nivel: 'STOCK_BAJO',
    desc: 'Notifica en panel del operario',
    badge: 'badge-stock_bajo',
  },
  {
    id: 'Supervisor',
    icon: '👔',
    nivel: 'AGOTADO',
    desc: 'Orden de reposición en ERP',
    badge: 'badge-agotado',
  },
  {
    id: 'Administrador',
    icon: '🏢',
    nivel: 'CRITICO',
    desc: 'Reporte urgente + proveedor',
    badge: 'badge-critico',
  },
];

const NIVELES = [
  { value: 'STOCK_BAJO', label: 'Stock Bajo',  icon: '⚠️' },
  { value: 'AGOTADO',    label: 'Agotado',     icon: '🔴' },
  { value: 'CRITICO',    label: 'Crítico',     icon: '🚨' },
];

const NIVEL_BORDER_COLOR = {
  STOCK_BAJO: '#f59e0b',
  AGOTADO:    '#f97316',
  CRITICO:    '#ef4444',
};

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function ChainViz({ animating, resolved }) {
  return (
    <div className="chain-viz">
      <div className="chain-viz-title">Chain of Responsibility — Cadena de Escalada de Alertas</div>
      <div className="chain-flow">
        {HANDLERS.map((h, i) => (
          <span key={h.id} style={{ display: 'contents' }}>
            <div
              className={`chain-handler${animating === h.id ? ' animating' : ''}${resolved === h.id ? ' resolved' : ''}`}
            >
              <div className="handler-icon">{h.icon}</div>
              <div className="handler-name">{h.id}</div>
              <div className="handler-desc">{h.desc}</div>
              <span className={`badge ${h.badge} handler-badge`}>
                {h.nivel.replace('_', ' ')}
              </span>
              {resolved === h.id && (
                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, marginTop: '0.4rem' }}>
                  ✓ Resolvió
                </span>
              )}
            </div>
            {i < HANDLERS.length - 1 && (
              <div className="chain-arrow">→</div>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombreProducto: '', stockActual: '', nivel: 'STOCK_BAJO' });
  const [processing, setProcessing] = useState(false);
  const [animating, setAnimating] = useState(null);
  const [resolved, setResolved] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    try {
      const data = await api.alertas.list();
      setAlertas(data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const procesar = async () => {
    if (!form.nombreProducto.trim() || !form.stockActual) return;
    setProcessing(true);
    setResolved(null);
    setLastResult(null);

    // Animate the chain traversal
    setAnimating('Operario');
    await sleep(500);
    if (form.nivel !== 'STOCK_BAJO') {
      setAnimating('Supervisor');
      await sleep(500);
    }
    if (form.nivel === 'CRITICO') {
      setAnimating('Administrador');
      await sleep(500);
    }
    setAnimating(null);

    try {
      const result = await api.alertas.create({
        nombreProducto: form.nombreProducto.trim(),
        stockActual: Number(form.stockActual),
        nivel: form.nivel,
      });
      setResolved(result.resolvedBy);
      setLastResult(result);
      setAlertas(prev => [result, ...prev]);
      setForm(f => ({ ...f, nombreProducto: '', stockActual: '' }));
    } catch (_) {
      setAnimating(null);
    }

    setProcessing(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <span className="pattern-tag" style={{ background: 'var(--accent)' }}>
            Chain of Responsibility
          </span>
          Alertas de Inventario RFID
        </h1>
        <p>
          El sensor IoT/RFID emite eventos de stock. La cadena escala la alerta
          automáticamente hasta el responsable adecuado según la criticidad.
        </p>
      </div>

      <ChainViz animating={animating} resolved={resolved} />

      {/* Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>
          Simular evento de sensor RFID
        </h3>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              value={form.nombreProducto}
              onChange={e => setForm(f => ({ ...f, nombreProducto: e.target.value }))}
              placeholder="Ej: Sensor RFID GEN-4"
            />
          </div>
          <div className="form-group">
            <label>Stock Actual (unidades)</label>
            <input
              type="number"
              min="0"
              value={form.stockActual}
              onChange={e => setForm(f => ({ ...f, stockActual: e.target.value }))}
              placeholder="Ej: 3"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Nivel de Alerta</label>
          <div className="nivel-selector">
            {NIVELES.map(({ value, label, icon }) => (
              <div
                key={value}
                className={`nivel-option${form.nivel === value ? ` selected-${value}` : ''}`}
                onClick={() => setForm(f => ({ ...f, nivel: value }))}
              >
                <span className="nivel-icon">{icon}</span>
                <div className="nivel-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={procesar}
          disabled={processing || !form.nombreProducto.trim() || !form.stockActual}
        >
          {processing
            ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Procesando…</>
            : '▶ Procesar Alerta'}
        </button>
      </div>

      {/* Last result */}
      {lastResult && (
        <div
          className="result-card"
          style={{ borderLeftColor: NIVEL_BORDER_COLOR[lastResult.nivel] }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Resultado del procesamiento
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className={`badge badge-${lastResult.nivel.toLowerCase()}`}>
              {lastResult.nivel.replace('_', ' ')}
            </span>
            <strong>{lastResult.nombreProducto}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Stock: {lastResult.stockActual} uds.
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            ✅ <strong>Resuelto por {lastResult.resolvedBy}</strong> — {lastResult.accion}
          </p>
          <div className="log-block">{lastResult.logs.join('\n')}</div>
        </div>
      )}

      {/* History */}
      <div className="section-header">
        <h2>Historial de Alertas ({alertas.length})</h2>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : alertas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>Sin alertas registradas</h3>
            <p>Simula un evento RFID para ver la cadena en acción.</p>
          </div>
        </div>
      ) : (
        alertas.map(a => (
          <div key={a.id} className="card alerta-card">
            <div className="alerta-header">
              <span className={`badge badge-${a.nivel.toLowerCase()}`}>
                {a.nivel.replace('_', ' ')}
              </span>
              <span className="alerta-producto">{a.nombreProducto}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {a.stockActual} uds.
              </span>
              <span className="alerta-resolved">→ {a.resolvedBy}</span>
              <span className="alerta-time">{fmtTime(a.timestamp)}</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.625rem' }}
              onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
            >
              {expandedId === a.id ? '▲ Ocultar log' : '▼ Ver log del patrón'}
            </button>
            {expandedId === a.id && (
              <div className="log-block">{a.logs.join('\n')}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
