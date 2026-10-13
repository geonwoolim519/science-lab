import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useProgress } from '../progress'
import { cn } from '../components/ui'

export function Stage({
  height = 236,
  draw,
}: {
  height?: number
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let frame = 0
    let stop = false
    const paint = (now: number) => {
      if (stop) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w < 2 || h < 2) {
        frame = requestAnimationFrame(paint)
        return
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const nextWidth = Math.floor(w * dpr)
      const nextHeight = Math.floor(h * dpr)
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth
        canvas.height = nextHeight
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      drawRef.current(ctx, w, h, now / 1000)
      frame = requestAnimationFrame(paint)
    }
    frame = requestAnimationFrame(paint)
    return () => {
      stop = true
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={ref} style={{ height }} className="block w-full rounded-2xl bg-[#0b1014]" />
}

export function Readouts({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/10">
          <div className="text-[10px] tracking-wide text-[#93aaa3]">{item.label}</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-[#f4f7f5]">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs leading-relaxed text-[#9fb1aa]">{children}</p>
}

type ChartLine = { key: string; color: string; name: string }

export function ScienceChart({
  data,
  xKey,
  lines,
  height = 176,
}: {
  data: object[]
  xKey: string
  lines: ChartLine[]
  height?: number
}) {
  return (
    <div style={{ height }} className="mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: '#b7c7c1', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#b7c7c1', fontSize: 11 }} tickLine={false} axisLine={false} width={46} />
          <Tooltip
            contentStyle={{
              background: '#16201c',
              border: '1px solid #29403a',
              borderRadius: 12,
              color: '#e7f0ec',
              fontSize: 12,
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Predict({
  prompt,
  choices,
}: {
  prompt: string
  choices: { id: string; label: string; ok: boolean; why: string }[]
}) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const picked = choices.find((choice) => choice.id === pickedId)
  return (
    <div className="rounded-2xl bg-[#17211d] p-3 ring-1 ring-white/10">
      <p className="text-sm font-medium text-[#f4f7f5]">예측하기 · {prompt}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => setPickedId(choice.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm',
              pickedId === choice.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10 text-[#e7f0ec]',
            )}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {picked ? (
        <p className="mt-2 text-sm leading-relaxed text-[#d5e4de]">
          {picked.ok ? '맞아요. ' : '이렇게 생각해 보세요. '}
          {picked.why}
        </p>
      ) : null}
    </div>
  )
}

export function Checklist({ id, steps }: { id: string; steps: { key: string; label: string }[] }) {
  const { engaged, completed, complete, resetOne } = useProgress()
  const doneKeys = new Set(engaged[id] ?? [])
  const ready = steps.every((step) => doneKeys.has(step.key))
  const done = completed.includes(id)

  return (
    <div className="rounded-3xl border border-line bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="text-sm font-semibold">실험 진행 {steps.filter((step) => doneKeys.has(step.key)).length}/{steps.length}</div>
      <ul className="mt-2 space-y-1.5 text-sm">
        {steps.map((step) => (
          <li key={step.key} className="flex items-center gap-2">
            <span className={doneKeys.has(step.key) ? 'text-sea' : 'text-ink/30 dark:text-white/30'}>
              {doneKeys.has(step.key) ? '●' : '○'}
            </span>
            {step.label}
          </li>
        ))}
      </ul>
      {done ? (
        <button
          type="button"
          onClick={() => resetOne(id)}
          className="mt-3 rounded-full bg-foam px-4 py-2 text-sm font-semibold text-sea dark:bg-white/10 dark:text-[#9dede2]"
        >
          실험 완료됨 · 해제
        </button>
      ) : (
        <button
          type="button"
          disabled={!ready}
          onClick={() => complete(id)}
          className="mt-3 rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-ink/40 dark:disabled:bg-white/10 dark:disabled:text-white/30"
        >
          이 실험 완료하기
        </button>
      )}
    </div>
  )
}

export function LabShell({
  children,
  controls,
  result,
  id,
  steps,
}: {
  children: ReactNode
  controls?: ReactNode
  result: ReactNode
  id: string
  steps: { key: string; label: string }[]
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-[#1c2a26] bg-[#10161c] text-[#e7f0ec] shadow-[0_18px_50px_rgba(16,22,28,0.18)]">
        <div className="flex items-center justify-between px-4 pt-4 text-[11px] font-semibold tracking-[0.18em] text-[#8aa59d]">
          <span>INTERACTIVE LAB</span>
          <span className="text-[#7ee0d0]">LIVE</span>
        </div>
        <div className="space-y-3 p-4 pt-3">
          {children}
          {controls}
        </div>
      </div>
      <div className="rounded-[28px] border border-line bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-2 text-xs font-semibold tracking-[0.16em] text-sea">04</div>
        <h3 className="text-lg font-semibold">지금 무슨 일이 일어났나요?</h3>
        <div className="mt-2 text-[15px] leading-7 text-ink/85 dark:text-[#dbe7e2]">{result}</div>
      </div>
      <Checklist id={id} steps={steps} />
    </div>
  )
}

export function useChartHistory<T>(read: () => T, active = true) {
  const readRef = useRef(read)
  readRef.current = read
  const [value, setValue] = useState<T>(read)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setValue(readRef.current()), 120)
    return () => window.clearInterval(id)
  }, [active])
  return value
}
