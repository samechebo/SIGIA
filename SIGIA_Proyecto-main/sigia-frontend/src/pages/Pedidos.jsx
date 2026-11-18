import { useState, useEffect, Fragment } from 'react';
import { api } from '../api/client';

const STATE_FLOW = ['Pendiente', 'Confirmado', 'Despachado', 'Entregado'];

function getAcciones(estado) {
  switch (estado) {
    case 'Pendiente':  return [
      { label: '✔ Confirmar', accion: 'confirmar', cls: 'btn-primary' },
      { label: '✖ Cancelar',  accion: 'cancelar',  cls: 'btn-danger'  },
    ];
    case 'Confirmado': return [
      { label: '🚚 Despachar', accion: 'despachar', cls: 'btn-primary' },
      { label: '✖ Cancelar',   accion: 'cancelar',  cls: 'btn-danger'  },
    ];
    case 'Despachado': return [
      { label: '✅ Entregar', accion: 'entregar', cls: 'btn-success' },
    ];
    default: return [];
  }
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function StateMachineViz({ currentState }) {
  return (
    <div className="state-machine">
      <div className="state-machine-title">Patrón State — Máquina de estados del Pedido</div>
      <div className="sm-flow">
        {STATE_FLOW.map((state, i) => (
          <Fragment key={state}>
            <div className={`sm-state ${state.toLowerCase()}${currentState === state ? ' current' : ''}`}>
              {state}
            </div>
            {i < STATE_FLOW.length - 1 && <span className="sm-arrow">→</span>}
          </Fragment>
        ))}
      </div>
      <div className="sm-cancel-row">
        <span className={`sm-state cancelado${currentState === 'Cancelado' ? ' current' : ''}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
          Cancelado
        </span>
        <span>← desde Pendiente o Confirmado</span>
      </div>
    </div>
  );
}

function PedidoCard({ pedido, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(null);
  const acciones = getAcciones(pedido.estado);

  const handle = async (accion) => {
    setLoading(accion);
    await onAction(pedido.id, accion);
    setLoading(null);
  };

  return (
    <div className="card pedido-card" style={{ animation: 'fadeIn 0.25s ease' }}>
      <div className="pedido-header">
        <span className="pedido-id">{pedido.id}</span>
        <span className="pedido-producto">{pedido.producto}</span>
        <span className={`badge badge-${pedido.estado.toLowerCase()}`}>{pedido.estado}</span>
      </div>

      {acciones.length > 0 && (
        <div className="pedido-actions">
          {acciones.map(({ label, accion, cls }) => (
            <button
              key={accion}
              className={`btn ${cls} btn-sm`}
              disabled={loading !== null}
              onClick={() => handle(accion)}
            >
              {loading === accion ? <span className="spinner" style={{ width: 14, height: 14 }} /> : label}
            </button>
          ))}
        </div>
      )}

      {(pedido.estado === 'Entregado' || pedido.estado === 'Cancelado') && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Estado final — sin acciones disponibles.
        </p>
      )}

      <div className="pedido-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(e => !e)}>
          {expanded ? '▲ Ocultar historial' : '▼ Ver historial'}
        </button>
        <span className="pedido-time">Creado: {fmtTime(pedido.createdAt)}</span>
      </div>

      {expanded && (
        <ul className="timeline">
          {pedido.history.map((h, i) => (
            <li key={i} className="timeline-item">
              <div className={`timeline-dot ${i === 0 ? 'created' : h.exitoso ? 'success' : 'failed'}`}>
                {i === 0 ? '★' : h.exitoso ? '✓' : '!'}
              </div>
              <div className="timeline-content">
                <div className="timeline-accion">
                  {h.accion}
                  {!h.exitoso && i > 0 && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>
                      (operación no válida)
                    </span>
                  )}
                </div>
                <div className="timeline-estado">
                  {h.estadoAntes
                    ? `${h.estadoAntes} → ${h.estadoDespues}`
                    : `Estado inicial: ${h.estadoDespues}`}
                </div>
                <div className="timeline-time">{fmtTime(h.timestamp)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [producto, setProducto] = useState('');
  const [creating, setCreating] = useState(false);
  const [vizState, setVizState] = useState(null);

  const load = async () => {
    try {
      const data = await api.pedidos.list();
      setPedidos(data);
      if (data.length > 0) setVizState(data[0].estado);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const crear = async () => {
    if (!producto.trim()) return;
    setCreating(true);
    try {
      const result = await api.pedidos.create({ producto });
      setPedidos(prev => [result, ...prev]);
      setVizState(result.estado);
      setProducto('');
      setShowForm(false);
    } catch (_) {}
    setCreating(false);
  };

  const handleAction = async (id, accion) => {
    try {
      const result = await api.pedidos[accion](id);
      setPedidos(prev => prev.map(p => p.id === id ? result : p));
      setVizState(result.estado);
    } catch (_) {}
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <span className="pattern-tag">Patrón State</span>
          Gestión de Pedidos
        </h1>
        <p>
          El <strong>Pedido</strong> delega sin if/else cada operación al estado actual.
          El estado concreto decide si la transición es válida.
        </p>
      </div>

      <StateMachineViz currentState={vizState} />

      <div className="section-header">
        <h2>Pedidos ({pedidos.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          + Nuevo Pedido
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Crear Pedido</h3>
          <div className="form-group">
            <label>Producto</label>
            <input
              value={producto}
              onChange={e => setProducto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && crear()}
              placeholder="Ej: Laptop Dell XPS 15, Sensor RFID GEN-4…"
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={crear}
              disabled={creating || !producto.trim()}
            >
              {creating ? 'Creando…' : 'Crear Pedido'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { setShowForm(false); setProducto(''); }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : pedidos.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Sin pedidos</h3>
            <p>Crea tu primer pedido para ver el patrón State en acción.</p>
          </div>
        </div>
      ) : (
        pedidos.map(p => (
          <PedidoCard key={p.id} pedido={p} onAction={handleAction} />
        ))
      )}
    </div>
  );
}
