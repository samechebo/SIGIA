# SIGIA en producción: SLA, SLO, SLI y Error Budget

**Proyecto:** SIGIA, Sistema Inteligente de Gestión de Inventarios Automatizados
**Autor:** Samuel Echeverri
**Asignatura:**
**Docente:**
**Institución:** Universidad de San Buenaventura Cali
**Fecha:** noviembre de 2026

Este informe es un trabajo incremental sobre el modelo C4 de SIGIA. Supone que el sistema se lanza a un ambiente productivo y define para él las cuatro piezas de confiabilidad: SLA, SLO, SLI y Error Budget.

---

## 1. Definiciones

| Término | Qué es | Quién lo usa | Ejemplo en SIGIA |
|---|---|---|---|
| **SLI** (Service Level Indicator) | Métrica concreta que mide qué tan bien funciona el servicio. Es un número, no una promesa. | Equipo técnico | «% de peticiones a la API que no responden con error 5xx» |
| **SLO** (Service Level Objective) | Valor objetivo interno que se quiere lograr para un SLI. Es más estricto que el SLA para tener margen. | Equipo técnico y producto | «El 99,9 % de las peticiones sin error 5xx en 30 días» |
| **SLA** (Service Level Agreement) | Contrato con el cliente. Define lo que se promete y las compensaciones si no se cumple. | Cliente y área legal | «Disponibilidad mensual del 99,5 %, con créditos de servicio si no se cumple» |
| **Error Budget** | Margen de error permitido: `100 % − SLO`. Si se gasta todo, se pausan las funcionalidades nuevas para enfocarse en estabilidad. | Equipo técnico y producto | «SLO 99,9 % → 43,8 min de caída al mes» |

**Cómo se relacionan.** El SLI mide, el SLO fija la meta interna, el SLA es la promesa externa (siempre menos exigente que el SLO) y el Error Budget es lo que sobra entre el SLO y el 100 %. Mientras haya presupuesto se puede innovar; cuando se agota, la confiabilidad pasa primero.

**Fórmula del presupuesto.** Con un mes de 43.830 minutos (365,25 días ÷ 12):

```
Error budget (min) = 43.830 × (100 − SLO) / 100
```

| SLO | Error budget por mes |
|---|---|
| 99 % | 438,3 min (7,3 h) |
| 99,5 % | 219,2 min (3,7 h) |
| 99,9 % | 43,8 min |
| 99,95 % | 21,9 min |
| 99,99 % | 4,4 min |

---

## 2. SIGIA en producción

### 2.1 Qué es y cómo está construido (C4)

SIGIA controla el inventario en tiempo real, gestiona ventas y predice la demanda. Según el C4:

- **Nivel 1 (Contexto):** actores Operador y Administrador; sistemas externos: anaqueles RFID/IoT (MQTT), ERP/POS (REST) y Pasarela de Pagos (REST).
- **Nivel 2 (Contenedores):** Frontend Web (React.js), Backend API (Node.js + Express), Base de Datos (PostgreSQL, ADR-002) y Controlador IoT (ESP32 + MQTT).
- **Nivel 3 (Componentes del Backend):** API Router, Servicio de Ventas (patrón State), Servicio de Inventario (patrón Chain of Responsibility) y Capa de Repositorios.
- **Nivel 4 (Código):** el `Pedido` pasa por Pendiente → Confirmado → Despachado → Entregado (o Cancelado). Las alertas de stock recorren Operario → Supervisor → Administrador.

### 2.2 Características de calidad que mandan

Se parte de las características de calidad de ISO/IEC 25010 que más pesan en SIGIA:

| Característica | Por qué importa en SIGIA |
|---|---|
| **Disponibilidad (fiabilidad)** | Si la API cae, el operador no puede vender ni consultar stock en la tienda. |
| **Comportamiento temporal (eficiencia)** | El valor del sistema es «tiempo real»: el stock debe actualizarse en segundos. |
| **Integridad de datos** | Una venta debe descontar stock y registrar el pedido de forma atómica (garantías ACID de PostgreSQL). |
| **Tolerancia a fallos** | Los ESP32 trabajan sobre WiFi inestable y dependemos de terceros (pasarela, ERP). |
| **Recuperabilidad** | Un fallo de la base de datos no puede significar perder ventas ni movimientos. |

### 2.3 Supuestos de despliegue

Estos supuestos son los que hacen alcanzables los objetivos de la sección 3:

