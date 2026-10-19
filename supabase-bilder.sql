-- Privater Bilder-Speicher für die Lernapp.
-- Einmal im Supabase-Dashboard des Voc-Trainer-Projekts unter "SQL Editor" einfügen und auf "Run" klicken.
-- Jeder Nutzer sieht nur seinen eigenen Ordner (benannt nach seiner User-ID).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lernapp-bilder', 'lernapp-bilder', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "lernapp bilder lesen" on storage.objects
  for select to authenticated
  using (bucket_id = 'lernapp-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "lernapp bilder hochladen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'lernapp-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "lernapp bilder ersetzen" on storage.objects
  for update to authenticated
  using (bucket_id = 'lernapp-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "lernapp bilder loeschen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'lernapp-bilder' and (storage.foldername(name))[1] = (select auth.uid())::text);
