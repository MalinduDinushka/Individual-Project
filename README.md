# Individual-Project

Quick setup

- Backend
	- cd Backend
	- npm install
	- npm test

- Frontend
	- cd Frontend
	- npm install
	- npm run build

Code review notes

- Backend tests currently pass: `cd Backend && npm test`.
- Frontend build succeeds: `cd Frontend && npm run build`.
- Editor Tailwind at-rule diagnostics are suppressed via `.vscode/settings.json`. Reviewers should reload the editor or restart the TypeScript server if they see stale diagnostics.
- See `REVIEW.md` for a concise reviewer checklist and key file locations.