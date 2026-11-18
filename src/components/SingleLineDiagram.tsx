import type { CSSProperties } from 'react'

/** Decorative single-line diagram: Taipower meter → NFB → house, with the water main alongside. */
export function SingleLineDiagram() {
  const copper = '#F59E0B'
  const water = '#60A5FA'
  const label = { fill: '#CBD5E1', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }
  return (
    <svg viewBox="0 0 420 300" role="img" aria-labelledby="sld-title" className="h-auto w-full max-w-md">
      <title id="sld-title">示意圖：台電電表經無熔絲開關接入住家，給水管經閥門接入住家</title>
      {/* power: meter → breaker → house */}
      <g fill="none" stroke={copper} strokeWidth="2.5" strokeLinecap="round">
        <circle cx="50" cy="70" r="22" className="sld-draw" style={{ '--len': 140 } as CSSProperties} />
        <path d="M72 70 H150" className="sld-draw" style={{ '--len': 80, '--delay': '.4s' } as CSSProperties} />
        <path d="M150 70 L172 54" className="sld-draw" style={{ '--len': 30, '--delay': '.7s' } as CSSProperties} />
        <path d="M176 70 H300 V120" className="sld-draw" style={{ '--len': 180, '--delay': '.9s' } as CSSProperties} />
        <path d="M176 70 H300 V120" stroke="#FDE68A" strokeWidth="1.5" className="sld-flow" opacity=".7" />
      </g>
      <text x="50" y="75" textAnchor="middle" fill={copper} fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700">kWh</text>
      <text x="22" y="112" {...label}>TPC 1φ3W</text>
      <text x="22" y="126" {...label}>110/220V</text>
      <text x="140" y="46" {...label}>NFB 2P 50A</text>

      {/* water: tank → valve → house */}
      <g fill="none" stroke={water} strokeWidth="2.5" strokeLinecap="round">
        <rect x="30" y="180" width="40" height="34" rx="3" className="sld-draw" style={{ '--len': 150, '--delay': '.3s' } as CSSProperties} />
        <path d="M70 200 H150" className="sld-draw" style={{ '--len': 80, '--delay': '.8s' } as CSSProperties} />
        <path d="M150 190 L170 210 M150 210 L170 190 M150 190 V210 M170 190 V210" className="sld-draw" style={{ '--len': 90, '--delay': '1s' } as CSSProperties} />
        <path d="M170 200 H300 V180" className="sld-draw" style={{ '--len': 150, '--delay': '1.2s' } as CSSProperties} />
        <path d="M170 200 H300 V180" stroke="#BFDBFE" strokeWidth="1.5" className="sld-flow" opacity=".7" />
      </g>
      <text x="22" y="236" {...label}>水塔 1000L</text>
      <text x="140" y="232" {...label}>Ø20 SUS304</text>

      {/* house */}
      <g fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M262 150 L310 112 L358 150 V230 H262 Z" className="sld-draw" style={{ '--len': 360, '--delay': '1.4s' } as CSSProperties} />
        <rect x="296" y="190" width="28" height="40" className="sld-draw" style={{ '--len': 140, '--delay': '1.8s' } as CSSProperties} />
      </g>
      <circle cx="300" cy="120" r="4" fill={copper} />
      <circle cx="300" cy="180" r="4" fill={water} />
      <text x="372" y="150" {...label}>D-01</text>
      <text x="262" y="252" {...label}>住宅 / 店面</text>
    </svg>
  )
}
