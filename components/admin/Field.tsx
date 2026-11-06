import type { ReactNode } from "react";

/**
 * Form primitives for the CMS. They are deliberately plain inputs styled by the
 * admin classes in globals.css: no client state is needed for a text field, so
 * most of the editor ships as a server component.
 */

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="admin-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[0.74rem] leading-relaxed text-charcoal/60">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  hint,
  placeholder,
  required,
  disabled,
  type = "text",
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "number" | "datetime-local";
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} htmlFor={name} className={className}>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="admin-input disabled:bg-ivory/60 disabled:text-charcoal/60"
      />
    </Field>
  );
}

export function TextareaField({
  name,
  label,
  defaultValue,
  hint,
  placeholder,
  rows = 4,
  required,
  disabled,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} htmlFor={name} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="admin-textarea disabled:bg-ivory/60 disabled:text-charcoal/60"
      />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  defaultValue,
  options,
  hint,
  disabled,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} htmlFor={name} className={className}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="admin-select disabled:bg-ivory/60 disabled:text-charcoal/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ReadOnlyField({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <p className="rounded-lg border border-navy/10 bg-ivory/60 px-3 py-2 font-mono text-[0.82rem] text-charcoal/70">
        {value}
      </p>
    </Field>
  );
}

export const STATUS_OPTIONS = [  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function PublishFields({
  status,
  publishedAt,
  disabled,
}: {
  status: string;
  publishedAt: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        name="status"
        label="Status"
        defaultValue={status}
        options={STATUS_OPTIONS}
        disabled={disabled}
        hint="Only published rows appear on the public site."
      />
      <TextField
        name="published_at"
        type="datetime-local"
        label="Publish at (IST)"
        defaultValue={publishedAt}
        disabled={disabled}
        hint="Leave empty to publish immediately once the status is Published."
      />
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  columns = 1,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <section className="admin-card p-5">
      <h2 className="font-display text-lg leading-tight tracking-[-0.01em] text-navy">{title}</h2>
      {description ? (
        <p className="mt-1 text-[0.8rem] leading-relaxed text-charcoal/65">{description}</p>
      ) : null}
      <div className={`mt-4 grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
    </section>
  );
}
