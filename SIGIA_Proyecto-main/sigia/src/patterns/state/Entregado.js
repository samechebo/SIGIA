const EstadoPedido = require('./EstadoPedido');

/**
 * Estado: el cliente recibió el pedido. Estado final positivo.
 * No permite ninguna operación adicional.
 */
class Entregado extends EstadoPedido {
  confirmar(pedido) {
    console.log('  [Entregado] confirmar() — No válido. El pedido ya fue entregado.');
  }

  despachar(pedido) {
    console.log('  [Entregado] despachar() — No válido. El pedido ya fue entregado.');
  }

  entregar(pedido) {
    console.log('  [Entregado] entregar() — No válido. El pedido ya fue entregado.');
  }

  cancelar(pedido) {
    console.log('  [Entregado] cancelar() — No válido. No se puede cancelar un pedido ya entregado.');
  }

  getNombre() {
    return 'Entregado';
  }
}

module.exports = Entregado;
