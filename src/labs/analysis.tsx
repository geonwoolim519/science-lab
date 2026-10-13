import { useMemo, useRef, useState } from 'react'
import { Slider } from '../components/ui'
import { useProgress } from '../progress'
import { fixed, sci } from './format'
import { LabShell, Note, Predict, ScienceChart, Stage } from './kit'

const LINES = [
  { id: 'cu', name: 'Cu Kα', lambda: 0.154 },
  { id: 'mo', name: 'Mo Kα', lambda: 0.071 },
]

export function BraggLab() {
  const { engage } = useProgress()
  const [theta, setTheta] = useState(20)
  const [d, setD] = useState(0.28)
  const [line, setLine] = useState(LINES[0])
  const peaks = [1, 2, 3]
    .map((n) => {
      const s = (n * line.lambda) / (2 * d)
      if (s > 1) return null
      const angle = (Math.asin(s) * 180) / Math.PI
      return { n, angle, twoTheta: angle * 2 }
    })
    .filter((peak): peak is { n: number; angle: number; twoTheta: number } => peak !== null)
  const near = peaks.find((peak) => Math.abs(peak.angle - theta) < 1.5)
  const data = useMemo(() => {
    return Array.from({ length: 90 }, (_, index) => {
      const twoTheta = index
      let intensity = 2
      for (const peak of peaks) {
        const width = 1.4
        intensity += 100 * Math.exp(-((twoTheta - peak.twoTheta) ** 2) / (2 * width * width))
      }
      return { two: twoTheta, I: Number(intensity.toFixed(2)) }
    })
  }, [peaks])

  return (
    <LabShell
      id="bragg"
      steps={[
        { key: 'theta', label: '각도 θ를 돌려 피크를 맞추기' },
        { key: 'd', label: '면 간격 d를 바꿔 보기' },
      ]}
      controls={
        <>
          <div className="flex gap-2">
            {LINES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setLine(item); engage('bragg', 'line') }} className={`rounded-full px-3 py-2 text-sm ${line.id === item.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item.name} {item.lambda} nm
              </button>
            ))}
          </div>
          <Slider label="브래그 각 θ" min={1} max={80} step={0.5} unit="°" value={theta} display={fixed(theta, 1)} onChange={(value) => { setTheta(value); engage('bragg', 'theta') }} />
          <Slider label="면 간격 d" min={0.12} max={0.6} step={0.01} unit="nm" value={d} display={fixed(d, 2)} onChange={(value) => { setD(value); engage('bragg', 'd') }} />
        </>
      }
      result={
        <>
          nλ = 2d sinθ. 지금 2d sinθ / λ = {fixed((2 * d * Math.sin((theta * Math.PI) / 180)) / line.lambda, 2)}입니다.
          {near ? ` n = ${near.n} 조건에 거의 맞습니다. 검출기는 보통 2θ = ${fixed(near.twoTheta, 1)}° 근처에 있습니다.` : ' 정수 차수에 맞지 않으면 산란파가 상쇄되어 피크가 없습니다.'}
          {peaks.length === 0 ? ' λ가 2d보다 커서 일차 회절도 불가능합니다.' : ` 가능한 차수는 ${peaks.map((peak) => `n=${peak.n} (θ ${fixed(peak.angle, 1)}°)`).join(', ')}입니다.`}
          {' '}d가 작아지면 같은 차수의 각도가 커집니다.
        </>
      }
    >
      <Stage
        height={180}
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const rad = (theta * Math.PI) / 180
          ctx.strokeStyle = '#3d5c54'
          for (let i = 0; i < 4; i += 1) {
            ctx.beginPath()
            ctx.moveTo(40, 40 + i * 28)
            ctx.lineTo(w - 40, 40 + i * 28)
            ctx.stroke()
          }
          ctx.strokeStyle = near ? '#f0b429' : '#9dede2'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(70, 20)
          ctx.lineTo(150, 40 + Math.tan(rad) * 40)
          ctx.moveTo(150, 40)
          ctx.lineTo(230, 40 - Math.tan(rad) * 50)
          ctx.stroke()
        }}
      />
      <ScienceChart data={data} xKey="two" lines={[{ key: 'I', name: '세기', color: '#f6f3ea' }]} />
      <Note>그래프 가로는 2θ(도)입니다. 브래그 각 θ는 결정면과 광선이 이루는 각이고, 논문의 XRD 축은 그 두 배인 경우가 많습니다.</Note>
    </LabShell>
  )
}

const SAMPLES = [
  { id: 'si', name: '실리콘', peaks: [{ shift: 520, h: 1, label: 'Si–Si' }] },
  { id: 'diamond', name: '다이아몬드', peaks: [{ shift: 1332, h: 1, label: 'C–C' }] },
  { id: 'calcite', name: '방해석', peaks: [{ shift: 1086, h: 1, label: 'CO₃' }, { shift: 712, h: 0.25 }] },
  { id: 'water', name: '물', peaks: [{ shift: 1640, h: 0.3, wide: 40 }, { shift: 3400, h: 0.7, wide: 180, label: 'O–H' }] },
  { id: 'ethanol', name: '에탄올', peaks: [{ shift: 880, h: 0.55 }, { shift: 1450, h: 0.3 }, { shift: 2930, h: 0.8, label: 'C–H' }] },
]

function ramanValue(shift: number, sample: (typeof SAMPLES)[number], intensity: number) {
  let y = 0.03 + Math.abs(Math.sin(shift * 0.17) * Math.sin(shift * 0.03)) * (0.05 / Math.sqrt(intensity))
  y += Math.min(1.15, 8 * Math.exp(-(shift * shift) / (2 * 12 * 12)))
  for (const peak of sample.peaks) {
    const width = 'wide' in peak ? peak.wide ?? 16 : 16
    const boltz = Math.exp((-1.4388 * peak.shift) / 298)
    y += intensity * peak.h * Math.exp(-((shift - peak.shift) ** 2) / (2 * width * width))
    y += intensity * peak.h * boltz * 0.35 * Math.exp(-((shift + peak.shift) ** 2) / (2 * width * width))
  }
  return y
}

export function RamanLab() {
  const { engage } = useProgress()
  const [laser, setLaser] = useState(532)
  const [power, setPower] = useState(0.8)
  const [sampleId, setSampleId] = useState('si')
  const [minShift, setMinShift] = useState(-200)
  const [maxShift, setMaxShift] = useState(1800)
  const sample = SAMPLES.find((item) => item.id === sampleId) ?? SAMPLES[0]
  const main = sample.peaks[0]
  const scattered = 1 / (1 / laser - main.shift / 1e7)
  const data = useMemo(() => {
    const points = []
    const span = maxShift - minShift
    for (let index = 0; index <= 160; index += 1) {
      const shift = minShift + (span * index) / 160
      points.push({ shift: Math.round(shift), I: Number(Math.min(1.2, ramanValue(shift, sample, power)).toFixed(3)) })
    }
    return points
  }, [sample, power, minShift, maxShift])

  return (
    <LabShell
      id="raman"
      steps={[
        { key: 'sample', label: '시료를 바꿔 피크 위치 보기' },
        { key: 'laser', label: '레이저 파장을 바꿔 보기' },
      ]}
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setSampleId(item.id); engage('raman', 'sample') }} className={`rounded-full px-3 py-2 text-sm ${sampleId === item.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[532, 633, 785].map((nm) => (
              <button key={nm} type="button" onClick={() => { setLaser(nm); engage('raman', 'laser') }} className={`rounded-full px-3 py-2 text-sm ${laser === nm ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {nm} nm
              </button>
            ))}
          </div>
          <Slider label="레이저 세기" min={0.15} max={1} step={0.05} value={power} display={fixed(power, 2)} onChange={(value) => { setPower(value); engage('raman', 'power') }} />
          <Slider label="범위 시작" min={-600} max={1000} step={20} unit="cm⁻¹" value={minShift} onChange={(value) => { setMinShift(Math.min(value, maxShift - 200)); engage('raman', 'range') }} />
          <Slider label="범위 끝" min={400} max={4000} step={20} unit="cm⁻¹" value={maxShift} onChange={(value) => { setMaxShift(Math.max(value, minShift + 200)); engage('raman', 'range') }} />
          <Predict
            prompt="레이저 색을 바꿔도 cm⁻¹ 축의 피크 위치는?"
            choices={[
              { id: 'same', label: '거의 그대로', ok: true, why: '라만 이동은 분자 진동 에너지입니다. 레이저가 바뀌면 흩어진 빛의 절대 파장은 달라지지만, 그 차이를 cm⁻¹로 읽으면 같은 자리에 남습니다.' },
              { id: 'move', label: '크게 이동한다', ok: false, why: '절대 파장으로 그리면 이동해 보입니다. 라만 스펙트럼의 가로축은 그 차이를 이미 뺀 값입니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          {sample.name}의 대표 피크는 {main.shift} cm⁻¹{main.label ? ` (${main.label})` : ''} 근처입니다. {laser} nm 레이저에서 이 스톡스 산란의 파장은 약 {fixed(scattered, 1)} nm로, 레이저보다 깁니다.
          0 cm⁻¹의 매우 큰 봉우리는 에너지를 주고받지 않은 레일리 산란이라 화면에서는 잘랐습니다. 음의 영역에서 약하게 보이는 것이 안티스톡스이고, 298 K에서는 스톡스보다 훨씬 작습니다.
        </>
      }
    >
      <div className="grid grid-cols-5 gap-1 text-center text-[11px] text-[#d5e4de]">
        {['레이저', '시료', '산란', '검출', '스펙트럼'].map((label, index) => (
          <div key={label} className="rounded-xl bg-white/10 py-2" style={{ background: index === 0 ? (laser < 600 ? '#3ddc54' : '#e23b3b') : undefined, color: index === 0 ? '#10211e' : undefined }}>
            {label}
          </div>
        ))}
      </div>
      <ScienceChart data={data} xKey="shift" lines={[{ key: 'I', name: '세기', color: '#7ee0d0' }]} height={200} />
      <Note>피크 위치는 각 물질의 대표적인 라만 이동입니다. 세기는 레이저 세기에 비례하고, 낮은 세기에서는 바닥 잡음에 파묻힙니다. 785 nm는 눈에 거의 어두운 근적외선입니다.</Note>
    </LabShell>
  )
}

function hash(ix: number, iy: number) {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}

function noise(x: number, y: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = x - x0
  const ty = y - y0
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  const a = hash(x0, y0)
  const b = hash(x0 + 1, y0)
  const c = hash(x0, y0 + 1)
  const d = hash(x0 + 1, y0 + 1)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

export function SemLab() {
  const { engage } = useProgress()
  const [kv, setKv] = useState(10)
  const [mag, setMag] = useState(5000)
  const [detector, setDetector] = useState<'se' | 'bse'>('se')
  const [spot, setSpot] = useState(1)
  const cache = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null)
  const voltage = kv * 1000
  const lambdaNm = 1.226 / Math.sqrt(voltage * (1 + 0.9788e-6 * voltage))

  return (
    <LabShell
      id="sem"
      steps={[
        { key: 'mag', label: '배율을 바꿔 보기' },
        { key: 'det', label: '검출기를 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="가속전압" min={1} max={30} step={1} unit="kV" value={kv} onChange={(value) => { setKv(value); engage('sem', 'kv') }} />
          <Slider label="배율" min={100} max={100000} step={100} value={mag} onChange={(value) => { setMag(value); engage('sem', 'mag') }} />
          <Slider label="빔 지름" min={0.4} max={3} step={0.1} value={spot} display={fixed(spot, 1)} onChange={(value) => { setSpot(value); engage('sem', 'spot') }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setDetector('se'); engage('sem', 'det') }} className={`rounded-full px-3 py-2 text-sm ${detector === 'se' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>이차전자 SE</button>
            <button type="button" onClick={() => { setDetector('bse'); engage('sem', 'det') }} className={`rounded-full px-3 py-2 text-sm ${detector === 'bse' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>후방산란 BSE</button>
          </div>
        </>
      }
      result={
        <>
          {kv} kV에서 전자 파장은 약 {fixed(lambdaNm * 1000, 1)} pm입니다. 가시광선 400–700 nm보다 훨씬 짧아, 원리적으로는 더 작은 간격을 구분할 수 있습니다.
          실제 분해능은 렌즈 수차와 빔 지름에도 좌우됩니다. {detector === 'se' ? '이차전자는 표면 경사에 민감해 입체감이 큽니다.' : '후방산란전자는 원자번호가 큰 곳이 밝아 조성 차이가 드러납니다.'}
          {' '}배율 {mag.toLocaleString('ko-KR')}배는 주사 폭을 줄여 같은 화면을 채운 것입니다. 광학현미경은 색과 대기 중 관찰이 가능하지만 회절 한계 때문에 이 배율까지 가지 못합니다.
        </>
      }
    >
      <Stage
        height={240}
        draw={(ctx, w, h) => {
          const key = `${kv}-${mag}-${detector}-${spot}-${Math.round(w)}-${Math.round(h)}`
          if (!cache.current || cache.current.key !== key) {
            const off = document.createElement('canvas')
            off.width = Math.max(1, Math.floor(w))
            off.height = Math.max(1, Math.floor(h))
            const offCtx = off.getContext('2d')
            if (!offCtx) return
            const zoom = Math.pow(mag / 1000, 0.55)
            const blur = spot * (kv < 5 ? 1.4 : 0.7)
            for (let y = 0; y < h; y += 2) {
              for (let x = 0; x < w; x += 2) {
                const nx = (x / w - 0.5) / zoom
                const ny = (y / h - 0.5) / zoom
                const heightValue = noise(nx * 3, ny * 3) * 0.65 + noise(nx * 7, ny * 7) * 0.35
                const hx = noise(nx * 3 + 0.08 * blur, ny * 3) - heightValue
                const material = noise(nx * 1.4 + 4, ny * 1.4)
                let shade = detector === 'se' ? 0.35 + hx * 8 + heightValue * 0.25 : 0.25 + material * 0.85
                shade += (kv / 30) * 0.05
                shade = Math.max(0, Math.min(1, shade))
                const value = Math.round(shade * 255)
                offCtx.fillStyle = `rgb(${value},${value},${value})`
                offCtx.fillRect(x, y, 2, 2)
              }
            }
            cache.current = { key, canvas: off }
          }
          ctx.drawImage(cache.current.canvas, 0, 0, w, h)
        }}
      />
      <Note>이 이미지는 실제 촬영이 아니라, 배율·전압·검출기·빔 지름의 경향을 따른 합성 표면입니다. 시료는 보통 진공에서 보고, 부도체는 전하가 쌓이지 않게 코팅합니다.</Note>
    </LabShell>
  )
}

export function PnLab() {
  const { engage } = useProgress()
  const [voltage, setVoltage] = useState(0)
  const [doping, setDoping] = useState<'light' | 'heavy'>('light')
  const vt = 0.026
  const is = 1e-12
  const arg = Math.max(-40, Math.min(40, voltage / vt))
  const current = is * (Math.exp(arg) - 1)
  const vbi = 0.7
  const width = doping === 'heavy' ? 0.55 : 1
  const depletion = voltage >= vbi ? 0.25 : width * Math.sqrt(Math.max(0.05, (vbi - voltage) / vbi))
  const data = useMemo(() => {
    return Array.from({ length: 57 }, (_, index) => {
      const v = -2 + index * 0.05
      const a = Math.max(-40, Math.min(40, v / vt))
      return { V: Number(v.toFixed(2)), I: Number((is * (Math.exp(a) - 1) * 1000).toFixed(3)) }
    })
  }, [])

  return (
    <LabShell
      id="pn"
      steps={[
        { key: 'forward', label: '순방향 전압을 올려 보기' },
        { key: 'reverse', label: '역방향도 걸어 보기' },
      ]}
      controls={
        <>
          <Slider
            label="전압"
            min={-2}
            max={0.75}
            step={0.01}
            unit="V"
            value={voltage}
            display={fixed(voltage, 2)}
            onChange={(value) => {
              setVoltage(value)
              if (value > 0.2) engage('pn', 'forward')
              if (value < -0.2) engage('pn', 'reverse')
            }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setDoping('light')} className={`rounded-full px-3 py-2 text-sm ${doping === 'light' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>옅은 도핑</button>
            <button type="button" onClick={() => setDoping('heavy')} className={`rounded-full px-3 py-2 text-sm ${doping === 'heavy' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>진한 도핑</button>
          </div>
        </>
      }
      result={
        <>
          {voltage >= 0 ? '순방향' : '역방향'} {fixed(voltage, 2)} V에서 쇼클리 식의 전류는 {current >= 0 ? fixed(current * 1000, 3) : sci(current * 1000, 2)} mA입니다.
          상온의 열전압은 약 26 mV라 순방향에서는 조금의 전압에도 전류가 급히 늘어납니다. 역방향 전류는 −Is 근처라 이 축에서는 거의 0으로 보입니다. 완전히 0은 아닙니다.
          공핍층은 {voltage < 0 ? '역방향에서 더 넓어지고' : '순방향에서 좁아집니다'}. 도핑이 진하면 같은 전압에서도 더 얇습니다. 이 곡선은 항복 전압 이전입니다.
        </>
      }
    >
      <Stage
        height={170}
        draw={(ctx, w, h, time) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          ctx.fillStyle = '#7a3e46'
          ctx.fillRect(0, 20, w / 2, h - 40)
          ctx.fillStyle = '#1f4d6e'
          ctx.fillRect(w / 2, 20, w / 2, h - 40)
          const half = depletion * 36
          ctx.fillStyle = 'rgba(16,22,28,0.72)'
          ctx.fillRect(w / 2 - half, 20, half * 2, h - 40)
          const flow = Math.max(0, current)
          const count = 10
          for (let i = 0; i < count; i += 1) {
            const shift = voltage > 0.3 ? ((time * (40 + flow * 30) + i * 20) % (w * 0.7)) : (i * w) / count
            ctx.fillStyle = '#f6f3ea'
            ctx.beginPath()
            ctx.arc(20 + shift, 40 + (i % 4) * 22, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#f0b429'
            ctx.beginPath()
            ctx.arc(w - 20 - (voltage > 0.3 ? shift : i * 12), 48 + (i % 3) * 24, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }}
      />
      <ScienceChart data={data} xKey="V" lines={[{ key: 'I', name: '전류 mA', color: '#7ee0d0' }]} />
      <Note>왼쪽이 P형, 오른쪽이 N형입니다. 가운데 어두운 띠가 공핍층입니다. 흰 점은 전자, 노란 점은 정공의 그림이고, 순방향에서만 접합을 지나 흐릅니다. Is = 10⁻¹² A, T = 300 K로 계산했습니다.</Note>
    </LabShell>
  )
}
