const ManejadorAlerta = require('./ManejadorAlerta');
const { NivelAlerta } = require('../../models/Alerta');

/**
 * Manejador nivel 1: Operario.
 * Resuelve alertas de STOCK_BAJO con notificación en pantalla.
 * Si el nivel es mayor, pasa al siguiente eslabón.
 */
class OperarioHandler extends ManejadorAlerta {
  manejar(alerta) {
    console.log(`  [OperarioHandler] Recibiendo alerta de nivel ${alerta.nivel}...`);

    if (alerta.nivel === NivelAlerta.STOCK_BAJO) {
      console.log(`  [OperarioHandler] Stock bajo en "${alerta.nombreProducto}" (${alerta.stockActual} unidades).`);
      console.log(`  [OperarioHandler] Notificando en panel del operario. Alerta resuelta.\n`);
    } else {
      console.log(`  [OperarioHandler] Nivel supera mi competencia. Llamando pasarSiguiente()...\n`);
      this.pasarSiguiente(alerta);
    }
  }
}

module.exports = OperarioHandler;
