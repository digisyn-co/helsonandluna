# RSVP → Google Sheet

`Code.js` + `appsscript.json` are the Apps Script web app that receives RSVPs from
`/api/rsvp` and appends them to the "RSVPs" tab of the bound Google Sheet.

Vercel environment variables (Production):
- `RSVP_WEBHOOK_URL` — the web app's `/exec` URL
- `RSVP_WEBHOOK_SECRET` — must equal the script property `RSVP_SECRET`

Update the script: `clasp push && clasp deploy -i <deploymentId>` (keeps the same URL).
