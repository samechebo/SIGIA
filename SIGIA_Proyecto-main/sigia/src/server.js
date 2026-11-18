const express = require('express');
const cors = require('cors');
const Pedido = require('./models/Pedido');
const { Alerta, NivelAlerta } = require('./models/Alerta');
const OperarioHandler = require('./patterns/chain/OperarioHandler');
const SupervisorHandler = require('./patterns/chain/SupervisorHandler');
const AdminHandler = require('./patterns/chain/AdminHandler');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory stores
const pedidosStore = new Map();
let nextPedidoId = 1;
const alertasStore = [];

// Temporarily replaces console.log to capture pattern output
function captureLog(fn) {
  const logs = [];
  const original = console.log;
  console.log = (...args) => logs.push(args.map(String).join(' '));
  fn();
  console.log = original;
  return logs;
}

function buildChain() {
  const operario = new OperarioHandler();
  const supervisor = new SupervisorHandler();
  const admin = new AdminHandler();
  operario.setSiguiente(supervisor).setSiguiente(admin);
  return operario;
}

function serializePedido(entry) {
  return {
    id: entry.pedido.id,
    producto: entry.producto,
    estado: entry.pedido.getEstado(),
    history: entry.history,
    createdAt: entry.createdAt,
  };
}

// ===================== PEDIDOS =====================

app.get('/api/pedidos', (req, res) => {
  res.json(Array.from(pedidosStore.values()).map(serializePedido));
});

app.post('/api/pedidos', (req, res) => {
  const { producto } = req.body;
  if (!producto || !String(producto).trim()) {
    return res.status(400).json({ error: 'El campo "producto" es requerido.' });
  }

  const id = `P-${String(nextPedidoId++).padStart(3, '0')}`;
  const pedido = new Pedido(id);
  const entry = {
    pedido,
    producto: String(producto).trim(),
    history: [{
      accion: 'Creado',
      estadoAntes: null,
      estadoDespues: 'Pendiente',
      exitoso: true,
      timestamp: new Date().toISOString(),
    }],
    createdAt: new Date().toISOString(),
  };

  pedidosStore.set(id, entry);
  res.status(201).json(serializePedido(entry));
});

function doTransition(id, accion, fn) {
  const entry = pedidosStore.get(id);
  if (!entry) return null;

  const estadoAntes = entry.pedido.getEstado();
  captureLog(() => fn(entry.pedido));
  const estadoDespues = entry.pedido.getEstado();

  entry.history.push({
    accion,
    estadoAntes,
    estadoDespues,
    exitoso: estadoAntes !== estadoDespues,
    timestamp: new Date().toISOString(),
  });

  return serializePedido(entry);
}

app.put('/api/pedidos/:id/confirmar', (req, res) => {
  const r = doTransition(req.params.id, 'Confirmar', p => p.confirmar());
  if (!r) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(r);
});

app.put('/api/pedidos/:id/despachar', (req, res) => {
  const r = doTransition(req.params.id, 'Despachar', p => p.despachar());
  if (!r) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(r);
});

app.put('/api/pedidos/:id/entregar', (req, res) => {
  const r = doTransition(req.params.id, 'Entregar', p => p.entregar());
  if (!r) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(r);
});

app.put('/api/pedidos/:id/cancelar', (req, res) => {
  const r = doTransition(req.params.id, 'Cancelar', p => p.cancelar());
  if (!r) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(r);
});

// ===================== ALERTAS =====================

app.get('/api/alertas', (req, res) => {
  res.json(alertasStore);
});

app.post('/api/alertas', (req, res) => {
  const { nombreProducto, stockActual, nivel } = req.body;

  if (!nombreProducto || stockActual == null || !nivel) {
    return res.status(400).json({ error: 'Los campos nombreProducto, stockActual y nivel son requeridos.' });
  }
  if (!NivelAlerta[nivel]) {
    return res.status(400).json({ error: `Nivel inválido. Valores aceptados: ${Object.keys(NivelAlerta).join(', ')}` });
  }

  const alerta = new Alerta(String(nombreProducto).trim(), Number(stockActual), nivel);
  const chain = buildChain();
  const logs = captureLog(() => chain.manejar(alerta));

  const resolvedByMap = {
    STOCK_BAJO: { resolvedBy: 'Operario', accion: 'Notificación enviada al panel del operario' },
    AGOTADO:    { resolvedBy: 'Supervisor', accion: 'Orden de reposición automática generada en ERP' },
    CRITICO:    { resolvedBy: 'Administrador', accion: 'Reporte urgente enviado y proveedor contactado' },
  };

  const entry = {
    id: `A-${String(alertasStore.length + 1).padStart(3, '0')}`,
    nombreProducto: alerta.nombreProducto,
    stockActual: alerta.stockActual,
    nivel,
    logs,
    timestamp: new Date().toISOString(),
    ...resolvedByMap[nivel],
  };

  alertasStore.unshift(entry);
  res.status(201).json(entry);
});

// ===================== STATS =====================

app.get('/api/stats', (req, res) => {
  const pedidosList = Array.from(pedidosStore.values());
  const porEstado = {};
  pedidosList.forEach(({ pedido }) => {
    const e = pedido.getEstado();
    porEstado[e] = (porEstado[e] || 0) + 1;
  });

  const alertasPorNivel = {};
  alertasStore.forEach(a => {
    alertasPorNivel[a.nivel] = (alertasPorNivel[a.nivel] || 0) + 1;
  });

  res.json({
    totalPedidos: pedidosList.length,
    porEstado,
    totalAlertas: alertasStore.length,
    alertasPorNivel,
  });
});

// Cuando se ejecuta directamente (`node src/server.js`) inicia el servidor local.
// Cuando es importado por Vercel serverless, solo exporta el app.
if (require.main === module) {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`\nSIGIA API corriendo en http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log('  GET  /api/stats');
    console.log('  GET  /api/pedidos');
    console.log('  POST /api/pedidos');
    console.log('  PUT  /api/pedidos/:id/confirmar|despachar|entregar|cancelar');
    console.log('  GET  /api/alertas');
    console.log('  POST /api/alertas\n');
  });
}

module.exports = app;
