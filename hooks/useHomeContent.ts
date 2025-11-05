import { useCallback, useEffect, useState } from "react";
import api from "@/api/api";
import { ContentHomeBlock } from "@/types/contentHome";

type UseHomeContentResult = {
  blocks: ContentHomeBlock[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useHomeContent(): UseHomeContentResult {
  const [blocks, setBlocks] = useState<ContentHomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/content-home");
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];
      setBlocks(data);
    } catch (err) {
      console.error("Erro ao carregar conteúdos da home:", err);
      setError("Não foi possível carregar os conteúdos da home.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContent();
  }, [fetchContent]);

  const refresh = useCallback(async () => {
    await fetchContent();
  }, [fetchContent]);

  return { blocks, loading, error, refresh };
}
