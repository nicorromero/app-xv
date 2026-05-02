# Feature: Voting

Sistema de votaciones en tiempo real para los Premios de la Noche.

## Descripción
Permite a los invitados votar por diferentes categorías (DJ, Vestuario, etc.) y visualizar los resultados en vivo en el proyector.

## Arquitectura
- **Hooks**: `useResultadosVotos` maneja la lógica de emisión y sincronización offline.
- **Vistas**: `VotarView` es la interfaz del invitado; `ProyectorView` es la visualización de resultados.
- **Sincronización**: Utiliza contadores fragmentados (sharded counters) para alta concurrencia en Firebase.

## Efectos Secundarios (Side Effects)
- **Firebase Performance**: Dispara la traza `proceso_voto_completo` en cada voto online.
- **LocalStorage**: Almacena `voto_{categoriaId}` para persistencia del estado de voto y `offline_sync_queue` para reintentos.
- **Logging**: Reporta eventos a Firebase Analytics/Cloud Logging a través de `logger.js`.

## Consideraciones de Accesibilidad (a11y)
- Los botones de candidatos deben incluir `aria-label` si el diseño se vuelve puramente visual.
- Soporte para alto contraste y fuentes legibles.
