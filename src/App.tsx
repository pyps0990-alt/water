import { useEffect, useState } from 'react'
import { captureSource } from './lib/source'
import { CASE_STATUSES, STATUS_LABELS } from './types/models'

export default function App() {
  const [source, setSource] = useState('direct')
  useEffect(() => setSource(captureSource()), [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">水電工程平台</h1>
      <p className="mt-2 text-ink-muted">Phase 1 基礎建置完成。來源：<strong>{source}</strong></p>
      <ol className="mt-6 flex flex-wrap gap-2" aria-label="案件階段">
        {CASE_STATUSES.map((s, i) => (
          <li key={s} className="rounded-lg bg-surface px-3 py-2 shadow-sm">
            {i + 1}. {STATUS_LABELS[s]}
          </li>
        ))}
      </ol>
    </main>
  )
}
