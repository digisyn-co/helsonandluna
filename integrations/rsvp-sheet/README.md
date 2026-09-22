# RSVP → Google Sheet

`Code.js` + `appsscript.json` are the Apps Script web app that receives RSVPs from
`/api/rsvp` and appends them to the "RSVPs" tab of the bound Google Sheet.

Vercel environment variables (Production):
- `RSVP_WEBHOOK_URL` — the web app's `/exec` URL
- `RSVP_WEBHOOK_SECRET` — must equal the script property `RSVP_SECRET`

Update the script: `clasp push && clasp deploy -i <deploymentId>` (keeps the same URL).

## Live setup (2026-09-22)
- Spreadsheet: https://docs.google.com/spreadsheets/d/1uvq2z7rTkj3IHmMCHJWbXRt00smO5TMdBi3XGHo6iM8/edit (tab "RSVPs", owned by jim@digisyn.co)
- Apps Script project "Helson and Luna": https://script.google.com/home/projects/1Jh6G8qfoygiXQD8Q_hWK0WyA7UhVcBk2YFsPJ4kr99MkkcwQ2qfJMB9z/edit
  - Script properties: `RSVP_SECRET` and `SHEET_ID` (values are not stored in this repo)
  - Web app deployment "Helson & Luna RSVP receiver v1": execute as jim@digisyn.co, access Anyone
- Vercel project `helsonandluna` (Production): `RSVP_WEBHOOK_URL`, `RSVP_WEBHOOK_SECRET` (encrypted)
- To change the code, paste the new `Code.js` into the project, save, then Deploy → Manage deployments → edit → "New version". That keeps the same /exec URL, so Vercel needs no change.
