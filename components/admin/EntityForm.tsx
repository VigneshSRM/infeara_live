"use client";

import { useActionState, type ReactNode } from "react";
import type { Action } from "@/lib/admin/types";

type Props = {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  secondary?: ReactNode;
};

export function EntityForm({ action, children, submitLabel = "Save changes", secondary }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
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
