interface PortraitFrameProps {
  photoUrl: string | null;
  name: string;
  subtitle?: string;
  aspectClass?: string;
}

function getInitials(name: string): string {
  const cleaned = name
    .replace(/\b(Rev\.?|Pst\.?|Pastor|Dr\.?|Prof\.?)\b/gi, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function PortraitFrame({
  photoUrl,
  name,
  subtitle,
  aspectClass = 'aspect-[4/5]',
}: PortraitFrameProps) {
  if (photoUrl) {
    return (
      <div
        className={`relative w-full overflow-hidden border border-white/15 bg-[#0A0A0A] ${aspectClass}`}
      >
        <img
          src={photoUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden border border-white/15 bg-[#0D0D0D] flex flex-col items-center justify-center p-6 text-center ${aspectClass}`}
    >
      <div className="flex h-20 w-20 items-center justify-center border border-white/25 bg-[#050505]">
        <span className="font-display text-2xl font-extrabold tracking-widest text-white">
          {getInitials(name)}
        </span>
      </div>
      {subtitle && (
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-neutral-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
