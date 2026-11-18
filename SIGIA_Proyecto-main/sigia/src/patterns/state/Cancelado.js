const EstadoPedido = require('./EstadoPedido');

/**
 * Estado: el pedido fue cancelado. Estado final negativo.
 * No permite ninguna operación adicional.
 */
class Cancelado extends EstadoPedido {
  confirmar(pedido) {
    console.log('  [Cancelado] confirmar() — No válido. El pedido está cancelado.');
  }

  despachar(pedido) {
    console.log('  [Cancelado] despachar() — No válido. El pedido está cancelado.');
  }

  entregar(pedido) {
    console.log('  [Cancelado] entregar() — No válido. El pedido está cancelado.');
  }

  cancelar(pedido) {
    console.log('  [Cancelado] cancelar() — No válido. El pedido ya está cancelado.');
  }

  getNombre() {
    return 'Cancelado';
  }
}

module.exports = Cancelado;
