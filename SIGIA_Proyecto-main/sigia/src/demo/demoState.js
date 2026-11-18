const Pedido = require('../models/Pedido');

console.log('='.repeat(55));
console.log('  SIGIA — Demo Patrón State');
console.log('  Módulo: Ventas — Ciclo de vida del pedido');
console.log('='.repeat(55));

// ── Caso 1: flujo normal completo ──────────────────────────
console.log('\n[ Caso 1 ] Flujo normal: confirmar → despachar → entregar\n');
const pedido1 = new Pedido('PED-001');

console.log('\nOperación: confirmar()');
pedido1.confirmar();

console.log('\nOperación: despachar()');
pedido1.despachar();

console.log('\nOperación: entregar()');
pedido1.entregar();

console.log('\nOperación: cancelar() — intento inválido en estado Entregado');
pedido1.cancelar();

// ── Caso 2: operación inválida en Pendiente ────────────────
console.log('\n' + '-'.repeat(55));
console.log('\n[ Caso 2 ] Operación inválida antes de confirmar\n');
const pedido2 = new Pedido('PED-002');

console.log('\nOperación: despachar() — inválido, aún Pendiente');
pedido2.despachar();

console.log('\nOperación: confirmar()');
pedido2.confirmar();

console.log('\nOperación: cancelar() — válido en Confirmado');
pedido2.cancelar();

console.log('\nOperación: confirmar() — intento inválido en Cancelado');
pedido2.confirmar();

// ── Caso 3: cancelación antes de confirmar ─────────────────
console.log('\n' + '-'.repeat(55));
console.log('\n[ Caso 3 ] Cancelar en estado Pendiente\n');
const pedido3 = new Pedido('PED-003');

console.log('\nOperación: cancelar() — válido en Pendiente');
pedido3.cancelar();

console.log('\nOperación: despachar() — intento inválido en Cancelado');
pedido3.despachar();

console.log('\n' + '='.repeat(55));
console.log('  Estado final de pedidos:');
console.log(`  PED-001: ${pedido1.getEstado()}`);
console.log(`  PED-002: ${pedido2.getEstado()}`);
console.log(`  PED-003: ${pedido3.getEstado()}`);
console.log('='.repeat(55) + '\n');
