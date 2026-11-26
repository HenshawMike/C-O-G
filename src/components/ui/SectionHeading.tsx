interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
}: SectionHeadingProps) {
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-2xl ${alignClasses}`}>
      <div
        className={`inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] ${
          light ? 'text-neutral-500' : 'text-neutral-400'
        }`}
      >
        <span className={`h-px w-8 ${light ? 'bg-black' : 'bg-white'}`} />
        <span>{eyebrow}</span>
      </div>
      <h2
        className={`mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-[1.04] ${
          light ? 'text-[#050505]' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-sm sm:text-base leading-relaxed ${
            light ? 'text-neutral-600' : 'text-neutral-400'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
