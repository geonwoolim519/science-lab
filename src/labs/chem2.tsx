import { useMemo, useRef, useState } from 'react'
import { Slider } from '../components/ui'
import { useProgress } from '../progress'
import { clamp, fixed, sci } from './format'
import { LabShell, Note, Predict, Readouts, ScienceChart, Stage } from './kit'

type ShapeId = 'linear' | 'trigonal' | 'bent3' | 'tetra' | 'pyramid' | 'bent4'

function shapeOf(bonds: number, lone: number): ShapeId | null {
  const domains = bonds + lone
  if (bonds < 2 || domains > 4 || domains < 2) return null
  if (bonds === 2 && lone === 0) return 'linear'
  if (bonds === 3 && lone === 0) return 'trigonal'
  if (bonds === 2 && lone === 1) return 'bent3'
  if (bonds === 4 && lone === 0) return 'tetra'
  if (bonds === 3 && lone === 1) return 'pyramid'
  if (bonds === 2 && lone === 2) return 'bent4'
  return null
}

const SHAPE_META: Record<ShapeId, { name: string; angle: string; points: [number, number, number][]; lone: [number, number, number][] }> = {
  linear: { name: '선형', angle: '180°', points: [[0, 0, 1], [0, 0, -1]], lone: [] },
  trigonal: { name: '삼각 평면', angle: '120°', points: [[1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]], lone: [] },
  bent3: { name: '굽은형', angle: '약 117°', points: [[1, 0, 0], [-0.5, 0, 0.866]], lone: [[-0.5, 0, -0.866]] },
  tetra: {
    name: '정사면체',
    angle: '109.5°',
    points: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((p) => p.map((n) => n / Math.sqrt(3)) as [number, number, number]),
    lone: [],
  },
  pyramid: {
    name: '삼각뿔',
    angle: '약 107°',
    points: [[1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((p) => p.map((n) => n / Math.sqrt(3)) as [number, number, number]),
    lone: [[1, 1, 1].map((n) => n / Math.sqrt(3)) as [number, number, number]],
  },
  bent4: {
    name: '굽은형 (물)',
    angle: '약 104.5°',
    points: [[1, -1, -1], [-1, 1, -1]].map((p) => p.map((n) => n / Math.sqrt(3)) as [number, number, number]),
    lone: [[1, 1, 1], [-1, -1, 1]].map((p) => p.map((n) => n / Math.sqrt(3)) as [number, number, number]),
  },
}

function project(p: [number, number, number], rotY: number) {
  const [x, y, z] = p
  const xr = x * Math.cos(rotY) + z * Math.sin(rotY)
  const zr = -x * Math.sin(rotY) + z * Math.cos(rotY)
  return { x: xr, y, z: zr }
}

export function VseprLab() {
  const { engage } = useProgress()
  const [bonds, setBonds] = useState(2)
  const [lone, setLone] = useState(2)
  const [rot, setRot] = useState(0.6)
  const shape = shapeOf(bonds, lone)
  const meta = shape ? SHAPE_META[shape] : null

  return (
    <LabShell
      id="vsepr"
      steps={[
        { key: 'bonds', label: '결합 수를 바꿔 보기' },
        { key: 'lone', label: '비공유 전자쌍을 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="결합한 원자 수" min={2} max={4} step={1} value={bonds} onChange={(value) => { setBonds(value); engage('vsepr', 'bonds') }} />
          <Slider label="비공유 전자쌍" min={0} max={2} step={1} value={lone} onChange={(value) => { setLone(value); engage('vsepr', 'lone') }} />
          <Slider label="회전" min={0} max={6.28} step={0.05} value={rot} display={`${Math.round((rot * 180) / Math.PI)}°`} onChange={setRot} />
        </>
      }
      result={
        meta ? (
          <>
            전자 영역은 {bonds + lone}개입니다. 보이는 모양은 {meta.name}이고 대표 결합각은 {meta.angle}입니다.
            비공유 전자쌍도 영역을 차지하지만 원자는 없습니다. 물처럼 결합 2개와 비공유 쌍 2개면 영역은 사면체인데 원자만 보면 굽어 있습니다.
          </>
        ) : (
          <>결합과 비공유 쌍의 합이 5 이상이면 삼각쌍뿔이나 팔면체가 됩니다. 이 실험은 영역 4개까지, 곧 선형·평면·사면체 가족만 보여 줍니다.</>
        )
      }
    >
      <Stage
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          if (!meta) return
          const cx = w / 2
          const cy = h / 2
          const scale = 78
          const dots = [
            ...meta.points.map((point) => ({ ...project(point, rot), kind: 'bond' as const })),
            ...meta.lone.map((point) => ({ ...project(point, rot), kind: 'lone' as const })),
          ].sort((a, b) => a.z - b.z)
          ctx.fillStyle = '#f6f3ea'
          ctx.beginPath()
          ctx.arc(cx, cy, 14, 0, Math.PI * 2)
          ctx.fill()
          for (const dot of dots) {
            const x = cx + dot.x * scale
            const y = cy - dot.y * scale
            ctx.strokeStyle = dot.kind === 'bond' ? '#9dede2' : '#f0b429'
            ctx.lineWidth = dot.kind === 'bond' ? 3 : 8
            ctx.globalAlpha = dot.kind === 'lone' ? 0.45 : 1
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.lineTo(x, y)
            ctx.stroke()
            if (dot.kind === 'bond') {
              ctx.fillStyle = '#7ee0d0'
              ctx.beginPath()
              ctx.arc(x, y, 10, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.globalAlpha = 1
          }
        }}
      />
      <Note>노란 굵은 선은 비공유 전자쌍, 청록 공은 결합한 원자입니다. 회전은 같은 구조를 다른 방향에서 보는 것입니다.</Note>
    </LabShell>
  )
}

const MOLECULES = [
  { id: 'h2o', name: '물 H₂O', polar: true, note: '산소 쪽으로 전자가 치우치고 분자가 굽어 화살표가 상쇄되지 않습니다.' },
  { id: 'co2', name: '이산화탄소 CO₂', polar: false, note: '각 C=O 결합은 산소 쪽으로 치우치지만 직선이라 양쪽 화살표가 상쇄됩니다.' },
  { id: 'ch4', name: '메테인 CH₄', polar: false, note: '네 방향의 약한 결합 극성이 사면체에서 합이 0입니다.' },
  { id: 'nh3', name: '암모니아 NH₃', polar: true, note: '질소 쪽으로 치우친 결합과 비공유 쌍이 남아 극성을 띱니다.' },
  { id: 'hcl', name: '염화수소 HCl', polar: true, note: '전기음성도는 Cl이 H보다 커서 화살표가 염소 쪽 하나입니다.' },
]

export function PolarityLab() {
  const { engage } = useProgress()
  const [id, setId] = useState('h2o')
  const [rot, setRot] = useState(20)
  const molecule = MOLECULES.find((item) => item.id === id) ?? MOLECULES[0]
  return (
    <LabShell
      id="polarity"
      steps={[
        { key: 'mol', label: '물과 이산화탄소를 비교하기' },
        { key: 'rot', label: '분자를 돌려 보기' },
      ]}
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {MOLECULES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setId(item.id); engage('polarity', 'mol') }} className={`rounded-full px-3 py-2 text-sm ${id === item.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item.name}
              </button>
            ))}
          </div>
          <Slider label="회전" min={0} max={360} step={2} unit="°" value={rot} onChange={(value) => { setRot(value); engage('polarity', 'rot') }} />
          <Predict
            prompt="CO₂는 결합마다 전자가 치우치는데 분자는?"
            choices={[
              { id: 'non', label: '무극성', ok: true, why: '결합 극성의 화살표가 180°로 반대라 합이 0입니다. 결합이 극성인 것과 분자가 극성인 것은 다른 질문입니다.' },
              { id: 'yes', label: '극성', ok: false, why: '물처럼 굽어 있어야 화살표가 남습니다. CO₂는 선형입니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          {molecule.name}은 {molecule.polar ? '극성 분자' : '무극성 분자'}입니다. {molecule.note} 화면을 돌려도 알짜 쌍극자가 있는지는 바뀌지 않습니다. 회전은 보는 방향만 바꿉니다.
        </>
      }
    >
      <div className="grid h-48 place-items-center rounded-2xl bg-[#0b1014]" style={{ transform: `rotate(${rot}deg)` }}>
        <PolarSketch id={molecule.id} />
      </div>
      <Note>화살표 끝은 전자가 치우친 쪽입니다. 분자가 무극성이면 알짜 화살표를 그리지 않습니다.</Note>
    </LabShell>
  )
}

function PolarSketch({ id }: { id: string }) {
  if (id === 'co2') {
    return (
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e07a5f]">O</span>
        <span className="text-[#f6f3ea]">←</span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0b429]">C</span>
        <span className="text-[#f6f3ea]">→</span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e07a5f]">O</span>
      </div>
    )
  }
  if (id === 'h2o') {
    return (
      <div className="relative h-32 w-40 text-sm font-semibold">
        <span className="absolute left-1/2 top-2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-[#e07a5f]">O</span>
        <span className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-[#f6f3ea] text-[#10211e]">H</span>
        <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-[#f6f3ea] text-[#10211e]">H</span>
        <span className="absolute left-1/2 top-14 -translate-x-1/2 text-lg text-[#7ee0d0]">↑</span>
      </div>
    )
  }
  if (id === 'hcl') {
    return (
      <div className="flex items-center gap-3 font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f6f3ea] text-[#10211e]">H</span>
        <span className="text-[#7ee0d0]">→</span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#9dede2] text-[#10211e]">Cl</span>
      </div>
    )
  }
  if (id === 'nh3') {
    return (
      <div className="text-center font-semibold text-[#f6f3ea]">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#7ee0d0] text-[#10211e]">N</div>
        <div className="mt-3 flex gap-4">
          <span>H</span><span>H</span><span>H</span>
        </div>
        <div className="text-[#7ee0d0]">알짜 ↑</div>
      </div>
    )
  }
  return <div className="font-semibold text-[#f6f3ea]">CH₄ · 네 방향이 상쇄</div>
}

const REACTIONS = {
  water: { label: '2H₂ + O₂ → 2H₂O', reactants: [{ id: 'H2', coeff: 2 }, { id: 'O2', coeff: 1 }], product: { id: 'H2O', coeff: 2 } },
  ammonia: { label: 'N₂ + 3H₂ → 2NH₃', reactants: [{ id: 'N2', coeff: 1 }, { id: 'H2', coeff: 3 }], product: { id: 'NH3', coeff: 2 } },
  burn: { label: 'CH₄ + 2O₂ → CO₂ + 2H₂O', reactants: [{ id: 'CH4', coeff: 1 }, { id: 'O2', coeff: 2 }], product: { id: '생성물 세트', coeff: 1 } },
}

export function StoichLab() {
  const { engage } = useProgress()
  const [reactionId, setReactionId] = useState<keyof typeof REACTIONS>('water')
  const [a, setA] = useState(2)
  const [b, setB] = useState(1)
  const reaction = REACTIONS[reactionId]
  const extentA = a / reaction.reactants[0].coeff
  const extentB = b / reaction.reactants[1].coeff
  const extent = Math.min(extentA, extentB)
  const limit = extentA < extentB ? reaction.reactants[0].id : extentB < extentA ? reaction.reactants[1].id : '둘 다'
  const product = extent * reaction.product.coeff
  const leftA = a - extent * reaction.reactants[0].coeff
  const leftB = b - extent * reaction.reactants[1].coeff

  return (
    <LabShell
      id="stoich"
      steps={[
        { key: 'rxn', label: '반응식을 고르기' },
        { key: 'amount', label: '반응물 양을 바꿔 제한 반응물 보기' },
      ]}
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(REACTIONS) as (keyof typeof REACTIONS)[]).map((key) => (
              <button key={key} type="button" onClick={() => { setReactionId(key); engage('stoich', 'rxn') }} className={`rounded-full px-3 py-2 text-sm ${reactionId === key ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {REACTIONS[key].label}
              </button>
            ))}
          </div>
          <Slider label={`${reaction.reactants[0].id} 양`} min={0} max={6} step={0.1} unit="mol" value={a} display={fixed(a, 1)} onChange={(value) => { setA(value); engage('stoich', 'amount') }} />
          <Slider label={`${reaction.reactants[1].id} 양`} min={0} max={6} step={0.1} unit="mol" value={b} display={fixed(b, 1)} onChange={(value) => { setB(value); engage('stoich', 'amount') }} />
        </>
      }
      result={
        <>
          계수로 나눈 값은 {reaction.reactants[0].id} {fixed(extentA, 2)}, {reaction.reactants[1].id} {fixed(extentB, 2)}입니다.
          더 작은 쪽이 제한 반응물이므로 지금은 {limit}입니다. 이론 생성량은 {reaction.product.id} {fixed(product, 2)} mol이고,
          남는 양은 {reaction.reactants[0].id} {fixed(Math.max(0, leftA), 2)} mol, {reaction.reactants[1].id} {fixed(Math.max(0, leftB), 2)} mol입니다.
          부반응이 없다고 둔 계산입니다.
        </>
      }
    >
      <Readouts
        items={[
          { label: '제한', value: limit },
          { label: '생성', value: `${fixed(product, 2)} mol` },
          { label: '반응 진척', value: fixed(extent, 2) },
        ]}
      />
    </LabShell>
  )
}

export function RateLab() {
  const { engage } = useProgress()
  const [temp, setTemp] = useState(25)
  const [conc, setConc] = useState(1)
  const [surface, setSurface] = useState(1)
  const [catalyst, setCatalyst] = useState(false)
  const ea = catalyst ? 30000 : 50000
  const k = Math.exp(-ea / (8.314 * (temp + 273.15)))
  const kRef = Math.exp(-50000 / (8.314 * 298.15))
  const relative = (k / kRef) * conc * conc * surface * (catalyst ? 1 : 1)
  const particles = useRef(Array.from({ length: 24 }, (_, index) => ({ x: (index * 37) % 100, y: (index * 53) % 100, vx: index % 2 ? 1 : -1 })))

  return (
    <LabShell
      id="rate"
      steps={[
        { key: 'temp', label: '온도를 바꿔 보기' },
        { key: 'cat', label: '촉매를 켜 보기' },
      ]}
      controls={
        <>
          <Slider label="온도" min={0} max={80} step={1} unit="°C" value={temp} onChange={(value) => { setTemp(value); engage('rate', 'temp') }} />
          <Slider label="농도" min={0.2} max={2} step={0.1} value={conc} display={fixed(conc, 1)} onChange={(value) => { setConc(value); engage('rate', 'conc') }} />
          <Slider label="표면적 배수" min={1} max={4} step={1} value={surface} onChange={(value) => { setSurface(value); engage('rate', 'surface') }} />
          <button type="button" onClick={() => { setCatalyst((value) => !value); engage('rate', 'cat') }} className="rounded-full bg-white/10 px-3 py-2 text-sm">
            촉매 {catalyst ? '켜짐 · Ea 30 kJ/mol' : '꺼짐 · Ea 50 kJ/mol'}
          </button>
        </>
      }
      result={
        <>
          25°C, 농도 1, 촉매 없을 때를 1로 두면 지금 상대 속도는 {fixed(relative, 2)}입니다.
          온도는 활성화 에너지를 넘는 충돌 비율을 지수적으로 바꾸고, 농도는 부딪히는 횟수를 늘립니다.
          촉매는 이 모형에서 장벽을 50에서 30 kJ/mol로 낮춥니다. 실제 차수와 장벽은 반응마다 실험으로 정합니다.
        </>
      }
    >
      <Stage
        height={180}
        draw={(ctx, w, h, time) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const count = Math.round(8 + conc * 10)
          const speed = 20 + temp * 0.7
          particles.current.slice(0, count).forEach((particle, index) => {
            const x = ((particle.x + Math.sin(time * speed * 0.05 + index) * 8) / 100) * w
            const y = ((particle.y + Math.cos(time * speed * 0.04 + index) * 8) / 100) * h
            const react = Math.sin(time * relative + index) > 0.92
            ctx.fillStyle = react ? '#f0b429' : '#9dede2'
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
          })
        }}
      />
      <Note>노란 점은 장벽을 넘었다고 표시한 충돌입니다. 온도·농도·촉매가 커질수록 더 자주 나타납니다. 속도 숫자는 아레니우스 모형이고, 점은 그 경향의 그림입니다.</Note>
    </LabShell>
  )
}

