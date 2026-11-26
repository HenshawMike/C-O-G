import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteData } from '../../context/SiteDataContext';
import { useToast } from '../../context/ToastContext';
import type { Announcement, AnnouncementPlacement } from '../../types';

const PLACEMENT_LABELS: Record<AnnouncementPlacement, string> = {
  'hero-card': 'Homepage Hero Card',
  'top-banner': 'Site-Wide Top Banner',
  'programmes-page': 'Programmes Page',
  'tribes-page': 'Twelve Tribes Page',
};

export function AdminAnnouncementsPanel() {
  const { data, mutate } = useSiteData();
  const { showToast } = useToast();
  const announcements = data?.announcements ?? [];

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('');
  const [placement, setPlacement] = useState<AnnouncementPlacement>('hero-card');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkTo, setLinkTo] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setEditingId('new');
    setTitle('');
    setMessage('');
    setBadge('');
    setPlacement('hero-card');
    setLinkLabel('');
    setLinkTo('');
    setActive(true);
  };

  const startEdit = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title);
    setMessage(item.message);
    setBadge(item.badge);
    setPlacement(item.placement);
    setLinkLabel(item.linkLabel);
    setLinkTo(item.linkTo);
    setActive(item.active);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { title, message, badge, placement, linkLabel, linkTo, active };
      if (editingId === 'new') {
        const created = await api.createAnnouncement(payload);
        mutate((prev) => ({
          ...prev,
          announcements: [created, ...(prev.announcements ?? [])],
        }));
        showToast('Announcement created.', 'success');
      } else if (editingId) {
        const updated = await api.updateAnnouncement(editingId, payload);
        mutate((prev) => ({
          ...prev,
          announcements: (prev.announcements ?? []).map((a) =>
            a.id === updated.id ? updated : a
          ),
        }));
        showToast('Announcement updated.', 'success');
      }
      setEditingId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Announcement) => {
    try {
      const updated = await api.updateAnnouncement(item.id, { active: !item.active });
      mutate((prev) => ({
        ...prev,
        announcements: (prev.announcements ?? []).map((a) =>
          a.id === updated.id ? updated : a
        ),
      }));
      showToast(updated.active ? 'Announcement live.' : 'Announcement hidden.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!window.confirm(`Delete announcement "${itemTitle}"?`)) return;
    try {
      await api.deleteAnnouncement(id);
      mutate((prev) => ({
        ...prev,
        announcements: (prev.announcements ?? []).filter((a) => a.id !== id),
      }));
      showToast('Announcement deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Announcements</h2>
          <p className="text-sm text-neutral-400">
            Publish dismissible announcements to the Homepage Hero, Top Banner, Programmes, or
            Tribes page.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 bg-white text-[#050505] px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      {editingId && (
        <form
          onSubmit={handleSave}
          className="border border-white/25 bg-[#0A0A0A] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display text-lg font-bold text-white">
              {editingId === 'new' ? 'New Announcement' : 'Edit Announcement'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunday Service — 8:00 AM"
                className="w-full border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Placement *
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as AnnouncementPlacement)}
                className="w-full border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              >
                <option value="hero-card">Homepage Hero Card</option>
                <option value="top-banner">Site-Wide Top Banner</option>
                <option value="programmes-page">Programmes Page</option>
                <option value="tribes-page">Twelve Tribes Page</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Message *
            </label>
            <textarea
              rows={2}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Short, clear announcement message..."
              className="w-full border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Badge (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Urgent, 8:00 AM, New"
                className="w-full border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Link Label (Optional)
              </label>
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="e.g. Programmes"
                className="w-full border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Link Destination (Optional)
              </label>
              <select
                value={linkTo}
                onChange={(e) => setLinkTo(e.target.value)}
                className="w-full border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              >
                <option value="">No link</option>
                <option value="/programmes">Programmes (/programmes)</option>
                <option value="/tribes">Join a Tribe (/tribes)</option>
                <option value="/gallery">Gallery (/gallery)</option>
                <option value="/about">About Us (/about)</option>
                <option value="/contact">Contact Us (/contact)</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 text-sm text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            <span>Active (visible on the website)</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="border border-white/15 px-4 py-2 text-sm text-neutral-400 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-white text-[#050505] px-5 py-2 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Announcement
            </button>
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="border border-white/10 bg-[#0A0A0A] p-10 text-center text-sm text-neutral-400">
          No announcements yet. Click &ldquo;New Announcement&rdquo; to publish one.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/15 bg-[#0A0A0A] p-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-white">{item.title}</h3>
                  <span className="border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {PLACEMENT_LABELS[item.placement]}
                  </span>
                  {item.badge && (
                    <span className="border border-[#F5B73B]/40 bg-[#F5B73B]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#F5B73B]">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                      item.active ? 'bg-white text-[#050505]' : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {item.active ? 'Live' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{item.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:border-white cursor-pointer"
                >
                  {item.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {item.active ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:border-white cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="inline-flex items-center gap-1.5 border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
