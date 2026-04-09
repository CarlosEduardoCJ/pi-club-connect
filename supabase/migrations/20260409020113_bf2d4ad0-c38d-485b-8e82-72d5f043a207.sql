
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (user_id, name, username)
VALUES ('878fd07f-9d69-4052-8b3c-28c78130209f', 'Ana', 'ana')
ON CONFLICT DO NOTHING;

INSERT INTO public.clubs (id, name, icon, description) VALUES
  ('c1000001-0000-4000-8000-000000000001', 'Clube de Programação', 'Code', 'Aprenda a programar e participe de hackathons!'),
  ('c1000002-0000-4000-8000-000000000002', 'Clube de Robótica', 'Bot', 'Construa robôs e explore automação.'),
  ('c1000003-0000-4000-8000-000000000003', 'Clube de Leitura', 'BookOpen', 'Leia e discuta livros com outros apaixonados.'),
  ('c1000004-0000-4000-8000-000000000004', 'Clube de Música', 'Music', 'Toque, cante e componha com a gente!'),
  ('c1000005-0000-4000-8000-000000000005', 'Clube de Esportes', 'Trophy', 'Pratique esportes e participe de campeonatos.'),
  ('c1000006-0000-4000-8000-000000000006', 'Clube de Fotografia', 'Camera', 'Capture momentos e aprenda técnicas fotográficas.')
ON CONFLICT DO NOTHING;

INSERT INTO public.events (club_id, title, description, date, time, location, attendees_count) VALUES
  ('c1000001-0000-4000-8000-000000000001', 'Hackathon de Primavera', 'Maratona de programação com prêmios incríveis!', '2026-05-15', '09:00', 'Laboratório de Informática', 25),
  ('c1000002-0000-4000-8000-000000000002', 'Competição de Robôs', 'Traga seu robô e mostre suas habilidades.', '2026-05-20', '14:00', 'Ginásio', 18),
  ('c1000003-0000-4000-8000-000000000003', 'Encontro Literário', 'Discussão do livro do mês.', '2026-04-25', '16:00', 'Biblioteca', 12),
  ('c1000005-0000-4000-8000-000000000005', 'Torneio de Futsal', 'Campeonato interclasses de futsal.', '2026-05-10', '10:00', 'Quadra Poliesportiva', 40)
ON CONFLICT DO NOTHING;

INSERT INTO public.chat_rooms (name, type, icon) VALUES
  ('Programação Geral', 'club', 'Code'),
  ('Robótica Geral', 'club', 'Bot')
ON CONFLICT DO NOTHING;
