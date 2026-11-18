import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const STATE_COLORS = {
  Pendiente:  'var(--state-pendiente)',
  Confirmado: 'var(--state-confirmado)',
  Despachado: 'var(--state-despachado)',
  Entregado:  'var(--state-entregado)',
  Cancelado:  'var(--state-cancelado)',
};
const LEVEL_COLORS = {
  STOCK_BAJO: 'var(--level-stock_bajo)',
  AGOTADO:    'var(--level-agotado)',
  CRITICO:    'var(--level-critico)',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  const load = () =>
    api.stats
      .get()
      .then(s => { setStats(s); setError(false); })
      .catch(() => setError(true));

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>SIGIA — Panel de Control</h1>
        <p>Universidad de San Buenaventura Cali · Diseño Detallado de Software</p>
      </div>

      {error && (
        <div className="no-backend">
          <h3>⚠️ Backend no conectado</h3>
          <p>
            El servidor API no está corriendo. En la carpeta <code>sigia/</code> ejecuta:&nbsp;
            <code>npm install &amp;&amp; npm run server</code>
          </p>
        </div>
      )}

      {/* Pattern cards */}
      <div className="pattern-info">
        <div className="pattern-card">
          <div className="pattern-type">Patrón State</div>
          <h3>Módulo de Ventas — Pedidos</h3>
          <p>
            El objeto <strong>Pedido</strong> delega cada operación a su estado actual sin
            lógica condicional. Los estados concretos son: Pendiente, Confirmado,
            Despachado, Entregado y Cancelado.
          </p>
          <Link to="/pedidos" className="btn btn-primary btn-sm" style={{ marginTop: '0.875rem' }}>
            Ir a Pedidos →
          </Link>
        </div>
        <div className="pattern-card chain">
          <div className="pattern-type">Chain of Responsibility</div>
          <h3>Módulo de Inventario — Alertas RFID</h3>
          <p>
            Las alertas del sensor RFID escalan automáticamente por la cadena:
            <strong> Operario → Supervisor → Administrador</strong>, según el nivel
            de criticidad del evento.
          </p>
          <Link to="/alertas" className="btn btn-success btn-sm" style={{ marginTop: '0.875rem' }}>
            Ir a Alertas →
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className="card-grid">
            <div className="card stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{stats.totalPedidos}</div>
              <div className="stat-label">Total Pedidos</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.porEstado?.Entregado || 0}</div>
              <div className="stat-label">Entregados</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">🔔</div>
              <div className="stat-value">{stats.totalAlertas}</div>
              <div className="stat-label">Total Alertas</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">🚨</div>
              <div className="stat-value">{stats.alertasPorNivel?.CRITICO || 0}</div>
              <div className="stat-label">Alertas Críticas</div>
            </div>
          </div>

          <div className="card-grid">
            {stats.totalPedidos > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Pedidos por Estado
                </h3>
                {Object.entries(stats.porEstado).map(([estado, count]) => (
                  <div key={estado} className="bar-row">
                    <span className={`badge badge-${estado.toLowerCase()}`} style={{ minWidth: 80 }}>
                      {estado}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(count / stats.totalPedidos) * 100}%`,
                          background: STATE_COLORS[estado] || '#999',
                        }}
                      />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {stats.totalAlertas > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Alertas por Nivel
                </h3>
                {Object.entries(stats.alertasPorNivel).map(([nivel, count]) => (
                  <div key={nivel} className="bar-row">
                    <span
                      className={`badge badge-${nivel.toLowerCase()}`}
                      style={{ minWidth: 90 }}
                    >
                      {nivel.replace('_', ' ')}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(count / stats.totalAlertas) * 100}%`,
                          background: LEVEL_COLORS[nivel] || '#999',
                        }}
                      />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {stats.totalPedidos === 0 && stats.totalAlertas === 0 && (
              <div className="card" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state">
                  <div className="empty-icon">🚀</div>
                  <h3>Sin datos aún</h3>
                  <p>
                    Crea pedidos y alertas para ver las estadísticas en tiempo real.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!stats && !error && (
        <div className="loading-container">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}
