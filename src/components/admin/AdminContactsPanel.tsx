import { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import type { ContactMessage, ContactStatus } from '../../types';

export function AdminContactsPanel() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ContactStatus>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.getContactMessages();
      setMessages(list);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load enquiries.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: ContactStatus) => {
    try {
      await api.updateContactStatus(id, status);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      showToast('Enquiry status updated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('Enquiry deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  const visible = filter === 'all' ? messages : messages.filter((m) => m.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Contact Enquiries</h2>
          <p className="text-sm text-[#A3A3A3]/75">
            View and respond to messages submitted through the Contact Us page.
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'unread', 'read', 'resolved'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-none px-3.5 py-2 text-xs font-semibold capitalize cursor-pointer ${
                filter === status
                  ? 'bg-white text-[#050505]'
                  : 'border border-white/15 bg-[#0A0A0A] text-[#A3A3A3]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#A3A3A3]/70 py-10 text-center">Loading enquiries...</p>
      ) : visible.length === 0 ? (
        <div className="rounded-none border border-white/10 bg-[#0A0A0A]/50 p-10 text-center text-sm text-[#A3A3A3]/75">
          No enquiries in this category yet.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((msg) => (
            <article
              key={msg.id}
              className="rounded-none border border-white/15 bg-[#0A0A0A]/75 p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{msg.fullName}</h3>
                  <p className="text-xs text-[#A3A3A3]/65">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={msg.status}
                    onChange={(e) => updateStatus(msg.id, e.target.value as ContactStatus)}
                    className="rounded-none border border-white/15 bg-[#050505] px-3 py-1.5 text-xs text-white"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(msg.id)}
                    aria-label="Delete message"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-red-400/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#A3A3A3] whitespace-pre-wrap">
                {msg.message}
              </p>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs">
                <a
                  href={`mailto:${msg.email}`}
                  className="inline-flex items-center gap-1.5 text-white hover:underline cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{msg.email}</span>
                </a>
                {msg.phone && (
                  <a
                    href={`tel:${msg.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-white hover:underline cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{msg.phone}</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
