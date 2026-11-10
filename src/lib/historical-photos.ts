import type { Photo } from "./site";

/** Acervo histórico local da Igreja Filadélfia (25 fotografias). */
const filenames = Array.from({ length: 25 }, (_, i) => `historia-${String(i + 1).padStart(2, "0")}.webp`);

export const historicalPhotos: Photo[] = filenames.map((filename, index) => ({
  id: `historica-${index + 1}`,
  storage_path: `/images/historia/${filename}`,
  title: `Memória da Igreja — ${index + 1}`,
  description: null, taken_on: null, category_id: null, sort_order: index,
}));
