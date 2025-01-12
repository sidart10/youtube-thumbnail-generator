-- Create a single policy for all operations on the thumbnails bucket
BEGIN;
  -- First, enable RLS on the storage.objects table
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Create a policy for SELECT operations
  CREATE POLICY "thumbnail_storage_select"
  ON storage.objects FOR SELECT
  TO public
  USING ( bucket_id = 'thumbnails' );

  -- Create a policy for INSERT operations
  CREATE POLICY "thumbnail_storage_insert"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK ( bucket_id = 'thumbnails' );

  -- Create a policy for UPDATE operations
  CREATE POLICY "thumbnail_storage_update"
  ON storage.objects FOR UPDATE
  TO public
  USING ( bucket_id = 'thumbnails' );

  -- Create a policy for DELETE operations
  CREATE POLICY "thumbnail_storage_delete"
  ON storage.objects FOR DELETE
  TO public
  USING ( bucket_id = 'thumbnails' );
COMMIT; 