# SIGIA — Prototipo de Patrones de Diseño

**Sistema Inteligente de Gestión de Inventarios Automatizados**  
Universidad de San Buenaventura Cali  
Asignatura: Diseño Detallado de Software  
Docente: Mg. Leidy Jaramillo  
Autores: Samuel Echeverri | Juan Diego Aristizábal

---

## Patrones implementados

| Patrón | Clasificación | Módulo SIGIA |
|---|---|---|
| State | Conductual | Ventas / Pedidos |
| Chain of Responsibility | Conductual | Inventario / Alertas |

---

## Estructura del proyecto

```
sigia/
├── package.json
├── README.md
└── src/
    ├── models/
    │   ├── Pedido.js          # Clase principal — delega al estado actual
    │   └── Alerta.js          # Objeto que viaja por la cadena + NivelAlerta
    ├── patterns/
    │   ├── state/
    │   │   ├── EstadoPedido.js  # Interfaz base (clase abstracta)
    │   │   ├── Pendiente.js     # Estado concreto
    │   │   ├── Confirmado.js    # Estado concreto
    │   │   ├── Despachado.js    # Estado concreto
    │   │   ├── Entregado.js     # Estado concreto (final positivo)
    │   │   └── Cancelado.js     # Estado concreto (final negativo)
    │   └── chain/
    │       ├── ManejadorAlerta.js   # Clase abstracta base de la cadena
    │       ├── OperarioHandler.js   # Manejador nivel 1 (STOCK_BAJO)
    │       ├── SupervisorHandler.js # Manejador nivel 2 (AGOTADO)
    │       └── AdminHandler.js      # Manejador nivel 3 (CRITICO)
    └── demo/
        ├── index.js       # Corre ambos demos juntos
        ├── demoState.js   # Demo del patrón State
        └── demoChain.js   # Demo del patrón Chain of Responsibility
```

---

## Cómo correr el proyecto

### Requisitos
- Node.js v14 o superior

### Instalación
```bash
cd sigia
```
No requiere dependencias externas — solo Node.js puro.

### Comandos

```bash
# Correr ambos patrones juntos
npm start

# Correr solo el patrón State
npm run demo:state

# Correr solo el patrón Chain of Responsibility
npm run demo:chain
```

---

## Patrón State — cómo funciona

Un pedido en el módulo de ventas atraviesa etapas definidas y en cada una solo ciertas operaciones están permitidas:

| Estado | confirmar() | despachar() | entregar() | cancelar() |
|---|---|---|---|---|
| Pendiente | ✅ → Confirmado | ❌ | ❌ | ✅ → Cancelado |
| Confirmado | ❌ | ✅ → Despachado | ❌ | ✅ → Cancelado |
| Despachado | ❌ | ❌ | ✅ → Entregado | ❌ |
| Entregado | ❌ | ❌ | ❌ | ❌ |
| Cancelado | ❌ | ❌ | ❌ | ❌ |

La clase `Pedido` no tiene ningún `if/else`. Solo delega:
```javascript
confirmar() { this.estadoActual.confirmar(this); }
```

---

## Patrón Chain of Responsibility — cómo funciona

La cadena se construye una sola vez:
```javascript
operario.setSiguiente(supervisor).setSiguiente(admin);
```

El módulo de inventario solo conoce el primer eslabón:
```javascript
operario.manejar(new Alerta('Producto', 0, NivelAlerta.AGOTADO));
```

| Nivel | Manejador que resuelve |
|---|---|
| STOCK_BAJO | OperarioHandler |
| AGOTADO | SupervisorHandler |
| CRITICO | AdminHandler |

---

## Fuentes

- Patrones de diseño: https://refactoring.guru/es/design-patterns
- Clasificación Microsoft: https://learn.microsoft.com/es-es/azure/architecture/patterns
