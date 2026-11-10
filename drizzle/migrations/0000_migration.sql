create type public.app_role as enum ('admin');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_first_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.site_settings (key text primary key, value text not null default '', updated_at timestamptz not null default now());
create table public.photo_categories (id uuid primary key default gen_random_uuid(), name text not null, period text, sort_order int not null default 0, created_at timestamptz not null default now());
create table public.photos (id uuid primary key default gen_random_uuid(), storage_path text not null, title text, description text, taken_on text, category_id uuid references public.photo_categories(id) on delete set null, sort_order int not null default 0, created_at timestamptz not null default now());
create index photos_order_idx on public.photos(sort_order, created_at);
create table public.videos (id uuid primary key default gen_random_uuid(), youtube_id text not null unique, title text, published_at timestamptz, featured boolean not null default false, is_live boolean not null default false, hidden boolean not null default false, source text not null default 'manual', created_at timestamptz not null default now());
create table public.events (id uuid primary key default gen_random_uuid(), title text not null, starts_at timestamptz not null, description text, location text, cover_path text, info_url text, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['site_settings','photo_categories','photos','videos','events'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop; end $$;

insert into public.site_settings(key, value) values
 ('youtube_url','https://www.youtube.com/@igfiladelfiapb'),
 ('youtube_channel_id','UCB0tTWYsgoVbOH-tx0wvP5Q'),
 ('address',''),('whatsapp',''),('instagram',''),('facebook',''),('email',''),
 ('schedule',''),
 ('about_text','A Igreja Filadélfia da Paraíba é uma comunidade cristã evangélica que se reúne para adorar a Deus, ouvir a Palavra e caminhar junto. Aqui, famílias, jovens e crianças encontram acolhimento, comunhão e um lugar para crescer na fé.'),
 ('hero_image',''),('interior_image',''),('logo_image','');

create policy "media read" on storage.objects for select to anon, authenticated using (bucket_id='media');
create policy "media admin write" on storage.objects for insert to authenticated with check (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));