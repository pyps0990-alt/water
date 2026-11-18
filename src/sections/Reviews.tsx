import { ExternalLink, Star } from 'lucide-react'
import type { ReviewsCache } from '../types/models'
import { Section } from '../components/ui'

export function Reviews({ reviews, fallbackUrl }: { reviews: ReviewsCache | null; fallbackUrl?: string }) {
  const url = reviews?.url ?? fallbackUrl
  const items = reviews?.items.filter((r) => r.rating >= 5).slice(0, 5) ?? []
  return (
    <Section id="reviews" no={1} code="RV" title="客戶怎麼說" lead="以下評論每週自 Google 商家檔案同步，未經修改。">
      {items.length === 0 ? (
        <p className="sheet p-6 text-ink-muted">
          Google 評論同步設定完成後，會顯示在這裡。
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((r, i) => (
            <li key={i} className="sheet p-5">
              <p className="flex items-center gap-1" aria-label={`${r.rating} 顆星`}>
                {Array.from({ length: 5 }, (_, k) => (
                  <Star key={k} aria-hidden className="h-4 w-4 fill-amber-accent text-amber-accent" />
                ))}
              </p>
              <blockquote className="mt-2">{r.text}</blockquote>
              <p className="mt-2 text-sm text-ink-muted">— {r.author}{r.relativeTime ? `・${r.relativeTime}` : ''}</p>
            </li>
          ))}
        </ul>
      )}
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-eng-blue underline">
          在 Google 上看所有評論 <ExternalLink aria-hidden className="h-4 w-4" />
          <span className="sr-only">（另開新視窗）</span>
        </a>
      )}
    </Section>
  )
}
