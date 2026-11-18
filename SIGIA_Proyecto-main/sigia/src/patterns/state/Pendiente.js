const EstadoPedido = require('./EstadoPedido');

/**
 * Estado: el pedido fue creado pero aún no confirmado.
 * Operaciones válidas: confirmar(), cancelar()
 * Operaciones inválidas: despachar(), entregar()
 */
class Pendiente extends EstadoPedido {
  confirmar(pedido) {
    console.log('  [Pendiente] confirmar() — Pago procesado. Transición: Pendiente → Confirmado.');
    const Confirmado = require('./Confirmado');
    pedido.setEstado(new Confirmado());
  }

  despachar(pedido) {
    console.log('  [Pendiente] despachar() — No válido. El pedido aún no fue confirmado.');
  }

  entregar(pedido) {
    console.log('  [Pendiente] entregar() — No válido. El pedido aún no fue confirmado.');
  }

  cancelar(pedido) {
    console.log('  [Pendiente] cancelar() — Pedido cancelado antes de confirmarse.');
    const Cancelado = require('./Cancelado');
    pedido.setEstado(new Cancelado());
  }

  getNombre() {
    return 'Pendiente';
  }
}

module.exports = Pendiente;
