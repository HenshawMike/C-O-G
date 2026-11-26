import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Loader2, Save, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteData } from '../../context/SiteDataContext';
import { useToast } from '../../context/ToastContext';
import { PortraitFrame } from '../ui/PortraitFrame';
import type { Leader } from '../../types';

export function AdminLeadershipPanel() {
  const { data, refresh } = useSiteData();
  const { showToast } = useToast();
  const leaders = data?.leaders ?? [];

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setEditingId('new');
    setFullName('');
    setPosition('');
    setBio('');
    setContactInfo('');
    setPhotoUrl(null);
    setDisplayOrder(leaders.length + 1);
  };

  const startEdit = (leader: Leader) => {
    setEditingId(leader.id);
    setFullName(leader.fullName);
    setPosition(leader.position);
    setBio(leader.bio);
    setContactInfo(leader.contactInfo);
    setPhotoUrl(leader.photoUrl);
    setDisplayOrder(leader.displayOrder);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setPhotoUrl(res.url);
      showToast('Portrait uploaded successfully.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim()) {
      showToast('Full name and position are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { fullName, position, bio, contactInfo, photoUrl, displayOrder };
      if (editingId === 'new') {
        await api.createLeader(payload);
        showToast('Leadership profile added.', 'success');
      } else if (editingId) {
        await api.updateLeader(editingId, payload);
        showToast('Leadership profile updated.', 'success');
      }
      setEditingId(null);
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete leadership profile for ${name}?`)) return;
    try {
      await api.deleteLeader(id);
      showToast('Leader removed.', 'success');
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Leadership Management</h2>
          <p className="text-sm text-[#A3A3A3]/75">
            Add or edit Chapel leadership profiles, portraits, and biographies.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-none bg-white text-[#050505] px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Leader
        </button>
      </div>

      {editingId && (
        <form
          onSubmit={handleSave}
          className="rounded-none border border-white/30 bg-[#0A0A0A] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display text-lg font-bold text-white">
              {editingId === 'new' ? 'New Leadership Profile' : 'Edit Leadership Profile'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-[#A3A3A3]/70 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rev. Samuel Bassey"
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Official Position *
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Head Chaplain"
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Short Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Contact Info (Optional)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Optional office contact"
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Portrait Photograph
              </label>
              <label className="flex items-center justify-center gap-2 rounded-none border border-dashed border-white/45 bg-[#050505] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{photoUrl ? 'Change Portrait' : 'Upload Portrait'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          {photoUrl && (
            <div className="flex items-center gap-4 pt-1">
              <img
                src={photoUrl}
                alt="Preview"
                className="h-16 w-16 rounded-none object-cover border border-white/20"
              />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="text-xs text-red-300 hover:underline cursor-pointer"
              >
                Remove Photo
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-none border border-white/15 px-4 py-2 text-sm text-[#A3A3A3] hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-none bg-white text-[#050505] px-5 py-2 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {leaders.map((leader) => (
          <div
            key={leader.id}
            className="flex gap-4 rounded-none border border-white/10 bg-[#0A0A0A]/70 p-4"
          >
            <div className="w-24 shrink-0">
              <PortraitFrame
                photoUrl={leader.photoUrl}
                name={leader.fullName}
                aspectClass="aspect-[4/5]"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {leader.position}
                </span>
                <h3 className="font-display text-lg font-bold text-white truncate">
                  {leader.fullName}
                </h3>
                <p className="mt-1 text-xs text-[#A3A3A3]/75 line-clamp-2">{leader.bio}</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(leader)}
                  className="inline-flex items-center gap-1.5 rounded-none border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:border-white cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(leader.id, leader.fullName)}
                  className="inline-flex items-center gap-1.5 rounded-none border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
