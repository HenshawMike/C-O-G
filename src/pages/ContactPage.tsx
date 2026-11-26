import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useSiteData } from '../context/SiteDataContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

export function ContactPage() {
  const { data } = useSiteData();
  const { showToast } = useToast();
  const settings = data?.settings;

  const phone = settings?.phone || '+234 907 052 1282';
  const whatsappDigits = (settings?.whatsapp || '2349070521282').replace(/[^0-9]/g, '');
  const socialHandle = settings?.socialHandle || '@CHAPEL OF GLORY';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitContact({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phoneInput.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setFullName('');
      setEmail('');
      setPhoneInput('');
      setMessage('');
      showToast('Message sent.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to send message.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <section className="pt-36 pb-16 cog-mono-stage cog-grain border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Connect" title="Contact Us" />
        </div>
      </section>

      <section className="bg-[#050505] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-px bg-white/15 border border-white/15 h-fit">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-4 bg-[#0A0A0A] p-6 hover:bg-[#141414] transition-colors cursor-pointer"
            >
              <Phone className="h-4 w-4 text-white shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                  Phone
                </p>
                <p className="font-display text-lg font-bold text-white mt-0.5">{phone}</p>
              </div>
            </a>

            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#0A0A0A] p-6 hover:bg-[#141414] transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-white shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                  WhatsApp
                </p>
                <p className="font-display text-lg font-bold text-white mt-0.5">
                  Direct Message
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 bg-[#0A0A0A] p-6">
              <Mail className="h-4 w-4 text-white shrink-0 mt-1" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                  Email
                </p>
                <p className="text-sm text-neutral-300 break-all mt-0.5">
                  {settings?.email || 'Placeholder'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-[#0A0A0A] p-6">
              <MapPin className="h-4 w-4 text-white shrink-0 mt-1" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                  Address
                </p>
                <p className="text-sm text-neutral-300 mt-0.5">
                  {settings?.address || 'Arthur Jarvis University Campus'}
                </p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] p-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-neutral-400">
              <span>{socialHandle}</span>
              <div className="flex gap-4">
                {settings?.instagramUrl ? (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                    IG
                  </a>
                ) : (
                  <span>IG</span>
                )}
                {settings?.telegramUrl ? (
                  <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                    TG
                  </a>
                ) : (
                  <span>TG</span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 border border-white/15 bg-[#0A0A0A] p-7 sm:p-10">
            <h2 className="font-display text-2xl font-bold uppercase text-white">Message</h2>

            {submitted ? (
              <div className="mt-8 border border-white/20 bg-[#050505] p-8 text-center space-y-4">
                <CheckCircle2 className="mx-auto h-10 w-10 text-white" />
                <p className="font-display text-xl font-bold uppercase text-white">Received</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="border border-white bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#050505] hover:bg-transparent hover:text-white transition-colors cursor-pointer"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                {error && (
                  <div className="border border-white/30 bg-white/10 px-4 py-3 text-xs text-white">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="contact-name" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-white/20 bg-[#050505] px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-white/20 bg-[#050505] px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                      Phone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+234 ..."
                      className="w-full border border-white/20 bg-[#050505] px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full border border-white/20 bg-[#050505] px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 border border-white bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] hover:bg-transparent hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
