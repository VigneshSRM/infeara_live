"use client";

import { useState } from "react";

export type RepeaterField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "lines";
  placeholder?: string;
};

type Props = {
  name: string;
  label: string;
  fields: RepeaterField[];
  initial?: Record<string, string>[];
  addLabel?: string;
  hint?: string;
  singleLabel?: [string, string];
};

/**
 * Repeatable group editor. Values live in component state and are serialised
 * into one hidden field, so the server action receives a single JSON string.
 * "lines" fields are textareas that the action splits into a string array.
 */
export function Repeater({ name, label, fields, initial = [], addLabel = "Add item", hint }: Props) {
  const [rows, setRows] = useState<Record<string, string>[]>(() =>
    initial.length
      ? initial
      : [Object.fromEntries(fields.map((field) => [field.name, ""]))],
  );

  function update(index: number, field: string, value: string) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function add() {
    setRows((current) => [...current, Object.fromEntries(fields.map((field) => [field.name, ""]))]);
  }

  function remove(index: number) {
    setRows((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="admin-label mb-0">{label}</span>
        <button type="button" onClick={add} className="admin-btn admin-btn-ghost !px-3 !py-1 !text-[0.72rem]">
          {addLabel}
        </button>
      </div>
      {hint ? <p className="mt-1 text-[0.76rem] text-charcoal/70">{hint}</p> : null}

      <input type="hidden" name={name} value={JSON.stringify(rows)} />

      <div className="mt-3 space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-lg border border-navy/10 bg-ivory/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-[0.7rem] uppercase tracking-[0.14em] text-charcoal/60">
                {String(index + 1).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-[0.72rem] text-coral-ink underline underline-offset-4 disabled:opacity-40"
                disabled={rows.length === 1}
              >
                Remove
              </button>
            </div>

            <div className="mt-2 space-y-3">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="admin-label" htmlFor={`${name}-${index}-${field.name}`}>
                    {field.label}
                  </label>
                  {field.type === "text" ? (
                    <input
                      id={`${name}-${index}-${field.name}`}
                      className="admin-input"
                      value={row[field.name] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => update(index, field.name, event.target.value)}
                    />
                  ) : (
                    <textarea
                      id={`${name}-${index}-${field.name}`}
                      className="admin-textarea"
                      rows={field.type === "lines" ? 4 : 3}
                      value={row[field.name] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => update(index, field.name, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
