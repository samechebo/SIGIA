const ManejadorAlerta = require('./ManejadorAlerta');

/**
 * Manejador nivel 3: Administrador.
 * Último eslabón de la cadena.
 * Maneja alertas críticas contactando directamente al proveedor.
 */
class AdminHandler extends ManejadorAlerta {
  manejar(alerta) {
    console.log(`  [AdminHandler] Recibiendo alerta de nivel ${alerta.nivel}...`);
    console.log(`  [AdminHandler] Alerta crítica en "${alerta.nombreProducto}".`);
    console.log(`  [AdminHandler] Enviando reporte urgente y contactando proveedor directamente.`);
    console.log(`  [AdminHandler] Alerta resuelta.\n`);
  }
}

module.exports = AdminHandler;
