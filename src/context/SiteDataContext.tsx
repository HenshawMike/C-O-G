import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, resolveMediaUrl } from '../lib/api';
import type { SiteData } from '../types';

function normalizeMediaUrls(site: SiteData): SiteData {
  return {
    ...site,
    leaders: site.leaders.map((l) => ({ ...l, photoUrl: resolveMediaUrl(l.photoUrl) })),
    programmes: site.programmes.map((p) => ({ ...p, imageUrl: resolveMediaUrl(p.imageUrl) })),
    tribes: site.tribes.map((t) => ({ ...t, headPhotoUrl: resolveMediaUrl(t.headPhotoUrl) })),
    photos: site.photos.map((ph) => ({
      ...ph,
      imageUrl: resolveMediaUrl(ph.imageUrl) || ph.imageUrl,
    })),
  };
}

interface SiteDataContextValue {
  data: SiteData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  mutate: (updater: (prev: SiteData) => SiteData) => void;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const siteData = await api.getSite();
      setData(normalizeMediaUrls(siteData));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load church data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const mutate = useCallback((updater: (prev: SiteData) => SiteData) => {
    setData((prev) => (prev ? normalizeMediaUrls(updater(prev)) : prev));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SiteDataContext.Provider value={{ data, loading, error, refresh, mutate }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider');
  return ctx;
}
