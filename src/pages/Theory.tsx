import { Component, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Formula, Symbols } from '../components/Formula'
import { Block, cn } from '../components/ui'
import { categoryById } from '../data/categories'
import { THEORIES, theoriesIn, theoryById } from '../data/theories'
import { LABS } from '../labs/register'
import type { LevelId } from '../types'

const LEVELS: { id: LevelId; name: string; hint: string }[] = [
  { id: 'basic', name: 'BASIC', hint: '처음' },
  { id: 'university', name: 'UNIVERSITY', hint: '학부' },
  { id: 'deep', name: 'DEEP DIVE', hint: '심화' },
]

class LabBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null }
  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }
  render() {
    if (this.state.message) return <p className="text-sm">실험을 표시하지 못했습니다. {this.state.message}</p>
    return this.props.children
  }
}

export function TheoryPage() {
  const { theoryId = '' } = useParams()
  const theory = theoryById(theoryId)
  const [level, setLevel] = useState<LevelId>(theory?.level ?? 'basic')

  useEffect(() => {
    setLevel(theory?.level ?? 'basic')
    window.scrollTo(0, 0)
  }, [theoryId, theory?.level])

  if (!theory) return <p>없는 이론입니다.</p>
  const category = categoryById(theory.category)
  const Lab = LABS[theory.id]
  const siblings = theoriesIn(theory.category)
  const index = siblings.findIndex((item) => item.id === theory.id)
  const prev = siblings[index - 1]
  const next = siblings[index + 1]

  return (
    <article>
      <Link to={`/c/${theory.category}`} className="inline-flex items-center gap-1 text-sm font-medium text-sea">
        <ArrowLeft size={16} />
        {category?.name}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{theory.title}</h1>
      <p className="mt-2 text-base leading-7 text-ink/75 dark:text-[#d5e4de]">{theory.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="난이도">
        {LEVELS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={level === item.id}
            onClick={() => setLevel(item.id)}
            className={cn(
              'rounded-full px-3 py-2 text-left text-xs font-semibold tracking-wide',
              level === item.id ? 'bg-ink text-paper dark:bg-[#f3f0e8] dark:text-[#1c1915]' : 'bg-black/5 dark:bg-white/10',
            )}
          >
            {item.name}
            <span className="mt-0.5 block font-medium tracking-normal opacity-70">{item.hint}</span>
          </button>
        ))}
      </div>

      <Block index="01" title="이것부터 이해하기">
        <p className="text-[15px] leading-7">{level === 'basic' ? theory.basic : theory.university}</p>
        {level === 'deep' ? <p className="mt-3 text-[15px] leading-7">{theory.deep}</p> : null}
        {theory.analogy ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-3xl bg-foam p-4 text-sm leading-6 dark:bg-white/10">
              <div className="text-xs font-semibold tracking-wide text-sea">비유</div>
              <p className="mt-1">{theory.analogy.story}</p>
            </div>
            <div className="rounded-3xl border border-line p-4 text-sm leading-6 dark:border-white/10">
              <div className="text-xs font-semibold tracking-wide">비유가 멈추는 곳</div>
              <p className="mt-1 text-ink/75 dark:text-[#d5e4de]">{theory.analogy.limit}</p>
            </div>
          </div>
        ) : null}
        <p className="mt-3 text-sm font-medium text-sea">{theory.glance}</p>
      </Block>

      <Block index="02" title="핵심 개념">
        <div className="grid gap-2 sm:grid-cols-2">
          {theory.concepts.map((concept) => (
            <article key={concept.title} className="rounded-3xl border border-line bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-semibold">{concept.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/75 dark:text-[#d5e4de]">{concept.body}</p>
            </article>
          ))}
        </div>
      </Block>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline gap-3">
          <span className="text-xs font-semibold tracking-[0.18em] text-sea">03</span>
          <h2 className="text-xl font-semibold tracking-tight">직접 실험하기</h2>
        </div>
        <LabBoundary key={theory.id}>{Lab ? <Lab /> : <p>실험이 아직 연결되지 않았습니다.</p>}</LabBoundary>
      </section>

      <Block index="05" title="실제 활용">
        <div className="grid gap-2">
          {theory.applications.map((item) => (
            <article key={item.title} className="rounded-3xl border border-line p-4 dark:border-white/10">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/75 dark:text-[#d5e4de]">{item.body}</p>
            </article>
          ))}
        </div>
      </Block>

      <Block index="06" title="한 단계 더">
        {theory.formula ? (
          <div className="rounded-[28px] bg-white/80 p-4 dark:bg-white/5">
            <Formula tex={theory.formula.tex} />
            <Symbols items={theory.formula.symbols} />
            <p className="mt-3 text-sm leading-6">{theory.formula.plain}</p>
          </div>
        ) : null}
        <p className="mt-3 text-sm leading-7 text-ink/80 dark:text-[#d5e4de]">{theory.deep}</p>
      </Block>

      <Block index="07" title="이 개념과 연결된 과학">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {theory.related.map((id) => {
            const related = THEORIES.find((item) => item.id === id)
            if (!related) return null
            return (
              <Link
                key={id}
                to={`/t/${id}`}
                className="min-w-[11rem] rounded-3xl border border-line bg-white/80 p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="text-[11px] font-semibold tracking-wide text-sea">
                  {categoryById(related.category)?.name}
                </div>
                <div className="mt-1 font-semibold">{related.title}</div>
              </Link>
            )
          })}
        </div>
      </Block>

      <div className="mt-8 grid grid-cols-2 gap-2">
        {prev ? (
          <Link to={`/t/${prev.id}`} className="rounded-3xl border border-line p-3 text-sm dark:border-white/10">
            <div className="text-xs text-ink/45 dark:text-white/40">이전</div>
            <div className="font-semibold">{prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/t/${next.id}`} className="rounded-3xl border border-line p-3 text-right text-sm dark:border-white/10">
            <div className="text-xs text-ink/45 dark:text-white/40">다음</div>
            <div className="font-semibold">{next.title}</div>
          </Link>
        ) : null}
      </div>
    </article>
  )
}