- Una región de nube, con **mínimo 2 instancias** del Backend API detrás de un balanceador de carga.
- **PostgreSQL gestionado** con réplica y recuperación a un punto en el tiempo (PITR).
- **Broker MQTT** con persistencia de mensajes; los ESP32 guardan eventos en buffer local si pierden la conexión y los reenvían al volver.
- Monitoreo con métricas, logs y pruebas sintéticas desde fuera, y despliegues con CI/CD, *canary* y *rollback*.
- Mantenimiento programado con aviso de 48 h, en ventana de domingo de 2:00 a 4:00 a. m., máximo 4 h al mes.
- Ventana de medición: **30 días móviles**.

### 2.4 Flujos críticos

| ID | Flujo | Contenedores involucrados | Criticidad |
|---|---|---|---|
| F1 | Plataforma disponible (web + API) | Frontend, API, BD | Alta |
| F2 | Registrar una venta | Frontend, API (Servicio de Ventas), BD, Pasarela | Alta |
| F3 | Consultar disponibilidad de inventario | Frontend, API, BD | Alta |
| F4 | Reflejar un evento RFID en el stock | ESP32, MQTT, API (Servicio de Inventario), BD | Alta |
| F5 | Entregar una alerta de reposición | API (cadena de manejadores), notificación | Media |
| F6 | Sincronizar el catálogo con el ERP/POS | API, ERP | Media |
| F7 | Generar predicciones de demanda (proceso diario) | API, BD | Baja |

---

## 3. Definición de SLI, SLO, SLA y Error Budget

### 3.1 Tabla principal

| Flujo | SLI (qué se mide) | SLO (interno, 30 días) | SLA (cliente) | Error budget |
|---|---|---|---|---|
| **F1 Plataforma** | % de peticiones HTTP sin error 5xx, medido en el balanceador | **99,9 %** | **99,5 %** mensual | SLO: 43,8 min. SLA: 219,2 min |
| **F2 Registrar venta** | % de operaciones sobre pedidos (crear, confirmar, despachar, entregar, cancelar) sin 5xx, **excluyendo errores de la pasarela** | **99,9 %** | Incluido en F1 | 43,8 min |
| **F2 Latencia de venta** | % de ventas registradas en menos de 1 s (sin contar la pasarela) | **95 %** | — | 5 % de las ventas |
| **F3 Consulta de inventario** | % de consultas con respuesta en menos de 500 ms | **95 %** | — | 5 % de las consultas |
| **F4 Evento RFID** | % de eventos reflejados en la BD en 5 s o menos desde que el ESP32 los publica | **99 %** | **95 %** en 10 s o menos | SLO: 1 % de los eventos |
| **F5 Alerta de reposición** | % de alertas entregadas al manejador correcto en 60 s o menos tras bajar del umbral | **99 %** | — | 1 % de las alertas |
| **F6 Sync con ERP** | % de ciclos de sincronización exitosos (un ciclo cada 15 min = 2.880 al mes) | **99 %** | — | 28 ciclos fallidos al mes |
| **F7 Predicciones** | % de días en que el proceso termina antes de las 6:00 a. m. | **95 %** | — | 1 día fallido al mes |

El SLA se contrata solo para lo que el cliente percibe de inmediato (F1 y F4). El resto son objetivos internos.

### 3.2 Por qué estos valores

- **SLO 99,9 % y SLA 99,5 %.** Para un primer lanzamiento en una sola región es una meta exigente pero alcanzable. La diferencia entre ambos deja **175 min** de margen: se puede fallar contra el SLO sin incumplir el contrato. Si el sistema madura, el SLO puede subir a 99,95 %.
- **F4 más flexible (99 %).** Los ESP32 dependen del WiFi de la tienda. Pedir 99,9 % sería prometer algo que no controlamos.
- **F2 excluye la pasarela.** Con disponibilidades típicas, API 99,95 % × BD 99,95 % × pasarela 99,9 % da **≈ 99,8 %**, menos que el SLO de 99,9 %. Por eso el SLI mide solo lo que SIGIA controla. Si la pasarela falla, el `Pedido` queda en estado **Pendiente** (patrón State) y se reintenta con una clave de idempotencia. El éxito de los pagos se vigila aparte, como indicador informativo.
- **F7 en 95 %.** Las predicciones no afectan la operación diaria de la tienda, así que toleran más fallos.
- **Recuperabilidad.** Objetivos internos: **RPO ≤ 5 min** (máxima pérdida de datos aceptable) y **RTO ≤ 1 h** (tiempo máximo para restablecer el servicio).

