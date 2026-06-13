import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useNowPlaying — optional data-plumbing for <NowPlaying>. Data-source agnostic.
 *
 * You provide a `fetcher` that returns a song (from Last.fm, Spotify, your own
 * API route, anything); the hook handles initial load, polling, pausing while
 * the tab is hidden, and an on-demand `refresh` to wire to <NowPlaying onRefresh>.
 *
 *   const { song, refresh } = useNowPlaying({
 *     fetcher: ({ fresh }) =>
 *       fetch(fresh ? `/api/now-playing?t=${Date.now()}` : '/api/now-playing')
 *         .then(r => r.ok ? r.json() : null)
 *         .then(d => d?.song ?? null),
 *   });
 *   return <NowPlaying song={song} variant="mini" onRefresh={refresh} />;
 *
 * @param {object}   opts
 * @param {(ctx: { fresh: boolean }) => Promise<any>} opts.fetcher
 *        Returns the next song, `null` to clear, or `undefined` to keep current.
 *        `fresh` is true for user-triggered refreshes (bust your cache then).
 * @param {number}   [opts.interval=25000] Poll interval in ms. 0/null disables polling.
 * @returns {{ song: any, refresh: () => void }}
 */
export function useNowPlaying({ fetcher, interval = 25000 } = {}) {
  const [song, setSong] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async (fresh = true) => {
    const f = fetcherRef.current;
    if (typeof f !== 'function') return;
    try {
      const next = await f({ fresh });
      if (next !== undefined) setSong(next); // undefined = leave current track untouched
    } catch { /* network hiccup → keep showing the last track */ }
  }, []);

  useEffect(() => {
    let alive = true;
    const tick = (fresh) => { if (alive) refresh(fresh); };
    tick(false);
    if (!interval) return () => { alive = false; };
    const id = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') tick(false);
    }, interval);
    return () => { alive = false; clearInterval(id); };
  }, [refresh, interval]);

  return { song, refresh };
}
