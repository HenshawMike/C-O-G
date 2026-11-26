import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Phone,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SectionHeading } from '../components/ui/SectionHeading';
import { RevolvingSpotlight } from '../components/ui/RevolvingSpotlight';
import { Reveal } from '../components/ui/Reveal';
import { AnnouncementSlot } from '../components/ui/AnnouncementSlot';
import { Modal } from '../components/ui/Modal';
import { TribeRegisterModal } from '../components/tribes/TribeRegisterModal';
import { useSiteData } from '../context/SiteDataContext';
import type { Programme } from '../types';

function getInitials(name: string): string {
  const cleaned = name
    .replace(/\b(Rev\.?|Pst\.?|Pastor|Dr\.?|Prof\.?)\b/gi, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function HomePage() {
  const { data } = useSiteData();
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
  const [tribeModalOpen, setTribeModalOpen] = useState(false);
  const [selectedTribeId, setSelectedTribeId] = useState('');

  const leaders = data?.leaders ?? [];
  const programmes = data?.programmes ?? [];
  const tribes = data?.tribes ?? [];
  const photos = data?.photos.slice(0, 4) ?? [];

  const openTribeModal = (tribeId?: string) => {
    setSelectedTribeId(tribeId || tribes[0]?.id || '');
    setTribeModalOpen(true);
  };

  return (
    <PageLayout>
      {/* HERO — Minimalist Square Frame + Living Sanctuary Color */}
      <section className="relative min-h-[96vh] flex items-center overflow-hidden cog-mono-stage cog-grain pt-32 pb-20 border-b border-white/15">
        <div className="pointer-events-none absolute inset-0">
          <img
            src="/images/hero-sanctuary.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-55 cog-ambient-pulse"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/45 to-[#050505]" />
          <div className="absolute inset-0 cog-beam-overlay" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8 space-y-6">
              <div className="animate-fade-up flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-[#36DFFF] to-[#F5B73B]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FFD98A]">
                  This Semester&apos;s Theme
                </span>
              </div>

              <h1 className="animate-fade-up animate-delay-100 font-display text-4xl sm:text-6xl lg:text-[4.6rem] font-extrabold uppercase leading-[0.98] tracking-tight text-white">
                <span className="inline-block pr-4 bg-gradient-to-r from-[#36DFFF] via-white to-[#087BFF] bg-clip-text text-transparent">
                  Discovery
                </span>
                <span className="block">
                  and{' '}
                  <span className="inline-block pr-3 bg-gradient-to-r from-[#FFE29E] via-[#F5B73B] to-[#F97316] bg-clip-text text-transparent">
                    Recovery.
                  </span>
                </span>
              </h1>

              <figure className="animate-fade-up animate-delay-200 max-w-lg border-l-2 border-[#F5B73B] bg-black/35 pl-5 pr-4 py-3 backdrop-blur-sm">
                <blockquote className="font-editorial text-lg sm:text-xl italic leading-snug text-white">
                  &ldquo;Pursue: for thou shalt surely overtake them, and without fail recover
                  all.&rdquo;
                </blockquote>
                <figcaption className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#F5B73B]">
                  1 Samuel 30:8
                </figcaption>
              </figure>

              <div className="animate-fade-up animate-delay-300 flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#about-chapel"
                  className="inline-flex items-center gap-2.5 border border-white bg-white px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <span>Discover</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/tribes"
                  className="inline-flex items-center gap-2.5 border border-white/40 bg-black/50 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md hover:border-[#F5B73B] hover:text-[#F5B73B] transition-all duration-300 cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span>Join a Tribe</span>
                </Link>
              </div>
            </div>

            {/* Simple, Cancellable Hero Announcement Box */}
            <div className="lg:col-span-4 animate-fade-up animate-delay-300">
              <AnnouncementSlot placement="hero-card" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT — Crisp Paper-White Contrast + Vibrant Sanctuary Image */}
      <section
        id="about-chapel"
        className="bg-[#F7F7F7] text-[#050505] py-24 lg:py-32 border-b border-black/10"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <Reveal className="lg:col-span-6 space-y-6">
              <SectionHeading
                light
                eyebrow="Identity"
                title="Faith, Purpose & Glory"
                subtitle="Chapel of Glory, Arthur Jarvis University — a community growing in worship, prayer, Scripture, and fellowship."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/15 border border-black/15">
                <div className="bg-white p-6 transition-colors hover:bg-neutral-50">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#087BFF]">
                    01 / Mission
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                    Raising Christ-centered believers equipped in faith, character, and purpose.
                  </p>
                </div>
                <div className="bg-white p-6 transition-colors hover:bg-neutral-50">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#087BFF]">
                    02 / Vision
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                    A Spirit-filled university church where every believer belongs and thrives.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 border border-[#050505] bg-[#050505] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-[#087BFF] hover:border-[#087BFF] transition-colors cursor-pointer"
                >
                  <span>About Us</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={140} className="lg:col-span-6">
              <div className="group overflow-hidden border border-black/15 bg-white p-3">
                <img
                  src="/images/fellowship-bible.jpg"
                  alt="Chapel of Glory Sanctuary"
                  loading="lazy"
                  className="h-[400px] sm:h-[440px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* LEADERSHIP — Revolving Spotlight */}
      <section className="bg-[#050505] py-24 lg:py-32 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <SectionHeading eyebrow="Leadership" title="Our Chaplains" />
              <Link
                to="/about#leadership"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-400 hover:text-[#36DFFF] transition-colors cursor-pointer shrink-0"
              >
                <span>All Leaders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <RevolvingSpotlight
              items={leaders}
              itemLabel="leader"
              renderLeft={(leader) => (
                <div className="flex h-full min-h-[15rem] md:min-h-[18rem] flex-col items-center justify-center gap-4 border border-white/15 bg-gradient-to-br from-[#0F172A] via-[#0A0A0A] to-[#050505] p-5 text-center">
                  {leader.photoUrl ? (
                    <img
                      src={leader.photoUrl}
                      alt={leader.fullName}
                      className="h-36 w-36 border border-white/30 object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center border border-[#36DFFF]/40 bg-[#050505] font-display text-3xl font-extrabold text-[#36DFFF]">
                      {getInitials(leader.fullName)}
                    </div>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-400">
                    {leader.position}
                  </p>
                </div>
              )}
              renderRight={(leader) => (
                <div>
                  <span className="inline-block border border-[#36DFFF]/40 bg-[#087BFF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#36DFFF]">
                    {leader.position}
                  </span>
                  <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold uppercase leading-tight text-white">
                    {leader.fullName}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
                    {leader.bio}
                  </p>
                  {leader.contactInfo && (
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white">
                      {leader.contactInfo}
                    </p>
                  )}
                </div>
              )}
            />
          </Reveal>
        </div>
      </section>

      {/* SERVICES & PROGRAMMES — Revolving Spotlight with Full-Color Visuals */}
      <section className="bg-[#0A0A0A] py-24 lg:py-32 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <SectionHeading eyebrow="Services" title="Programmes" />
              <Link
                to="/programmes"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-400 hover:text-[#36DFFF] transition-colors cursor-pointer shrink-0"
              >
                <span>All Programmes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <RevolvingSpotlight
              items={programmes}
              itemLabel="programme"
              renderLeft={(prog) => (
                <div className="relative flex h-full min-h-[15rem] md:min-h-[18rem] flex-col items-center justify-center overflow-hidden border border-white/20 bg-[#050505]">
                  {prog.imageUrl ? (
                    <img
                      src={prog.imageUrl}
                      alt={prog.title}
                      loading="lazy"
                      className={`h-full w-full ${
                        prog.slug === 'shekinah-night' ? 'object-contain p-7' : 'object-cover'
                      }`}
                    />
                  ) : (
                    <Calendar className="h-10 w-10 text-neutral-600" />
                  )}
                </div>
              )}
              renderRight={(prog) => {
                const isFiery = prog.theme === 'fiery-red';
                return (
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${
                        isFiery
                          ? 'border-[#F5B73B]/45 bg-[#F97316]/10 text-[#F5B73B]'
                          : 'border-[#36DFFF]/40 bg-[#087BFF]/10 text-[#36DFFF]'
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>{prog.schedule}</span>
                    </span>
                    <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold uppercase leading-tight text-white">
                      {prog.title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
                      {prog.description}
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedProgramme(prog)}
                        className="inline-flex items-center gap-2 border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* TWELVE TRIBES — Revolving Spotlight */}
      <section className="bg-[#050505] py-24 lg:py-32 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <SectionHeading eyebrow="Fellowship" title="Twelve Tribes" />
              <Link
                to="/tribes"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-400 hover:text-[#36DFFF] transition-colors cursor-pointer shrink-0"
              >
                <span>All 12 Tribes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <RevolvingSpotlight
              items={tribes}
              itemLabel="tribe"
              renderLeft={(tribe) => (
                <div className="flex h-full min-h-[15rem] md:min-h-[18rem] flex-col items-center justify-center gap-4 border border-white/15 bg-gradient-to-br from-[#0F172A] via-[#0A0A0A] to-[#050505] p-5 text-center">
                  {tribe.headPhotoUrl ? (
                    <img
                      src={tribe.headPhotoUrl}
                      alt={tribe.headName || `Tribe of ${tribe.name}`}
                      className="h-36 w-36 border border-white/30 object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-28 w-28 flex-col items-center justify-center border border-[#F5B73B]/40 bg-[#050505]">
                      <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-neutral-500">
                        Tribe
                      </span>
                      <span className="font-display text-3xl font-extrabold text-[#F5B73B]">
                        {String(tribe.order).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">
                    {tribe.headName || 'Head • Pending'}
                  </p>
                </div>
              )}
              renderRight={(tribe) => {
                const whatsappNum = (tribe.whatsapp || tribe.phone || '').replace(/[^0-9]/g, '');
                return (
                  <div>
                    <span className="inline-block border border-[#F5B73B]/40 bg-[#F5B73B]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#F5B73B]">
                      Tribe {String(tribe.order).padStart(2, '0')} / 12
                    </span>
                    <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold uppercase leading-tight text-white">
                      {tribe.name}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
                      {tribe.introduction}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openTribeModal(tribe.id)}
                        className="inline-flex items-center gap-2 border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-colors cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Join {tribe.name}</span>
                      </button>
                      {tribe.phone && (
                        <a
                          href={`tel:${tribe.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 border border-white/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 border border-white/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* GALLERY PREVIEW — Crisp Paper Surface with Vibrant Full-Color Photography */}
      <section className="bg-[#F7F7F7] text-[#050505] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <SectionHeading light eyebrow="Archive" title="Gallery" />
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 border border-[#050505] bg-[#050505] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-[#087BFF] hover:border-[#087BFF] transition-colors cursor-pointer shrink-0"
              >
                <span>Open Gallery</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Link
                key={photo.id}
                to="/gallery"
                className="group relative overflow-hidden border border-black/15 bg-[#050505] aspect-[4/3] cursor-pointer"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white">
                    {photo.title}
                  </p>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* PROGRAMME DETAIL MODAL */}
      <Modal
        open={Boolean(selectedProgramme)}
        onClose={() => setSelectedProgramme(null)}
        title={selectedProgramme?.title || ''}
        subtitle={selectedProgramme?.schedule}
      >
        {selectedProgramme && (
          <div className="space-y-5">
            {selectedProgramme.imageUrl && (
              <div className="overflow-hidden border border-white/15 bg-[#050505]">
                <img
                  src={selectedProgramme.imageUrl}
                  alt={selectedProgramme.title}
                  className={`w-full max-h-60 ${
                    selectedProgramme.slug === 'shekinah-night'
                      ? 'object-contain p-6'
                      : 'object-cover'
                  }`}
                />
              </div>
            )}
            <p className="text-sm leading-relaxed text-neutral-300">
              {selectedProgramme.details || selectedProgramme.description}
            </p>
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <Link
                to="/contact"
                onClick={() => setSelectedProgramme(null)}
                className="inline-flex items-center gap-2 border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-colors cursor-pointer"
              >
                <span>Enquire</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <TribeRegisterModal
        open={tribeModalOpen}
        onClose={() => setTribeModalOpen(false)}
        tribes={tribes}
        selectedTribeId={selectedTribeId}
      />
    </PageLayout>
  );
}
