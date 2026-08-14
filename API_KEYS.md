# Updating API keys

The app uses two sets of keys, both stored as inline string literals in the JS
files (no build step, no env vars — just paste-and-save).

**The keys are stripped from the repo for security.** Every place that needs
one has an empty string `""` as a placeholder. To make the app work locally or
before deploying, replace those empty strings with your real keys.

---

## The two keys

| What | Where to get it |
|---|---|
| **RapidAPI key** | https://rapidapi.com/developer/dashboard → your master key. One key covers all the RapidAPI hosts we use (Genius Lyrics + YouTube search). |
| **Firebase Web API Key** | Firebase Console → the-language-of-music project → Project Settings → General → "Your apps" → Web app → SDK setup and configuration → the `apiKey` field. |

---

## Where to paste them

Every location below already has the correct surrounding code — just replace
the empty `""` with the string of your key. Keep the quotes.

### RapidAPI key — 5 places

Search for `'X-RapidAPI-Key'` in the codebase, or update these exact lines:

| File | Line | Snippet |
|---|---|---|
| `js/main.js` | 4 | `'X-RapidAPI-Key': ""` |
| `js/main.js` | 314 | `'X-RapidAPI-Key': ""` |
| `js/script.js` | 20 | `'X-RapidAPI-Key': ""` |
| `js/script.js` | 274 | `'X-RapidAPI-Key': ""` |
| `js/vid.js` | 4 | `'X-RapidAPI-Key': ""` |

(`js/video.js` has one too but nothing loads that file — safe to ignore.)

### Firebase apiKey — 4 places

Search for `apiKey:` in the codebase, or update:

| File | Line | Snippet |
|---|---|---|
| `js/fire.js` | 5 | `apiKey: ""` |
| `js/fire1.js` | 5 | `apiKey: ""` |
| `js/quickfire.js` | 5 | `apiKey: ""` |
| `js/login.js` | 7 | `apiKey: ""` |

---

## Quick recipe (copy-paste)

Once you have your two key values in mind, the fastest way is find-and-replace
across the `js/` folder in your editor:

- Find: `'X-RapidAPI-Key': ""`  →  Replace with: `'X-RapidAPI-Key': "PASTE-RAPIDAPI-KEY-HERE"`
- Find: `apiKey: ""`  →  Replace with: `apiKey: "PASTE-FIREBASE-KEY-HERE"`

Any editor's "Replace in Files" (VS Code: ⌘⇧H) will hit all the spots in one
go.

---

## After pasting

1. Save all files.
2. Reload http://localhost:8000 in your browser — song search should work.
3. **Do not commit the keys.** Before pushing to GitHub, undo the changes to
   those files (or use `git stash` to set them aside) so the empty strings go
   back. Only the local working copy should have real keys.
4. If you're deploying to Firebase, deploy WITH the real keys pasted in
   (`firebase deploy --only hosting`) — Firebase deploys your local working
   copy, so keys need to be in the files at deploy time.

---

## Rotating a key

Same process — replace the old key with the new one in the same 5 (RapidAPI)
or 4 (Firebase) places. There's no central config; every file has its own copy.

If this gets annoying, ask Claude Code or another agent to help set up a single
`js/keys.js` file that every other JS file reads from — one place to update
instead of nine.
