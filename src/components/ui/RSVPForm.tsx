"use client";

import { useId, useState, type FormEvent } from "react";
import { details } from "@/content/wedding";
import s from "./rsvp.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; attending: boolean } | { kind: "error"; message: string };

/**
 * RSVP form: a few large touch targets, works with the keyboard and screen readers,
 * and does not depend on any animation or WebGL. Posts to /api/rsvp.
 */
export function RSVPForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(body.message ?? "Something went wrong. Please try again.");
      setStatus({ kind: "sent", attending: data.attending === "yes" });
      form.reset();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className={s.done} role="status">
        <p className="display">{status.attending ? "Thank you — we can't wait to celebrate with you." : "Thank you for letting us know."}</p>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate={false}>
      <div className={s.field}>
        <label htmlFor={`${id}-name`} className="meta">
          Your name(s)
        </label>
        <input id={`${id}-name`} name="name" required minLength={2} maxLength={120} autoComplete="name" className={s.input} />
      </div>

      <fieldset className={s.field}>
        <legend className="meta">Will you attend?</legend>
        <div className={s.choices}>
          <label className={s.choice}>
            <input type="radio" name="attending" value="yes" required />
            <span>Joyfully accepts</span>
          </label>
          <label className={s.choice}>
            <input type="radio" name="attending" value="no" />
            <span>Regretfully declines</span>
          </label>
        </div>
      </fieldset>

      <div className={s.field}>
        <label htmlFor={`${id}-contact`} className="meta">
          Email or phone <span className={s.optional}>(optional)</span>
        </label>
        <input id={`${id}-contact`} name="contact" maxLength={120} autoComplete="email" className={s.input} />
      </div>

      <div className={s.field}>
        <label htmlFor={`${id}-message`} className="meta">
          A note for the couple <span className={s.optional}>(optional)</span>
        </label>
        <textarea id={`${id}-message`} name="message" maxLength={1000} rows={3} className={s.input} />
      </div>

      {/* Spam trap: invisible to people, filled in by bots. */}
      <div className={s.trap} aria-hidden="true">
        <label>
          Leave empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" className={s.submit} disabled={sending}>
        {sending ? "Sending…" : "Send RSVP"}
      </button>
      <p className={s.note}>Kindly respond by {details.rsvpBy}.</p>
      {status.kind === "error" && (
        <p className={s.error} role="alert">
          {status.message}
        </p>
      )}
    </form>
  );
}
