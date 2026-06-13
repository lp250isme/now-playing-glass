import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/* Dynamic equalizer: four bars bounce while live, otherwise freeze low —
   reads clearer than a pulsing dot for "music is playing right now". */
function Equalizer({ live }) {
  return (
    <span className={`npg-eq${live ? ' npg-eq-live' : ''}`} aria-hidden>
      <span /><span /><span /><span />
    </span>
  );
}

// Staggered reveal of card text (cover lands first, then label → title slide in);
// on collapse the whole block fades out fast (ahead of the shell).
const textContainer = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } };
const textItem = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0.2, 0.85, 0.25, 1] } },
};

const pctOf = (song) =>
  song && song.duration > 0 ? Math.min(100, Math.max(0, ((song.progress || 0) / song.duration) * 100)) : null;

/**
 * NowPlaying — presentational "now playing / recently played" widget.
 *
 * Purely visual: you pass it a `song` (from Last.fm, Spotify, Apple Music,
 * whatever) and it renders the glass widget. No fetching happens inside.
 *
 *  variant="mini":  the album disc — tap to expand into a Dynamic-Island-style card.
 *  variant="card":  a static glass-chip card (kept for simpler placements).
 *
 *  `onRefresh` fires when opened — wire it to re-fetch so the card is current.
 *  `open`/`onOpenChange` make the mini's open state controllable; `openOnHover`
 *  opens it on hover (desktop). `align="auto"` expands toward whichever side has room.
 */
