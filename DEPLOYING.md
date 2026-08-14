# Deploying to Firebase Hosting

The live site https://the-language-of-music.web.app is served by Firebase
Hosting. Merging a PR on GitHub **does not deploy** — you have to run one
command from your machine.

## First-time setup (once per machine)

Install the Firebase CLI (needs Node.js):

```bash
npm install -g firebase-tools
```

Log in with the Google account that owns the Firebase project:

```bash
firebase login
```

## Deploying an update

From the repo root:

```bash
git checkout main
git pull
firebase deploy --only hosting
```

That's it. Firebase uploads the whole repo (see `firebase.json` — the
`"public": "."` line means "deploy from the current directory") and swaps the
live site over in about 30 seconds. The URL stays the same.

If it's your first deploy on this machine, Firebase will ask you to pick a
project. Pick **the-language-of-music**.

## Rolling back a bad deploy

Firebase keeps every past release. To roll back:

```bash
firebase hosting:rollback
```

Or from the Firebase Console → Hosting → Release History → "Rollback" on any
prior release.

## What gets deployed

The `ignore` block in `firebase.json` excludes:
- `firebase.json` itself
- Any dotfile / dotfolder (`.git`, `.github`, etc.)
- `node_modules/`

Everything else in the repo gets uploaded — including `README.md` and the
`.png` embed-guide images (which are referenced from the app, so that's fine).

## Troubleshooting

**"Directory '(public)' for Hosting does not exist"**
Your local `firebase.json` still has the old `"public": "(public)"` line. Pull
the latest `main` — it should say `"public": "."`.

**"Error: HTTP Error: 401, Request had invalid authentication credentials"**
Your login expired. Run `firebase logout` then `firebase login` again.

**"You do not currently have permission to access this project."**
The account you're logged in with isn't an editor on the Firebase project. Log
in with the right Google account, or ask the project owner to add you at
Firebase Console → Project Settings → Users and permissions.
