/**
 * SIGIA — Patrón Chain of Responsibility
 * Clase abstracta base de la cadena.
 * Define el enlace al siguiente manejador y el método manejar().
 * Cada subclase decide si procesa la alerta o la pasa al siguiente.
 */
class ManejadorAlerta {
  constructor() {
    this.siguiente = null;
  }

  /**
   * Encadena el siguiente manejador.
   * Retorna 'siguiente' para permitir encadenamiento fluido:
   * operario.setSiguiente(supervisor).setSiguiente(admin)
   */
  setSiguiente(handler) {
    this.siguiente = handler;
    return handler;
  }

  /**
   * Cada subclase debe implementar este método
   * con su lógica de decisión.
   */
  manejar(alerta) {
    throw new Error('manejar() debe ser implementado por el manejador concreto');
  }

  /**
   * Pasa la alerta al siguiente eslabón.
   * Si no hay siguiente, la alerta quedó sin resolver.
   */
  pasarSiguiente(alerta) {
    if (this.siguiente !== null) {
      this.siguiente.manejar(alerta);
    } else {
      console.log('  [Cadena] Alerta llegó al final sin resolverse completamente.');
    }
  }
}

module.exports = ManejadorAlerta;
