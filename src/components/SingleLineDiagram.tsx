import { useRef, useState, type CSSProperties } from 'react'
import { Pause, Play } from 'lucide-react'
import { prefersMotion } from '../lib/motion'

const v = (vars: Record<string, string | number>) => vars as CSSProperties

const COPPER_PATH = 'M72 70 H150 M176 70 H300 V120'
const POWER_RUN = 'M176 70 H300 V122'
const WATER_RUN = 'M170 200 H300 V178'

/**
 * Hero single-line diagram, told as a story:
 * strokes draw → breaker closes (spark) → copper energises → windows light;
 * valve opens → water flows. Final state is static when reduced motion is preferred.
 */
export function SingleLineDiagram() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [motion] = useState(prefersMotion)
  const [paused, setPaused] = useState(false)
  const label = { fill: '#94A3B8', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.04em' }

  const toggle = () => {
    const svg = svgRef.current
    if (!svg) return
    if (paused) svg.unpauseAnimations(); else svg.pauseAnimations()
    setPaused(!paused)
  }

  return (
    <figure className={`relative ${paused ? 'motion-paused' : ''}`}>
      <svg ref={svgRef} viewBox="0 0 420 290" role="img" aria-labelledby="sld-title" className="h-auto w-full">
        <title id="sld-title">示意圖：台電電表經無熔絲開關供電給住家，水塔經閥門供水給住家</title>
        <defs>
          <filter id="glow-copper" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
          <linearGradient id="g-copper" x1="0" x2="1"><stop offset="0" stopColor="#FDE68A" /><stop offset=".5" stopColor="#F59E0B" /><stop offset="1" stopColor="#D97706" /></linearGradient>
          <linearGradient id="g-water" x1="0" x2="1"><stop offset="0" stopColor="#BAE6FD" /><stop offset="1" stopColor="#38BDF8" /></linearGradient>
          <radialGradient id="g-window"><stop offset="0" stopColor="#FEF3C7" /><stop offset="1" stopColor="#F59E0B" /></radialGradient>
        </defs>

        {/* ── power ── */}
        <g fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
          <circle cx="50" cy="70" r="22" className="sld-draw" style={v({ '--len': 140, '--d': '.35s' })} />
          <path d={COPPER_PATH} className="sld-draw" style={v({ '--len': 330, '--d': '.6s' })} />
        </g>
        {/* energised copper (appears when the breaker closes) */}
        <g className="sld-energy" style={v({ '--d': '1.95s' })} fill="none" strokeLinecap="round">
          <path d={COPPER_PATH} stroke="url(#g-copper)" strokeWidth="2.6" filter="url(#glow-copper)" />
          <circle cx="50" cy="70" r="22" stroke="#F59E0B" strokeWidth="2.4" filter="url(#glow-copper)" />
        </g>
        <path d={POWER_RUN} fill="none" stroke="#FEF3C7" strokeWidth="1.6" strokeLinecap="round" className="sld-flow" style={v({ '--d': '2.1s' })} />
        <text x="50" y="74.5" textAnchor="middle" fill="#FBBF24" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="700">kWh</text>
        {/* breaker: fixed contacts + moving arm */}
        <circle cx="150" cy="70" r="3" fill="#F59E0B" />
        <circle cx="176" cy="70" r="3" fill="#F59E0B" />
        <line x1="150" y1="70" x2="176" y2="70" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" className="sld-arm" style={v({ '--d': '1.5s' })} />
        <circle cx="176" cy="70" r="9" fill="#FDE68A" className="sld-spark" style={v({ '--d': '1.9s' })} />
        <text x="18" y="112" {...label}>TPC 1φ3W</text>
        <text x="18" y="125" {...label}>110 / 220V</text>
        <text x="134" y="50" {...label}>NFB 2P 50A</text>

        {/* ── water ── */}
        <g fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="28" y="180" width="44" height="36" rx="4" className="sld-draw" style={v({ '--len': 160, '--d': '.45s' })} />
          <path d="M72 200 H150" className="sld-draw" style={v({ '--len': 80, '--d': '.75s' })} />
          <path d={WATER_RUN} className="sld-draw" style={v({ '--len': 160, '--d': '.95s' })} />
        </g>
        <g className="sld-energy" style={v({ '--d': '2.05s' })} fill="none" strokeLinecap="round">
          <path d="M72 200 H150" stroke="url(#g-water)" strokeWidth="2.6" />
          <path d={WATER_RUN} stroke="url(#g-water)" strokeWidth="2.6" />
          <rect x="30" y="198" width="40" height="16" rx="2" fill="#38BDF8" fillOpacity=".35" stroke="none" />
        </g>
        <path d={WATER_RUN} fill="none" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" className="sld-flow" style={v({ '--d': '2.2s' })} />
        {/* valve body + lever */}
        <path d="M150 190 L170 210 V190 L150 210 Z" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" strokeLinejoin="round" />
        <g className="sld-valve" style={v({ '--d': '1.6s' })}>
          <line x1="160" y1="200" x2="160" y2="184" stroke="#BAE6FD" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="154" y1="184" x2="166" y2="184" stroke="#BAE6FD" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        <text x="18" y="236" {...label}>水塔 1000L</text>
        <text x="132" y="230" {...label}>Ø20 SUS304</text>

        {/* ── house ── */}
        <rect x="270" y="150" width="80" height="80" fill="#F59E0B" opacity=".18" filter="url(#glow-soft)" className="sld-window" style={v({ '--d': '2.5s' })} />
        <g fill="none" stroke="#E2E8F0" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M262 150 L310 112 L358 150 V230 H262 Z" className="sld-draw" style={v({ '--len': 360, '--d': '1.05s' })} />
          <rect x="296" y="192" width="26" height="38" className="sld-draw" style={v({ '--len': 130, '--d': '1.35s' })} />
        </g>
        <rect x="272" y="160" width="18" height="16" fill="url(#g-window)" className="sld-window" style={v({ '--d': '2.45s' })} />
        <rect x="330" y="160" width="18" height="16" fill="url(#g-window)" className="sld-window" style={v({ '--d': '2.6s' })} />
        <circle cx="300" cy="122" r="4" fill="#F59E0B" />
        <circle cx="300" cy="178" r="4" fill="#38BDF8" />
        <text x="368" y="152" {...label}>D-01</text>
        <text x="270" y="250" {...label}>住宅 / 店面</text>

        {/* travelling charge + droplets (motion users only) */}
        {motion && (
          <g aria-hidden>
            {[0, 0.8, 1.6].map((o) => (
              <circle key={`e${o}`} r="2.6" fill="#FEF3C7" filter="url(#glow-copper)" opacity="0">
                <animateMotion dur="2.4s" begin={`${2.2 + o}s`} repeatCount="indefinite" path={POWER_RUN} />
                <set attributeName="opacity" to="1" begin={`${2.2 + o}s`} />
              </circle>
            ))}
            {[0, 1, 2].map((o) => (
              <circle key={`w${o}`} r="2.4" fill="#E0F2FE" opacity="0">
                <animateMotion dur="3s" begin={`${2.3 + o}s`} repeatCount="indefinite" path={WATER_RUN} />
                <set attributeName="opacity" to="1" begin={`${2.3 + o}s`} />
              </circle>
            ))}
          </g>
        )}
      </svg>
      <figcaption className="mt-2 flex items-center justify-between gap-2 border-t border-white/15 pt-2 font-mono text-[0.7rem] tracking-wider text-slate-400">
        <span>SINGLE-LINE DIAGRAM · D-01</span>
        {motion && (
          <button type="button" onClick={toggle} className="inline-flex min-h-11 items-center gap-1.5 px-2 text-slate-300 hover:text-busy-dk">
            {paused ? <Play aria-hidden className="h-3.5 w-3.5" /> : <Pause aria-hidden className="h-3.5 w-3.5" />}
            {paused ? '播放動畫' : '暫停動畫'}
          </button>
        )}
      </figcaption>
    </figure>
  )
}
