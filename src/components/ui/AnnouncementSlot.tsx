import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Megaphone } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import type { AnnouncementPlacement } from '../../types';

const STORAGE_KEY = 'cog_dismissed_announcements';

function getDismissed(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

interface AnnouncementSlotProps {
  placement: AnnouncementPlacement;
}

export function AnnouncementSlot({ placement }: AnnouncementSlotProps) {
  const { data } = useSiteData();
  const [dismissed, setDismissed] = useState<string[]>(() => getDismissed());

  const items = useMemo(() => {
    return (data?.announcements ?? []).filter(
      (a) => a.active && a.placement === placement && !dismissed.includes(a.id)
    );
  }, [data?.announcements, placement, dismissed]);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  if (items.length === 0) return null;

  // Simple square Hero Announcement Card
  if (placement === 'hero-card') {
    const current = items[0];
    return (
      <div className="border border-white/25 bg-[#0A0A0A]/88 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/45">
        <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3.5">
          <div className="flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5 text-[#36DFFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#36DFFF]">
              Announcement
            </span>
          </div>

          <div className="flex items-center gap-2">
            {current.badge && (
              <span className="border border-[#F5B73B]/45 bg-[#F5B73B]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5B73B]">
                {current.badge}
              </span>
            )}
            <button
              type="button"
              onClick={() => dismiss(current.id)}
              aria-label="Cancel announcement"
              className="inline-flex h-7 w-7 items-center justify-center border border-white/20 text-neutral-400 hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase leading-snug text-white">
            {current.title}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-300">{current.message}</p>
        </div>

        {current.linkTo && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <Link
              to={current.linkTo}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:text-[#36DFFF] transition-colors cursor-pointer"
            >
              <span>{current.linkLabel || 'Learn More'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {items.length > 1 && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                +{items.length - 1} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Sleek Horizontal Dismissible Banner (top-banner, programmes-page, tribes-page)
  return (
    <div
      className={
        placement === 'top-banner'
          ? 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-0'
          : 'mx-auto max-w-7xl px-6 lg:px-8 pt-8'
      }
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-white/25 bg-[#0A0A0A] px-5 py-4"
          >
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <Megaphone className="h-4 w-4 shrink-0 text-[#36DFFF] mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {item.badge && (
                    <span className="border border-[#F5B73B]/45 bg-[#F5B73B]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5B73B]">
                      {item.badge}
                    </span>
                  )}
                  <span className="font-display text-sm font-bold uppercase text-white">
                    {item.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-300 leading-relaxed">{item.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {item.linkTo && (
                <Link
                  to={item.linkTo}
                  className="inline-flex items-center gap-1.5 border border-white bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-colors cursor-pointer"
                >
                  <span>{item.linkLabel || 'View'}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Cancel announcement"
                className="inline-flex h-8 w-8 items-center justify-center border border-white/20 text-neutral-400 hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
