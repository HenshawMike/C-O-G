import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programmes', label: 'Programmes' },
  { to: '/tribes', label: 'Tribes' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navListRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const activeIndex = NAV_LINKS.findIndex((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  );

  const measureIndicator = useCallback(() => {
    const idx = activeIndex >= 0 ? activeIndex : 0;
    const activeEl = itemRefs.current[idx];
    const listEl = navListRef.current;
    if (!activeEl || !listEl) return;
    const listRect = listEl.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: itemRect.left - listRect.left,
      width: itemRect.width,
      ready: true,
    });
  }, [activeIndex]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    measureIndicator();
    window.addEventListener('resize', measureIndicator);
    return () => window.removeEventListener('resize', measureIndicator);
  }, [measureIndicator]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-5 left-4 right-4 z-40 mx-auto max-w-7xl">
      <nav
        aria-label="Primary Navigation"
        className={`flex items-center justify-between border border-white/35 px-4 py-3 sm:px-6 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050505]/92 shadow-[0_18px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl'
            : 'bg-[#050505]/75 backdrop-blur-lg'
        }`}
      >
        {/* Brand — full color logo */}
        <Link to="/" className="flex items-center gap-3.5 group cursor-pointer">
          <div className="h-10 w-10 overflow-hidden border border-white/40 bg-white p-0.5 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/images/chapel-logo.jpg"
              alt="Chapel of Glory Official Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-[0.12em] text-white">
              CHAPEL OF GLORY
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.26em] text-neutral-400">
              Arthur Jarvis University
            </span>
          </div>
        </Link>

        {/* Desktop Links with smooth left/right sliding indicator */}
        <ul ref={navListRef} className="relative hidden lg:flex items-center gap-1">
          {indicator.ready && activeIndex >= 0 && (
            <span
              aria-hidden="true"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: `${indicator.width}px`,
              }}
              className="pointer-events-none absolute top-0 bottom-0 left-0 bg-white transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          )}

          {NAV_LINKS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <li key={item.to} className="relative z-10">
                <Link
                  to={item.to}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  className={`block px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors duration-300 cursor-pointer ${
                    isActive ? 'text-[#050505]' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center">
          <Link
            to="/tribes"
            className="inline-flex items-center gap-2 border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-all duration-300 cursor-pointer"
          >
            <span>Join a Tribe</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center border border-white/35 text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden mt-2 border border-white/35 bg-[#050505]/95 px-6 py-5 backdrop-blur-xl page-transition">
          <ul className="flex flex-col divide-y divide-white/10">
            {NAV_LINKS.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`block py-3.5 text-xs font-bold uppercase tracking-[0.22em] transition-colors cursor-pointer ${
                      isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/tribes"
            className="mt-4 flex items-center justify-center gap-2 border border-white bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] hover:bg-[#087BFF] hover:border-[#087BFF] hover:text-white transition-colors cursor-pointer"
          >
            <span>Join a Tribe</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </header>
  );
}
