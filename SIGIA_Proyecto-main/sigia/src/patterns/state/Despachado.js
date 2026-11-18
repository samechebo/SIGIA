const EstadoPedido = require('./EstadoPedido');

/**
 * Estado: el pedido salió del almacén hacia el cliente.
 * Operaciones válidas: entregar()
 * Operaciones inválidas: confirmar(), despachar(), cancelar()
 */
class Despachado extends EstadoPedido {
  confirmar(pedido) {
    console.log('  [Despachado] confirmar() — No válido en estado Despachado.');
  }

  despachar(pedido) {
    console.log('  [Despachado] despachar() — No válido. El pedido ya fue despachado.');
  }

  entregar(pedido) {
    console.log('  [Despachado] entregar() — Entregado al cliente. Registro de confirmación guardado. Transición: Despachado → Entregado.');
    const Entregado = require('./Entregado');
    pedido.setEstado(new Entregado());
  }

  cancelar(pedido) {
    console.log('  [Despachado] cancelar() — No válido. No se puede cancelar un pedido ya despachado.');
  }

  getNombre() {
    return 'Despachado';
  }
}

module.exports = Despachado;
