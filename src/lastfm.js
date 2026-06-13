import { useNowPlaying } from './useNowPlaying.js';

// Largest non-empty Last.fm image, by size preference.
function pickArt(images) {
  if (!Array.isArray(images)) return null;
  for (const size of ['extralarge', 'large', 'medium', 'small', '']) {
    const m = images.find((i) => i && i.size === size && i['#text']);
    if (m) return m['#text'];
  }
  const any = images.find((i) => i && i['#text']);
  return any ? any['#text'] : null;
}

/**
 * useLastfm — drop-in data source for <NowPlaying>, backed by Last.fm.
 *
 *   const { song, refresh } = useLastfm({ user: 'rj', apiKey: 'YOUR_KEY' });
 *   <NowPlaying song={song} variant="mini" onRefresh={refresh} />
 *
 * Last.fm read API keys are meant to be usable from the browser (the API sends
 * `Access-Control-Allow-Origin: *`). Built on `useNowPlaying`, so it polls and
 * pauses while the tab is hidden.
 *
 * @param {object} opts
 * @param {string} opts.user   Last.fm username.
 * @param {string} opts.apiKey Last.fm API key.
 * @param {number} [opts.interval=25000] Poll interval in ms (0 disables).
 */
export function useLastfm({ user, apiKey, interval = 25000 } = {}) {
  return useNowPlaying({
    interval,
    fetcher: async () => {
      if (!user || !apiKey) return null;
      const url =
        'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks' +
        `&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`;
      const res = await fetch(url);
      if (!res.ok) return undefined; // transient error → keep the current track
      const data = await res.json();
      let t = data && data.recenttracks && data.recenttracks.track;
      if (Array.isArray(t)) t = t[0];
      if (!t || !t.name) return null;
      return {
        name: t.name,
        artist: (t.artist && (t.artist['#text'] || t.artist.name)) || '',
        art: pickArt(t.image),
        url: t.url || null,
        nowplaying: !!(t['@attr'] && t['@attr'].nowplaying === 'true'),
        color: null,
      };
    },
  });
}
