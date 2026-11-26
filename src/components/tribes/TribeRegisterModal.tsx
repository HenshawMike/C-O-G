import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import type { Tribe } from '../../types';

interface TribeRegisterModalProps {
  open: boolean;
  onClose: () => void;
  tribes: Tribe[];
  selectedTribeId: string;
}

export function TribeRegisterModal({
  open,
  onClose,
  tribes,
  selectedTribeId,
}: TribeRegisterModalProps) {
  const { showToast } = useToast();
  const [tribeId, setTribeId] = useState(selectedTribeId);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTribeName, setSubmittedTribeName] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTribeId(selectedTribeId || tribes[0]?.id || '');
      setError(null);
      setSubmittedTribeName(null);
    }
  }, [open, selectedTribeId, tribes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !tribeId) {
      setError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const reg = await api.registerTribe({
        tribeId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        additionalInfo: additionalInfo.trim(),
      });
      setSubmittedTribeName(reg.tribeName);
      setFullName('');
      setPhone('');
      setEmail('');
      setAdditionalInfo('');
      showToast(`Registered for the Tribe of ${reg.tribeName}.`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to submit registration.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join a Tribe"
      subtitle="Twelve Tribes of Israel • Chapel of Glory"
    >
      {submittedTribeName ? (
        <div className="py-6 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-10 w-10 text-white" />
          <h4 className="font-display text-2xl font-bold uppercase text-white">
            Tribe of {submittedTribeName}
          </h4>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            Registration confirmed. Your Tribe Head will connect with you shortly.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 border border-white bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] hover:bg-transparent hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="border border-white/30 bg-white/10 px-4 py-3 text-xs text-white">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reg-tribe" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
              Tribe *
            </label>
            <select
              id="reg-tribe"
              value={tribeId}
              onChange={(e) => setTribeId(e.target.value)}
              required
              className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
            >
              {tribes.map((tribe) => (
                <option key={tribe.id} value={tribe.id}>
                  Tribe of {tribe.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reg-name" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
              Full Name *
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-phone" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                Phone *
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 ..."
                className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                Email *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-info" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
              Note (Optional)
            </label>
            <textarea
              id="reg-info"
              rows={2}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Department, level, or note..."
              className="w-full border border-white/20 bg-[#050505] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-300 hover:border-white hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-transparent hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Register</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
