/**
 * SIGIA — Patrón State
 * Interfaz base que define las operaciones posibles sobre un pedido.
 * Cada estado concreto implementa qué hacer en cada operación.
 */
class EstadoPedido {
  confirmar(pedido) {
    throw new Error('confirmar() debe ser implementado por el estado concreto');
  }
  despachar(pedido) {
    throw new Error('despachar() debe ser implementado por el estado concreto');
  }
  entregar(pedido) {
    throw new Error('entregar() debe ser implementado por el estado concreto');
  }
  cancelar(pedido) {
    throw new Error('cancelar() debe ser implementado por el estado concreto');
  }
  getNombre() {
    throw new Error('getNombre() debe ser implementado por el estado concreto');
  }
}

module.exports = EstadoPedido;
