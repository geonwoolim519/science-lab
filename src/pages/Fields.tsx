import { CATEGORIES } from '../data/categories'
import { CategoryCard } from './Home'

export function Fields() {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-sea">FIELDS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">과학 분야</h1>
      <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-[#d5e4de]">
        일곱 분야, 마흔 개의 이론. 각 카드의 완료 수는 이 기기에 저장됩니다.
      </p>
      <div className="mt-5 grid gap-3">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} id={category.id} />
        ))}
      </div>
    </div>
  )
}
