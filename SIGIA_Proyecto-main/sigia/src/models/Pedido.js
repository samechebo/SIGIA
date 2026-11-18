const Pendiente = require('../patterns/state/Pendiente');

/**
 * SIGIA — Módulo de Ventas
 * Clase Pedido: no contiene lógica propia de comportamiento.
 * Delega cada operación al estado actual.
 * Cuando el estado cambia, lo hace desde adentro del propio estado.
 */
class Pedido {
  constructor(id) {
    this.id = id;
    this.estadoActual = new Pendiente(); // estado inicial
    console.log(`Pedido ${this.id} creado. Estado inicial: ${this.estadoActual.getNombre()}`);
  }

  // El Pedido NO tiene if/else — solo delega al estado actual
  confirmar() { this.estadoActual.confirmar(this); }
  despachar() { this.estadoActual.despachar(this); }
  entregar()  { this.estadoActual.entregar(this);  }
  cancelar()  { this.estadoActual.cancelar(this);  }

  /**
   * Cambia el estado actual del pedido.
   * Solo los estados concretos llaman a este método desde adentro.
   */
  setEstado(nuevoEstado) {
    console.log(`  >>> Transición: ${this.estadoActual.getNombre()} → ${nuevoEstado.getNombre()}`);
    this.estadoActual = nuevoEstado;
  }

  getEstado() {
    return this.estadoActual.getNombre();
  }
}

module.exports = Pedido;
