import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SETTING_KEYS = ["youtube_url","youtube_channel_id","address","whatsapp","instagram","facebook","email","schedule","about_text","hero_image","interior_image","logo_image","pastor_image"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export type Settings = { [K in SettingKey]?: string };

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    staleTime: 300000,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      const s: Settings = {};
      data.forEach((r) => (s[r.key as SettingKey] = r.value));
      return s;
    },
  });
}

const SIGN_TTL = 60 * 60 * 24 * 7;

export async function signPaths(paths: string[]) {
  const clean = paths.filter(Boolean);
  if (!clean.length) return {} as Record<string, string>;
  const { data, error } = await supabase.storage.from("media").createSignedUrls(clean, SIGN_TTL);
  if (error) throw error;
  if (data?.some(row => row.error)) throw new Error("Photo unavailable");
  const out: Record<string, string> = {};
  data?.forEach((d) => {
    if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  });
  return out;
}

export function useSignedUrls(paths: (string | null | undefined)[]) {
  const list = Array.from(new Set(paths.filter((p): p is string => !!p)));
  return useQuery({
    queryKey: ["signed", list],
    queryFn: () => signPaths(list),
    enabled: list.length > 0,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useSignedUrl(path?: string | null) {
  const q = useSignedUrls([path]);
  return path ? q.data?.[path] : undefined;
}

export type Photo = {
  id: string;
  storage_path: string;
  title: string | null;
  description: string | null;
  taken_on: string | null;
  category_id: string | null;
  sort_order: number;
};

/** Loads all photo metadata in pages of 1000 (metadata is small; images load lazily). */
export function usePhotos() {
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const all: Photo[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("photos")
          .select("id,storage_path,title,description,taken_on,category_id,sort_order")
          .order("sort_order")
          .order("created_at")
          .range(from, from + 999);
        if (error) throw error;
        all.push(...data);
        if (data.length < 1000) break;
      }
      return all;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("photo_categories").select("*").order("sort_order").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useEvents(upcomingOnly = false) {
  return useQuery({
    queryKey: ["events", upcomingOnly],
    queryFn: async () => {
      let q = supabase.from("events").select("*").order("starts_at");
      if (upcomingOnly) q = q.gte("starts_at", new Date(Date.now() - 864e5).toISOString());
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

export const formatDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  !Number.isFinite(new Date(iso).getTime()) ? "" : new Date(iso).toLocaleDateString("pt-BR", opts ?? { day: "2-digit", month: "long", year: "numeric" });
