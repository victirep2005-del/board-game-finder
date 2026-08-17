ALTER TABLE public.board_games
ADD COLUMN IF NOT EXISTS category text;

CREATE INDEX IF NOT EXISTS board_games_category_idx
ON public.board_games(category);
