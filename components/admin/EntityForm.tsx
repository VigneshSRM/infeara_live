"use client";

import { useActionState, useLayoutEffect, useRef, type ReactNode } from "react";
import type { Action, ActionState } from "@/lib/admin/types";

type Props = {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  secondary?: ReactNode;
};

/**
 * React 19 resets a form's uncontrolled fields once its action has run, even when the action
 * answers with an error message. Left alone, one bad link would cost the editor a whole form of
 * typing. This puts back what was submitted.
 *
 * Fields that React controls (the repeaters, the picture number, the PDF's hidden fields) keep
 * their own values through the reset, so hidden, file and password inputs are not touched here.
 */
function restoreFields(form: HTMLFormElement, submitted: FormData) {
  for (const element of Array.from(form.elements)) {
    if (element instanceof HTMLInputElement) {
      const { type, name } = element;
      if (!name || element.disabled) continue;
      if (["hidden", "file", "password", "submit", "button", "reset", "image"].includes(type)) continue;

      const values = submitted.getAll(name);
      if (type === "checkbox" || type === "radio") element.checked = values.includes(element.value);
      else if (values.length > 0) element.value = String(values[0]);
    } else if (element instanceof HTMLTextAreaElement) {
      if (!element.name || element.disabled) continue;
      const values = submitted.getAll(element.name);
      if (values.length > 0) element.value = String(values[0]);
    } else if (element instanceof HTMLSelectElement) {
      if (!element.name || element.disabled) continue;
      const values = submitted.getAll(element.name).map(String);
      for (const option of Array.from(element.options)) option.selected = values.includes(option.value);
    }
  }
}

export function EntityForm({ action, children, submitLabel = "Save changes", secondary }: Props) {
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef<FormData | null>(null);

  const [state, formAction, pending] = useActionState(
    (previous: ActionState, formData: FormData) => {
      submitted.current = formData;
      return action(previous, formData);
    },
    null,
  );

  // After a failed save only: a successful one leaves the form to reset as it always did.
  useLayoutEffect(() => {
    if (state?.error && form.current && submitted.current) restoreFields(form.current, submitted.current);
  }, [state]);

  return (
    <form ref={form} action={formAction} className="space-y-6">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-coral-ink/30 bg-coral/10 px-4 py-3 text-[0.86rem] text-coral-ink"
        >
          {state.error}
        </p>
      ) : null}

      {children}

      <div className="flex flex-wrap items-center gap-3 border-t border-navy/10 pt-5">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {secondary}
      </div>
    </form>
  );
}
