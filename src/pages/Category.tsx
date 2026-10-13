import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { categoryById } from '../data/categories'
import { theoriesIn } from '../data/theories'
import { useProgress } from '../progress'
import { CategoryGlyph } from './Home'

const LEVEL = {
  basic: 'BASIC',
  university: 'UNIVERSITY',
}

export function CategoryPage() {
  const { categoryId = '' } = useParams()
  const category = categoryById(categoryId)
  const { completed } = useProgress()
  if (!category) {
    return <p>없는 분야입니다.</p>
  }
  const theories = theoriesIn(category.id)
  const done = theories.filter((theory) => completed.includes(theory.id)).length
  return (
    <div>
      <CategoryGlyph id={category.id} color={category.color} />
      <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-sea">{category.mark} 분야</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{category.name}</h1>
      <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-[#d5e4de]">{category.blurb}</p>
      <p className="mt-3 text-sm font-medium tabular-nums">
        {done} / {theories.length} 완료
      </p>
      <ul className="mt-4 space-y-2">
        {theories.map((theory, index) => {
          const isDone = completed.includes(theory.id)
          return (
            <li key={theory.id}>
              <Link
                to={`/t/${theory.id}`}
                className="flex items-center gap-3 rounded-3xl border border-line bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
              >
                <span className="w-6 text-sm tabular-nums text-ink/40 dark:text-white/35">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{theory.title}</span>
                    {isDone ? <span className="text-xs font-semibold text-sea">완료</span> : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink/60 dark:text-[#c9d7d1]">{theory.tagline}</span>
                  <span className="mt-1 block text-[11px] font-semibold tracking-wide text-ink/40 dark:text-white/35">
                    {LEVEL[theory.level]}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-ink/30" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
