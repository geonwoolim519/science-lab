import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Atom, Cpu, Dna, FlaskConical, Globe, Hexagon, Microscope, Orbit, type LucideIcon } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { theoriesIn } from '../data/theories'
import { useProgress } from '../progress'
import type { CategoryId } from '../types'

const ICONS: Record<CategoryId, LucideIcon> = {
  physics: Orbit,
  chemistry: FlaskConical,
  biology: Dna,
  earth: Globe,
  materials: Hexagon,
  analysis: Microscope,
  semiconductor: Cpu,
}

export function CategoryGlyph({ id, color }: { id: CategoryId; color: string }) {
  const Icon = ICONS[id]
  return (
    <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${color}22`, color }}>
      <Icon size={22} />
    </span>
  )
}

export function CategoryCard({ id }: { id: CategoryId }) {
  const category = CATEGORIES.find((item) => item.id === id)!
  const theories = theoriesIn(id)
  const { completed } = useProgress()
  const done = theories.filter((theory) => completed.includes(theory.id)).length
  const ratio = theories.length ? done / theories.length : 0
  return (
    <Link
      to={`/c/${category.id}`}
      className="block rounded-[28px] border border-line bg-white/80 p-4 shadow-[0_10px_30px_rgba(28,25,21,0.04)] transition active:scale-[0.99] dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex items-start gap-3">
        <CategoryGlyph id={category.id} color={category.color} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-wide text-ink/45 dark:text-white/45">{category.mark}</div>
          <h3 className="text-lg font-semibold tracking-tight">{category.name}</h3>
          <p className="mt-1 text-sm leading-6 text-ink/70 dark:text-[#d5e4de]">{category.blurb}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="tabular-nums text-ink/60 dark:text-white/60">
          이론 {theories.length} · 완료 {done}
        </span>
        <span className="font-semibold tabular-nums text-sea">{Math.round(ratio * 100)}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: category.color }} />
      </div>
    </Link>
  )
}

export function Home() {
  const { completed } = useProgress()
  const ratio = completed.length / 40
  return (
    <div>
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <img src={`${import.meta.env.BASE_URL}icon-512.png`} alt="" className="h-20 w-20 rounded-[22px]" />
        <p className="mt-5 text-xs font-semibold tracking-[0.22em] text-sea">SCIENCE LAB</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">어려운 과학을 직접 실험해보세요.</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-ink/70 dark:text-[#d5e4de]">
          읽어서 외우기 전에, 슬라이더를 움직여 힘·빛·분자·세포가 어떻게 바뀌는지 확인합니다.
        </p>
        <div className="mt-5 rounded-[28px] border border-line bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-ink/60 dark:text-white/55">전체 진행</div>
              <div className="text-2xl font-semibold tabular-nums">
                {completed.length}
                <span className="text-base font-medium text-ink/45 dark:text-white/40"> / 40</span>
              </div>
            </div>
            <Atom className="text-sea" size={22} />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full rounded-full bg-sea" style={{ width: `${ratio * 100}%` }} />
          </div>
        </div>
      </motion.section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight">과학 분야 탐험</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} id={category.id} />
          ))}
        </div>
      </section>
      <p className="mt-6 text-sm leading-6 text-ink/55 dark:text-white/45">
        핸드폰에서는 브라우저 메뉴의 ‘홈 화면에 추가’로 설치하면, 큰 S 로고가 앱 아이콘으로 나타납니다.
      </p>
    </div>
  )
}
