# now-playing-glass — 正在聽玻璃小卡

A presentational React **"now playing"** widget: an album disc that taps open
into a Dynamic-Island-style glass card — shared-element cover morph, bouncing
equalizer, blurred-cover ambient backdrop, gentle title marquee, live halo.
**Bring your own data source** (Last.fm, Spotify, Apple Music, anything).

[English](#english) | [繁體中文](#繁體中文)

🔗 **Live demo:** [kvcc.me](https://kvcc.me) (the disc at the top-left corner)

---

## English

### Why

It's purely visual. You hand it a `song`; it renders the widget. No fetching,
no polling, no provider lock-in — pair it with whatever scrobbler/API you like.

### Install

```bash
npm i now-playing-glass framer-motion
```

`react` (≥18) and `framer-motion` (≥11) are peer dependencies.

### Use

```jsx
import { NowPlaying } from 'now-playing-glass';
import 'now-playing-glass/styles.css';

function Header({ song, refetch }) {
  return (
    // `song` shape: { name, artist, art?, url?, nowplaying?, color? }
    <NowPlaying
      song={song}            // null → renders nothing
      variant="mini"         // "mini" (disc → card morph) | "card" (static chip)
      lang="en"              // built-in labels: "en" | "zh"
      onRefresh={refetch}    // fired on open/click — re-fetch so it shows the live track
    />
  );
}
```

Feed it from any source — a tiny Last.fm example:

```jsx
const [song, setSong] = useState(null);
const load = useCallback(() => {
  fetch('/api/now-playing').then(r => r.json()).then(d => setSong(d.song));
}, []);
useEffect(() => { load(); const id = setInterval(load, 25000); return () => clearInterval(id); }, [load]);

<NowPlaying song={song} variant="mini" onRefresh={load} />
```

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `song` | `Song \| null` | — | `null` or no `name` → renders nothing |
| `variant` | `"mini" \| "card"` | `"card"` | `mini` = disc that morphs open; `card` = static chip |
| `lang` | `"en" \| "zh"` | `"en"` | built-in label language |
| `labels` | `{ nowPlaying?, recentlyPlayed? }` | — | override labels for full i18n |
| `onRefresh` | `() => void` | — | called on open/click — re-fetch your data here |
| `className` | `string` | — | extra class on the root |

**`Song`**: `{ name, artist, art?, url?, nowplaying?, color? }`. Set
`nowplaying: true` for the live treatment (halo + spinning cover + bouncing
equalizer). `color` (e.g. a vibrant color extracted from the cover) tints the
halo/equalizer; it falls back to green.

### Theming

Self-contained out of the box. It reads `--label`, `--fill` and
liquid-glass-kit's `--lg-*` tokens **when present**, so it melts into an
existing design system; otherwise the baked light/dark defaults apply. Dark
mode follows `prefers-color-scheme`, and an ancestor `[data-theme="light|dark"]`
overrides it. Respects `prefers-reduced-motion`.

The refraction is frosted-glass via `backdrop-filter`; it degrades gracefully
where that isn't supported.

### More by kv

Part of the [kvcc.me](https://kvcc.me) ecosystem of small, focused libraries.

### Credit

The Dynamic-Island morph idea is Apple's; the glass material follows the
liquid-glass family. Built by kv.

---

## 繁體中文

### 這是什麼

一個**純呈現**的 React「正在聽」小卡：頂部一顆專輯封面圓盤，點開以
Dynamic-Island 式形變展開完整玻璃卡 —— 共享封面 morph、動態等化器、模糊封面
氛圍底、歌名輕柔捲動、live 光環。**資料來源自己接**（Last.fm / Spotify /
Apple Music 都行）。

### 安裝

```bash
npm i now-playing-glass framer-motion
```

`react`（≥18）與 `framer-motion`（≥11）是 peer dependencies。

### 用法

```jsx
import { NowPlaying } from 'now-playing-glass';
import 'now-playing-glass/styles.css';

// song 形狀：{ name, artist, art?, url?, nowplaying?, color? }
<NowPlaying
  song={song}            // null → 不渲染
  variant="mini"         // "mini"(圓盤→卡片形變) | "card"(靜態 chip)
  lang="zh"              // 內建文案語言："en" | "zh"
  onRefresh={refetch}    // 點開/點擊時觸發 —— 在這裡重抓資料,卡片才顯示「現在」這首
/>
```

它不抓資料，你從任何來源餵 `song` 進來即可（上面英文段有 Last.fm 範例）。

### Props

| Prop | 型別 | 預設 | 說明 |
|---|---|---|---|
| `song` | `Song \| null` | — | `null` 或沒有 `name` → 不渲染 |
| `variant` | `"mini" \| "card"` | `"card"` | `mini`＝圓盤形變展開；`card`＝靜態 chip |
| `lang` | `"en" \| "zh"` | `"en"` | 內建文案語言 |
| `labels` | `{ nowPlaying?, recentlyPlayed? }` | — | 覆寫文案，完整 i18n 控制 |
| `onRefresh` | `() => void` | — | 點開/點擊時呼叫 —— 在此重抓資料 |
| `className` | `string` | — | 根元素額外 class |

**`Song`**：`{ name, artist, art?, url?, nowplaying?, color? }`。`nowplaying: true`
進入 live 樣式（光環＋封面慢轉＋等化器跳動）；`color`（例如由封面抽出的
vibrant 色）為光環/等化器上色，沒給就退回綠色。

### 主題

開箱即用、自帶樣式。偵測到 `--label`、`--fill` 或 liquid-glass-kit 的 `--lg-*`
token 就吃它們，自然融入既有設計系統；沒有就用內建的明/暗預設。深色跟隨
`prefers-color-scheme`，祖層 `[data-theme="light|dark"]` 可覆寫。尊重
`prefers-reduced-motion`。

折射用 `backdrop-filter` 霜化玻璃，不支援的環境會優雅降級。

### More by kv

[kvcc.me](https://kvcc.me) 生態系裡一組小而專注的共用庫之一。

### 授權

Dynamic-Island 形變的點子源自 Apple；玻璃材質沿用 liquid-glass 家族。由 kv 製作。
