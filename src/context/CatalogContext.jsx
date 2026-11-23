import { createContext, useContext, useMemo } from 'react';
import useAsync from '../hooks/useAsync';
import { listCategories, listProducts } from '../services/productService';

const CatalogCtx = createContext(null);
export const useCatalog = () => useContext(CatalogCtx);

export function CatalogProvider({ children }) {
  const { data, loading, error, reload } = useAsync(async () => {
    const [products, categories] = await Promise.all([listProducts(), listCategories()]);
    return { products, categories };
  }, []);

  const value = useMemo(() => ({
    products: data?.products || [],
    categories: data?.categories || [],
    loading,
    error,
    reload,
  }), [data, loading, error, reload]);

  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}
