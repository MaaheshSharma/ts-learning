import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { ApiProduct } from "../types/product";

export function useProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const data = await getProducts(controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setProducts(data);
        setError(null);
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";

        setError(errorMessage);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  function retry() {
    setError(null);
    setLoading(true);
    setRetryCount((count) => count + 1);
  }

  return {
    products,
    loading,
    error,
    retry,
  };
}
