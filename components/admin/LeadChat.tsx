"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  NOTE_MAX_LENGTH,
  cleanNoteBody,
  groupByDay,
  sameThread,
  sortNotes,
  timeLabel,
  withSaved,
  type ChatNote,
} from "@/lib/admin/lead-chat";
import { addLeadNote, deleteLeadNote, type DeleteResult, type SendResult } from "@/lib/admin/lead-note-actions";

/**
 * The internal notes on a lead, as a chat. Each note is its own message with the
 * sender's name and the time; nothing is overwritten and everyone on staff reads
 * the same history.
 *
 * The history arrives already rendered from the server. After that the browser asks
 * for the thread every few seconds (and when the tab comes back into view), so a
 * colleague's message shows up without a reload. Sending is optimistic: the message
 * appears at once, and if the server refuses it, the text goes back into the box.
 */

const POLL_MS = 6000;
const LEGACY_AUTHOR = "Earlier note";

type Props = {
  leadId: string;
  initialNotes: ChatNote[];
  /** The thread was cut to the most recent messages. */
  truncated: boolean;
  currentUserId: string;
  /** Only a super admin sees Delete. The database enforces it as well. */
  canDelete: boolean;
  /** Server clock at render time, so "Today" matches between server and browser on first paint. */
  nowMs: number;
};

type Pending = { key: string; body: string };
type Connection = "live" | "retrying" | "signed_out" | "not_set_up";

const SEND_FAILED: SendResult = { ok: false, error: "The note could not be sent. Check your connection and try again." };
const DELETE_FAILED: DeleteResult = { ok: false, error: "The message could not be deleted. Try again." };

/** Server actions that redirect (signed out) resolve to nothing; treat that as a failure, not a crash. */
const asResult = <T extends { ok: boolean }>(value: T | undefined | null, fallback: T): T =>
  value && typeof value === "object" && "ok" in value ? value : fallback;

