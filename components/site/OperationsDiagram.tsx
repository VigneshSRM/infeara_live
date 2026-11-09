export function OperationsDiagram() {
  const nodes = [
    { x: 96, y: 132, r: 7 },
    { x: 96, y: 276, r: 7 },
    { x: 96, y: 420, r: 7 },
    { x: 232, y: 204, r: 9 },
    { x: 232, y: 348, r: 9 },
  ];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 960 600"
      className="h-full w-full"
      fill="none"
    >
      {/* connection paths */}
      <g stroke="#EAE6DE" strokeOpacity="0.18" strokeWidth="1.2">
        <path d="M96 132 C 300 132, 420 176, 560 210" />
        <path d="M96 276 C 320 276, 420 276, 560 282" />
        <path d="M96 420 C 300 420, 420 372, 560 354" />
        <path d="M232 204 C 360 204, 430 226, 560 246" />
        <path d="M232 348 C 360 348, 430 320, 560 318" />
      </g>

      {/* signal paths */}
      <g stroke="#EF8557" strokeWidth="2.4" strokeLinecap="round">
        <path className="signal" d="M96 132 C 300 132, 420 176, 560 210" />
        <path className="signal" d="M96 276 C 320 276, 420 276, 560 282" />
        <path className="signal" d="M96 420 C 300 420, 420 372, 560 354" />
      </g>

      {/* endpoints */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={i < 3 ? "#EAE6DE" : "#EF8557"}
          />
        </g>
      ))}

      {/* server rack */}
      <g transform="translate(560 84)">
        <rect x="0" y="0" width="300" height="432" rx="0" fill="#226192" stroke="#EAE6DE" strokeOpacity="0.4" />
        <rect x="16" y="18" width="268" height="396" rx="0" fill="#226192" fillOpacity="0.72" stroke="#EAE6DE" strokeOpacity="0.2" />

        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <g key={row} transform={`translate(30 ${38 + row * 46})`}>
            <rect width="240" height="30" rx="0" fill="#226192" fillOpacity="0.55" stroke="#EAE6DE" strokeOpacity="0.22" />
            <rect x="8" y="8" width="6" height="14" rx="2" fill="#EF8557" opacity="0.85" />
            <rect x="20" y="11" width="58" height="3" rx="1.5" fill="#EAE6DE" opacity="0.65" />
            <rect x="20" y="18" width="34" height="3" rx="1.5" fill="#EAE6DE" opacity="0.42" />
            <circle cx="224" cy="15" r="3" fill="#EF8557" />
            <circle cx="208" cy="15" r="3" fill="#EAE6DE" opacity="0.7" />
          </g>
        ))}
      </g>

      {/* baseline */}
      <line x1="96" y1="528" x2="860" y2="528" stroke="#EAE6DE" strokeOpacity="0.09" strokeWidth="1" />
      <text x="96" y="560" fill="#EAE6DE" fillOpacity="0.28" fontSize="11" letterSpacing="2.4">
        OPERATIONS · MONITORING · RESPONSE
      </text>
    </svg>
  );
}
