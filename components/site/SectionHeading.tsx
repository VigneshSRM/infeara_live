type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  invert?: boolean;
  level?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert = false,
  level = "h2",
  className = "",
}: Props) {
  const Heading = level;

  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-[42rem] text-center" : "max-w-[42rem]"} ${className}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${invert ? "text-coral/90" : "text-blue"}`}>
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={`${eyebrow ? "mt-4" : ""} font-display text-[clamp(1.75rem,3vw,2.6rem)] font-medium leading-[1.06] tracking-[-0.025em] ${
          invert ? "text-ivory" : "text-navy"
        }`}
      >
        {title}
      </Heading>
      {intro ? (
        <p
          className={`mt-5 text-[1rem] leading-relaxed ${
            invert ? "text-ivory/65" : "text-charcoal/75"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