### 3.3 Qué cuenta y qué no cuenta contra el SLA

No cuentan contra el SLA: el mantenimiento programado dentro de su ventana, las fallas de terceros (pasarela, ERP/POS), las fallas de red WiFi o de hardware ESP32 en la tienda del cliente y los casos de fuerza mayor.

### 3.4 Compensación (propuesta)

| Disponibilidad mensual medida | Crédito sobre la factura del mes |
|---|---|
| Menos de 99,5 % y al menos 99,0 % | 10 % |
| Menos de 99,0 % y al menos 95,0 % | 25 % |
| Menos de 95,0 % | 50 % |

Los porcentajes de crédito son una propuesta del equipo y deben validarse con el cliente y el área legal.

---

## 4. Política del Error Budget

El presupuesto se consulta sobre la ventana de 30 días de F1 y F2 (43,8 min).

| Presupuesto restante | Qué se hace |
|---|---|
| Más de 50 % | Despliegues normales y desarrollo de funcionalidades. |
| Entre 25 % y 50 % | Despliegues solo con revisión adicional y *canary*. |
| Menos de 25 % | Se congelan las funcionalidades nuevas; solo correcciones de confiabilidad. |
| Agotado (0 %) | Congelamiento total, salvo correcciones de estabilidad o seguridad. Se hace un *postmortem* sin culpables y se prioriza la causa raíz. |

**Alertas por velocidad de consumo (*burn rate*):**

| Condición | Presupuesto gastado | Acción |
|---|---|---|
| Consumo 14,4 veces el normal durante 1 h | 2 % | Llamada inmediata (*page*) |
| Consumo 6 veces el normal durante 6 h | 5 % | Llamada inmediata (*page*) |
| Consumo 1 vez el normal durante 3 días | 10 % | Ticket (sin llamada) |

---

## 5. Cómo se miden los SLI

| SLI | Fuente |
|---|---|
| F1, F2, F3 | Métricas del Express (`prom-client`) y del balanceador, en Prometheus y Grafana |
| F1 (desde fuera) | Prueba sintética a `/health` cada minuto desde otra región |
| F4 | El ESP32 envía la hora del evento en el mensaje MQTT (con reloj sincronizado por NTP); se compara con la hora de escritura en BD |
| F5 | Marca de tiempo al detectar la caída de stock frente a la entrega al manejador de la cadena |
| F6, F7 | Resultado y duración de cada ejecución del trabajo programado |

---

## 6. Qué debe estar listo antes del lanzamiento

1. Mínimo 2 instancias del API con balanceador y *health checks*.
2. PostgreSQL con réplica, respaldos y recuperación PITR probada (RPO/RTO).
3. Broker MQTT con persistencia y buffer local en los ESP32.
4. Tablero de métricas con los SLI de la sección 3 y las alertas de *burn rate*.
5. Reintentos con idempotencia para pagos y transiciones del `Pedido`.
6. Pipeline con *canary* y *rollback* automático.
7. Documento de SLA acordado con el cliente (sección 3.3 y 3.4).

---

## 7. Conclusión

SIGIA se lanzaría con un SLA de **99,5 %** de disponibilidad y de **95 %** de eventos RFID reflejados en 10 s o menos. Internamente se apunta a un SLO de **99,9 %** y **99 %** en 5 s, lo que da un presupuesto de error de **43,8 min al mes**. El diseño del C4 ayuda: el patrón State permite que una caída de la pasarela no tumbe las ventas, y el buffer en los ESP32 más MQTT absorbe las caídas del WiFi. Todas las cifras son propuestas de lanzamiento y deben recalibrarse con datos reales después de los primeros meses.

---

## Referencias

- Beyer, B., Jones, C., Petoff, J., y Murphy, N. R. (2016). *Site Reliability Engineering: How Google runs production systems*. O'Reilly Media. https://sre.google/sre-book/table-of-contents/
- Brown, S. (2023). *The C4 model for visualising software architecture*. https://c4model.com
- ISO/IEC. (2011). *ISO/IEC 25010:2011 Systems and software engineering. Systems and software Quality Requirements and Evaluation (SQuaRE). System and software quality models*.
- Echeverri, S. (2026). *Modelo C4: SIGIA, Sistema Inteligente de Gestión de Inventarios Automatizados* [Documento académico]. Universidad de San Buenaventura Cali.
