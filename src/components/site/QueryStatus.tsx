import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
export function QueryError({ retry }: { retry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-4 border-y border-current/20 py-6 text-sm"><p>Não foi possível carregar este conteúdo.</p><Button variant="outline" size="sm" onClick={retry}><RefreshCw className="h-4 w-4" /> Tentar novamente</Button></div>;
}