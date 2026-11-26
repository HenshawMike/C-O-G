import { useState, useMemo } from 'react';
import { Phone, MessageCircle, Users, Search } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SectionHeading } from '../components/ui/SectionHeading';
import { PortraitFrame } from '../components/ui/PortraitFrame';
import { AnnouncementSlot } from '../components/ui/AnnouncementSlot';
import { TribeRegisterModal } from '../components/tribes/TribeRegisterModal';
import { useSiteData } from '../context/SiteDataContext';

export function TribesPage() {
  const { data } = useSiteData();
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTribeId, setSelectedTribeId] = useState('');

  const tribes = data?.tribes ?? [];
  const officePhone = data?.settings.phone || '+234 907 052 1282';
  const officeWhatsApp = (data?.settings.whatsapp || '2349070521282').replace(/[^0-9]/g, '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tribes;
    return tribes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.headName.toLowerCase().includes(q)
    );
  }, [tribes, query]);

  const handleJoin = (tribeId: string) => {
    setSelectedTribeId(tribeId);
    setModalOpen(true);
  };

  return (
    <PageLayout>
      <section className="pt-36 pb-16 cog-mono-stage cog-grain border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <SectionHeading eyebrow="Fellowship" title="Twelve Tribes" />

          <div className="w-full lg:w-80">
            <label htmlFor="tribe-search" className="sr-only">
              Search tribes
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                id="tribe-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tribes..."
                className="w-full border border-white/20 bg-[#050505] pl-11 pr-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] py-16 lg:py-24">
        <AnnouncementSlot placement="tribes-page" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
          {filtered.length === 0 ? (
            <div className="border border-white/15 bg-[#0A0A0A] p-12 text-center text-sm text-neutral-400">
              No tribes matched &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tribe) => {
                const whatsappNum = (tribe.whatsapp || tribe.phone || '').replace(/[^0-9]/g, '');
                const hasDirectContact = Boolean(tribe.phone || tribe.whatsapp);

                return (
                  <article
                    key={tribe.id}
                    className="flex flex-col justify-between border border-white/15 bg-[#0A0A0A] p-6 hover:border-white/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-500">
                          {String(tribe.order).padStart(2, '0')} / 12
                        </span>
                      </div>

                      <PortraitFrame
                        photoUrl={tribe.headPhotoUrl}
                        name={tribe.headName || tribe.name}
                        subtitle={tribe.headName || 'Head • Pending'}
                        aspectClass="aspect-[16/10]"
                      />

                      <h2 className="mt-5 font-display text-2xl font-extrabold uppercase text-white">
                        {tribe.name}
                      </h2>

                      <p className="mt-2 text-xs leading-relaxed text-neutral-400 line-clamp-2">
                        {tribe.introduction}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
                      {hasDirectContact ? (
                        <div className="grid grid-cols-2 gap-2">
                          {tribe.phone && (
                            <a
                              href={`tel:${tribe.phone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center justify-center gap-1.5 border border-white/20 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-300 hover:border-white hover:text-white transition-colors cursor-pointer"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                          {whatsappNum && (
                            <a
                              href={`https://wa.me/${whatsappNum}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 border border-white/20 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-300 hover:border-white hover:text-white transition-colors cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <a
                          href={`https://wa.me/${officeWhatsApp}?text=${encodeURIComponent(
                            `Hello Chapel of Glory Office, I would like to connect with the Tribe of ${tribe.name}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={officePhone}
                          className="flex items-center justify-between border border-white/10 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-neutral-400 hover:border-white/30 hover:text-white transition-colors cursor-pointer"
                        >
                          <span>Office Contact</span>
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleJoin(tribe.id)}
                        className="w-full inline-flex items-center justify-center gap-2 border border-white bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] hover:bg-transparent hover:text-white transition-colors cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Join {tribe.name}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <TribeRegisterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tribes={tribes}
        selectedTribeId={selectedTribeId}
      />
    </PageLayout>
  );
}
