/**
 * Helson & Luna — RSVP receiver (standalone Google Apps Script web app).
 *
 * The website's /api/rsvp forwards each RSVP here as JSON. Apps Script cannot read
 * request headers, so the shared secret arrives in the body and is checked against the
 * script property RSVP_SECRET (Project Settings → Script properties).
 * Run setup() once: it creates the "Helson & Luna RSVPs" spreadsheet and stores its id
 * in the SHEET_ID script property.
 */
const SHEET_NAME = "RSVPs";
const HEADERS = ["Submitted at (Manila)", "Name", "Attending", "Email or phone", "Message"];

function doPost(e) {
  const secret = PropertiesService.getScriptProperties().getProperty("RSVP_SECRET");
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return json({ ok: false, error: "bad_json" });
  }
  if (!secret || body.secret !== secret) return json({ ok: false, error: "unauthorized" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // two guests at the same second never overwrite each other
  try {
    const sheet = getSheet();
    sheet.appendRow([
      Utilities.formatDate(new Date(body.submittedAt || Date.now()), "Asia/Manila", "yyyy-MM-dd HH:mm"),
      safe(body.name),
      body.attending === "yes" ? "Joyfully accepts" : "Regretfully declines",
      safe(body.contact),
      safe(body.message),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

/** A quick health check: open the web app URL in a browser. */
function doGet() {
  return json({ ok: true, service: "helson-luna-rsvp" });
}

function getSheet() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("Run setup() first");
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

/** Guests' text is stored as text: a leading = + - @ can never run as a formula. */
function safe(v) {
  const s = String(v == null ? "" : v).slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor: creates the spreadsheet (if needed) and grants permissions. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SHEET_ID")) {
    const ss = SpreadsheetApp.create("Helson & Luna RSVPs");
    props.setProperty("SHEET_ID", ss.getId());
    const first = ss.getSheets()[0];
    first.setName(SHEET_NAME);
    first.appendRow(HEADERS);
    first.setFrozenRows(1);
    first.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  const url = SpreadsheetApp.openById(props.getProperty("SHEET_ID")).getUrl();
  Logger.log("RSVP sheet: " + url);
  return url;
}
