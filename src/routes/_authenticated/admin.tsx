
import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Film,
  ImagePlus,
  Loader2,
  LogOut,
  Trash2,
  Upload,
  Youtube,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  parseYoutubeId,
  usePhotos,
  useSignedUrls,
} from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      {
        title: "Painel administrativo | Igreja Filadélfia",
      },
    ],
  }),
  component: Admin,
});

type Tab = "galeria" | "youtube";

type UploadItem = {
  id: string;
  file: File;
  title: string;
  description: string;
  takenOn: string;
};

type GalleryPhoto = {
  id: string;
  storage_path: string;
  title: string | null;
  description: string | null;
  taken_on: string | null;
  sort_order: number;
};

type YoutubeVideo = {
  youtube_id: string;
  title: string | null;
  published_at: string | null;
};

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogv)$/i;

function isVideo(path: string) {
  return VIDEO_EXTENSIONS.test(path.split("?")[0] ?? "");
}

function makeId() {
  return crypto.randomUUID();
}

function safeExtension(file: File) {
  const original = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (/^[a-z0-9]{2,5}$/.test(original)) {
    return original;
  }

  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "video/mp4") return "mp4";

  return file.type.startsWith("video/") ? "mp4" : "jpg";
}

function Admin() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("galeria");

  const adminQuery = useQuery({
    queryKey: ["admin-role", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      return Boolean(data);
    },
  });

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    await navigate({ to: "/auth" });
  }

  if (adminQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  if (adminQuery.isError || !adminQuery.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl">
            Acesso não autorizado
          </h1>

          <p className="mt-4 text-white/60">
            Esta conta não possui permissão administrativa.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-black"
          >
            Voltar ao site
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] pb-20 text-white">
      <header className="border-b border-white/10 bg-[#111]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo-filadelfia.jpg"
              alt="Igreja Filadélfia"
              className="h-12 w-12 rounded object-contain"
            />

            <div>
              <h1 className="font-serif text-xl sm:text-2xl">
                Painel administrativo
              </h1>

              <p className="text-xs text-white/50">
                Igreja Filadélfia da Paraíba
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm"
            >
              <ArrowLeft size={16} />
              Ver site
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTab("galeria")}
            className={`rounded-xl border p-5 text-left transition ${
              tab === "galeria"
                ? "border-white bg-[#242424]"
                : "border-white/10 bg-[#141414] hover:border-white/30"
            }`}
          >
            <ImagePlus className="mb-4 h-6 w-6" />

            <h2 className="font-serif text-2xl">
              Galeria da igreja
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Fotos e vídeos enviados pelo celular ou computador.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab("youtube")}
            className={`rounded-xl border p-5 text-left transition ${
              tab === "youtube"
                ? "border-white bg-[#242424]"
                : "border-white/10 bg-[#141414] hover:border-white/30"
            }`}
          >
            <Youtube className="mb-4 h-6 w-6" />

            <h2 className="font-serif text-2xl">
              Canal do YouTube
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Adicione links de cultos e pregações manualmente.
            </p>
          </button>
        </div>

        {tab === "galeria" ? (
          <GalleryAdmin />
        ) : (
          <YoutubeAdmin />
        )}
      </div>
    </main>
  );
}