export default function NowPlaying({
  song,
  variant = 'card',
  align = 'left',
  lang = 'en',
  labels,
  onRefresh,
  open: controlledOpen,
  onOpenChange,
  openOnHover = false,
  className,
}) {
  const [openState, setOpenState] = useState(false);
  const [autoGrow, setAutoGrow] = useState('left');
  const [marquee, setMarquee] = useState(false);
  const [scroll, setScroll] = useState(0);
  const ref = useRef(null);
  const clipRef = useRef(null);
  const titleRef = useRef(null);
  const reduce = useReducedMotion();

  const isControlled = typeof controlledOpen === 'boolean';
  const open = isControlled ? controlledOpen : openState;
  const setOpen = (v) => {
    if (v === open) return;
    if (!isControlled) setOpenState(v);
    if (typeof onOpenChange === 'function') onOpenChange(v);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure whether the title overflows the fixed column; only then marquee it.
  useEffect(() => {
    if (variant !== 'mini' || !open || reduce) { setMarquee(false); return; }
    const clip = clipRef.current, t = titleRef.current;
    if (!clip || !t) return;
    const measure = () => {
      const d = t.scrollWidth - clip.clientWidth;
      if (d > 4) { setScroll(d); setMarquee(true); } else { setMarquee(false); }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [variant, open, reduce, song && song.name, song && song.artist]);

  if (!song || !song.name) return null;
  const live = !!song.nowplaying;
  const label = live
    ? (labels && labels.nowPlaying) || (lang === 'zh' ? '正在聽' : 'Now playing')
    : (labels && labels.recentlyPlayed) || (lang === 'zh' ? '最近在聽' : 'Recently played');
  const accentStyle = song.color ? { '--np-accent': song.color } : undefined;
  const rootClass = (extra) => `now-playing-glass${className ? ` ${className}` : ''}${extra ? ` ${extra}` : ''}`;
  const refresh = () => { if (typeof onRefresh === 'function') onRefresh(); };
  const pct = pctOf(song);

  // Polite live region: announces the track to screen readers when it changes,
  // even while the widget is collapsed (a "now playing" widget changes on its own).
  const announce = <span className="npg-sr-only" aria-live="polite">{`${label}: ${song.name} — ${song.artist}`}</span>;

  const musicGlyph = (size) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );

  if (variant === 'mini') {
    // Anti-ellipse trick: the glass shell only fades + uniformly scales; the cover
    // is a separate top layer translating/scaling between disc and card positions.
    const lt = reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40, mass: 0.7 };
    // Expand direction. "auto" picks the side with more room (measured on open).
    const grow = align === 'auto' ? autoGrow : (align === 'right' ? 'right' : 'left');

    const doOpen = (withRefresh) => {
      if (align === 'auto' && ref.current) {
        const r = ref.current.getBoundingClientRect();
        setAutoGrow(r.left + r.width / 2 > window.innerWidth / 2 ? 'right' : 'left');
      }
      setOpen(true);
      if (withRefresh) refresh();
    };
    const hoverProps = openOnHover
      ? { onMouseEnter: () => doOpen(false), onMouseLeave: () => setOpen(false) }
      : undefined;

    const coverImg = song.art ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={song.art} alt="" className="npg-cover-img" loading="lazy" />
    ) : (
      <span className="npg-cover-fallback">{musicGlyph(15)}</span>
    );

    const cardMotion = {
      initial: { opacity: 0, scale: 0.86 },
      animate: { opacity: 1, scale: 1, transition: lt },
      exit: { opacity: 0, scale: 0.92, transition: { duration: 0.12, ease: 'easeIn' } },
      style: { borderRadius: 16, transformOrigin: grow === 'right' ? '100% 0%' : '0% 0%' },
    };
    const cardClass = `npg-panel npg-card${grow === 'right' ? ' npg-card--right' : ''}`;
    const cardBody = (
      <>
        {song.art && (
          <span aria-hidden className="npg-ambient" style={{ '--np-art': `url(${song.art})` }} />
        )}
        <motion.span className="npg-detail" variants={textContainer} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.08 } }}>
          <motion.span variants={textItem} className="npg-label">
            <Equalizer live={live} />
            {label}
          </motion.span>
          <motion.span variants={textItem} style={{ display: 'block' }}>
            <span ref={clipRef} className="npg-title-clip">
              <span ref={titleRef} className={`npg-title${marquee ? ' npg-title-marquee' : ''}`} style={marquee ? { '--np-scroll': `${scroll}px` } : undefined}>
                {song.name}<span className="npg-artist"> — {song.artist}</span>
              </span>
            </span>
          </motion.span>
        </motion.span>
        {pct !== null && (
          <span className="npg-progress" aria-hidden><span className="npg-progress-fill" style={{ width: `${pct}%` }} /></span>
        )}
      </>
    );

    return (
      <div ref={ref} className={rootClass('npg-mini')} style={accentStyle} {...hoverProps}>
        {announce}
        {/* live halo (collapsed), tinted by --np-accent (cover color) */}
        {!open && live && <span className="npg-halo" aria-hidden />}

        {/* glass disc (collapsed): empty glass ring, cover floats above; tap to open */}
        <AnimatePresence>
          {!open && (
            <motion.button
              key="disc"
              onClick={() => doOpen(true)}
              aria-label={label}
              aria-expanded={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.12 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              whileTap={{ scale: 0.94 }}
              className="npg-glass npg-disc-btn"
            />
          )}
        </AnimatePresence>

        {/* card shell (expanded): pure fade + uniform scale-from-corner → no ellipse on collapse */}
        <AnimatePresence>
          {open && (
            song.url ? (
              <motion.a key="card" href={song.url} target="_blank" rel="noopener noreferrer" onClick={refresh} aria-label={`${label}: ${song.name} — ${song.artist}`} className={cardClass} {...cardMotion}>
                {cardBody}
              </motion.a>
            ) : (
              // No link: a non-interactive info card (avoids the div+onClick
              // keyboard-inaccessible a11y trap); onRefresh already fired on open.
              <motion.div key="card" className={cardClass} {...cardMotion}>
                {cardBody}
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* cover: always present, top layer, click-through; translates+scales between
            disc and card positions. key by grow so a runtime align flip remounts it
            (otherwise a stale left/right inline style over-constrains → it overflows). */}
        <motion.div
          key={grow}
          aria-hidden
          className="npg-cover"
          initial={false}
          animate={open ? { top: 8, [grow]: 8, width: 44, height: 44, borderRadius: 12 } : { top: 3, [grow]: 3, width: 38, height: 38, borderRadius: 19 }}
          transition={lt}
        >
          <span className={`npg-cover-inner${live && !open ? ' npg-disc' : ''}`}>
            {coverImg}
          </span>
        </motion.div>
      </div>
    );
  }

  // variant="card": static glass-chip card
  const cover = song.art ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={song.art} alt="" className={`npg-card-cover${live ? ' npg-disc' : ''}`} loading="lazy" />
  ) : (
    <span className={`npg-card-cover npg-cover-fallback${live ? ' npg-disc' : ''}`}>{musicGlyph(14)}</span>
  );
  const detail = (
    <span className="npg-detail">
      <span className="npg-label">
        {live && <span className="npg-live-dot" aria-hidden />}
        {label}
      </span>
      <span className="npg-title npg-truncate" style={{ display: 'block' }}>
        {song.name}<span className="npg-artist"> — {song.artist}</span>
      </span>
      {pct !== null && (
        <span className="npg-progress npg-progress--chip" aria-hidden><span className="npg-progress-fill" style={{ width: `${pct}%` }} /></span>
      )}
    </span>
  );
  return song.url ? (
    <a href={song.url} target="_blank" rel="noopener noreferrer" onClick={refresh} className={rootClass('npg-chip npg-card-pill')} style={accentStyle}>{announce}{cover}{detail}</a>
  ) : (
    <span className={rootClass('npg-chip npg-card-pill')} style={accentStyle}>{announce}{cover}{detail}</span>
  );
}
