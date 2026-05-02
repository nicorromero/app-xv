[file-tag: code-generated-file-0-1777736369910123397]

### ¿Qué incluye este archivo?
1.  **Título y Badges:** Muestra tu stack (React, Vite, Firebase, Cloudinary) de forma visual.
2.  **Descripción del Proyecto:** Explica qué es la App-XV y por qué es especial (enfocada en eventos).
3.  **Arquitectura:** Detalla tu estructura de carpetas modular (`src/features/`), lo cual es muy bien visto por otros desarrolladores.
4.  **Calidad (Tests/Lint):** Menciona los comandos `validate` y `test` que configuramos, demostrando que el código es robusto.
5.  **Reglas de Desarrollo:** Resume tus "Global Rules" para mantener el orden.

### Instrucciones para copiar y pegar:
Si preferís no descargar el archivo, acá tenés el texto final para copiarlo directamente:

```markdown
# App-XV 🎂✨
> Una experiencia interactiva en tiempo real para eventos, diseñada como una Progressive Web App (PWA) de alto rendimiento.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

## 🚀 Descripción del Proyecto
**App-XV** es una plataforma interactiva diseñada para transformar la experiencia de los invitados en eventos sociales (fiestas de 15 años). A través de una PWA optimizada, los asistentes pueden participar en votaciones en vivo, subir fotos al muro digital, realizar pedidos al DJ y seguir la cuenta regresiva del evento.

El proyecto destaca por su capacidad de **sincronización offline**, **gestión optimista de la UI** y un **sistema de proyector** diseñado para mantener 60 FPS constantes incluso bajo carga masiva de datos en tiempo real.

---

## ✨ Características Principales
- **🗳️ Votación en Tiempo Real:** Sistema de votación categorizado con resultados en vivo reflejados en un podio animado con soporte para "Stress Tests".
- **📸 Muro de Fotos Digital:** Integración con Cloudinary para carga dinámica y visualización de imágenes optimizadas (`q_auto`, `f_auto`).
- **🖥️ Proyector View:** Interfaz de alto rendimiento para pantallas gigantes con efectos visuales (Lluvia de Estrellas) optimizados mediante `Framer Motion` y `useMemo`.
- **🎵 DJ Hub:** Flujo de peticiones de canciones directo a la cabina del DJ con validación de estado.
- **📶 Resiliencia Offline:** Sincronización automática de datos mediante Hooks personalizados para garantizar que ningún voto o foto se pierda por falta de conexión.
- **🛠️ Panel de Administración:** Control total sobre el estado de la votación y configuración de categorías.

---

## 🛠️ Stack Tecnológico
- **Frontend:** React 18 + Vite.
- **Estado y Animaciones:** React Hooks, Framer Motion.
- **Backend as a Service:** Firebase (Firestore, Auth, Hosting, Performance Monitoring, Analytics).
- **Almacenamiento de Medios:** Cloudinary API.
- **Testing:** Vitest + JSDOM.
- **Calidad de Código:** ESLint, JSDoc, Linter de Pureza de Hooks.

---

## 🏗️ Arquitectura del Repositorio
El proyecto sigue una estructura **Modular por Features**, lo que facilita la escalabilidad:

```text
src/
├── app/              # Configuración global y estilos base
├── components/       # Componentes transversales y Layouts
├── context/          # Contextos de React (AuthContext)
├── features/         # Módulos de negocio (voting, gallery, dj, admin)
│   ├── components/   # Componentes específicos del módulo
│   ├── hooks/        # Lógica de negocio (Hooks personalizados)
│   └── views/        # Vistas principales del módulo
├── hooks/            # Hooks de utilidad global (OfflineSync, OnlineStatus)
├── services/         # Capa de servicios (Firebase Config, Loggers)
└── utils/            # Funciones de utilidad (Cloudinary, helpers)
