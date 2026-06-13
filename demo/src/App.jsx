import React, { useEffect, useState } from 'react';
import { NowPlaying } from 'now-playing-glass';
import 'now-playing-glass/styles.css';

const SONGS = [
  { name: 'Midnight City', artist: 'M83', art: 'https://picsum.photos/seed/midnight/300', color: '#7c5cff' },
  { name: 'リライト', artist: 'ASIAN KUNG-FU GENERATION', art: 'https://picsum.photos/seed/rewrite/300', color: '#ff5c8a' },
  { name: 'DRIP', artist: 'BABYMONSTER', art: 'https://picsum.photos/seed/babymonster/300', color: '#ff3b6b' },
  { name: 'Topia', artist: 'Crystal Castles', art: 'https://picsum.photos/seed/topia/300', color: '#2fd6c4' },
];

const q = (s) => encodeURIComponent(`${s.name} ${s.artist}`);
const SERVICES = {
  spotify: { label: 'Spotify', url: (s) => `https://open.spotify.com/search/${q(s)}` },
  apple: { label: 'Apple Music', url: (s) => `https://music.apple.com/search?term=${q(s)}` },
  youtube: { label: 'YouTube', url: (s) => `https://music.youtube.com/search?q=${q(s)}` },
  off: { label: 'no link', url: () => null },
};

function Seg({ label, value, options, onChange }) {
  return (
    <div className="seg">
      <span className="seg-label">{label}</span>
      <div className="seg-track">
        {options.map((o) => (
          <button key={String(o.value)} className={`seg-btn${value === o.value ? ' on' : ''}`} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');

export default function App() {
  const [variant, setVariant] = useState(params.get('v') === 'card' ? 'card' : 'mini');
  const [align, setAlign] = useState(params.get('align') === 'right' ? 'right' : 'left');
  const [live, setLive] = useState(params.get('state') !== 'recent');
  const [theme, setTheme] = useState(params.get('theme') === 'light' ? 'light' : 'dark');
  const [hasArt, setHasArt] = useState(true);
  const [service, setService] = useState('spotify');
  const [idx, setIdx] = useState(0);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // ?open=1 → pop the mini open on load (handy for sharing a state / screenshots).
  useEffect(() => {
    if (params.get('open') !== '1') return;
    const t = setTimeout(() => document.querySelector('.npg-disc-btn')?.click(), 350);
    return () => clearTimeout(t);
  }, []);

  const base = SONGS[idx];
  const song = {
    name: base.name,
    artist: base.artist,
    art: hasArt ? base.art : null,
    url: SERVICES[service].url(base),
    nowplaying: live,
    color: base.color,
  };

  return (
    <div className="page">
      <header className="hero">
        <h1>now-playing-glass</h1>
        <p className="tag">
          A presentational React <b>“now playing”</b> widget — an album disc that taps open
          into a Dynamic-Island-style glass card.
        </p>
        <div className="links">
          <a href="https://www.npmjs.com/package/now-playing-glass" target="_blank" rel="noreferrer">npm</a>
          <a href="https://github.com/lp250isme/now-playing-glass" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </header>

      <section className="stage" data-align={align}>
        {variant === 'mini' ? (
          <div className={`stage-anchor ${align}`}>
            <NowPlaying song={song} variant="mini" align={align} lang="en" onRefresh={() => {}} />
          </div>
        ) : (
          <div className="stage-center">
            <NowPlaying song={song} variant="card" lang="en" />
          </div>
        )}
        {variant === 'mini' && <span className="hint">tap the disc ↑</span>}
      </section>

      <section className="controls">
        <Seg label="variant" value={variant} onChange={setVariant}
          options={[{ label: 'mini', value: 'mini' }, { label: 'card', value: 'card' }]} />
        <Seg label="align" value={align} onChange={setAlign}
          options={[{ label: 'left', value: 'left' }, { label: 'right', value: 'right' }]} />
        <Seg label="state" value={live} onChange={setLive}
          options={[{ label: 'now playing', value: true }, { label: 'recent', value: false }]} />
        <Seg label="theme" value={theme} onChange={setTheme}
          options={[{ label: 'dark', value: 'dark' }, { label: 'light', value: 'light' }]} />
        <Seg label="cover art" value={hasArt} onChange={setHasArt}
          options={[{ label: 'on', value: true }, { label: 'off', value: false }]} />
        <Seg label="open in" value={service} onChange={setService}
          options={Object.entries(SERVICES).map(([value, s]) => ({ label: s.label, value }))} />
        <Seg label="track" value={idx} onChange={setIdx}
          options={SONGS.map((s, i) => ({ label: s.name.slice(0, 11), value: i }))} />
      </section>

      <section className="usage">
        <h2>Usage</h2>
        <pre>{`import { NowPlaying, useNowPlaying } from 'now-playing-glass';
import 'now-playing-glass/styles.css';

function TopBar() {
  // Bring your own data source — Last.fm, Spotify, your API route…
  const { song, refresh } = useNowPlaying({
    fetcher: ({ fresh }) =>
      fetch(fresh ? '/api/now-playing?t=' + Date.now() : '/api/now-playing')
        .then(r => (r.ok ? r.json() : null))
        .then(d => d?.song ?? null),
  });

  return (
    <NowPlaying
      song={song}            // { name, artist, art?, url?, nowplaying?, color? }
      variant="mini"         // "mini" disc→card morph · "card" static chip
      align="left"           // "left" | "right" — flip for right-corner placement
      onRefresh={refresh}    // re-fetch on open so it shows the live track
    />
  );
}`}</pre>
      </section>

      <footer className="foot">
        MIT · built by <a href="https://kvcc.me" target="_blank" rel="noreferrer">kv</a> · part of the kvcc.me ecosystem
      </footer>
    </div>
  );
}
