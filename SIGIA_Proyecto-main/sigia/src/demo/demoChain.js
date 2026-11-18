const { Alerta, NivelAlerta } = require('../models/Alerta');
const OperarioHandler   = require('../patterns/chain/OperarioHandler');
const SupervisorHandler = require('../patterns/chain/SupervisorHandler');
const AdminHandler      = require('../patterns/chain/AdminHandler');

console.log('='.repeat(55));
console.log('  SIGIA — Demo Patrón Chain of Responsibility');
console.log('  Módulo: Inventario — Escalado de alertas RFID');
console.log('='.repeat(55));

// ── Construcción de la cadena ──────────────────────────────
// El módulo de inventario solo conoce el primer eslabón
const operario  = new OperarioHandler();
const supervisor = new SupervisorHandler();
const admin     = new AdminHandler();

// Encadenamiento fluido: operario → supervisor → admin
operario.setSiguiente(supervisor).setSiguiente(admin);

console.log('\nCadena construida: OperarioHandler → SupervisorHandler → AdminHandler\n');

// ── Caso 1: STOCK_BAJO — resuelto por Operario ────────────
console.log('-'.repeat(55));
console.log('[ Caso 1 ] Alerta STOCK_BAJO — Arroz Diana 500g (4 unidades)\n');
const alerta1 = new Alerta('Arroz Diana 500g', 4, NivelAlerta.STOCK_BAJO);
operario.manejar(alerta1);

// ── Caso 2: AGOTADO — escala a Supervisor ─────────────────
console.log('-'.repeat(55));
console.log('[ Caso 2 ] Alerta AGOTADO — Aceite Gourmet 1L (0 unidades)\n');
const alerta2 = new Alerta('Aceite Gourmet 1L', 0, NivelAlerta.AGOTADO);
operario.manejar(alerta2);

// ── Caso 3: CRITICO — escala hasta Administrador ──────────
console.log('-'.repeat(55));
console.log('[ Caso 3 ] Alerta CRITICO — Leche Colanta 1L (0 unidades)\n');
const alerta3 = new Alerta('Leche Colanta 1L', 0, NivelAlerta.CRITICO);
operario.manejar(alerta3);

console.log('='.repeat(55) + '\n');
