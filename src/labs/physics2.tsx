import { useMemo, useRef, useState } from 'react'
import { Slider } from '../components/ui'
import { useProgress } from '../progress'
import { arrow } from './draw'
import { fixed } from './format'
import { LabShell, Note, Predict, Readouts, ScienceChart, Stage } from './kit'

export function WaveLab() {
  const { engage } = useProgress()
  const [a1, setA1] = useState(0.6)
  const [a2, setA2] = useState(0.45)
  const [f1, setF1] = useState(1.5)
  const [f2, setF2] = useState(1.8)
  const [speed, setSpeed] = useState(1.2)
  const [phase, setPhase] = useState(0)
  const lambda1 = speed / f1
  const lambda2 = speed / f2

  return (
    <LabShell
      id="wave"
      steps={[
        { key: 'amp', label: '진폭을 바꿔 보기' },
        { key: 'freq', label: '주파수를 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="파동 1 진폭" min={0} max={1} step={0.05} value={a1} display={fixed(a1, 2)} onChange={(value) => { setA1(value); engage('wave', 'amp') }} />
          <Slider label="파동 2 진폭" min={0} max={1} step={0.05} value={a2} display={fixed(a2, 2)} onChange={(value) => { setA2(value); engage('wave', 'amp') }} />
          <Slider label="파동 1 주파수" min={0.4} max={3} step={0.1} unit="Hz" value={f1} display={fixed(f1, 1)} onChange={(value) => { setF1(value); engage('wave', 'freq') }} />
          <Slider label="파동 2 주파수" min={0.4} max={3} step={0.1} unit="Hz" value={f2} display={fixed(f2, 1)} onChange={(value) => { setF2(value); engage('wave', 'freq') }} />
          <Slider label="매질 속력" min={0.6} max={2.4} step={0.1} unit="m/s" value={speed} display={fixed(speed, 1)} onChange={(value) => { setSpeed(value); engage('wave', 'speed') }} />
          <Slider label="위상 차" min={0} max={360} step={5} unit="°" value={phase} onChange={(value) => { setPhase(value); engage('wave', 'phase') }} />
        </>
      }
      result={
        <>
          같은 매질이라 파장 = 속력/주파수입니다. 파동 1의 파장은 {fixed(lambda1, 2)} m, 파동 2는 {fixed(lambda2, 2)} m입니다.
          노란 선은 두 변위를 더한 결과입니다. 마루가 만나면 더 커지고, 마루와 골이 만나면 작아집니다.
          {Math.abs(f1 - f2) < 0.35 && a1 > 0.2 && a2 > 0.2
            ? ` 두 주파수가 가까워 천천히 커졌다 작아지는 맥놀이가 보입니다. 맥놀이 횟수는 대략 ${fixed(Math.abs(f1 - f2), 2)} Hz입니다.`
            : ' 주파수를 비슷하게 맞추면 맥놀이가 나타납니다.'}
        </>
      }
    >
      <Stage
        height={250}
        draw={(ctx, w, h, time) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const mid = h / 2
          ctx.strokeStyle = '#24332e'
          ctx.beginPath()
          ctx.moveTo(12, mid)
          ctx.lineTo(w - 12, mid)
          ctx.stroke()
          const drawWave = (amp: number, freq: number, phi: number, color: string, width: number) => {
            ctx.beginPath()
            ctx.strokeStyle = color
            ctx.lineWidth = width
            for (let i = 0; i <= w; i += 2) {
              const x = (i / w) * 4
              const y = amp * Math.sin(2 * Math.PI * (freq * x / speed - freq * time) + phi)
              const py = mid - y * (h * 0.28)
              if (i === 0) ctx.moveTo(i, py)
              else ctx.lineTo(i, py)
            }
            ctx.stroke()
          }
          drawWave(a1, f1, 0, '#7ee0d0', 1.5)
          drawWave(a2, f2, (phase * Math.PI) / 180, '#f0b42988', 1.5)
          ctx.beginPath()
          ctx.strokeStyle = '#f6f3ea'
          ctx.lineWidth = 2.4
          for (let i = 0; i <= w; i += 2) {
            const x = (i / w) * 4
            const y1 = a1 * Math.sin(2 * Math.PI * (f1 * x / speed - f1 * time))
            const y2 = a2 * Math.sin(2 * Math.PI * (f2 * x / speed - f2 * time) + (phase * Math.PI) / 180)
            const py = mid - (y1 + y2) * (h * 0.28)
            if (i === 0) ctx.moveTo(i, py)
            else ctx.lineTo(i, py)
          }
          ctx.stroke()
        }}
      />
      <Note>청록과 흐린 노랑은 각 파동, 흰 선은 합입니다. 가로 4 m 구간을 그렸습니다. 주파수를 올리면 같은 속력에서 파장이 짧아집니다.</Note>
    </LabShell>
  )
}

export function InterferenceLab() {
  const { engage } = useProgress()
  const [wavelength, setWavelength] = useState(550)
  const [gap, setGap] = useState(0.6)
  const [phase, setPhase] = useState(0)
  const distance = 1
  const spacing = (wavelength * 1e-9 * distance) / (gap * 1e-3)

  const data = useMemo(() => {
    return Array.from({ length: 121 }, (_, index) => {
      const y = -0.004 + (index / 120) * 0.008
      const sinTheta = y / Math.hypot(y, distance)
      const phi = (2 * Math.PI * gap * 1e-3 * sinTheta) / (wavelength * 1e-9) + (phase * Math.PI) / 180
      return { y: Number((y * 1000).toFixed(2)), I: Number((Math.cos(phi / 2) ** 2).toFixed(3)) }
    })
  }, [wavelength, gap, phase])

  return (
    <LabShell
      id="interference"
      steps={[
        { key: 'wave', label: '파장을 바꿔 무늬 간격을 보기' },
        { key: 'gap', label: '파원 간격을 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="파장" min={400} max={700} step={10} unit="nm" value={wavelength} onChange={(value) => { setWavelength(value); engage('interference', 'wave') }} />
          <Slider label="파원 간격" min={0.2} max={2} step={0.05} unit="mm" value={gap} display={fixed(gap, 2)} onChange={(value) => { setGap(value); engage('interference', 'gap') }} />
          <Slider label="위상 차" min={0} max={180} step={5} unit="°" value={phase} onChange={(value) => { setPhase(value); engage('interference', 'phase') }} />
          <Predict
            prompt="파장만 길어지면 밝은 무늬 간격은?"
            choices={[
              { id: 'wide', label: '넓어진다', ok: true, why: '이웃한 밝은 무늬 간격은 대략 λL/d입니다. 파장이 길면 경로 차이가 한 파장에 도달하는 데 더 옆까지 가야 합니다.' },
              { id: 'narrow', label: '좁아진다', ok: false, why: '파장이 짧을 때 무늬가 촘촘합니다. 빨간 빛이 파란 빛보다 간격이 넓습니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          화면까지 거리 L = 1 m로 두면, 이웃한 밝은 무늬 간격은 약 {fixed(spacing * 1000, 2)} mm입니다.
          파장이 길거나 파원 간격이 좁으면 무늬가 성깁니다. 위상 차가 180°면 정면이 오히려 어두워집니다.
          세기는 같은 진폭의 두 파원에 대해 cos²(φ/2)로 계산했습니다. φ는 경로 차이에서 온 위상입니다.
        </>
      }
    >
      <Stage
        height={150}
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const bandTop = h / 2 - 16
          for (let x = 0; x < w; x += 1) {
            const y = -0.004 + (x / w) * 0.008
            const sinTheta = y / Math.hypot(y, distance)
            const phi = (2 * Math.PI * gap * 1e-3 * sinTheta) / (wavelength * 1e-9) + (phase * Math.PI) / 180
            const intensity = Math.cos(phi / 2) ** 2
            ctx.fillStyle = `rgb(${Math.round(255 * intensity)}, ${Math.round(255 * intensity)}, ${Math.round(230 * intensity + 20)})`
            ctx.fillRect(x, bandTop, 1, 32)
          }
        }}
      />
      <ScienceChart data={data} xKey="y" lines={[{ key: 'I', name: '상대 세기', color: '#f6f3ea' }]} />
      <Note>위 띠는 화면의 ±4 mm 구간입니다. 그래프 가로는 그 위치(mm), 세로는 상대 밝기입니다.</Note>
    </LabShell>
  )
}

export function DiffractionLab() {
  const { engage } = useProgress()
  const [widthUm, setWidthUm] = useState(80)
  const [wavelength, setWavelength] = useState(550)
  const slit = widthUm * 1e-6
  const lambda = wavelength * 1e-9
  const screen = 1
  const data = useMemo(() => {
    return Array.from({ length: 121 }, (_, index) => {
      const y = -0.02 + (index / 120) * 0.04
      const sinTheta = y / Math.hypot(y, screen)
      const beta = (Math.PI * slit * sinTheta) / lambda
      const intensity = Math.abs(beta) < 1e-6 ? 1 : (Math.sin(beta) / beta) ** 2
      return { y: Number((y * 1000).toFixed(1)), I: Number(intensity.toFixed(3)) }
    })
  }, [slit, lambda])
  const yMin = (lambda * screen) / slit

  return (
    <LabShell
      id="diffraction"
      steps={[
        { key: 'slit', label: '슬릿 폭을 바꿔 보기' },
        { key: 'wave', label: '파장을 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="슬릿 폭" min={30} max={200} step={5} unit="μm" value={widthUm} onChange={(value) => { setWidthUm(value); engage('diffraction', 'slit') }} />
          <Slider label="파장" min={400} max={700} step={10} unit="nm" value={wavelength} onChange={(value) => { setWavelength(value); engage('diffraction', 'wave') }} />
        </>
      }
      result={
        <>
          첫 어두운 무늬는 작은 각도에서 대략 y = λL/a = {fixed(yMin * 1000, 1)} mm에 있습니다. 슬릿이 좁거나 파장이 길면 중앙 밝은 띠가 넓어집니다.
          정면은 슬릿의 모든 부분이 거의 같은 위상으로 더해져 가장 밝고, 그 세기는 (sinβ/β)²로 줄어듭니다.
        </>
      }
    >
      <Stage
        height={160}
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          ctx.fillStyle = '#1b2a26'
          ctx.fillRect(w * 0.12, h * 0.35, 10, h * 0.3)
          const opening = Math.max(6, 70 * (widthUm / 200))
          ctx.clearRect(w * 0.12, h / 2 - opening / 2, 10, opening)
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(w * 0.12, h / 2 - opening / 2, 10, opening)
          for (let x = Math.floor(w * 0.45); x < w - 16; x += 1) {
            const y = -0.02 + ((x - w * 0.45) / (w * 0.5)) * 0.04
            const sinTheta = y / Math.hypot(y, screen)
            const beta = (Math.PI * slit * sinTheta) / lambda
            const intensity = Math.abs(beta) < 1e-6 ? 1 : (Math.sin(beta) / beta) ** 2
            ctx.fillStyle = `rgba(246,243,234,${intensity})`
            ctx.fillRect(x, 16, 2, h - 32)
          }
        }}
      />
      <ScienceChart data={data} xKey="y" lines={[{ key: 'I', name: '상대 세기', color: '#7ee0d0' }]} />
      <Note>오른쪽 막대는 화면 ±20 mm의 밝기입니다. 슬릿을 좁히면 밝은 영역이 좌우로 퍼집니다.</Note>
    </LabShell>
  )
}

const MEDIA = [
  { id: 'air', name: '공기', n: 1 },
  { id: 'water', name: '물', n: 1.333 },
  { id: 'glass', name: '유리', n: 1.5 },
  { id: 'diamond', name: '다이아몬드', n: 2.417 },
]

export function RefractionLab() {
  const { engage } = useProgress()
  const [from, setFrom] = useState('air')
  const [to, setTo] = useState('water')
  const [angle, setAngle] = useState(40)
  const n1 = MEDIA.find((item) => item.id === from)?.n ?? 1
  const n2 = MEDIA.find((item) => item.id === to)?.n ?? 1
  const rad = (angle * Math.PI) / 180
  const sine2 = (n1 / n2) * Math.sin(rad)
  const tir = sine2 > 1
  const angle2 = tir ? null : (Math.asin(sine2) * 180) / Math.PI
  const critical = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null

  return (
    <LabShell
      id="refraction"
      steps={[
        { key: 'media', label: '매질을 바꿔 보기' },
        { key: 'angle', label: '입사각을 바꿔 보기' },
      ]}
      controls={
        <>
          <div className="text-sm">입사 매질</div>
          <div className="flex flex-wrap gap-2">
            {MEDIA.map((item) => (
              <button key={item.id} type="button" onClick={() => { setFrom(item.id); engage('refraction', 'media') }} className={`rounded-full px-3 py-2 text-sm ${from === item.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item.name}
              </button>
            ))}
          </div>
          <div className="text-sm">굴절 매질</div>
          <div className="flex flex-wrap gap-2">
            {MEDIA.map((item) => (
              <button key={item.id} type="button" onClick={() => { setTo(item.id); engage('refraction', 'media') }} className={`rounded-full px-3 py-2 text-sm ${to === item.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item.name}
              </button>
            ))}
          </div>
          <Slider label="입사각 (법선 기준)" min={0} max={80} step={1} unit="°" value={angle} onChange={(value) => { setAngle(value); engage('refraction', 'angle') }} />
        </>
      }
      result={
        <>
          n₁ sinθ₁ = {fixed(n1 * Math.sin(rad), 3)} 이고 n₂ = {fixed(n2, 3)}입니다.{' '}
          {tir
            ? `sinθ₂가 1을 넘어 투과 광선이 없습니다. 전반사이고, 반사각은 입사각과 같은 ${angle}°입니다.`
            : `굴절각은 ${fixed(angle2 ?? 0, 1)}°입니다. 굴절률이 더 큰 쪽의 각도가 더 작습니다.`}
          {critical ? ` 이 경계의 임계각은 ${fixed(critical, 1)}°입니다.` : ' 더 빠른 매질에서 더 느린 매질로는 전반사가 생기지 않습니다.'}
        </>
      }
    >
      <Stage
        height={240}
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#10211c'
          ctx.fillRect(0, 0, w, h / 2)
          ctx.fillStyle = '#16342d'
          ctx.fillRect(0, h / 2, w, h / 2)
          const cx = w / 2
          const cy = h / 2
          ctx.strokeStyle = '#9fb1aa'
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(cx, 16)
          ctx.lineTo(cx, h - 16)
          ctx.stroke()
          ctx.setLineDash([])
          const ray = (deg: number, length: number, up: boolean, color: string) => {
            const theta = (deg * Math.PI) / 180
            const dir = up ? -1 : 1
            const x2 = cx + Math.sin(theta) * length
            const y2 = cy + dir * Math.cos(theta) * length
            arrow(ctx, up ? x2 : cx, up ? y2 : cy, up ? cx : x2, up ? cy : y2, color)
          }
          ray(angle, h * 0.42, true, '#f0b429')
          if (tir) {
            const theta = (angle * Math.PI) / 180
            const length = h * 0.42
            arrow(ctx, cx, cy, cx - Math.sin(theta) * length, cy - Math.cos(theta) * length, '#e07a5f')
          } else ray(angle2 ?? 0, h * 0.42, false, '#7ee0d0')
          ctx.fillStyle = '#d7f3ef'
          ctx.font = '12px sans-serif'
          ctx.fillText(`n = ${n1}`, 16, 28)
          ctx.fillText(`n = ${n2}`, 16, h - 18)
        }}
      />
      <Note>점선은 법선입니다. 각도는 경계면이 아니라 이 법선에서 잽니다. 노란 선은 입사, 청록은 굴절, 붉은 선은 전반사입니다.</Note>
    </LabShell>
  )
}

export function InductionLab() {
  const { engage } = useProgress()
  const [position, setPosition] = useState(0)
  const [turns, setTurns] = useState(20)
  const [field, setField] = useState(1)
  const [auto, setAuto] = useState(false)
  const hist = useRef<{ t: number; emf: number }[]>([])
  const last = useRef({ x: 0, t: 0 })
  const [chart, setChart] = useState<{ t: number; emf: number }[]>([])
  const clock = useRef(0)

  const fluxAt = (x: number) => turns * field * Math.exp(-(x * x) / (2 * 0.045))

  return (
    <LabShell
      id="induction"
      steps={[
        { key: 'move', label: '자석을 움직여 보기' },
        { key: 'turns', label: '감은 수나 세기를 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider
            label="자석 위치"
            min={-0.4}
            max={0.4}
            step={0.005}
            unit="m"
            value={position}
            display={fixed(position, 2)}
            onChange={(value) => {
              setPosition(value)
              setAuto(false)
              engage('induction', 'move')
            }}
          />
          <Slider label="감은 수" min={1} max={80} step={1} value={turns} onChange={(value) => { setTurns(value); engage('induction', 'turns') }} />
          <Slider label="자기장 세기" min={0.2} max={2} step={0.1} value={field} display={fixed(field, 1)} onChange={(value) => { setField(value); engage('induction', 'turns') }} />
          <button
            type="button"
            onClick={() => {
              setAuto((value) => !value)
              engage('induction', 'move')
            }}
            className="rounded-full bg-white/10 px-3 py-2 text-sm"
          >
            {auto ? '직접 움직이기' : '앞뒤로 통과시키기'}
          </button>
        </>
      }
      result={
        <>
          자석이 멈춰 있으면 코일 안에 자기장이 있어도 유도기전력은 0입니다. 자석이 지나갈 때만 자속이 변하고 전압이 생깁니다.
          감은 수와 자기장 세기는 그 전압의 크기를 키웁니다. 방향은 자석이 다가올 때와 멀어질 때 반대입니다.
          화면의 전압은 종 모양 자속 모형의 상대값이며, 부호가 렌츠의 법칙처럼 변화를 거스르는 쪽입니다.
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          const dt = last.current.t ? Math.min(0.05, time - last.current.t) : 0.016
          const x = auto ? 0.35 * Math.sin(2 * Math.PI * 0.7 * time) : position
          const velocity = auto ? 0.35 * 2 * Math.PI * 0.7 * Math.cos(2 * Math.PI * 0.7 * time) : (x - last.current.x) / Math.max(dt, 0.001)
          last.current = { x, t: time }
          const flux = fluxAt(x)
          const dflux = flux * (-x / 0.045)
          const emf = -dflux * (auto ? velocity : Math.max(-4, Math.min(4, velocity)))
          clock.current += dt
          if (hist.current.length === 0 || clock.current - hist.current[hist.current.length - 1].t > 0.05) {
            hist.current.push({ t: Number(clock.current.toFixed(2)), emf: Number(emf.toFixed(3)) })
            if (hist.current.length > 100) hist.current.shift()
            if (hist.current.length % 4 === 0) setChart(hist.current.slice())
          }
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const cx = w / 2
          const cy = h * 0.55
          ctx.strokeStyle = '#9dede2'
          ctx.lineWidth = 3
          for (let i = 0; i < 5; i += 1) {
            ctx.beginPath()
            ctx.ellipse(cx, cy - 20 + i * 8, 28, 10, 0, 0, Math.PI * 2)
            ctx.stroke()
          }
          const mx = cx + x * w * 0.9
          ctx.fillStyle = '#e07a5f'
          ctx.fillRect(mx - 14, cy - 46, 28, 18)
          ctx.fillStyle = '#d7f3ef'
          ctx.fillRect(mx - 14, cy - 28, 28, 18)
          ctx.fillStyle = '#f6f3ea'
          ctx.font = '12px sans-serif'
          ctx.fillText(`상대 기전력 ${emf.toFixed(2)}`, 16, 24)
        }}
      />
      <ScienceChart data={chart} xKey="t" lines={[{ key: 'emf', name: '상대 기전력', color: '#f0b429' }]} />
      <Readouts items={[{ label: '자속 모형', value: fixed(fluxAt(auto ? 0 : position), 2) }, { label: '감은 수', value: String(turns) }, { label: '자기장', value: fixed(field, 1) }]} />
      <Note>자석을 슬라이더로 천천히 움직이면 기전력이 생기고, 손을 떼 멈추면 0으로 돌아갑니다.</Note>
    </LabShell>
  )
}
