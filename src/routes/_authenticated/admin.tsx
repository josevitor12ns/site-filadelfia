
import { useState, type FormEvent } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Film,
  Images,
  Loader2,
  LogOut,
  Plus,
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
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Admin,
});

type Tab = "galeria" | "youtube";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-[#202020] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/60";

function isVideo(path: string) {
  return /\.(mp4|webm|mov|m4v|ogv)$/i.test(path);
}

function Admin() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("galeria");
  const [signingOut, setSigningOut] = useState(false);

  const role = useQuery({
    queryKey: ["is-admin", user.id],
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
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      qc.clear();

      await navigate({
        to: "/auth",
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível sair do painel.");
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 bg-[#111111]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <img
              src="/images/logo-filadelfia.jpg"
              alt="Logo da Igreja Filadélfia"
              className="h-12 w-12 rounded-md object-contain"
            />

            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">
                Igreja Filadélfia da Paraíba
              </p>

              <p className="text-sm font-semibold">
                Painel administrativo
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm transition hover:bg-white/10 disabled:opacity-50"
          >
            {signingOut ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <LogOut size={16} />
            )}

            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        {role.isLoading ? (
          <div className="flex items-center gap-3 py-12 text-white/60">
            <Loader2 className="animate-spin" />
            Verificando acesso...
          </div>
        ) : role.isError ? (
          <div className="space-y-4">
            <p>
              Não foi possível verificar sua permissão.
            </p>

            <button
              type="button"
              onClick={() => void role.refetch()}
              className={buttonClass}
            >
              Tentar novamente
            </button>
          </div>
        ) : !role.data ? (
          <div className="rounded-xl border border-white/15 bg-[#151515] p-6">
            Esta conta não tem permissão de administrador.
          </div>
        ) : (
          <>
            <Link
              to="/"
              className="mb-7 inline-flex items-center gap-2 text-xs text-white/50 transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Voltar ao site
            </Link>

            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">
              Área administrativa
            </p>

            <h1 className="font-serif text-3xl sm:text-5xl">
              Gerenciar conteúdo.
            </h1>

            <p className="mb-9 mt-4 max-w-xl text-sm leading-7 text-white/50">
              Adicione fotos e vídeos à galeria ou
              gerencie os vídeos do canal da igreja.
            </p>

            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTab("galeria")}
                aria-pressed={tab === "galeria"}
                className={`rounded-xl border p-6 text-left transition ${
                  tab === "galeria"
                    ? "border-white bg-[#252525]"
                    : "border-white/10 bg-[#151515] hover:border-white/40"
                }`}
              >
                <Images
                  size={25}
                  strokeWidth={1.5}
                />

                <h2 className="mt-6 font-serif text-2xl">
                  Galeria da igreja
                </h2>

                <p className="mt-2 text-xs text-white/50">
                  Fotos e vídeos enviados diretamente.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTab("youtube")}
                aria-pressed={tab === "youtube"}
                className={`rounded-xl border p-6 text-left transition ${
                  tab === "youtube"
                    ? "border-white bg-[#252525]"
                    : "border-white/10 bg-[#151515] hover:border-white/40"
                }`}
              >
                <Youtube
                  size={25}
                  strokeWidth={1.5}
                />

                <h2 className="mt-6 font-serif text-2xl">
                  Canal do YouTube
                </h2>

                <p className="mt-2 text-xs text-white/50">
                  Links de cultos e pregações do canal.
                </p>
              </button>
            </div>

            {tab === "galeria" ? (
              <GalleryAdmin />
            ) : (
              <YoutubeAdmin />
            )}

            <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/35">
              Painel protegido — Igreja Filadélfia da Paraíba
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function GalleryAdmin() {
  const qc = useQueryClient();
  const photosQuery = usePhotos();
  const items = photosQuery.data ?? [];

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [deleting, setDeleting] = useState<string | null>(
    null
  );
  const [page, setPage] = useState(0);

  const PER_PAGE = 24;

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / PER_PAGE)
  );

  const currentPage = Math.min(
    page,
    totalPages - 1
  );

  const visibleItems = items.slice(
    currentPage * PER_PAGE,
    (currentPage + 1) * PER_PAGE
  );

  const { data: urls = {} } = useSignedUrls(
    visibleItems.map((item) => item.storage_path)
  );

  const photoCount = items.filter(
    (item) => !isVideo(item.storage_path)
  ).length;

  const videoCount = items.length - photoCount;

  async function refresh() {
    await qc.invalidateQueries({
      queryKey: ["photos"],
    });
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || uploading) return;

    const selected = Array.from(files);

    setUploading(true);

    let success = 0;

    let order = items.length
      ? Math.max(
          ...items.map(
            (item) => item.sort_order ?? 0
          )
        ) + 1
      : 0;

    // Iteração segura: "file" sempre existe.
    for (const [i, file] of selected.entries()) {
      const image = file.type.startsWith("image/");
      const video = file.type.startsWith("video/");

      if (!image && !video) {
        toast.error(
          `Arquivo não permitido: ${file.name}`
        );
        continue;
      }

      setProgress(
        `Enviando arquivo ${i + 1} de ${selected.length}...`
      );

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        (video ? "mp4" : "jpg");

      const path = `historia/${crypto.randomUUID()}.${extension}`;

      let uploaded = false;

      try {
        // O Supabase exige contentType como string.
        // Nunca passamos undefined.
        const contentType: string =
          file.type || "application/octet-stream";

        const { error: uploadError } =
          await supabase.storage
            .from("media")
            .upload(path, file, {
              contentType,
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploaded = true;

        const { error: insertError } =
          await supabase
            .from("photos")
            .insert({
              storage_path: path,
              sort_order: order,
              category_id: null,
              title: file.name.replace(
                /\.[^.]+$/,
                ""
              ),
            });

        if (insertError) {
          throw insertError;
        }

        order++;
        success++;
      } catch (error) {
        console.error(
          "Erro ao enviar arquivo:",
          error
        );

        if (uploaded) {
          await supabase.storage
            .from("media")
            .remove([path]);
        }

        toast.error(
          `Não foi possível enviar ${file.name}.`
        );
      }
    }

    setUploading(false);
    setProgress("");

    if (success > 0) {
      toast.success(
        `${success} arquivo(s) adicionado(s) à galeria!`
      );

      setPage(0);

      await refresh();
    }
  }

  async function deleteItem(
    id: string,
    path: string
  ) {
    if (
      !window.confirm(
        "Deseja excluir este arquivo da galeria?"
      )
    ) {
      return;
    }

    setDeleting(id);

    try {
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      const { error: storageError } =
        await supabase.storage
          .from("media")
          .remove([path]);

      if (storageError) {
        toast.warning(
          "Item removido da galeria, mas o arquivo não foi apagado do armazenamento."
        );
      } else {
        toast.success("Arquivo excluído.");
      }

      await refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "Não foi possível excluir o arquivo."
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[#151515] p-5 md:p-8">
      <div className="mb-7 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl">
            Galeria da igreja
          </h2>

          <p className="mt-3 text-sm text-white/50">
            {photoCount} fotos · {videoCount} vídeos
          </p>
        </div>

        <label
          className={`${buttonClass} ${
            uploading
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }`}
        >
          {uploading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Upload size={18} />
          )}

          {uploading
            ? "Enviando..."
            : "Adicionar arquivos"}

          <input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={uploading}
            className="hidden"
            onChange={(event) => {
              void uploadFiles(
                event.target.files
              );

              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="mb-7 rounded-lg border border-dashed border-white/15 bg-[#202020] p-5">
        <div className="flex items-start gap-3">
          <Film
            size={20}
            className="mt-1 shrink-0"
          />

          <div>
            <h3 className="text-sm font-semibold">
              Fotos e vídeos da igreja
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/50">
              Envie fotografias e vídeos de cultos,
              encontros e momentos especiais.
              O YouTube fica separado desta galeria.
            </p>

            {progress && (
              <p className="mt-3 text-sm text-white">
                {progress}
              </p>
            )}
          </div>
        </div>
      </div>

      {photosQuery.isLoading ? (
        <div className="flex items-center gap-3 py-10 text-white/50">
          <Loader2 className="animate-spin" />
          Carregando galeria...
        </div>
      ) : photosQuery.isError ? (
        <div className="space-y-4 py-6">
          <p>
            Não foi possível carregar a galeria.
          </p>

          <button
            type="button"
            onClick={() =>
              void photosQuery.refetch()
            }
            className={buttonClass}
          >
            Tentar novamente
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 py-16 text-center">
          <Images
            size={36}
            className="mx-auto mb-4 text-white/40"
          />

          <h3 className="font-serif text-xl">
            Galeria vazia.
          </h3>

          <p className="mt-3 text-sm text-white/45">
            Adicione as primeiras fotos ou vídeos da igreja.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {visibleItems.map((item) => {
              const url =
                urls[item.storage_path];

              const video = isVideo(
                item.storage_path
              );

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-white/10 bg-[#202020]"
                >
                  <div className="relative flex aspect-[4/5] items-center justify-center bg-black">
                    {url ? (
                      video ? (
                        <video
                          key={item.id}
                          src={url}
                          controls
                          preload="metadata"
                          playsInline
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <img
                          src={url}
                          alt={
                            item.title ||
                            "Foto da igreja"
                          }
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      )
                    ) : (
                      <Loader2 className="animate-spin text-white/40" />
                    )}

                    <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-1 text-[10px]">
                      {video
                        ? "VÍDEO"
                        : "FOTO"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="min-w-0 truncate text-xs text-white/60">
                      {item.title || "Arquivo"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteItem(
                          item.id,
                          item.storage_path
                        )
                      }
                      disabled={
                        deleting === item.id
                      }
                      aria-label="Excluir arquivo"
                      className="rounded-md p-2 text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                    >
                      {deleting === item.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              <button
                type="button"
                disabled={
                  currentPage === 0
                }
                onClick={() =>
                  setPage(
                    currentPage - 1
                  )
                }
                className="text-sm disabled:opacity-30"
              >
                Anterior
              </button>

              <span className="text-xs text-white/50">
                Página {currentPage + 1} de {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  currentPage >= totalPages - 1
                }
                onClick={() =>
                  setPage(
                    currentPage + 1
                  )
                }
                className="text-sm disabled:opacity-30"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function YoutubeAdmin() {
  const qc = useQueryClient();

  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<
    string | null
  >(null);

  const videosQuery = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const all: Array<{
        id: string;
        youtube_id: string;
        title: string | null;
      }> = [];

      for (
        let from = 0;
        ;
        from += 1000
      ) {
        const { data, error } =
          await supabase
            .from("videos")
            .select(
              "id,youtube_id,title"
            )
            .order("created_at", {
              ascending: false,
            })
            .range(
              from,
              from + 999
            );

        if (error) {
          throw error;
        }

        all.push(
          ...(data ?? [])
        );

        if (
          !data ||
          data.length < 1000
        ) {
          break;
        }
      }

      return all;
    },
  });

  const videos =
    videosQuery.data ?? [];

  async function refresh() {
    await qc.invalidateQueries({
      queryKey: ["videos"],
    });
  }

  async function addVideo(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const youtubeId =
      parseYoutubeId(link);

    if (!youtubeId) {
      toast.error(
        "Informe um link válido do YouTube."
      );
      return;
    }

    setSaving(true);

    try {
      const { error } =
        await supabase
          .from("videos")
          .upsert(
            {
              youtube_id: youtubeId,
              title:
                title.trim() || null,
              published_at:
                new Date().toISOString(),
              source: "manual",
              hidden: false,
            },
            {
              onConflict:
                "youtube_id",
            }
          );

      if (error) {
        throw error;
      }

      setLink("");
      setTitle("");

      toast.success(
        "Vídeo do YouTube cadastrado!"
      );

      await refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível cadastrar o vídeo."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteVideo(
    id: string
  ) {
    if (
      !window.confirm(
        "Remover este vídeo do site?"
      )
    ) {
      return;
    }

    setDeleting(id);

    try {
      const { error } =
        await supabase
          .from("videos")
          .delete()
          .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success(
        "Vídeo removido."
      );

      await refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível remover o vídeo."
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[#151515] p-5 md:p-8">
      <div className="mb-7 border-b border-white/10 pb-6">
        <h2 className="font-serif text-2xl sm:text-3xl">
          Canal do YouTube
        </h2>

        <p className="mt-3 text-sm leading-7 text-white/50">
          Esta área é exclusiva para vídeos
          publicados no canal da igreja
          no YouTube.
        </p>
      </div>

      <form
        onSubmit={addVideo}
        className="mb-8 space-y-4 rounded-xl border border-white/10 bg-[#202020] p-5"
      >
        <h3 className="flex items-center gap-2 font-semibold">
          <Plus size={18} />
          Adicionar vídeo do YouTube
        </h3>

        <div>
          <label
            htmlFor="youtube-link"
            className="mb-2 block text-xs text-white/60"
          >
            Link do vídeo
          </label>

          <input
            id="youtube-link"
            type="url"
            required
            value={link}
            onChange={(event) =>
              setLink(
                event.target.value
              )
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="youtube-title"
            className="mb-2 block text-xs text-white/60"
          >
            Título (opcional)
          </label>

          <input
            id="youtube-title"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Ex.: Culto de domingo"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={buttonClass}
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Plus size={17} />
          )}

          {saving
            ? "Salvando..."
            : "Adicionar vídeo"}
        </button>
      </form>

      <h3 className="mb-5 font-serif text-2xl">
        Vídeos cadastrados
      </h3>

      {videosQuery.isLoading ? (
        <p className="text-sm text-white/50">
          Carregando vídeos...
        </p>
      ) : videosQuery.isError ? (
        <button
          type="button"
          onClick={() =>
            void videosQuery.refetch()
          }
          className={buttonClass}
        >
          Tentar novamente
        </button>
      ) : videos.length === 0 ? (
        <p className="text-sm text-white/50">
          Nenhum vídeo cadastrado ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#202020] p-3 sm:flex-row sm:items-center"
            >
              <img
                src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="aspect-video w-full rounded object-cover sm:w-36"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {video.title ||
                    "Vídeo do YouTube"}
                </p>

                <a
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
                >
                  Assistir no YouTube
                  <ArrowUpRight size={14} />
                </a>
              </div>

              <button
                type="button"
                onClick={() =>
                  void deleteVideo(
                    video.id
                  )
                }
                disabled={
                  deleting === video.id
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/20 px-4 py-3 text-xs text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                {deleting === video.id ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
