CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.shelves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.board_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  shelf_id uuid NOT NULL REFERENCES public.shelves(id) ON DELETE RESTRICT,
  min_players int,
  max_players int,
  duration_minutes int,
  min_age int,
  difficulty text NOT NULL DEFAULT 'casual' CHECK (difficulty IN ('casual', 'medium', 'hard', 'expert')),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelves TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_games TO anon;
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.shelves TO service_role;
GRANT ALL ON public.board_games TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on rooms" ON public.rooms FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon full access on shelves" ON public.shelves FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon full access on board_games" ON public.board_games FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_board_games_updated_at
BEFORE UPDATE ON public.board_games
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.rooms (name, sort_order) VALUES
  ('Sala Principal', 1),
  ('Sala de Rol', 2),
  ('Almacén', 3);

INSERT INTO public.shelves (room_id, name, sort_order) VALUES
  ((SELECT id FROM public.rooms WHERE name = 'Sala Principal'), 'A1', 1),
  ((SELECT id FROM public.rooms WHERE name = 'Sala Principal'), 'A2', 2),
  ((SELECT id FROM public.rooms WHERE name = 'Sala Principal'), 'A3', 3),
  ((SELECT id FROM public.rooms WHERE name = 'Sala de Rol'), 'B1', 1),
  ((SELECT id FROM public.rooms WHERE name = 'Sala de Rol'), 'B2', 2),
  ((SELECT id FROM public.rooms WHERE name = 'Almacén'), 'C1', 1),
  ((SELECT id FROM public.rooms WHERE name = 'Almacén'), 'C2', 2);

INSERT INTO public.board_games (name, shelf_id, min_players, max_players, duration_minutes, min_age, difficulty, notes) VALUES
  ('Catan', (SELECT id FROM public.shelves WHERE name = 'A1'), 3, 4, 90, 10, 'casual', 'Clásico de comercio y estrategia'),
  ('Carcassonne', (SELECT id FROM public.shelves WHERE name = 'A1'), 2, 5, 45, 7, 'casual', 'Coloca losetas y controla territorios'),
  ('Ticket to Ride', (SELECT id FROM public.shelves WHERE name = 'A2'), 2, 5, 60, 8, 'casual', 'Construye rutas de tren por América'),
  ('7 Wonders', (SELECT id FROM public.shelves WHERE name = 'A2'), 3, 7, 30, 10, 'medium', 'Draft de cartas para toda la mesa'),
  ('Dominion', (SELECT id FROM public.shelves WHERE name = 'A3'), 2, 4, 30, 13, 'medium', 'El primer deck-building'),
  ('Pandemic', (SELECT id FROM public.shelves WHERE name = 'B1'), 2, 4, 45, 8, 'medium', 'Cooperativo contra enfermedades'),
  ('Gloomhaven', (SELECT id FROM public.shelves WHERE name = 'B1'), 1, 4, 120, 12, 'hard', 'Campaña táctica de fantasía'),
  ('Azul', (SELECT id FROM public.shelves WHERE name = 'B2'), 2, 4, 45, 8, 'casual', 'Coloca azulejos para puntuar'),
  ('Wingspan', (SELECT id FROM public.shelves WHERE name = 'B2'), 1, 5, 70, 10, 'medium', 'Colección de aves con motor de combos'),
  ('Terraforming Mars', (SELECT id FROM public.shelves WHERE name = 'C1'), 1, 5, 120, 12, 'hard', 'Gestión de recursos en Marte'),
  ('Scythe', (SELECT id FROM public.shelves WHERE name = 'C1'), 1, 5, 115, 14, 'hard', 'Estrategia y exploración dieselpunk'),
  ('Codenames', (SELECT id FROM public.shelves WHERE name = 'C2'), 4, 8, 15, 14, 'casual', 'Juego de palabras por equipos');