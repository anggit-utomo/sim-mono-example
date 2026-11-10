// Detailed decision flowchart: boxes, diamonds, yes/no branches, and per-step
// mono captions naming the exact function, query, and set. Server-rendered SVG.

import { TONES, type Tone } from '../flows/diagram';

export type FStep = {
  title: string;
  title2?: string;
  sub?: string;
  tone: Tone;
};

export type FNode = {
  kind: 'box' | 'diamond';
  title: string;
  title2?: string;
  code?: string[];
  tone: Tone;
  edge?: string;
  note?: string;
  branch?: { edge: string; steps: FStep[] };
};

const SW = 340; // spine width
const BW = 290; // branch width
const GAP = 60;
const PAD = 12;

function boxH(n: FNode): number {
  const lines = n.code ?? [];
  return (n.title2 ? 66 : 50) + lines.length * 17 + 14;
}
const DIAMOND_H = 148;

function BranchStack({ steps, x, y }: { steps: FStep[]; x: number; y: number }) {
  let cy = y;
  return (
    <g>
      {steps.map((s, i) => {
        const t = TONES[s.tone];
        const h = 84;
        const el = (
          <g key={i}>
            {i > 0 && (
              <line x1={x + BW / 2} y1={cy - 14} x2={x + BW / 2} y2={cy} stroke="#64748b" strokeWidth="1.8" markerEnd="url(#flow-arrow2)" />
            )}
            <rect x={x} y={cy} width={BW} height={h} rx="10" fill={t.fill} stroke={t.stroke} strokeWidth="1.8" />
            <text x={x + BW / 2} y={cy + 30} textAnchor="middle" fontSize="13" fontWeight="700" fill={t.title}>
              {s.title}
            </text>
            {s.title2 && (
              <text x={x + BW / 2} y={cy + 46} textAnchor="middle" fontSize="13" fontWeight="700" fill={t.title}>
                {s.title2}
              </text>
            )}
            {s.sub && (
              <text x={x + BW / 2} y={cy + (s.title2 ? 64 : 62)} textAnchor="middle" fontSize="11" fill={t.sub}>
                {s.sub}
              </text>
            )}
          </g>
        );
        cy += h + 26;
        return el;
      })}
    </g>
  );
}

export default function FlowChart({ nodes }: { nodes: FNode[] }) {
  // Pre-compute row geometry.
  const rows = nodes.map((n) => {
    const spineH = n.kind === 'diamond' ? DIAMOND_H + (n.note ? 22 : 0) : boxH(n);
    const branchH = n.branch ? n.branch.steps.length * 84 + (n.branch.steps.length - 1) * 26 : 0;
    return { h: Math.max(spineH, branchH), spineH };
  });
  const width = PAD * 2 + SW + GAP + BW;
  const height = rows.reduce((a, r) => a + r.h, 0) + (nodes.length - 1) * 34 + PAD * 2;

  let cy = PAD;
  return (
    <div className="diagram">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: width, height: 'auto', display: 'block' }} role="img">
        <defs>
          <marker id="flow-arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {nodes.map((n, i) => {
          const t = TONES[n.tone];
          const y = cy;
          const rowH = rows[i].h;
          const el = (
            <g key={i}>
              {i > 0 && n.edge && (
                <text x={PAD + 4} y={y - 8} fontSize="11" fontStyle="italic" fill="#475569">
                  {n.edge}
                </text>
              )}
              {i > 0 && (
                <line x1={PAD + SW / 2} y1={y - 34} x2={PAD + SW / 2} y2={y} stroke="#64748b" strokeWidth="1.8" markerEnd="url(#flow-arrow2)" />
              )}
              {n.kind === 'box' ? (
                <g>
                  <rect x={PAD} y={y} width={SW} height={rows[i].spineH} rx="10" fill={t.fill} stroke={t.stroke} strokeWidth="1.8" />
                  <text x={PAD + 14} y={y + 28} fontSize="13" fontWeight="700" fill={t.title}>
                    {n.title}
                  </text>
                  {n.title2 && (
                    <text x={PAD + 14} y={y + 44} fontSize="13" fontWeight="700" fill={t.title}>
                      {n.title2}
                    </text>
                  )}
                  {(n.code ?? []).map((c, k) => (
                    <text key={k} x={PAD + 14} y={y + (n.title2 ? 66 : 50) + k * 17} fontSize="10.5" fontFamily="monospace" fill={t.sub}>
                      {c}
                    </text>
                  ))}
                </g>
              ) : (
                <g>
                  <polygon
                    points={`${PAD + SW / 2},${y + 6} ${PAD + SW - 6},${y + DIAMOND_H / 2} ${PAD + SW / 2},${y + DIAMOND_H - 6} ${PAD + 6},${y + DIAMOND_H / 2}`}
                    fill={t.fill}
                    stroke={t.stroke}
                    strokeWidth="1.8"
                  />
                  <text x={PAD + SW / 2} y={y + DIAMOND_H / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={t.title}>
                    {n.title}
                  </text>
                  {n.title2 && (
                    <text x={PAD + SW / 2} y={y + DIAMOND_H / 2 + 14} textAnchor="middle" fontSize="13" fontWeight="700" fill={t.title}>
                      {n.title2}
                    </text>
                  )}
                  {n.note && (
                    <text x={PAD + SW / 2} y={y + DIAMOND_H + 16} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fill={t.sub}>
                      {n.note}
                    </text>
                  )}
                  {n.branch && (
                    <g>
                      <line
                        x1={PAD + SW - 6}
                        y1={y + DIAMOND_H / 2}
                        x2={PAD + SW + GAP}
                        y2={y + DIAMOND_H / 2}
                        stroke="#64748b"
                        strokeWidth="1.8"
                        markerEnd="url(#flow-arrow2)"
                      />
                      <text x={PAD + SW + GAP / 2} y={y + DIAMOND_H / 2 - 8} textAnchor="middle" fontSize="11" fontStyle="italic" fill="#475569">
                        {n.branch.edge}
                      </text>
                      <BranchStack steps={n.branch.steps} x={PAD + SW + GAP} y={y + 10} />
                    </g>
                  )}
                </g>
              )}
              {n.kind === 'box' && n.branch && (
                <g>
                  <line
                    x1={PAD + SW}
                    y1={y + rows[i].spineH / 2}
                    x2={PAD + SW + GAP}
                    y2={y + rows[i].spineH / 2}
                    stroke="#64748b"
                    strokeWidth="1.8"
                    markerEnd="url(#flow-arrow2)"
                  />
                  <text x={PAD + SW + GAP / 2} y={y + rows[i].spineH / 2 - 8} textAnchor="middle" fontSize="11" fontStyle="italic" fill="#475569">
                    {n.branch.edge}
                  </text>
                  <BranchStack steps={n.branch.steps} x={PAD + SW + GAP} y={y} />
                </g>
              )}
            </g>
          );
          cy += rowH + 34;
          return el;
        })}
      </svg>
    </div>
  );
}
