ALTER TABLE public.board_games
  ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('board-game-images', 'board-game-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can view board game images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'board-game-images');

CREATE POLICY "Authenticated users can upload board game images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'board-game-images');

CREATE POLICY "Authenticated users can update board game images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'board-game-images')
WITH CHECK (bucket_id = 'board-game-images');

CREATE POLICY "Authenticated users can delete board game images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'board-game-images');
