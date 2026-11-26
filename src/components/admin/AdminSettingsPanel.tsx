import React, { useState, useEffect, useCallback } from 'react';
import { Save, UserPlus, Trash2, Loader2, Shield } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteData } from '../../context/SiteDataContext';
import { useToast } from '../../context/ToastContext';
import type { SafeAdminUser, AdminRole } from '../../types';

export function AdminSettingsPanel() {
  const { data, refresh } = useSiteData();
  const { showToast } = useToast();

  const [phone, setPhone] = useState(data?.settings.phone || '');
  const [whatsapp, setWhatsapp] = useState(data?.settings.whatsapp || '');
  const [email, setEmail] = useState(data?.settings.email || '');
  const [address, setAddress] = useState(data?.settings.address || '');
  const [socialHandle, setSocialHandle] = useState(data?.settings.socialHandle || '');
  const [instagramUrl, setInstagramUrl] = useState(data?.settings.instagramUrl || '');
  const [telegramUrl, setTelegramUrl] = useState(data?.settings.telegramUrl || '');
  const [savingSettings, setSavingSettings] = useState(false);

  const [users, setUsers] = useState<SafeAdminUser[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('editor');
  const [creatingUser, setCreatingUser] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const list = await api.getAdminUsers();
      setUsers(list);
    } catch {
      // ignore if non-super-admin
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.updateSettings({
        phone,
        whatsapp,
        email,
        address,
        socialHandle,
        instagramUrl,
        telegramUrl,
      });
      showToast('Church contact & social settings saved.', 'success');
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const created = await api.createAdminUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setUsers((prev) => [...prev, created]);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      showToast(`Administrator "${created.name}" created.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create user.', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Remove administrator "${name}"?`)) return;
    try {
      await api.deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('Administrator removed.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete user.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          Church Settings & Access Control
        </h2>
        <p className="text-sm text-[#A3A3A3]/75">
          Manage official contact details, verified social media links, and role-based admin
          accounts.
        </p>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="rounded-none border border-white/25 bg-[#0A0A0A] p-6 space-y-4"
      >
        <h3 className="font-display text-lg font-bold text-white">
          Official Contact & Social Media
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Official Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              WhatsApp Number (Digits with country code)
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Church Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Social Handle
            </label>
            <input
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Official Instagram URL (Leave blank if not ready)
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Official Telegram URL (Leave blank if not ready)
            </label>
            <input
              type="url"
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              placeholder="https://t.me/..."
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
            Physical Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          disabled={savingSettings}
          className="inline-flex items-center gap-2 rounded-none bg-white text-[#050505] px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-60 cursor-pointer"
        >
          {savingSettings ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </button>
      </form>

      {/* Admin Users */}
      <div className="rounded-none border border-white/15 bg-[#0A0A0A]/70 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-white" />
          <h3 className="font-display text-lg font-bold text-white">
            Role-Based Admin Accounts
          </h3>
        </div>

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full Name"
            className="rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
          />
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
          />
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            className="rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AdminRole)}
            className="rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
          >
            <option value="editor">Editor</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button
            type="submit"
            disabled={creatingUser}
            className="inline-flex items-center justify-center gap-1.5 rounded-none bg-white text-[#050505] px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </form>

        <div className="divide-y divide-white/10 rounded-none border border-white/10 bg-[#050505]/70">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-white">{u.name}</p>
                <p className="text-xs text-[#A3A3A3]/70">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-none bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-white">
                  {u.role.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  aria-label={`Remove ${u.name}`}
                  className="text-red-300 hover:text-red-200 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
