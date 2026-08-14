# The Language of Music

A language-learning web app that turns foreign-language songs into fill-in-the-blank
listening exercises. Users pick any song, and the app pulls its lyrics + a YouTube
audio track, blanks out the words, and lets them transcribe as they listen — with
a built-in **double-click-to-translate** dictionary for any word they don't know.

**Live site:** https://the-language-of-music.web.app/

## What it does

- **Practice mode** — enter a song title + artist, get an interactive fill-in-the-blank
  exercise synced to the music. Custom settings for accents, character counts, and
  reveal-word behavior.
- **Teacher mode** — teachers can save custom lessons (which words are blanked, which
  video to use, which settings) that students later load and complete.
- **Word translation (NLP)** — double-click any word in the lyrics to see its
  translation in a tooltip. Uses the [MyMemory](https://mymemory.translated.net/)
  translation API with in-memory caching, and supports 9 source languages.

## Tech stack

- **Frontend:** vanilla HTML / CSS / JavaScript. No framework, no build step.
- **Backend / hosting:** Firebase Hosting + Cloud Firestore (for teacher-mode lessons).
- **APIs:**
  - [Genius Song Lyrics](https://rapidapi.com/Glavier/api/genius-song-lyrics1) via RapidAPI — lyrics fetch
  - [YouTube Search](https://rapidapi.com/ytdlfree/api/youtube-search-results) via RapidAPI — audio track lookup
  - [MyMemory Translation](https://mymemory.translated.net/doc/spec.php) — word translation (no key required)

## Project structure

```
.
├── index.html          # home page
├── 404.html            # not-found page
├── firebase.json       # hosting config
├── css/                # all stylesheets
├── js/                 # all client-side JavaScript
├── pages/              # every non-entry HTML page
└── assets/             # images (logo, favicon, congrats)
```

Each page has its own CSS and JS file (e.g. `pages/play.html` pairs with
`css/lyrics.css` + `css/vid.css` and `js/main.js` + `js/vid.js`). Cross-cutting
files: `css/mobile.css` (responsive + Safari fixes, loaded on every page) and
`js/vocab.js` (the double-click translation feature).

## Running locally

The site is fully static, so any HTTP server works:

```bash
python3 -m http.server 8000
# → open http://localhost:8000
```

To exercise the practice/teacher flows you'll need to paste your own API keys into
the JS files (they're stripped from the repo):

- RapidAPI key → `js/main.js`, `js/script.js`, `js/vid.js`, `js/video.js`
- Firebase config → `js/fire.js`, `js/fire1.js`, `js/quickfire.js`, `js/login.js`

The translation feature (`js/vocab.js`) needs no key.

You can also try the app with zero keys — the sample songs *"La Famille" by Tony Parker*
and *"Papaoutai" by Stromae* are hardcoded in `js/main.js` and work offline.

## Deploying

The site is hosted on Firebase. To deploy:

```bash
firebase deploy --only hosting
```

## About this project

Originally built as a high-school community-service project. It's been updated
since to support mobile / Safari, restructure the files, and add the word-level
NLP translation feature.
