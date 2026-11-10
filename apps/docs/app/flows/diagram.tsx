// Static SVG pipeline diagram. Server-rendered, no JS, no dependencies.

export type Tone = 'slate' | 'amber' | 'blue' | 'green' | 'red';

export type Step = {
  title: string;
  title2?: string;
  sub: string;
  sub2?: string;
  tone: Tone;
};

const TONES: Record<Tone, { fill: string; stroke: string; title: string; sub: string; badge: string }> = {
  slate: { fill: '#f1f5f9', stroke: '#94a3b8', title: '#0f172a', sub: '#64748b', badge: '#475569' },
  amber: { fill: '#fef3c7', stroke: '#d97706', title: '#78350f', sub: '#92400e', badge: '#d97706' },
  blue: { fill: '#dbeafe', stroke: '#2563eb', title: '#1e3a8a', sub: '#1d4ed8', badge: '#2563eb' },
  green: { fill: '#dcfce7', stroke: '#16a34a', title: '#14532d', sub: '#15803d', badge: '#16a34a' },
  red: { fill: '#fee2e2', stroke: '#dc2626', title: '#7f1d1d', sub: '#b91c1c', badge: '#dc2626' },
};

const NW = 184; // node width
const GAP = 56; // arrow gap
const NH = 112; // node height
const PAD = 8;

export default function Diagram({ steps, edges = [] }: { steps: Step[]; edges?: string[] }) {
  const top = edges.some(Boolean) ? 22 : 0;
  const width = steps.length * NW + (steps.length - 1) * GAP + PAD * 2;
  const height = top + NH + PAD * 2;
  const midY = top + PAD + NH / 2;

  return (
    <div className="diagram">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, height: 'auto', display: 'block' }}
        role="img"
      >
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {steps.map((s, i) => {
          const t = TONES[s.tone];
          const x = PAD + i * (NW + GAP);
          const y = top + PAD;
          return (
            <g key={i}>
              <rect x={x} y={y} width={NW} height={NH} rx="10" fill={t.fill} stroke={t.stroke} strokeWidth="1.8" />
              <circle cx={x + 18} cy={y + 20} r="11" fill={t.badge} />
              <text x={x + 18} y={y + 24.5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
                {i + 1}
              </text>
              <text x={x + NW / 2} y={y + 48} textAnchor="middle" fontSize="13" fontWeight="700" fill={t.title}>
                {s.title}
              </text>
              {s.title2 && (
                <text x={x + NW / 2} y={y + 64} textAnchor="middle" fontSize="13" fontWeight="700" fill={t.title}>
                  {s.title2}
                </text>
              )}
              <text x={x + NW / 2} y={y + (s.title2 ? 84 : 70)} textAnchor="middle" fontSize="11" fill={t.sub}>
                {s.sub}
              </text>
              {s.sub2 && (
                <text x={x + NW / 2} y={y + (s.title2 ? 98 : 86)} textAnchor="middle" fontSize="11" fill={t.sub}>
                  {s.sub2}
                </text>
              )}
            </g>
          );
        })}
        {steps.slice(0, -1).map((_, i) => {
          const x1 = PAD + i * (NW + GAP) + NW;
          const x2 = x1 + GAP;
          return (
            <g key={i}>
              {edges[i] && (
                <text x={(x1 + x2) / 2} y={top - 2} textAnchor="middle" fontSize="11" fontStyle="italic" fill="#475569">
                  {edges[i]}
                </text>
              )}
              <line x1={x1 + 2} y1={midY} x2={x2 - 2} y2={midY} stroke="#64748b" strokeWidth="1.8" markerEnd="url(#flow-arrow)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Legend() {
  const items: Array<{ tone: Tone; label: string }> = [
    { tone: 'amber', label: 'waiting / pending' },
    { tone: 'blue', label: 'working' },
    { tone: 'green', label: 'done' },
    { tone: 'red', label: 'failed' },
    { tone: 'slate', label: 'you / config' },
  ];
  return (
    <div className="legend">
      {items.map((it) => (
        <span key={it.tone} className="chip">
          <span className="dot" style={{ background: TONES[it.tone].badge }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
