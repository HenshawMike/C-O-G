import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SectionHeading } from '../components/ui/SectionHeading';
import { PortraitFrame } from '../components/ui/PortraitFrame';
import { useSiteData } from '../context/SiteDataContext';

const PILLARS = [
  { num: '01', title: 'Spiritual Excellence' },
  { num: '02', title: 'Worship & Prayer' },
  { num: '03', title: 'Christian Fellowship' },
  { num: '04', title: 'Community & Belonging' },
  { num: '05', title: 'Spiritual Growth' },
  { num: '06', title: 'University Church Culture' },
];

export function AboutPage() {
  const { data } = useSiteData();
  const leaders = data?.leaders ?? [];

  return (
    <PageLayout>
      <section className="pt-36 pb-20 cog-mono-stage cog-grain border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="About"
            title="Chapel of Glory"
            subtitle="Arthur Jarvis University — Raising a generation of faith, purpose and glory."
          />
        </div>
      </section>

      <section className="bg-[#F7F7F7] text-[#050505] py-20 lg:py-28 border-b border-black/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="border border-black/15 bg-white p-10 flex flex-col items-center text-center">
              <img
                src="/images/chapel-logo.jpg"
                alt="Chapel of Glory Emblem"
                className="h-48 w-48 object-contain"
              />
              <p className="mt-6 font-editorial italic text-xl text-neutral-800">
                &ldquo;Discovery and Recovery.&rdquo;
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/15 border border-black/15">
              <div className="bg-white p-7">
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-500">
                  Mission
                </span>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  Official mission statement placeholder — editable by Chapel Leadership.
                </p>
              </div>
              <div className="bg-white p-7">
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-500">
                  Vision
                </span>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  Official vision statement placeholder — editable by Chapel Leadership.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-black/15 border border-black/15">
              {PILLARS.map((p) => (
                <div key={p.num} className="bg-white p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">
                    {p.num}
                  </span>
                  <p className="mt-2 font-display text-sm font-bold uppercase text-[#050505]">
                    {p.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="leadership" className="bg-[#050505] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Leadership" title="Chaplains" />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaders.map((leader) => (
              <article
                key={leader.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-6 border border-white/15 bg-[#0A0A0A] p-6"
              >
                <div className="sm:col-span-5">
                  <PortraitFrame
                    photoUrl={leader.photoUrl}
                    name={leader.fullName}
                    subtitle={leader.position}
                  />
                </div>
                <div className="sm:col-span-7 flex flex-col justify-between">
                  <div>
                    <span className="inline-block border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-300">
                      {leader.position}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold uppercase text-white">
                      {leader.fullName}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                      {leader.bio}
                    </p>
                  </div>
                  {leader.contactInfo && (
                    <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white">
                      {leader.contactInfo}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 border border-white/15 bg-[#0A0A0A] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h3 className="font-display text-2xl font-bold uppercase text-white">
              Belong to a Tribe
            </h3>
            <Link
              to="/tribes"
              className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] hover:bg-transparent hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <span>Join a Tribe</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
