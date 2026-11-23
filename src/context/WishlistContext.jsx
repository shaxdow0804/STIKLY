import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { addRemoteWishlist, fetchRemoteWishlist, removeRemoteWishlist } from '../services/engagementService';

const WishlistCtx = createContext(null);
export const useWishlist = () => useContext(WishlistCtx);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useLocalStorage('stikly:wishlist', []);
  const { user } = useAuth();

  // When a user signs in (Supabase mode), merge the local list with their saved list.
  useEffect(() => {
    if (!user) return;
    fetchRemoteWishlist(user.id)
      .then((remote) => {
        setIds((local) => {
          const merged = [...new Set([...local, ...remote])];
          local.filter((id) => !remote.includes(id)).forEach((id) => addRemoteWishlist(user.id, id).catch(() => {}));
          return merged;
        });
      })
      .catch(() => {});
  }, [user, setIds]);

  const toggle = useCallback((id) => {
    const wasIn = ids.includes(id);
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    if (user) (wasIn ? removeRemoteWishlist(user.id, id) : addRemoteWishlist(user.id, id)).catch(() => {});
    return !wasIn;
  }, [ids, setIds, user]);

  const value = useMemo(() => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle }), [ids, toggle]);
  return <WishlistCtx.Provider value={value}>{children}</WishlistCtx.Provider>;
}
