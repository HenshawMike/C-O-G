import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Flag,
  Image as ImageIcon,
  MessageSquare,
  Megaphone,
  Settings,
  LogOut,
  Lock,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteDataContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { AdminLeadershipPanel } from '../components/admin/AdminLeadershipPanel';
import { AdminProgrammesPanel } from '../components/admin/AdminProgrammesPanel';
import { AdminTribesPanel } from '../components/admin/AdminTribesPanel';
import { AdminGalleryPanel } from '../components/admin/AdminGalleryPanel';
import { AdminContactsPanel } from '../components/admin/AdminContactsPanel';
import { AdminAnnouncementsPanel } from '../components/admin/AdminAnnouncementsPanel';
import { AdminSettingsPanel } from '../components/admin/AdminSettingsPanel';

type AdminTab =
  | 'overview'
  | 'announcements'
  | 'leadership'
  | 'programmes'
  | 'tribes'
  | 'gallery'
  | 'contacts'
  | 'settings';

export function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  const { data } = useSiteData();
  const { showToast } = useToast();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regCount, setRegCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    void Promise.all([api.getRegistrations(), api.getContactMessages()])
      .then(([regs, msgs]) => {
        setRegCount(regs.length);
        setMsgCount(msgs.length);
      })
      .catch(() => {});
  }, [user, tab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSigningIn(true);
    try {
      await login(email, password);
      setPassword('');
      showToast('Signed in.', 'success');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <Loader2 className="h-7 w-7 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen cog-mono-stage flex flex-col items-center justify-center p-6 page-transition">
        <div className="w-full max-w-md border border-white/20 bg-[#0A0A0A] p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 overflow-hidden border border-white/25 bg-white p-0.5">
              <img
                src="/images/chapel-logo.jpg"
                alt="Chapel of Glory"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase text-white">
              Admin
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.26em] text-neutral-400">
              Chapel of Glory • AJU
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            {loginError && (
              <div className="border border-white/30 bg-white/10 px-4 py-3 text-xs text-white">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="admin-email" className="block text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full inline-flex items-center justify-center gap-2 border border-white bg-white py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-[#050505] hover:bg-transparent hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              <span>Sign In</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; superOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'leadership', label: 'Leadership', icon: Users },
    { id: 'programmes', label: 'Programmes', icon: Calendar },
    { id: 'tribes', label: 'Tribes', icon: Flag },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'contacts', label: 'Enquiries', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings, superOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row page-transition">
      <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-white/15 bg-[#0A0A0A] p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <img
              src="/images/chapel-logo.jpg"
              alt="Chapel of Glory"
              className="h-9 w-9 bg-white p-0.5 object-cover"
            />
            <div>
              <p className="font-display text-xs font-bold tracking-[0.14em] text-white">
                CHAPEL OF GLORY
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400">Admin</p>
            </div>
          </div>

          <nav className="mt-5 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {navItems
              .filter((item) => !item.superOnly || user.role === 'super_admin')
              .map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-white text-[#050505]'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
          <div className="border border-white/10 bg-[#050505] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="truncate">{user.name}</span>
            </div>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {user.role.replace('_', ' ')}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-neutral-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border border-white/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-300 hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              Out
            </button>
          </div>
        </div>
      </aside>

      <main key={tab} className="flex-1 p-6 lg:p-10 max-w-6xl w-full page-transition">
        {tab === 'overview' && (
          <div className="space-y-8">
            <h1 className="font-display text-3xl font-extrabold uppercase text-white">
              Overview
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/15 border border-white/15">
              {[
                {
                  label: 'Announcements',
                  value: data?.announcements?.length ?? 0,
                  target: 'announcements' as AdminTab,
                },
                { label: 'Leaders', value: data?.leaders.length ?? 0, target: 'leadership' as AdminTab },
                { label: 'Programmes', value: data?.programmes.length ?? 0, target: 'programmes' as AdminTab },
                { label: 'Tribes', value: data?.tribes.length ?? 12, target: 'tribes' as AdminTab },
                { label: 'Registrations', value: regCount, target: 'tribes' as AdminTab },
                { label: 'Photos', value: data?.photos.length ?? 0, target: 'gallery' as AdminTab },
                { label: 'Enquiries', value: msgCount, target: 'contacts' as AdminTab },
              ].map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => setTab(stat.target)}
                  className="bg-[#0A0A0A] p-7 text-left hover:bg-[#141414] transition-colors cursor-pointer"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-neutral-400">
                    {stat.label}
                  </p>
                  <p className="mt-3 font-display text-4xl font-extrabold text-white">
                    {stat.value}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'announcements' && <AdminAnnouncementsPanel />}
        {tab === 'leadership' && <AdminLeadershipPanel />}
        {tab === 'programmes' && <AdminProgrammesPanel />}
        {tab === 'tribes' && <AdminTribesPanel />}
        {tab === 'gallery' && <AdminGalleryPanel />}
        {tab === 'contacts' && <AdminContactsPanel />}
        {tab === 'settings' && user.role === 'super_admin' && <AdminSettingsPanel />}
      </main>
    </div>
  );
}
