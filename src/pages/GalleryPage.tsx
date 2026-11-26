import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useSiteData } from '../context/SiteDataContext';

export function GalleryPage() {
  const { data } = useSiteData();
  const [activeAlbum, setActiveAlbum] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const albums = data?.albums ?? [];
  const photos = data?.photos ?? [];

  const filteredPhotos = useMemo(() => {
    if (activeAlbum === 'all') return photos;
    return photos.filter((p) => p.albumId === activeAlbum);
  }, [photos, activeAlbum]);

  const albumNameMap = useMemo(() => {
    const map = new Map<string, string>();
    albums.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [albums]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i === null ? null : (i + 1) % filteredPhotos.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxIndex, filteredPhotos.length]);

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <PageLayout>
      <section className="pt-36 pb-14 cog-mono-stage cog-grain border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Archive" title="Gallery" />

          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveAlbum('all');
                setLightboxIndex(null);
              }}
              className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer ${activeAlbum === 'all'
                  ? 'border-white bg-white text-[#050505]'
                  : 'border-white/20 text-neutral-400 hover:border-white hover:text-white'
                }`}
            >
              All ({photos.length})
            </button>
            {albums.map((album) => {
              const count = photos.filter((p) => p.albumId === album.id).length;
              return (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => {
                    setActiveAlbum(album.id);
                    setLightboxIndex(null);
                  }}
                  className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer ${activeAlbum === album.id
                      ? 'border-white bg-white text-[#050505]'
                      : 'border-white/20 text-neutral-400 hover:border-white hover:text-white'
                    }`}
                >
                  {album.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] py-16 lg:py-24 min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {filteredPhotos.length === 0 ? (
            <div className="border border-white/15 bg-[#0A0A0A] p-14 text-center space-y-2">
              <ImageIcon className="mx-auto h-8 w-8 text-neutral-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                No photographs in this album yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPhotos.map((photo, index) => (
                <figure
                  key={photo.id}
                  onClick={() => setLightboxIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightboxIndex(index);
                    }
                  }}
                  className="group overflow-hidden border border-white/15 bg-[#0A0A0A] cursor-pointer hover:border-white/50 transition-colors"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-black">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                  </div>
                  <figcaption className="p-4 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                      {albumNameMap.get(photo.albumId) || 'Gallery'}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold uppercase text-white">
                      {photo.title}
                    </h3>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {activePhoto &&
        lightboxIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.title}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
              className="absolute top-5 right-5 inline-flex h-11 w-11 items-center justify-center border border-white/25 text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {filteredPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                    )
                  }
                  aria-label="Previous photo"
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center border border-white/25 text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
                  aria-label="Next photo"
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center border border-white/25 text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="max-w-5xl w-full flex flex-col items-center">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto border border-white/20 object-contain"
              />
              <div className="mt-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-400">
                  {albumNameMap.get(activePhoto.albumId)} • {lightboxIndex + 1} /{' '}
                  {filteredPhotos.length}
                </span>
                <h3 className="mt-1 font-display text-lg font-bold uppercase text-white">
                  {activePhoto.title}
                </h3>
              </div>
            </div>
          </div>,
          document.body
        )}
    </PageLayout>
  );
}
