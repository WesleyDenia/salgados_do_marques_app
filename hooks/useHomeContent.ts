import { useCallback, useEffect, useState } from "react";
import api from "@/api/api";
import { ContentHomeBlock } from "@/types/contentHome";

type UseHomeContentResult = {
  blocks: ContentHomeBlock[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function normalizeBlocks(raw: any[]): ContentHomeBlock[] {
  return raw
    .filter((block: ContentHomeBlock) => block?.is_active !== false)
    .sort(
      (a: ContentHomeBlock, b: ContentHomeBlock) =>
        (a.display_order ?? Number.MAX_SAFE_INTEGER) -
        (b.display_order ?? Number.MAX_SAFE_INTEGER),
    );
}

export function useHomeContent(): UseHomeContentResult {
  const [blocks, setBlocks] = useState<ContentHomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/content-home", { signal });
        const raw = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

        setBlocks(normalizeBlocks(raw));
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        console.error("Erro ao carregar conteúdos da home:", err);
        setError("Não foi possível carregar os conteúdos da home.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchContent(controller.signal);
    return () => controller.abort();
  }, [fetchContent]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    await fetchContent(controller.signal);
  }, [fetchContent]);

  return { blocks, loading, error, refresh };
}
