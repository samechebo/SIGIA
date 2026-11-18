# SIGIA: SLA, SLO, SLI y Error Budget

Taller de confiabilidad sobre el modelo C4 de **SIGIA** (Sistema Inteligente de Gestión de Inventarios Automatizados).
**Autor:** Samuel Echeverri · **Institución:** Universidad de San Buenaventura Cali · **Fecha:** noviembre de 2026

## Instrucciones del taller

**Qué deben hacer:** escoger un software o proyecto propio (puede ser cualquiera que ya hayan hecho, por ejemplo la tesis) y, suponiendo que lo van a lanzar a un ambiente productivo, definir para él las cuatro piezas:

1. SLA (acuerdo de nivel de servicio)
2. SLO (objetivo de nivel de servicio)
3. SLI (indicador de nivel de servicio)
4. Error budget (margen de error permitido)

**Condiciones:**

- Los supuestos deben depender de las características de calidad del software, como la disponibilidad.
- Es un trabajo incremental sobre lo que ya se diagramó con C4.
- Hay que tener clara la definición de cada término.
- **Formato:** un informe, o un Markdown subido a GitHub (cada grupo decide).

## Cómo se cumple en este repositorio

| Requisito | Dónde está en el informe |
|---|---|
| Proyecto propio | SIGIA, con su modelo C4 (sección 2.1) |
| Definición de cada término | Sección 1 |
| Supuestos según características de calidad | Secciones 2.2 y 2.3 (disponibilidad, tiempo real, integridad, tolerancia a fallos y recuperabilidad) |
| SLI, SLO, SLA y Error Budget | Sección 3 |
| Política del presupuesto y medición | Secciones 4 y 5 |
| Trabajo incremental sobre C4 | Los flujos críticos salen de los contenedores y componentes del C4 (sección 2.4) |
| Formato | Markdown en GitHub |

**Informe completo:** [`SIGIA_SLA_SLO_SLI_ErrorBudget.md`](SIGIA_SLA_SLO_SLI_ErrorBudget.md)

## Resumen

| Pieza | Para SIGIA |
|---|---|
| **SLI** | % de peticiones a la API sin error 5xx; % de eventos RFID reflejados en la base de datos en 5 s o menos |
| **SLO** | 99,9 % de disponibilidad y 99 % de eventos RFID en 5 s o menos (30 días móviles) |
| **SLA** | 99,5 % de disponibilidad mensual y 95 % de eventos RFID en 10 s o menos, con créditos de servicio |
| **Error Budget** | 43,8 min de caída al mes (SLO 99,9 %). Si se agota, se pausan las funcionalidades nuevas |

Decisión de diseño clave: la pasarela de pagos queda fuera del SLI de ventas. Con disponibilidades típicas, API × BD × pasarela da ≈ 99,8 %, menos que el SLO. Si la pasarela falla, el `Pedido` queda en estado *Pendiente* (patrón State) y se reintenta.

## Contenido del informe

1. Definiciones
2. SIGIA en producción (C4, características de calidad, supuestos de despliegue, flujos críticos)
3. Definición de SLI, SLO, SLA y Error Budget
4. Política del Error Budget y alertas de consumo
5. Cómo se miden los SLI
6. Qué debe estar listo antes del lanzamiento
7. Conclusión y referencias

> Las cifras son propuestas de lanzamiento y deben recalibrarse con datos reales después de los primeros meses.
