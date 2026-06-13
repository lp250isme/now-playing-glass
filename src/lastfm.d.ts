import { UseNowPlayingResult } from './index';

export interface UseLastfmOptions {
  /** Last.fm username. */
  user: string;
  /** Last.fm API key (read keys are safe to use client-side). */
  apiKey: string;
  /** Poll interval in ms; pauses while the tab is hidden. 0 disables. Default: 25000. */
  interval?: number;
}

/** Drop-in Last.fm data source for `<NowPlaying>`. Returns `{ song, refresh }`. */
export function useLastfm(options: UseLastfmOptions): UseNowPlayingResult;
