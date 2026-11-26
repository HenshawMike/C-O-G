import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Loader2, Save, X, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteData } from '../../context/SiteDataContext';
import { useToast } from '../../context/ToastContext';
import type { Programme, ProgrammeTheme } from '../../types';

export function AdminProgrammesPanel() {
  const { data, refresh } = useSiteData();
  const { showToast } = useToast();
  const programmes = data?.programmes ?? [];

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [theme, setTheme] = useState<ProgrammeTheme>('electric-blue');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setEditingId('new');
    setTitle('');
    setSchedule('');
    setDescription('');
    setDetails('');
    setTheme('electric-blue');
    setImageUrl(null);
    setIsFeatured(false);
    setDisplayOrder(programmes.length + 1);
  };

  const startEdit = (prog: Programme) => {
    setEditingId(prog.id);
    setTitle(prog.title);
    setSchedule(prog.schedule);
    setDescription(prog.description);
    setDetails(prog.details);
    setTheme(prog.theme);
    setImageUrl(prog.imageUrl);
    setIsFeatured(prog.isFeatured);
    setDisplayOrder(prog.displayOrder);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setImageUrl(res.url);
      showToast('Programme image uploaded.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !schedule.trim()) {
      showToast('Programme title and schedule are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        schedule,
        description,
        details,
        theme,
        imageUrl,
        isFeatured,
        displayOrder,
      };
      if (editingId === 'new') {
        await api.createProgramme(payload);
        showToast('Programme created.', 'success');
      } else if (editingId) {
        await api.updateProgramme(editingId, payload);
        showToast('Programme updated.', 'success');
      }
      setEditingId(null);
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete programme "${name}"?`)) return;
    try {
      await api.deleteProgramme(id);
      showToast('Programme removed.', 'success');
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Programme Management</h2>
          <p className="text-sm text-[#A3A3A3]/75">
            Update schedules, descriptions, visual themes, and featured upcoming events.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-none bg-white text-[#050505] px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Programme
        </button>
      </div>

      {editingId && (
        <form
          onSubmit={handleSave}
          className="rounded-none border border-white/30 bg-[#0A0A0A] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-display text-lg font-bold text-white">
              {editingId === 'new' ? 'New Programme' : 'Edit Programme'}
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
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Day & Time Schedule *
              </label>
              <input
                type="text"
                required
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. Sunday, 8:00 AM"
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Short Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Full Event Details
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Visual Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ProgrammeTheme)}
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              >
                <option value="electric-blue">Electric Blue (Primary)</option>
                <option value="fiery-red">Fiery Red (Special Event)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Order
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
              <label className="flex items-center justify-center gap-2 rounded-none border border-dashed border-white/45 bg-[#050505] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{imageUrl ? 'Change Banner' : 'Upload Banner'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 text-sm text-[#A3A3A3] cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded accent-[#FFFFFF]"
            />
            <span>Feature as highlighted upcoming event</span>
          </label>

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
              Save Programme
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {programmes.map((prog) => (
          <div
            key={prog.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-none border border-white/10 bg-[#0A0A0A]/70 p-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-white">{prog.title}</h3>
                <span
                  className={`rounded-none px-2.5 py-0.5 text-[11px] font-semibold ${
                    prog.theme === 'fiery-red'
                      ? 'bg-red-500/20 text-white'
                      : 'bg-white/10 border border-white/20 text-white'
                  }`}
                >
                  {prog.schedule}
                </span>
                {prog.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-none bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    <Star className="h-3 w-3 text-white" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A3A3A3]/75 line-clamp-1">{prog.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(prog)}
                className="inline-flex items-center gap-1.5 rounded-none border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:border-white cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(prog.id, prog.title)}
                className="inline-flex items-center gap-1.5 rounded-none border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