function indicator(ph: number) {
  const stops: [number, [number, number, number]][] = [
    [0, [225, 29, 46]],
    [2, [240, 120, 40]],
    [4, [230, 190, 40]],
    [6, [170, 200, 60]],
    [7, [50, 170, 90]],
    [8, [40, 150, 170]],
    [10, [50, 90, 210]],
    [12, [90, 60, 180]],
    [14, [70, 30, 120]],
  ]
  let lower = stops[0]
  let upper = stops[stops.length - 1]
  for (let index = 0; index < stops.length - 1; index += 1) {
    if (ph >= stops[index][0] && ph <= stops[index + 1][0]) {
      lower = stops[index]
      upper = stops[index + 1]
    }
  }
  const span = upper[0] - lower[0] || 1
  const t = (ph - lower[0]) / span
  const rgb = lower[1].map((channel, index) => Math.round(channel + (upper[1][index] - channel) * t))
  return `rgb(${rgb.join(',')})`
}

export function PhLab() {
  const { engage } = useProgress()
  const [ph, setPh] = useState(7)
  const h = 10 ** -ph
  const oh = 1e-14 / h
  const data = useMemo(
    () => Array.from({ length: 15 }, (_, index) => ({ ph: index, h: index === 0 ? 1 : 10 ** -index })),
    [],
  )

  return (
    <LabShell
      id="ph"
      steps={[
        { key: 'ph', label: 'pH를 옮겨 보기' },
        { key: 'ten', label: '10배 버튼으로 로그를 확인하기' },
      ]}
      controls={
        <>
          <Slider label="pH" min={0} max={14} step={0.1} value={ph} display={fixed(ph, 1)} onChange={(value) => { setPh(value); engage('ph', 'ph') }} />
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => { setPh((value) => clamp(value - 1, 0, 14)); engage('ph', 'ten') }}>
              H⁺ 10배
            </button>
            <button type="button" className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => { setPh((value) => clamp(value + 1, 0, 14)); engage('ph', 'ten') }}>
              H⁺ 1/10
            </button>
          </div>
          <Predict
            prompt="pH가 3에서 2로 줄면 H⁺는?"
            choices={[
              { id: 'ten', label: '10배 많아진다', ok: true, why: 'pH는 로그라서 1 차이마다 농도는 10배입니다. pH 3은 10⁻³ mol/L, pH 2는 10⁻² mol/L입니다.' },
              { id: 'one', label: '1만큼 많아진다', ok: false, why: 'pH 숫자 1은 농도 1 mol/L이 아닙니다. 지수 위의 숫자가 1 바뀝니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          pH {fixed(ph, 1)}은 [H⁺] = {sci(h, 2)} mol/L, [OH⁻] = {sci(oh, 2)} mol/L입니다. 둘의 곱은 25°C에서 1.0×10⁻¹⁴로 맞춥니다.
          pH가 1 작아질 때마다 수소 이온은 10배입니다. 7보다 작으면 산성, 크면 염기성 쪽에 가깝고, 이 기준은 25°C의 물입니다.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
        <div className="mx-auto h-40 w-28 rounded-b-3xl rounded-t-md border-4 border-white/30" style={{ background: indicator(ph) }} />
        <div>
          <div className="text-xs text-[#9fb1aa]">로그 눈금에서 pH 한 칸</div>
          <div className="mt-2 flex h-8 overflow-hidden rounded-full">
            {Array.from({ length: 15 }, (_, index) => (
              <div key={index} className="flex-1" style={{ background: indicator(index), outline: Math.round(ph) === index ? '2px solid white' : 'none' }} />
            ))}
          </div>
          <ScienceChart data={data} xKey="ph" lines={[{ key: 'h', name: '[H⁺]', color: '#f0b429' }]} />
        </div>
      </div>
      <Readouts items={[{ label: 'pH', value: fixed(ph, 1) }, { label: '[H⁺]', value: sci(h, 2) }, { label: '[OH⁻]', value: sci(oh, 2) }]} />
      <Note>비커 색은 범용 지시약의 대표 색입니다. 그래프는 pH에 대한 [H⁺]라서 오른쪽으로 갈수록 급격히 작아집니다.</Note>
    </LabShell>
  )
}
