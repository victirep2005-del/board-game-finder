PWA instalable para tablet con soporte offline de lectura

## Objetivo
Convertir la app de catálogo de juegos de mesa en una aplicación web instalable (PWA) que se pueda usar desde un tablet como si fuera una app nativa, con acceso offline a los datos de juegos ya cargados.

## Alcance incluido
- Publicar la app en una URL estable de Lovable.
- Añadir un web app manifest con nombre, iconos, color y modo `standalone`.
- Generar iconos en los tamaños necesarios para Android/iOS/tablet.
- Añadir las etiquetas `<head>` necesarias (manifest, theme-color, apple-touch-icon, viewport).
- Instalar y configurar `vite-plugin-pwa` con un service worker generado (`generateSW`) que:
  - Cachea el app shell para que la interfaz funcione sin internet.
  - Usa `NetworkFirst` para las páginas y `CacheFirst` para los assets hasheados.
  - No se registra en el preview/editor de Lovable (registro protegido por contexto).
- Persistir el caché de TanStack Query en `localStorage` o `IndexedDB` para que los datos de juegos, estantes y cuartos estén disponibles offline después de la primera carga.
- Añadir una pantalla simple que indique cuando el tablet está offline.

## Alcance NO incluido (queda fuera de esta fase)
- Crear/editar/eliminar juegos sin conexión. Las operaciones de escritura seguirán requiriendo internet.
- Empaquetar como app nativa iOS/Android (es otro camino, posible con Capacitor, pero no es PWA).
- Notificaciones push ni sincronización en segundo plano.

## Pasos técnicos

1. Publicar la app actual para obtener la URL de producción estable.
2. Generar iconos PWA (192x192, 512x512, máscara) y guardarlos en `public/`.
3. Crear `public/manifest.webmanifest`:
   - `name`: "BoardGameFinder"
   - `short_name`: "BGFinder"
   - `start_url`: "/"
   - `display`: "standalone"
   - `background_color` y `theme_color` acordes al diseño actual.
   - `icons` con los tamaños generados.
4. Actualizar `src/routes/__root.tsx` para incluir:
   - `<link rel="manifest" href="/manifest.webmanifest" />`
   - `<meta name="theme-color" ... />`
   - `<link rel="apple-touch-icon" ... />`
   - Favicon para tablet.
5. Instalar `vite-plugin-pwa` como devDependency.
6. Configurar `vite.config.ts`:
   - Añadir el plugin `VitePWA` con `registerType: "autoUpdate"`, `injectRegister: null`, `devOptions: { enabled: false }`, estrategia `NetworkFirst` para navegaciones y `CacheFirst` para assets hasheados.
   - Excluir `/~oauth` de la cache de navegación (si aplica en el futuro).
7. Crear un wrapper de registro del service worker (`src/lib/pwa-register.ts`) que:
   - Sólo registra en producción (`import.meta.env.PROD`).
   - No registra si la app está en un iframe, en URLs de preview (`id-preview--`, `preview--`, `*.lovableproject.com`, `*.beta.lovable.dev`) o si la URL tiene `?sw=off`.
   - Desregistra cualquier `/sw.js` previo en contextos de preview.
8. Llamar al wrapper desde `src/routes/__root.tsx` (dentro de `useEffect` en el componente raíz).
9. Añadir persistencia offline al caché de TanStack Query:
   - Instalar `@tanstack/react-query-persist-client` y `idb-keyval`.
   - Configurar `PersistQueryClientProvider` en lugar de `QueryClientProvider`.
   - Persistir las queries de juegos, estantes y cuartos con `maxAge` de 7 días.
10. Añadir un pequeño indicador de estado offline en la interfaz (por ejemplo, en el header o en la página de inicio).
11. Verificar que el build pasa, que el preview no registra el SW, y que la app publicada se puede instalar en un tablet Android/iPad desde Chrome/Safari.
12. Volver a publicar tras los cambios para que la PWA esté en la URL de producción.

## Resultado esperado
- Una URL pública accesible desde cualquier navegador de tablet.
- Opción "Añadir a pantalla de inicio" / "Add to Home Screen" en Chrome (Android) y Safari (iPad).
- La interfaz y los datos de juegos cargados previamente funcionan sin conexión a internet.
- Las ediciones del catálogo siguen requiriendo conexión, con un aviso claro al usuario.
