import * as React from 'react';

export interface NowPlayingSong {
  /** Track title. Required — a song with no `name` renders nothing. */
  name: string;
  /** Artist name, shown after an em-dash. */
  artist: string;
  /** Album-art URL. Omit/null → a music-note glyph placeholder. */
  art?: string | null;
  /** Link opened when the widget is clicked (e.g. the track page). Omit → not a link. */
  url?: string | null;
  /** `true` = currently playing (live halo + spinning cover + bouncing equalizer);
   *  `false`/omitted = recently played (frozen). */
  nowplaying?: boolean;
  /** Accent color (e.g. a vibrant color extracted from the cover) used for the
   *  halo / equalizer / pulse. Falls back to a green. Any CSS color. */
  color?: string | null;
}

export interface NowPlayingLabels {
  /** Label shown when `nowplaying` is true. Default: "Now playing" / "正在聽". */
  nowPlaying?: string;
  /** Label shown otherwise. Default: "Recently played" / "最近在聽". */
  recentlyPlayed?: string;
}

export interface NowPlayingProps {
  /** The track to show. `null` (or no `name`) renders nothing. */
  song: NowPlayingSong | null;
  /** "mini" = album disc that taps open into a Dynamic-Island-style card.
   *  "card" = a static glass-chip card. Default: "card". */
  variant?: 'mini' | 'card';
  /** Built-in label language. Default: "en". Ignored for fields you set via `labels`. */
  lang?: 'en' | 'zh';
  /** Override the two labels for full i18n control. */
  labels?: NowPlayingLabels;
  /** Called when the user opens / clicks the widget — wire it to re-fetch your
   *  data so the card reflects the truly-current track. */
  onRefresh?: () => void;
  /** Extra class on the root element. */
  className?: string;
}

/** Presentational "now playing / recently played" glass widget. */
export function NowPlaying(props: NowPlayingProps): React.JSX.Element | null;
