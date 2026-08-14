# The Language of Music

A language-learning web app that turns foreign-language songs into interactive
listening exercises. Pick any song, and the app pulls its lyrics + a matching
audio track, blanks out the words, and lets you transcribe as the music plays —
with a built-in **double-click-to-translate** dictionary for any word you don't
recognize.

**Live site:** https://the-language-of-music.web.app/

> Adopted by the **West Windsor-Plainsboro Regional School District** as a
> supplemental tool in their world-languages program, and recognized with the
> **Girl Scout Gold Award** for its measurable impact on language learners in
> the local community.

---

## Try it — the "La Famille" example

The fastest way to feel what this does:

1. Open the [live site](https://the-language-of-music.web.app/), click the play
   icon on the home page.
2. Enter **Title:** `La Famille`, **Artist:** `Tony Parker`. Hit **Submit**.
3. The lyrics render as blanks and the song loads on the right.

Now try the interactive features on this song:

- **Play a line** — click ▶ next to any line to hear it and start typing. Click
  again to check. Words turn **green** (correct), **blue** (right word, wrong
  accents — configurable), or **red** (wrong).
- **Double-click any word** to see its English translation in a tooltip. The
  song language is **auto-detected** (`franc-min` sees the French words and
  sets the dropdown to French on load). Try double-clicking **"Comment"** or
  **"reçois"** to see the translation.
- Open the **⚙ Settings** panel and toggle:
  - **Show first word of each line** — helpful scaffolding when a language is
    new. The first blank of each line is pre-filled.
  - **Show last word of each line** — same idea for rhymes and line-endings.
  - **Show character count** — displays the length of each blank as a hint.
  - **Require accents** — off by default (partial credit for accent-less
    answers); flip on for strict grading.
  - **Enter `***` to reveal** — type three asterisks to give up on a blank and
    see the answer without counting it wrong.
- Change **Song language** in the dropdown to override the auto-detection — the
  choice is remembered across page loads via `sessionStorage`.

---

## Features

### Practice mode (any song)

- Fetches lyrics for **any song title + artist** via the Genius API.
- Finds a matching **YouTube audio track** automatically.
- Splits every line into individual word-blanks, preserving punctuation and
  accents.
- Per-line playback: hit ▶, transcribe, verify, move on.

### Word-level NLP translation

- **Language auto-detection.** The full set of lyric words is fed to
  [`franc-min`](https://github.com/wooorm/franc) — an n-gram language classifier
  that runs entirely in the browser (no API call, no key). The result is mapped
  to the dropdown so learners never have to configure anything.
- **On-demand dictionary.** A double-click on any word queries the
  [MyMemory Translation API](https://mymemory.translated.net/) for the
  source-language → English pair. Results are cached in a `Map` keyed by
  `word|source|target`, so repeated lookups are instant and quota-free.
- **Zero-config.** No API keys required for this feature — it uses only free,
  no-auth endpoints.
- See `js/vocab.js` — a single ~180-line file, heavily commented.

### Teacher mode

- Teachers log into the **Teacher Portal** and create **lessons** — a curated
  song with specific blanks chosen, a specific video, and specific settings
  locked in.
- Each lesson gets a **play code**. Students enter the code on the practice
  page and get exactly the lesson their teacher built — same blanks, same
  video, same rules.
- Lessons persist in **Cloud Firestore**, so a teacher's classroom set is
  available across devices.

### Mobile + Safari friendly

- Every page uses `width=device-width, initial-scale=1.0`, `100svh` with a
  `-webkit-fill-available` fallback for iOS Safari's address-bar clipping, and
  a `@media (max-width: 900px)` layer that reins in the `vw`-based typography
  so titles don't overflow on phones.
- The YouTube player uses a `calc()`-computed 16:9 height on narrow viewports.

---

## Impact & vision

The project started as a way to help classmates practicing French, Spanish, and
Chinese in high school — the observation was that consuming music in a target
language was one of the most engaging ways to learn, but transcribing and
looking up words manually was a friction wall. Automating that loop is the whole
point.

Two milestones since the initial release:

- **Girl Scout Gold Award (2023)** — recognizing sustained community impact,
  with the app being adopted and iterated on based on real learner feedback.
- **WW-P District pilot** — the world-languages program uses The Language of
  Music as one of its supplemental tools, especially for French and Spanish
  classrooms where teachers publish curated lessons via the teacher portal.

The direction from here: better dictionary results for short/ambiguous words
(pairing MyMemory with Wiktionary), spaced-repetition on words you've looked
up, and a "difficulty score" per song so learners can pick material at their
level.

---

## Tech stack

- **Frontend:** vanilla HTML / CSS / JavaScript. No framework, no build step —
  intentionally, so anyone can open a file and edit it.
- **Hosting + DB:** Firebase Hosting + Cloud Firestore.
- **NLP:** [`franc-min`](https://github.com/wooorm/franc) (client-side language
  detection) + [MyMemory API](https://mymemory.translated.net/doc/spec.php)
  (translation).
- **Data APIs:** [Genius Lyrics](https://rapidapi.com/Glavier/api/genius-song-lyrics1)
  and [YouTube Search](https://rapidapi.com/ytdlfree/api/youtube-search-results),
  both via RapidAPI.

## Project structure

```
.
├── index.html          # home page
├── 404.html            # not-found page
├── firebase.json       # hosting config
├── css/                # all stylesheets (one per page + mobile.css + vocab.css)
├── js/                 # all client-side JavaScript
├── pages/              # every non-entry HTML page
└── assets/             # images (logo, favicon, congrats)
```

Cross-cutting files worth knowing about:

- `css/mobile.css` — responsive + Safari fixes, loaded on every page
- `js/vocab.js` — the NLP translation feature, loaded on `play.html` and `view.html`

## Running locally

The site is fully static, so any HTTP server works:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

To exercise the full practice / teacher flows locally you'll need to paste your
own API keys into the JS files (they're stripped from the repo for security):

- **RapidAPI key** → `js/main.js`, `js/script.js`, `js/vid.js`
- **Firebase config** → `js/fire.js`, `js/fire1.js`, `js/quickfire.js`, `js/login.js`

The **NLP translation feature needs no keys** — try it with the hardcoded
sample songs *"La Famille" by Tony Parker* and *"Papaoutai" by Stromae* which
work offline (see `js/main.js`).

## Deploying

```bash
firebase deploy --only hosting
```
