const ManejadorAlerta = require('./ManejadorAlerta');
const { NivelAlerta } = require('../../models/Alerta');

/**
 * Manejador nivel 2: Supervisor.
 * Resuelve alertas de AGOTADO generando una orden de reposición en el ERP.
 * Si el nivel es CRITICO, escala al administrador.
 */
class SupervisorHandler extends ManejadorAlerta {
  manejar(alerta) {
    console.log(`  [SupervisorHandler] Recibiendo alerta de nivel ${alerta.nivel}...`);

    if (alerta.nivel === NivelAlerta.AGOTADO) {
      console.log(`  [SupervisorHandler] Producto agotado: "${alerta.nombreProducto}".`);
      console.log(`  [SupervisorHandler] Generando orden de reposición automática en ERP.`);
      console.log(`  [SupervisorHandler] Alerta resuelta.\n`);
    } else {
      console.log(`  [SupervisorHandler] Alerta crítica. Llamando pasarSiguiente()...\n`);
      this.pasarSiguiente(alerta);
    }
  }
}

module.exports = SupervisorHandler;
