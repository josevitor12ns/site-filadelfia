export function validateSetting(key: string, value: string): string | null {
  if (!value.trim()) return null;
  if (["instagram", "facebook", "youtube_url"].includes(key)) {
    try { const url = new URL(value); if (!["https:", "http:"].includes(url.protocol)) return "Informe um link http ou https válido."; }
    catch { return "Informe um link completo válido."; }
  }
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Informe um e-mail válido.";
  if (key === "youtube_channel_id" && !/^UC[\w-]{22}$/.test(value)) return "Informe o ID válido do canal.";
  return null;
}
export function imageUploadSummary(successful: number, total: number): string {
  return successful === 0 ? "Nenhuma foto foi enviada. Tente novamente." : successful < total ? `${successful} de ${total} fotos enviadas. Confira os arquivos que falharam.` : `${successful} foto(s) enviada(s).`;
}