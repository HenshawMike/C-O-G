import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export function Footer() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const phone = settings?.phone || '+234 907 052 1282';
  const whatsappDigits = (settings?.whatsapp || '2349070521282').replace(/[^0-9]/g, '');
  const socialHandle = settings?.socialHandle || '@CHAPEL OF GLORY';

  return (
    <footer className="border-t border-white/15 bg-[#050505] text-neutral-400">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3.5 cursor-pointer">
              <div className="h-11 w-11 overflow-hidden border border-white/25 bg-white p-0.5">
                <img
                  src="/images/chapel-logo.jpg"
                  alt="Chapel of Glory Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-display text-sm font-bold tracking-[0.14em] text-white">
                  CHAPEL OF GLORY
                </p>
                <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-400">
                  Arthur Jarvis University
                </p>
              </div>
            </Link>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-x-6 gap-y-2.5 items-start text-xs font-semibold uppercase tracking-[0.18em]">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About' },
              { to: '/programmes', label: 'Programmes' },
              { to: '/tribes', label: 'Tribes' },
              { to: '/gallery', label: 'Gallery' },
              { to: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 text-xs">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 text-white hover:text-neutral-300 transition-colors cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{phone}</span>
            </a>
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp Office</span>
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Chapel of Glory • Arthur Jarvis University</p>
          <p>Raising a Generation of Faith, Purpose &amp; Glory</p>
        </div>
      </div>
    </footer>
  );
}
