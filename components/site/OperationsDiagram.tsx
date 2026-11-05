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
      <defs>
        <linearGradient id="rack-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2b3d" />
          <stop offset="100%" stopColor="#0e1a26" />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#226192" stopOpacity="0" />
          <stop offset="60%" stopColor="#226192" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#EF8557" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* connection paths */}
      <g stroke="#EAE6DE" strokeOpacity="0.18" strokeWidth="1.2">
        <path d="M96 132 C 300 132, 420 176, 560 210" />
        <path d="M96 276 C 320 276, 420 276, 560 282" />
        <path d="M96 420 C 300 420, 420 372, 560 354" />
        <path d="M232 204 C 360 204, 430 226, 560 246" />
        <path d="M232 348 C 360 348, 430 320, 560 318" />
      </g>

      {/* travelling signals */}
      <g stroke="url(#beam)" strokeWidth="2.4" strokeLinecap="round">
        <path className="signal" d="M96 132 C 300 132, 420 176, 560 210" style={{ animationDelay: "0s" }} />
        <path className="signal" d="M96 276 C 320 276, 420 276, 560 282" style={{ animationDelay: "1.2s" }} />
        <path className="signal" d="M96 420 C 300 420, 420 372, 560 354" style={{ animationDelay: "2.1s" }} />
      </g>

      {/* endpoints */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r + 10} fill="#226192" fillOpacity="0.12" />
          <circle
            className="node-pulse"
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={i < 3 ? "#EAE6DE" : "#EF8557"}
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        </g>
      ))}

      {/* server rack */}
      <g transform="translate(560 84)">
        <rect x="0" y="0" width="300" height="432" rx="18" fill="url(#rack-face)" stroke="#2c4258" />
        <rect x="16" y="18" width="268" height="396" rx="10" fill="#0a141d" stroke="#1d3145" />

        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <g key={row} transform={`translate(30 ${38 + row * 46})`}>
            <rect width="240" height="30" rx="4" fill="#12212f" stroke="#243a4f" />
            <rect x="8" y="8" width="6" height="14" rx="2" fill="#EF8557" opacity="0.85" />
            <rect x="20" y="11" width="58" height="3" rx="1.5" fill="#EAE6DE" opacity="0.28" />
            <rect x="20" y="18" width="34" height="3" rx="1.5" fill="#EAE6DE" opacity="0.18" />
            <circle className="led" cx="224" cy="15" r="3" fill="#EF8557" style={{ animationDelay: `${row * 0.32}s` }} />
            <circle className="led-slow" cx="208" cy="15" r="3" fill="#226192" style={{ animationDelay: `${row * 0.5}s` }} />
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
