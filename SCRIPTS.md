# SCRIPTS.md

Development Checklist (automated tasks & commands)

Copy these commands and run them from the project root (/Users/gimseongtae/Documents/pace) when you need to reproduce environment setup, CI checks, PR flow, or deployment.

```sh
# 1) Go to project root
cd /Users/gimseongtae/Documents/pace

# 2) Status check
git status
gh pr list --repo javamain87/pace --state open

# 3) Install dependencies cleanly
npm ci

# 4) Typecheck + Build + Test
npx tsc -b || true
npm run build || true
npm test || true

# 5) If you changed deps, update lockfile
npm install --package-lock-only

# 6) Create branch, commit, push, PR
git checkout -b my-change
# make changes
git add .
git commit -m "chore: describe change"
git push -u origin my-change
gh pr create --fill

# 7) If conflicts occur when PR is dirty
git fetch origin
git checkout my-change
git merge origin/main
# resolve conflicts, then
git add <files>
git commit -m "chore: resolve conflicts with main"
git push

# 8) Merge PR via CLI after CI green
gh pr merge <PR_NUMBER> --merge --delete-branch --admin

# 9) Deploy to Vercel (optional, token required locally)
# export VERCEL_TOKEN=...  # set locally
vercel --prod --yes
```

