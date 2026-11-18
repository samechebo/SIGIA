const EstadoPedido = require('./EstadoPedido');

/**
 * Estado: el pago fue procesado y el pedido está listo para despacho.
 * Operaciones válidas: despachar(), cancelar()
 * Operaciones inválidas: confirmar(), entregar()
 */
class Confirmado extends EstadoPedido {
  confirmar(pedido) {
    console.log('  [Confirmado] confirmar() — No válido. El pedido ya fue confirmado.');
  }

  despachar(pedido) {
    console.log('  [Confirmado] despachar() — Pedido enviado al módulo de despacho. LED activado en estantería. Transición: Confirmado → Despachado.');
    const Despachado = require('./Despachado');
    pedido.setEstado(new Despachado());
  }

  entregar(pedido) {
    console.log('  [Confirmado] entregar() — No válido. El pedido aún no fue despachado.');
  }

  cancelar(pedido) {
    console.log('  [Confirmado] cancelar() — Iniciando reembolso. Transición: Confirmado → Cancelado.');
    const Cancelado = require('./Cancelado');
    pedido.setEstado(new Cancelado());
  }

  getNombre() {
    return 'Confirmado';
  }
}

module.exports = Confirmado;
