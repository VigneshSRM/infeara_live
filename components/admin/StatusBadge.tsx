type Status = "draft" | "published" | "archived" | "new" | "contacted" | "qualified" | "closed" | "spam";

const styles: Record<Status, string> = {
  published: "bg-blue/10 text-blue",
  draft: "bg-charcoal/10 text-charcoal/80",
  archived: "bg-navy/10 text-navy/70",
  new: "bg-coral/20 text-coral-ink",
  contacted: "bg-blue/10 text-blue",
  qualified: "bg-blue/15 text-blue",
  closed: "bg-charcoal/10 text-charcoal/75",
  spam: "bg-coral-ink/10 text-coral-ink",
};

const labels: Record<Status, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  spam: "Spam",
};

export function StatusBadge({ status, scheduled }: { status: Status; scheduled?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex rounded-sm px-2.5 py-0.5 font-heading text-[0.66rem] uppercase tracking-[0.1em] ${styles[status]}`}
      >
        {labels[status]}
      </span>
      {scheduled ? (
        <span className="inline-flex rounded-sm bg-navy/10 px-2.5 py-0.5 font-heading text-[0.66rem] uppercase tracking-[0.1em] text-navy/75">
          Scheduled
        </span>
      ) : null}
    </span>
  );
}
