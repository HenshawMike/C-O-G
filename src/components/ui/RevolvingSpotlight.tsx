import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Phase = 'idle' | 'out' | 'in';

interface RevolvingSpotlightProps<T extends { id: string }> {
  items: T[];
  itemLabel: string;
  renderLeft: (item: T, index: number) => React.ReactNode;
  renderRight: (item: T, index: number) => React.ReactNode;
}

export function RevolvingSpotlight<T extends { id: string }>({
  items,
  itemLabel,
  renderLeft,
  renderRight,
}: RevolvingSpotlightProps<T>) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [nextTurns, setNextTurns] = useState(0);
  const [prevTurns, setPrevTurns] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (index >= items.length && items.length > 0) {
      setIndex(0);
    }
  }, [items.length, index]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  if (items.length === 0) return null;

  const busy = phase !== 'idle';
  const canNavigate = items.length > 1;
  const safeIndex = Math.min(index, items.length - 1);
  const current = items[safeIndex];
  const total = String(items.length).padStart(2, '0');

  const transitionTo = (targetIndex: number, direction: 'next' | 'prev' = 'next') => {
    if (busy || !canNavigate || targetIndex === safeIndex) return;
    if (direction === 'prev') {
      setPrevTurns((t) => t - 1);
    } else {
      setNextTurns((t) => t + 1);
    }
    setPhase('out');
    timers.current.push(
      window.setTimeout(() => {
        setIndex(targetIndex);
        setPhase('in');
      }, 380),
      window.setTimeout(() => setPhase('idle'), 920)
    );
  };

  const goPrev = () => {
    transitionTo((safeIndex - 1 + items.length) % items.length, 'prev');
  };

  const goNext = () => {
    transitionTo((safeIndex + 1) % items.length, 'next');
  };

  const swing = phase === 'out' ? 'is-out' : phase === 'in' ? 'is-in' : '';

  return (
    <div className="cog-stage mx-auto w-full max-w-5xl border border-white/15 bg-[#0A0A0A] p-6 sm:p-9">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[16.5rem_auto_minmax(0,1fr)] md:gap-9">
        {/* Left Panel — pivots on the steel pole */}
        <div className={`cog-panel-l ${swing}`}>{renderLeft(current, safeIndex)}</div>

        {/* Center Steel Pole */}
        <div className="hidden md:flex flex-col items-center" aria-hidden="true">
          <span className="cog-pole-cap" />
          <span className={`cog-pole ${busy ? 'is-spinning' : ''}`} />
          <span className="cog-pole-cap" />
        </div>

        {/* Right Details Panel */}
        <div className="flex flex-col justify-between">
          <div className={`cog-panel-r ${swing}`} aria-live="polite">
            {renderRight(current, safeIndex)}
          </div>

          {/* Counter, clickable indicator bars, and square arrow controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="font-display text-xs tracking-[0.2em] text-neutral-500">
                <b className="text-base text-white">{String(safeIndex + 1).padStart(2, '0')}</b> /{' '}
                {total}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {items.map((item, k) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busy || !canNavigate}
                    onClick={() => transitionTo(k, k < safeIndex ? 'prev' : 'next')}
                    aria-label={`View ${itemLabel} ${k + 1} of ${items.length}`}
                    className={`h-1 transition-all cursor-pointer disabled:cursor-default ${
                      items.length > 6 ? 'w-3.5 sm:w-4' : 'w-6'
                    } ${
                      k === safeIndex ? 'bg-white' : 'bg-white/20 hover:bg-white/45'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Arrow-only Square Controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={goPrev}
                disabled={busy || !canNavigate}
                aria-label={`Previous ${itemLabel} (${safeIndex + 1} of ${items.length})`}
                className="group inline-flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-default"
              >
                <span
                  style={{ transform: `rotate(${prevTurns * 360}deg)` }}
                  className="cog-orb flex h-11 w-11 items-center justify-center border border-white/25 bg-transparent text-white group-hover:bg-white group-hover:text-[#050505]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </span>
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={busy || !canNavigate}
                aria-label={`Next ${itemLabel} (${safeIndex + 1} of ${items.length})`}
                className="group inline-flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-default"
              >
                <span
                  style={{ transform: `rotate(${nextTurns * 360}deg)` }}
                  className="cog-orb flex h-11 w-11 items-center justify-center border border-white bg-white text-[#050505] group-hover:bg-transparent group-hover:text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
