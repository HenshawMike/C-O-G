import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SectionHeading } from '../components/ui/SectionHeading';
import { AnnouncementSlot } from '../components/ui/AnnouncementSlot';
import { Modal } from '../components/ui/Modal';
import { useSiteData } from '../context/SiteDataContext';
import type { Programme } from '../types';

export function ProgrammesPage() {
  const { data } = useSiteData();
  const [selected, setSelected] = useState<Programme | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const programmes = data?.programmes ?? [];
  const featured = programmes.filter((p) => p.isFeatured);
  const visible = filter === 'featured' ? featured : programmes;

  return (
    <PageLayout>
      <section className="pt-36 pb-16 cog-mono-stage cog-grain border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Gatherings" title="Programmes" />

          <div className="mt-8 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'border-white bg-white text-[#050505]'
                  : 'border-white/20 text-neutral-400 hover:border-white hover:text-white'
              }`}
            >
              All ({programmes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('featured')}
              className={`border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer ${
                filter === 'featured'
                  ? 'border-white bg-white text-[#050505]'
                  : 'border-white/20 text-neutral-400 hover:border-white hover:text-white'
              }`}
            >
              Featured ({featured.length})
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] py-16 lg:py-24">
        <AnnouncementSlot placement="programmes-page" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6 mt-8">
          {visible.map((prog) => (
            <article
              key={prog.id}
              className="border border-white/15 bg-[#0A0A0A] grid grid-cols-1 lg:grid-cols-12"
            >
              <div className="lg:col-span-4 relative min-h-[220px] bg-[#050505] border-b lg:border-b-0 lg:border-r border-white/10">
                {prog.imageUrl ? (
                  <img
                    src={prog.imageUrl}
                    alt={prog.title}
                    loading="lazy"
                    className={`h-full w-full transition-transform duration-700 hover:scale-105 ${
                      prog.slug === 'shekinah-night' ? 'object-contain p-8' : 'object-cover'
                    }`}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-neutral-700" />
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 p-7 sm:p-9 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-300">
                      <Clock className="h-3 w-3" />
                      <span>{prog.schedule}</span>
                    </span>
                    {prog.isFeatured && (
                      <span className="bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#050505]">
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="mt-5 font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                    {prog.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400 max-w-2xl">
                    {prog.description}
                  </p>
                </div>

                <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setSelected(prog)}
                    className="inline-flex items-center gap-2 border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-transparent hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    to="/contact"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Enquire
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || ''}
        subtitle={selected?.schedule}
      >
        {selected && (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-neutral-300">
              {selected.details || selected.description}
            </p>
            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-300 hover:border-white hover:text-white cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/contact"
                onClick={() => setSelected(null)}
                className="border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-transparent hover:text-white cursor-pointer"
              >
                Contact Office
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
