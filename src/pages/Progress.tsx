import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { theoriesIn } from '../data/theories'
import { useProgress } from '../progress'

export function ProgressPage() {
  const { completed, resetAll } = useProgress()
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-sea">PROGRESS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">학습 진행률</h1>
      <p className="mt-3 text-4xl font-semibold tabular-nums">
        {completed.length}
        <span className="text-xl font-medium text-ink/40 dark:text-white/40"> / 40 완료</span>
      </p>
      <div className="mt-6 space-y-4">
        {CATEGORIES.map((category) => {
          const theories = theoriesIn(category.id)
          const done = theories.filter((theory) => completed.includes(theory.id)).length
          const ratio = theories.length ? done / theories.length : 0
          return (
            <section key={category.id}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <Link to={`/c/${category.id}`} className="font-semibold">
                  {category.name}
                </Link>
                <span className="tabular-nums text-ink/55 dark:text-white/50">
                  {done}/{theories.length} · {Math.round(ratio * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: category.color }} />
              </div>
            </section>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          if (window.confirm('이 기기에 저장된 완료 기록을 지울까요?')) resetAll()
        }}
        className="mt-8 text-sm font-medium text-ink/50 underline dark:text-white/45"
      >
        진행 기록 지우기
      </button>
    </div>
  )
}