export function LeadChat({ leadId, initialNotes, truncated, currentUserId, canDelete, nowMs }: Props) {
  const [notes, setNotes] = useState<ChatNote[]>(initialNotes);
  const [pending, setPending] = useState<Pending[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection>("live");
  const [now, setNow] = useState(nowMs);
  const [hasNew, setHasNew] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const previousCount = useRef(initialNotes.length);
  const inFlight = useRef(false);
  const counter = useRef(0);
  /** When each message we sent was saved, so a refresh that began earlier cannot drop it. */
  const savedAt = useRef(new Map<string, number>());
  /** Messages deleted here, so a refresh that began earlier cannot bring them back. */
  const deletedIds = useRef(new Set<string>());

  const polling = connection !== "signed_out" && connection !== "not_set_up";

  /* ── Refresh ─────────────────────────────────────────────────────────────── */

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const startedAt = Date.now();
    try {
      const response = await fetch(`/admin/api/leads/${leadId}/notes`, {
        cache: "no-store",
        credentials: "same-origin",
        redirect: "manual",
        headers: { accept: "application/json" },
      });

      // The proxy turns a lapsed session into a redirect to the sign-in page.
      if (response.type === "opaqueredirect" || response.status === 401) {
        setConnection("signed_out");
        return;
      }
      if (response.status === 409) {
        setConnection("not_set_up");
        return;
      }
      const isJson = (response.headers.get("content-type") ?? "").includes("application/json");
      if (!response.ok || !isJson) {
        setConnection("retrying");
        return;
      }

      const body = (await response.json()) as { notes?: ChatNote[] };
      if (!Array.isArray(body.notes)) {
        setConnection("retrying");
        return;
      }
      const incoming = body.notes;

      setConnection("live");
      setNow(Date.now());
      setNotes((current) => {
        const ids = new Set(incoming.map((note) => note.id));
        // A message we saved after this request began may not be in its answer yet.
        const recent = current.filter((note) => !ids.has(note.id) && (savedAt.current.get(note.id) ?? 0) > startedAt);
        const next = sortNotes([...incoming.filter((note) => !deletedIds.current.has(note.id)), ...recent]);
        return sameThread(current, next) ? current : next;
      });
    } catch {
      setConnection("retrying");
    } finally {
      inFlight.current = false;
    }
  }, [leadId]);

  useEffect(() => {
    if (!polling) return;
    const tick = () => {
      if (!document.hidden) void refresh();
    };
    const timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [polling, refresh]);

  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
    setNow(Date.now());
  }, []);

  /* ── Scrolling ───────────────────────────────────────────────────────────── */

  const scrollToEnd = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    stickToBottom.current = true;
    setHasNew(false);
  }, []);

  useLayoutEffect(() => {
    const grew = notes.length > previousCount.current;
    previousCount.current = notes.length;
    if (stickToBottom.current) {
      scrollToEnd();
    } else if (grew) {
      setHasNew(true);
    }
  }, [notes.length, pending.length, scrollToEnd]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (stickToBottom.current) setHasNew(false);
  };

  /* ── Sending ─────────────────────────────────────────────────────────────── */

  const send = () => {
    const cleaned = cleanNoteBody(draft);
    if (!cleaned.ok) {
      setError(
        cleaned.error === "empty"
          ? "Write something before sending."
          : `Notes can be up to ${NOTE_MAX_LENGTH.toLocaleString("en-IN")} characters.`,
      );
      return;
    }

    const key = `pending-${(counter.current += 1)}`;
    const text = cleaned.body;
    setError(null);
    setDraft("");
    setPending((list) => [...list, { key, body: text }]);
    stickToBottom.current = true;

    void (async () => {
      let result: SendResult;
      try {
        result = asResult(await addLeadNote(leadId, text), SEND_FAILED);
      } catch {
        result = SEND_FAILED;
      }

      setPending((list) => list.filter((item) => item.key !== key));
      if (result.ok) {
        savedAt.current.set(result.note.id, Date.now());
        setNotes((current) => withSaved(current, result.note));
      } else {
        setError(result.error);
        // Give the text back so nothing typed is lost.
        setDraft((current) => (current.trim() ? `${text}\n\n${current}` : text));
      }
    })();
  };

  const remove = async (note: ChatNote) => {
    if (!window.confirm("Delete this message for everyone? This cannot be undone.")) return;
    setRemoving(note.id);
    setError(null);
    let result: DeleteResult;
    try {
      result = asResult(await deleteLeadNote(note.id), DELETE_FAILED);
    } catch {
      result = DELETE_FAILED;
    }
    setRemoving(null);
    if (result.ok) {
      deletedIds.current.add(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
    } else {
      setError(result.error);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */

  const groups = useMemo(() => groupByDay(notes, now), [notes, now]);
  const length = draft.trim().length;
  const nearLimit = length > NOTE_MAX_LENGTH - 500;

  return (
    <section id="notes" className="admin-card flex scroll-mt-6 flex-col" aria-labelledby={`notes-heading-${leadId}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-navy/10 px-5 py-4">
        <div>
          <h2 id={`notes-heading-${leadId}`} className="font-display text-lg text-navy">
            Internal notes
          </h2>
          <p className="mt-0.5 text-[0.76rem] leading-relaxed text-charcoal/65">
            A private thread for staff. Every note is kept with who wrote it and when; notes cannot be edited.
          </p>
        </div>
        <p
          className="flex items-center gap-1.5 pt-1 text-[0.72rem] text-charcoal/60"
          data-testid="notes-connection"
          data-state={connection}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${connection === "live" ? "bg-blue" : "bg-coral"}`}
          />
          {connection === "live" ? "Updates automatically" : null}
          {connection === "retrying" ? "Reconnecting…" : null}
          {connection === "signed_out" ? "Signed out" : null}
          {connection === "not_set_up" ? "Not switched on" : null}
        </p>
      </div>

      {connection === "signed_out" ? (
        <p role="alert" className="border-b border-coral/30 bg-coral/10 px-5 py-3 text-[0.82rem] text-coral-ink">
          Your session has ended, so new notes will not appear or send.{" "}
          <Link href={`/admin/login?next=${encodeURIComponent(`/admin/leads/${leadId}`)}`} className="font-heading underline underline-offset-4">
            Sign in again
          </Link>
          .
        </p>
      ) : null}

      <div className="relative">
        <div
          ref={listRef}
          onScroll={onScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Internal notes history"
          tabIndex={0}
          className="max-h-[30rem] min-h-[11rem] space-y-5 overflow-y-auto bg-navy/[0.035] px-4 py-4 md:px-5"
          data-testid="notes-thread"
        >
          {truncated ? (
            <p className="text-center text-[0.72rem] text-charcoal/55">Showing the most recent {notes.length} messages.</p>
          ) : null}

          {!groups.length && !pending.length ? (
            <p className="px-2 py-8 text-center text-[0.84rem] leading-relaxed text-charcoal/65">
              No notes yet. Write the first one below. Everyone on staff can read it.
            </p>
          ) : null}

          {groups.map((group) => (
            <section key={group.key} aria-label={group.label} className="space-y-2.5">
              <h3 className="flex justify-center">
                <span className="bg-navy/10 px-2.5 py-0.5 font-heading text-[0.66rem] uppercase tracking-[0.12em] text-charcoal/70">
                  {group.label}
                </span>
              </h3>
              <ol className="space-y-2.5">
                {group.notes.map((note) => {
                  const mine = note.authorId !== null && note.authorId === currentUserId;
                  const earlier = note.authorId === null && note.authorName === LEGACY_AUTHOR;
                  return (
                    <li key={note.id} className={`flex ${mine ? "justify-end" : "justify-start"}`} data-note-id={note.id}>
                      <article
                        className={`max-w-[88%] rounded-sm px-3 py-2 md:max-w-[78%] ${
                          mine
                            ? "bg-blue text-ivory"
                            : earlier
                              ? "border border-dashed border-navy/30 bg-ivory text-charcoal"
                              : "border border-navy/15 bg-ivory text-charcoal"
                        }`}
                      >
                        <p className={`font-heading text-[0.7rem] font-semibold ${mine ? "text-ivory/85" : "text-blue"}`}>
                          {mine ? "You" : note.authorName}
                          {earlier ? <span className="font-normal text-charcoal/55"> · written before the chat</span> : null}
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-[0.88rem] leading-relaxed">{note.body}</p>
                        <p className={`mt-1 flex items-center justify-end gap-3 text-[0.66rem] tabular-nums ${mine ? "text-ivory/75" : "text-charcoal/55"}`}>
                          <time dateTime={note.createdAt}>{timeLabel(note.createdAt)}</time>
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => void remove(note)}
                              disabled={removing === note.id}
                              className="font-heading underline underline-offset-2 hover:no-underline disabled:opacity-50"
                              aria-label={`Delete the note from ${mine ? "you" : note.authorName} at ${timeLabel(note.createdAt)}`}
                            >
                              {removing === note.id ? "Deleting…" : "Delete"}
                            </button>
                          ) : null}
                        </p>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          {pending.length ? (
            <ol className="space-y-2.5" aria-label="Sending">
              {pending.map((item) => (
                <li key={item.key} className="flex justify-end">
                  <article className="max-w-[88%] rounded-sm bg-blue/70 px-3 py-2 text-ivory md:max-w-[78%]">
                    <p className="font-heading text-[0.7rem] font-semibold text-ivory/85">You</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-[0.88rem] leading-relaxed">{item.body}</p>
                    <p className="mt-1 text-right text-[0.66rem] text-ivory/75">Sending…</p>
                  </article>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {hasNew ? (
          <button
            type="button"
            onClick={scrollToEnd}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-navy px-3 py-1 font-heading text-[0.72rem] text-ivory shadow"
          >
            New notes ↓
          </button>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="border-t border-navy/10 px-4 py-4 md:px-5"
        noValidate
      >
        <label htmlFor={`note-draft-${leadId}`} className="sr-only">
          Write an internal note
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id={`note-draft-${leadId}`}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter adds a line, the way a chat does. Only on a
              // device with a real keyboard: on a phone Enter must stay a new line.
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && finePointer) {
                event.preventDefault();
                send();
              }
            }}
            rows={Math.min(8, Math.max(2, draft.split("\n").length))}
            placeholder="Write a note for your team…"
            className="admin-textarea min-h-0 flex-1 resize-none"
            aria-describedby={`note-help-${leadId}`}
          />
          <button type="submit" className="admin-btn admin-btn-primary shrink-0" disabled={!draft.trim()}>
            Send
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p id={`note-help-${leadId}`} className="text-[0.72rem] text-charcoal/60">
            {finePointer ? "Enter to send · Shift+Enter for a new line" : "Tap Send to add the note"}
          </p>
          {nearLimit ? (
            <p className={`text-[0.72rem] tabular-nums ${length > NOTE_MAX_LENGTH ? "font-semibold text-coral-ink" : "text-charcoal/60"}`}>
              {length.toLocaleString("en-IN")} / {NOTE_MAX_LENGTH.toLocaleString("en-IN")}
            </p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="mt-2 text-[0.8rem] text-coral-ink">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
