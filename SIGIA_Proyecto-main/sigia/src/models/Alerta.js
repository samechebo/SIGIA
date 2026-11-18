/**
 * SIGIA — Patrón Chain of Responsibility
 * Objeto que viaja por la cadena con la información
 * del evento detectado por el sensor RFID / Gateway IoT.
 */

const NivelAlerta = Object.freeze({
  STOCK_BAJO: 'STOCK_BAJO',
  AGOTADO:    'AGOTADO',
  CRITICO:    'CRITICO',
});

class Alerta {
  constructor(nombreProducto, stockActual, nivel) {
    this.nombreProducto = nombreProducto;
    this.stockActual    = stockActual;
    this.nivel          = nivel;
  }
}

module.exports = { Alerta, NivelAlerta };
