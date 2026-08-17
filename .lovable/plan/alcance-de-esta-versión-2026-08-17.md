Catálogo de juegos de mesa para uso interno con buscador por ubicación (cuarto y estante) y detalles básicos de cada juego. El foco principal es encontrar rápidamente dónde está físicamente un juego.

## Alcance de esta versión

- **Uso interno**: sin autenticación de usuarios por ahora, solo una interfaz de administración directa.
- **Buscador principal**: al escribir el nombre de un juego, aparecen resultados con su cuarto, estante y detalles.
- **Gestión de catálogo**: añadir, editar y eliminar juegos, cuartos y estantes.
- **Datos de ejemplo**: la base de datos se carga con unos cuantos juegos ficticios repartidos en 3 cuartos y varios estantes para que puedas probar inmediatamente.
- **Información por juego**: nombre, cuarto, estante, número de jugadores, tiempo aproximado, edad mínima, dificultad, notas opcionales.

## Diseño

- Interfaz limpia y centrada en el buscador.
- Optimizado para móvil: el buscador es lo primero que se ve y los resultados son tarjetas grandes y legibles.
- Navegación simple con una sola página principal (`/`) y accesos directos a gestionar catálogo y ubicaciones.

## Modelo de datos (Lovable Cloud / PostgreSQL)

```text
rooms
  id uuid
  name text
  sort_order int
  created_at timestamp

shelves
  id uuid
  room_id uuid -> rooms
  name text
  sort_order int
  created_at timestamp

board_games
  id uuid
  name text
  shelf_id uuid -> shelves
  min_players int
  max_players int
  duration_minutes int
  min_age int
  difficulty text (casual, medium, hard, expert)
  notes text
  created_at timestamp
  updated_at timestamp
```

Todas las tablas tendrán permisos de lectura/escritura para el rol de aplicación y políticas de seguridad (RLS) adecuadas para uso interno. No se requiere autenticación de usuarios en esta versión, por lo que las políticas permitirán acceso anónimo controlado desde el servidor.

## Rutas de la aplicación

```text
/                         Página principal con buscador y resultados
/catalogo                 Listado completo de juegos con filtros y edición
/catalogo/nuevo           Formulario para añadir un juego
/catalogo/$id/editar      Formulario para editar un juego
/ubicaciones              Gestión de cuartos y estantes
```

## Funcionalidades clave

1. **Buscador en tiempo real**: al escribir, se filtran los juegos por nombre y notas.
2. **Tarjeta de resultado**: muestra nombre, cuarto, estante, jugadores, tiempo, edad y dificultad con iconos.
3. **Gestión de catálogo**: CRUD completo de juegos con selector de cuarto y estante.
4. **Gestión de ubicaciones**: CRUD de cuartos y estantes, pudiendo reorganizar visualmente.
5. **Datos de ejemplo**: se insertan 10-12 juegos de mesa ficticios repartidos en 3 cuartos con varios estantes cada uno.

## Tecnología

- Frontend: React + TanStack Router + Tailwind CSS (ya configurado).
- Backend: server functions de TanStack Start con Lovable Cloud como base de datos.
- Formularios: React Hook Form + Zod.
- Tablas: Supabase a través de Lovable Cloud.

## Criterios de éxito

- Al abrir la app se ve un buscador funcional y los datos de ejemplo aparecen.
- Buscar un juego por nombre muestra su cuarto y estante correctamente.
- Se puede añadir un nuevo juego y volver a buscarlo inmediatamente.
- Se puede crear un nuevo estante y un nuevo cuarto desde la app.
- La app funciona bien en pantallas de móvil.