import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Upload, Save, X, Loader2, Download, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteData } from '../../context/SiteDataContext';
import { useToast } from '../../context/ToastContext';
import type { Tribe, TribeRegistration, RegistrationStatus } from '../../types';

export function AdminTribesPanel() {
  const { data, refresh } = useSiteData();
  const { showToast } = useToast();
  const tribes = data?.tribes ?? [];

  const [subTab, setSubTab] = useState<'registrations' | 'directory'>('registrations');
  const [tribeFilter, setTribeFilter] = useState('all');
  const [registrations, setRegistrations] = useState<TribeRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);

  const [editingTribe, setEditingTribe] = useState<Tribe | null>(null);
  const [headName, setHeadName] = useState('');
  const [headPhotoUrl, setHeadPhotoUrl] = useState<string | null>(null);
  const [introduction, setIntroduction] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadRegistrations = useCallback(async () => {
    setLoadingRegs(true);
    try {
      const list = await api.getRegistrations(tribeFilter);
      setRegistrations(list);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load registrations.', 'error');
    } finally {
      setLoadingRegs(false);
    }
  }, [tribeFilter, showToast]);

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);

  const startEditTribe = (tribe: Tribe) => {
    setEditingTribe(tribe);
    setHeadName(tribe.headName);
    setHeadPhotoUrl(tribe.headPhotoUrl);
    setIntroduction(tribe.introduction);
    setPhone(tribe.phone);
    setWhatsapp(tribe.whatsapp);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setHeadPhotoUrl(res.url);
      showToast('Tribe Head photo uploaded.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const saveTribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTribe) return;
    setSaving(true);
    try {
      await api.updateTribe(editingTribe.id, {
        headName,
        headPhotoUrl,
        introduction,
        phone,
        whatsapp,
      });
      showToast(`Tribe of ${editingTribe.name} updated.`, 'success');
      setEditingTribe(null);
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id: string, status: RegistrationStatus) => {
    try {
      await api.updateRegistrationStatus(id, status);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      showToast('Registration status updated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const removeRegistration = async (id: string) => {
    if (!window.confirm('Delete this tribe registration record?')) return;
    try {
      await api.deleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      showToast('Registration deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  const exportCsv = () => {
    const headers = ['Date', 'Tribe', 'Full Name', 'Phone', 'Email', 'Status', 'Additional Info'];
    const rows = registrations.map((r) => [
      new Date(r.createdAt).toLocaleDateString(),
      r.tribeName,
      r.fullName,
      r.phone,
      r.email,
      r.status,
      r.additionalInfo.replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapel-of-glory-tribe-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Twelve Tribes Management</h2>
          <p className="text-sm text-[#A3A3A3]/75">
            Review tribe registrations and manage Tribe Head profiles & contact details.
          </p>
        </div>

        <div className="flex rounded-none border border-white/15 bg-[#050505] p-1">
          <button
            type="button"
            onClick={() => setSubTab('registrations')}
            className={`rounded-none px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              subTab === 'registrations'
                ? 'bg-white text-[#050505]'
                : 'text-[#A3A3A3]/80 hover:text-white'
            }`}
          >
            Registrations ({registrations.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('directory')}
            className={`rounded-none px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              subTab === 'directory'
                ? 'bg-white text-[#050505]'
                : 'text-[#A3A3A3]/80 hover:text-white'
            }`}
          >
            Manage 12 Tribes
          </button>
        </div>
      </div>

      {subTab === 'registrations' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              value={tribeFilter}
              onChange={(e) => setTribeFilter(e.target.value)}
              aria-label="Filter registrations by tribe"
              className="rounded-none border border-white/15 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            >
              <option value="all">All 12 Tribes</option>
              {tribes.map((t) => (
                <option key={t.id} value={t.id}>
                  Tribe of {t.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={exportCsv}
              disabled={registrations.length === 0}
              className="inline-flex items-center gap-2 rounded-none border border-white/35 bg-[#0A0A0A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white hover:text-[#050505] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {loadingRegs ? (
            <div className="py-12 text-center text-sm text-[#A3A3A3]/70">
              Loading registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="rounded-none border border-white/10 bg-[#0A0A0A]/50 p-10 text-center text-sm text-[#A3A3A3]/75">
              No tribe registrations recorded yet for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-none border border-white/10 bg-[#0A0A0A]/60">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-[#050505]/70 text-xs uppercase tracking-wider text-[#A3A3A3]/70">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Tribe</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white">{reg.fullName}</p>
                        <p className="text-xs text-[#A3A3A3]/60">
                          {new Date(reg.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-none bg-white/10 border border-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                          {reg.tribeName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A3A3A3]">
                        <p>{reg.phone}</p>
                        <p className="text-[#A3A3A3]/70">{reg.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A3A3A3]/80 max-w-xs">
                        {reg.additionalInfo || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={reg.status}
                          onChange={(e) =>
                            changeStatus(reg.id, e.target.value as RegistrationStatus)
                          }
                          className="rounded-none border border-white/15 bg-[#050505] px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="welcomed">Welcomed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeRegistration(reg.id)}
                          aria-label="Delete registration"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-red-400/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {editingTribe && (
            <form
              onSubmit={saveTribe}
              className="rounded-none border border-white/35 bg-[#0A0A0A] p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-lg font-bold text-white">
                  Edit Tribe of {editingTribe.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTribe(null)}
                  className="text-[#A3A3A3]/70 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                    Tribe Head Name
                  </label>
                  <input
                    type="text"
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder="Enter Tribe Head full name"
                    className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 ..."
                    className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="23480..."
                    className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                  Short Introduction
                </label>
                <textarea
                  rows={2}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 rounded-none border border-dashed border-white/45 bg-[#050505] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{headPhotoUrl ? 'Change Head Photo' : 'Upload Head Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTribe(null)}
                    className="rounded-none border border-white/15 px-4 py-2 text-sm text-[#A3A3A3] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-none bg-white text-[#050505] px-5 py-2 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Tribe
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tribes.map((tribe) => (
              <div
                key={tribe.id}
                className="rounded-none border border-white/10 bg-[#0A0A0A]/70 p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                    Tribe {String(tribe.order).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    Tribe of {tribe.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#A3A3A3]/80">
                    Head: {tribe.headName || 'Not set yet'}
                  </p>
                  {tribe.phone && (
                    <p className="text-xs text-[#A3A3A3]/65 mt-0.5">Phone: {tribe.phone}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startEditTribe(tribe)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-none border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:border-white cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Tribe Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
