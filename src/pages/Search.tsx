import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryById } from '../data/categories'
import { searchTheories } from '../data/search'

const SUGGESTIONS = ['빛', '분자', '반도체', '라만', '결정', '파동', 'DNA', '중력']

export function SearchPage() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchTheories(query), [query])
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-sea">SEARCH</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">이론 검색</h1>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="라만, 레이저, 분자, 반도체…"
        className="mt-4 w-full rounded-3xl border border-line bg-white px-4 py-3 text-base outline-none dark:border-white/10 dark:bg-white/5"
        aria-label="이론 검색"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => setQuery(word)}
            className="rounded-full bg-black/5 px-3 py-1.5 text-sm dark:bg-white/10"
          >
            {word}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink/55 dark:text-white/45">{results.length}개</p>
      <ul className="mt-2 space-y-2">
        {results.map((theory) => (
          <li key={theory.id}>
            <Link
              to={`/t/${theory.id}`}
              className="block rounded-3xl border border-line bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-[11px] font-semibold tracking-wide text-sea">
                {categoryById(theory.category)?.name}
              </div>
              <div className="mt-1 font-semibold">{theory.title}</div>
              <div className="mt-1 text-sm text-ink/65 dark:text-[#c9d7d1]">{theory.tagline}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
