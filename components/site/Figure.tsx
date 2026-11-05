export function Figure({
  seed,
  label,
  caption,
  className = "",
}: {
  seed: number;
  label: string;
  caption: string;
  className?: string;
}) {
  // Deterministic geometry: the same seed always produces the same drawing,
  // so the illustration stays stable across builds and is not decorative noise.
  const bars = Array.from({ length: 14 }, (_, i) => {
    const n = (seed * 31 + i * 17) % 97;
    return 60 + (n % 44) * 4;
  });
  const accent = (seed * 7) % bars.length;

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-navy">
        <svg
          viewBox="0 0 1200 760"
          role="img"
          aria-label={caption}
          className="block h-full w-full"
        >
          <defs>
            <linearGradient id={`wash-${seed}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#226192" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#101D2B" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <rect width="1200" height="760" fill={`url(#wash-${seed})`} />

          <g stroke="#EAE6DE" strokeOpacity="0.08">
            {Array.from({ length: 7 }, (_, i) => (
              <line key={i} x1="0" y1={80 + i * 100} x2="1200" y2={80 + i * 100} />
            ))}
          </g>

          <g>
            {bars.map((height, i) => (
              <rect
                key={i}
                x={90 + i * 74}
                y={560 - height}
                width="30"
                height={height}
                rx="3"
                fill={i === accent ? "#EF8557" : "#EAE6DE"}
                fillOpacity={i === accent ? 0.95 : 0.3}
              />
            ))}
          </g>

          <path
            d="M90 600 C 320 540, 420 640, 620 470 S 940 330, 1110 380"
            stroke="#EAE6DE"
            strokeOpacity="0.28"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M90 600 C 320 540, 420 640, 620 470 S 940 330, 1110 380"
            stroke="#EF8557"
            strokeWidth="2.5"
            strokeDasharray="16 150"
            strokeLinecap="round"
            fill="none"
          />

          {[
            { x: 320, y: 548 },
            { x: 620, y: 470 },
            { x: 940, y: 352 },
          ].map((p) => (
            <g key={`${p.x}-${p.y}`}>
              <circle cx={p.x} cy={p.y} r="18" fill="#EAE6DE" fillOpacity="0.12" />
              <circle cx={p.x} cy={p.y} r="6" fill="#EAE6DE" fillOpacity="0.7" />
            </g>
          ))}

          <text
            x="90"
            y="700"
            fill="#EAE6DE"
            fillOpacity="0.45"
            fontSize="16"
            letterSpacing="4"
          >
            {label.toUpperCase()}
          </text>
        </svg>
      </div>
      <figcaption className="mt-3 text-[0.78rem] leading-relaxed text-charcoal/75">
        {caption}
      </figcaption>
    </figure>
  );
}
