import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementSlot } from '../ui/AnnouncementSlot';

export function PageLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />
      <AnnouncementSlot placement="top-banner" />
      <main key={pathname} className="flex-1 page-transition">
        {children}
      </main>
      <Footer />
    </div>
  );
}
