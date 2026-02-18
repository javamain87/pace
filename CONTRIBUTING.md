# CONTRIBUTING.md

Guidelines for contributing to this project.

- Use feature branches named like `feat/short-description` or `fix/short-description`.
- Create a PR and include a short description, testing steps, and any risk notes.
- Ensure CI passes before merging. Main branch has protected status checks requiring CI.
- For dependency upgrades, prefer small incremental PRs. Use `npm audit fix` in a separate branch and open a PR.
- For breaking upgrades, run full local build and tests before pushing.

Refer to SCRIPTS.md for exact commands to run locally.