function GalleryAdmin() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: photos = [], isPending, isError } = usePhotos();

  const gallery = photos as GalleryPhoto[];

  const paths = gallery.map((photo) => photo.storage_path);
  const { data: signed = {} } = useSignedUrls(paths);

  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(gallery.length / pageSize));

  const visiblePhotos = gallery.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const photoCount = gallery.filter(
    (item) => !isVideo(item.storage_path)
  ).length;

  const videoCount = gallery.length - photoCount;

  function addFiles(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files).filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );

    if (selected.length === 0) {
      toast.error("Selecione fotos ou vídeos válidos.");
      return;
    }

    setQueue((current) => [
      ...current,
      ...selected.map((file) => ({
        id: makeId(),
        file,
        title: "",
        description: "",
        takenOn: "",
      })),
    ]);

    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }

  function updateItem(
    id: string,
    field: "title" | "description" | "takenOn",
    value: string
  ) {
    setQueue((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  async function publish() {
    if (queue.length === 0 || uploading) return;

    setUploading(true);

    let published = 0;
    const failed: UploadItem[] = [];

    try {
      for (const item of queue) {
        const extension = safeExtension(item.file);

        const path = `gallery/${makeId()}.${extension}`;

        try {
          const contentType =
            item.file.type || "application/octet-stream";

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(path, item.file, {
              contentType,
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { error: insertError } = await supabase
            .from("photos")
            .insert({
              storage_path: path,
              title: item.title.trim() || null,
              description: item.description.trim() || null,
              taken_on: item.takenOn || null,
              category_id: null,
              sort_order: 0,
            });

          if (insertError) {
            await supabase.storage
              .from("media")
              .remove([path]);

            throw insertError;
          }

          published++;
        } catch (error) {
          console.error("Erro ao publicar arquivo:", error);
          failed.push(item);
        }
      }

      if (published > 0) {
        toast.success(
          `${published} arquivo(s) publicado(s) com sucesso!`
        );

        await queryClient.invalidateQueries({
          queryKey: ["photos"],
        });
      }

      if (failed.length > 0) {
        toast.error(
          `${failed.length} arquivo(s) não foram publicados. Confira o tamanho e o formato.`
        );
      }

      setQueue(failed);
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto(photo: GalleryPhoto) {
    if (
      !window.confirm(
        "Deseja excluir este arquivo permanentemente da galeria?"
      )
    ) {
      return;
    }

    setDeleting(photo.id);

    try {
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", photo.id);

      if (error) throw error;

      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([photo.storage_path]);

      if (storageError) {
        console.warn(
          "O registro foi excluído, mas o arquivo pode permanecer no armazenamento:",
          storageError
        );
      }

      toast.success("Arquivo excluído.");

      await queryClient.invalidateQueries({
        queryKey: ["photos"],
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível excluir o arquivo.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="rounded-xl border border-white/15 bg-[#141414] p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-3xl">
            Galeria da igreja
          </h2>

          <p className="mt-2 text-sm text-white/55">
            {photoCount} fotos · {videoCount} vídeos
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          <Upload size={18} />
          Adicionar arquivos
        </button>

        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-white/15 bg-[#202020] p-5">
        <div className="flex items-start gap-3">
          <Film className="mt-1 h-5 w-5 shrink-0" />

          <div>
            <h3 className="font-semibold">
              Fotos e vídeos da igreja
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Selecione os arquivos do celular ou computador.
              Você pode escrever um título, uma descrição
              e uma data para cada arquivo. Tudo é opcional.
            </p>
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="mt-8 rounded-xl border border-white/20 bg-[#1d1d1d] p-4 sm:p-6">
          <h3 className="font-serif text-2xl">
            Preparar publicação
          </h3>

          <p className="mt-2 text-sm text-white/55">
            Preencha apenas o que desejar. Campos vazios
            não aparecerão no site.
          </p>

          <div className="mt-6 space-y-6">
            {queue.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/15 bg-[#101010] p-4"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Arquivo {index + 1}
                    </p>

                    <p className="mt-1 break-all text-xs text-white/50">
                      {item.file.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() =>
                      setQueue((current) =>
                        current.filter(
                          (entry) => entry.id !== item.id
                        )
                      )
                    }
                    className="rounded-lg border border-white/20 p-2 text-white/70"
                    aria-label="Remover da seleção"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor={`title-${item.id}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      Título{" "}
                      <span className="text-white/40">
                        (opcional)
                      </span>
                    </label>

                    <input
                      id={`title-${item.id}`}
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Culto de domingo"
                      className="min-h-12 w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-white/60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`description-${item.id}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      Descrição{" "}
                      <span className="text-white/40">
                        (opcional)
                      </span>
                    </label>

                    <textarea
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Escreva sobre esse momento especial..."
                      rows={4}
                      className="w-full resize-y rounded-lg border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-white/60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`date-${item.id}`}
                      className="mb-2 flex items-center gap-2 text-sm font-medium"
                    >
                      <CalendarDays size={16} />

                      Data do acontecimento{" "}
                      <span className="text-white/40">
                        (opcional)
                      </span>
                    </label>

                    <input
                      id={`date-${item.id}`}
                      type="date"
                      value={item.takenOn}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "takenOn",
                          event.target.value
                        )
                      }
                      className="min-h-12 w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-white/60 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={publish}
              disabled={uploading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}

              {uploading
                ? "Publicando, aguarde..."
                : `Publicar ${queue.length} arquivo(s)`}
            </button>

            <button
              type="button"
              onClick={() => setQueue([])}
              disabled={uploading}
              className="min-h-12 rounded-lg border border-white/20 px-5 py-3 text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          <p className="mt-4 text-xs text-white/45">
            Não feche esta página enquanto os arquivos
            estiverem sendo enviados.
          </p>
        </div>
      )}

      {isPending && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      )}

      {isError && (
        <p className="py-10 text-center text-sm text-white/60">
          Não foi possível carregar a galeria.
        </p>
      )}

      {!isPending && !isError && gallery.length === 0 && (
        <p className="py-12 text-center text-sm text-white/50">
          Nenhuma foto ou vídeo publicado ainda.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visiblePhotos.map((photo) => {
          const url = signed[photo.storage_path];
          const video = isVideo(photo.storage_path);

          return (
            <article
              key={photo.id}
              className="overflow-hidden rounded-lg border border-white/15 bg-[#202020]"
            >
              <div className="relative aspect-[4/5] bg-black">
                {url ? (
                  video ? (
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={photo.title || "Foto da igreja"}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/40">
                    Carregando arquivo...
                  </div>
                )}

                <span className="absolute left-2 top-2 rounded bg-black/80 px-2 py-1 text-[10px] font-semibold">
                  {video ? "VÍDEO" : "FOTO"}
                </span>
              </div>

              <div className="p-4">
                {photo.title && (
                  <h3 className="break-words font-semibold">
                    {photo.title}
                  </h3>
                )}

                {photo.description && (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-white/60">
                    {photo.description}
                  </p>
                )}

                {photo.taken_on && (
                  <p className="mt-2 text-xs text-white/40">
                    {new Date(
                      `${photo.taken_on}T12:00:00`
                    ).toLocaleDateString("pt-BR")}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => deletePhoto(photo)}
                  disabled={deleting === photo.id}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 px-4 py-2.5 text-sm text-red-300 disabled:opacity-50"
                >
                  {deleting === photo.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  Excluir
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() =>
              setPage((current) => Math.max(1, current - 1))
            }
            className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-30"
          >
            Anterior
          </button>

          <span className="text-sm text-white/60">
            {page} de {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) =>
                Math.min(totalPages, current + 1)
              )
            }
            className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-30"
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}

function YoutubeAdmin() {
  const queryClient = useQueryClient();

  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: videos = [], isPending } = useQuery({
    queryKey: ["admin-youtube-videos"],
    queryFn: async (): Promise<YoutubeVideo[]> => {
      const { data, error } = await supabase
        .from("videos")
        .select("youtube_id,title,published_at")
        .order("published_at", {
          ascending: false,
        });

      if (error) throw error;

      return data ?? [];
    },
  });

  async function addVideo() {
    const youtubeId = parseYoutubeId(link);

    if (!youtubeId) {
      toast.error("Informe um link válido do YouTube.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("videos")
        .upsert(
          {
            youtube_id: youtubeId,
            title: title.trim() || "Vídeo da igreja",
            published_at: new Date().toISOString(),
            source: "manual",
            hidden: false,
          },
          {
            onConflict: "youtube_id",
          }
        );

      if (error) throw error;

      setLink("");
      setTitle("");

      toast.success("Vídeo adicionado!");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-youtube-videos"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["videos"],
        }),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível adicionar o vídeo.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVideo(youtubeId: string) {
    if (!window.confirm("Excluir este link cadastrado?")) {
      return;
    }

    setDeleting(youtubeId);

    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("youtube_id", youtubeId);

      if (error) throw error;

      toast.success("Link excluído.");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-youtube-videos"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["videos"],
        }),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível excluir o link.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="rounded-xl border border-white/15 bg-[#141414] p-4 sm:p-8">
      <h2 className="font-serif text-3xl">
        Canal do YouTube
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-white/55">
        Os vídeos automáticos do canal continuam separados
        da galeria. Aqui você também pode adicionar links
        manualmente.
      </p>

      <div className="mt-8 space-y-5 rounded-xl border border-white/15 bg-[#1d1d1d] p-4 sm:p-6">
        <div>
          <label
            htmlFor="youtube-link"
            className="mb-2 block text-sm font-medium"
          >
            Link do vídeo
          </label>

          <input
            id="youtube-link"
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="min-h-12 w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-white/60"
          />
        </div>

        <div>
          <label
            htmlFor="youtube-title"
            className="mb-2 block text-sm font-medium"
          >
            Título do vídeo
          </label>

          <input
            id="youtube-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Culto de domingo"
            className="min-h-12 w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-base text-white outline-none focus:border-white/60"
          />
        </div>

        <button
          type="button"
          onClick={addVideo}
          disabled={saving || !link.trim()}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Youtube className="h-5 w-5" />
          )}

          Adicionar vídeo
        </button>
      </div>

      <h3 className="mt-10 font-serif text-2xl">
        Links cadastrados
      </h3>

      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <article
            key={video.youtube_id}
            className="overflow-hidden rounded-xl border border-white/15 bg-[#202020]"
          >
            <img
              src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
              alt={video.title || "Vídeo"}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />

            <div className="p-4">
              <h4 className="font-semibold">
                {video.title || "Vídeo da igreja"}
              </h4>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm"
                >
                  Assistir
                </a>

                <button
                  type="button"
                  onClick={() =>
                    deleteVideo(video.youtube_id)
                  }
                  disabled={deleting === video.youtube_id}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/25 px-4 py-2 text-sm text-red-300 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
