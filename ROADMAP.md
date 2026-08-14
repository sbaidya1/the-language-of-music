# Roadmap

Ideas for making this project stronger — as a learner tool AND as a portfolio
piece. Ordered by return-on-effort.

---

## Quick wins (low effort, high signal to recruiters)

### 1. Add a screenshot or GIF to the top of the README
Recruiters skim in ~15 seconds. One animated GIF of the La Famille flow
(typing a blank, hitting play, double-clicking a word to translate) is worth
more than three paragraphs of description.

**Tools:** [Kap](https://getkap.co/) or [LICEcap](https://www.cockos.com/licecap/) — both free.
**Where it goes:** right under the tagline in `README.md`.

### 2. GitHub Actions CI
Even a trivial workflow that runs `node --check js/*.js` and validates HTML
signals engineering discipline. About 15 lines of YAML in
`.github/workflows/ci.yml`. Green checkmarks on the PR page are a quiet
positive signal recruiters notice.

### 3. Accessibility pass
Real companies test for this in interviews now. Concrete items:
- `alt` text on every `<img>` (`logo.svg`, `congrats.svg`, both embed
  screenshots)
- `aria-label` on the icon-only buttons (`home`, `gears`, `poll`, the play
  buttons on each line)
- Visible keyboard focus on word inputs — right now `outline: none` may be
  hiding it
- Ensure the language dropdown and translate tooltip are keyboard-reachable
- Run [axe DevTools](https://www.deque.com/axe/devtools/) or Lighthouse and
  fix flagged issues

Estimate: ~1 hour. Very concrete resume bullet ("audited and remediated
accessibility issues per WCAG 2.1 AA").

### 4. Move API keys off the client
Right now the RapidAPI key sits in `js/main.js` and friends. Anyone can view
source and steal it. This is the biggest thing a senior engineer would
flag in code review.

**Fix:** a tiny Firebase Cloud Function that proxies the RapidAPI calls.
Keys live in Function config (`firebase functions:config:set`), not in
client code. Client-side calls hit `/api/lyrics` and `/api/youtube` on your
own domain.

**Resume bullet:** *"Secured client-side API calls by proxying through
Firebase Cloud Functions, removing exposed API keys from source."*

Estimate: half a day if you've never touched Firebase Functions before.

---

## Deepen the NLP story

Pick one of these to add a second, concrete NLP feature beyond the current
click-to-translate.

### 5. Song difficulty scoring
Score each song **Beginner / Intermediate / Advanced** based on the rarity of
its vocabulary. Uses free frequency lists like
[wordfreq](https://github.com/rspeer/wordfreq) or CEFR word lists.

**UX:** a small badge on `play.html` next to the song title.
**NLP concept to demo:** vocabulary frequency, corpus-based difficulty
estimation.

### 6. Save-and-review vocab list with spaced repetition
When you double-click a word to translate, add a **★ Save** button on the
tooltip. Saved words go into `sessionStorage` (or Firestore for a signed-in
user), and a new `pages/vocab.html` shows them as a spaced-repetition quiz
(SM-2 algorithm — the same one Anki uses).

Extends translation from "look up once" into a full learner journey. Shows
you can compose multiple features into a real product flow.

---

## The wow moment

### 7. Write a short technical blog post
Free platform: [dev.to](https://dev.to/). Title suggestion:

> *"Adding client-side NLP to a vanilla-JS app: language detection with
> n-grams in 200 lines"*

Walk through the tradeoffs — why `franc-min` over an API call, why MyMemory
over LibreTranslate, why an in-memory `Map` cache beats `localStorage` for
this use case. Link it from the README.

Recruiters clicking through from a repo to a well-written technical post is
a huge differentiator vs. candidates whose portfolios are just repos.

---

## How to frame it on the resume

Whatever you build, phrase around **impact + technical specifics**, not
features:

> *"Full-stack language-learning app used by students in the West
> Windsor-Plainsboro school district's world-languages program (Girl Scout
> Gold Award). Built client-side NLP with `franc-min` n-gram language
> detection and MyMemory translation, secured API calls via Firebase
> Functions proxy, deployed to Firebase Hosting."*

Adjust the specifics as you add things.
