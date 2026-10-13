import type { ReactNode } from 'react'

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  display?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-0.5 flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-sea">
          {display ?? value}
          {unit ? <span className="ml-1 font-medium text-ink/55 dark:text-[#d5e4de]/70">{unit}</span> : null}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: T
  options: { id: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div>
      {label ? <div className="mb-1.5 text-sm">{label}</div> : null}
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={cn(
                'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-sea text-white' : 'bg-black/5 text-ink dark:bg-white/10 dark:text-[#e7f0ec]',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Block({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="text-xs font-semibold tracking-[0.18em] text-sea">{index}</span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export function Pill({ children, tone = 'sea' }: { children: ReactNode; tone?: 'sea' | 'ink' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        tone === 'sea' ? 'bg-foam text-sea dark:bg-white/10 dark:text-[#9dede2]' : 'bg-black/5 dark:bg-white/10',
      )}
    >
      {children}
    </span>
  )
}
