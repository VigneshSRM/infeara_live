type Variant = "layers" | "mesh" | "loop" | "timeline" | "grid";

const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [2, 4],
  [3, 5],
  [4, 5],
  [1, 3],
];

const nodes: [number, number][] = [
  [340, 300],
  [600, 210],
  [860, 320],
  [470, 470],
  [740, 470],
  [600, 600],
];

function mesh() {
  return (
    <>
      {edges.map(([a, b], index) => (
        <line
          key={index}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={index % 3 === 0 ? "#EF8557" : "#EAE6DE"}
          strokeOpacity={index % 3 === 0 ? 0.45 : 0.16}
          strokeWidth="2"
        />
      ))}
      {nodes.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="26" fill="#101D2B" stroke={index === 1 ? "#EF8557" : "#EAE6DE"} strokeOpacity={index === 1 ? 0.9 : 0.28} />
          <circle cx={x} cy={y} r="6" fill={index === 1 ? "#EF8557" : "#EAE6DE"} fillOpacity={index === 1 ? 1 : 0.6} />
        </g>
      ))}
    </>
  );
}

const variants: Record<Variant, React.ReactNode> = {
  layers: (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={170 + i * 40}
            y={200 + i * 95}
            width={860 - i * 80}
            height="64"
            rx="10"
            fill={i === 3 ? "#EF8557" : "#EAE6DE"}
            fillOpacity={i === 3 ? 0.55 : 0.1 + i * 0.04}
            stroke={i === 3 ? "#EF8557" : "#EAE6DE"}
            strokeOpacity={i === 3 ? 0.7 : 0.18}
          />
          <circle
            cx={210 + i * 40}
            cy={232 + i * 95}
            r="6"
            fill={i === 3 ? "#101D2B" : "#EAE6DE"}
            fillOpacity={i === 3 ? 1 : 0.55}
          />
        </g>
      ))}
    </>
  ),
  mesh: mesh(),
  loop: (
    <>
      <circle cx="600" cy="390" r="210" fill="none" stroke="#EAE6DE" strokeOpacity="0.14" strokeDasharray="4 12" />
      <circle cx="600" cy="390" r="140" fill="none" stroke="#EAE6DE" strokeOpacity="0.1" />
      {[0, 1, 2, 3].map((i) => {
        const angle = -Math.PI / 2 + (i * Math.PI) / 2;
        const x = 600 + Math.cos(angle) * 210;
        const y = 390 + Math.sin(angle) * 210;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="30"
              fill="#101D2B"
              stroke={i === 0 ? "#EF8557" : "#EAE6DE"}
              strokeOpacity={i === 0 ? 0.9 : 0.3}
            />
            <circle cx={x} cy={y} r="7" fill={i === 0 ? "#EF8557" : "#EAE6DE"} fillOpacity={i === 0 ? 1 : 0.6} />
          </g>
        );
      })}
    </>
  ),
  timeline: (
    <>
      <line x1="140" y1="420" x2="1060" y2="420" stroke="#EAE6DE" strokeOpacity="0.18" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 180 + i * 210;
        const active = i === 2;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={420}
              r="16"
              fill="#101D2B"
              stroke={active ? "#EF8557" : "#EAE6DE"}
              strokeOpacity={active ? 0.95 : 0.3}
            />
            <circle cx={x} cy={420} r="5" fill={active ? "#EF8557" : "#EAE6DE"} fillOpacity={active ? 1 : 0.55} />
            <rect
              x={x - 46}
              y={active ? 300 : 330}
              width="92"
              height={active ? 92 : 62}
              rx="8"
              fill="#EAE6DE"
              fillOpacity={active ? 0.12 : 0.06}
              stroke={active ? "#EF8557" : "transparent"}
              strokeOpacity="0.5"
            />
          </g>
        );
      })}
    </>
  ),
  grid: (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const active = i === 5 || i === 9;
        return (
          <rect
            key={i}
            x={250 + col * 185}
            y={220 + row * 150}
            width="140"
            height="104"
            rx="10"
            fill={active ? "#EF8557" : "#EAE6DE"}
            fillOpacity={active ? 0.4 : 0.07}
            stroke={active ? "#EF8557" : "#EAE6DE"}
            strokeOpacity={active ? 0.7 : 0.16}
          />
        );
      })}
      <path d="M320 272 H1050 M320 422 H1050" stroke="#EAE6DE" strokeOpacity="0.12" strokeDasharray="3 9" />
    </>
  ),
};

export function Schematic({
  variant = "layers",
  label,
  caption,
  className = "",
}: {
  variant?: Variant;
  label: string;
  caption: string;
  className?: string;
}) {
  const gradientId = `schematic-${variant}`;

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-navy/10 bg-navy">
        <svg viewBox="0 0 1200 760" role="img" aria-label={caption} className="block h-full w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#226192" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#101D2B" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="1200" height="760" fill={`url(#${gradientId})`} />
          {variants[variant]}
          <text x="90" y="700" fill="#EAE6DE" fillOpacity="0.45" fontSize="16" letterSpacing="4">
            {label.toUpperCase()}
          </text>
        </svg>
      </div>
      <figcaption className="mt-3 text-[0.78rem] leading-relaxed text-charcoal/75">{caption}</figcaption>
    </figure>
  );
}
