import { useRef, useState } from 'react'
import { Slider } from '../components/ui'
import { useProgress } from '../progress'
import { arrow } from './draw'
import { fixed, sci } from './format'
import { LabShell, Note, Predict, Readouts, ScienceChart, Stage, useChartHistory } from './kit'

const G = 9.8

export function NewtonLab() {
  const { engage } = useProgress()
  const sim = useRef({ x: 0, v: 0, a: 0, net: 0, last: 0 })
  const [mass, setMass] = useState(2)
  const [force, setForce] = useState(6)
  const [mu, setMu] = useState(0.1)
  const live = useChartHistory(() => ({ a: sim.current.a, v: sim.current.v, net: sim.current.net }))

  return (
    <LabShell
      id="newton"
      steps={[
        { key: 'mass', label: '질량을 움직여 보기' },
        { key: 'force', label: '힘을 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider
            label="질량"
            min={0.5}
            max={8}
            step={0.1}
            unit="kg"
            value={mass}
            display={fixed(mass, 1)}
            onChange={(value) => {
              setMass(value)
              engage('newton', 'mass')
            }}
          />
          <Slider
            label="미는 힘"
            min={-20}
            max={20}
            step={0.5}
            unit="N"
            value={force}
            display={fixed(force, 1)}
            onChange={(value) => {
              setForce(value)
              engage('newton', 'force')
            }}
          />
          <Slider
            label="마찰 계수"
            min={0}
            max={0.8}
            step={0.01}
            value={mu}
            display={fixed(mu, 2)}
            onChange={(value) => {
              setMu(value)
              engage('newton', 'friction')
            }}
          />
          <Predict
            prompt="마찰이 없을 때 질량만 두 배가 되면 가속도는?"
            choices={[
              { id: 'half', label: '절반', ok: true, why: 'a = F/m 이므로 같은 힘에서 질량이 두 배면 가속도는 절반입니다. 마찰이 켜져 있으면 a = F/m − μg라서, 마찰 항은 질량과 함께 커진 무게 때문에 그대로입니다.' },
              { id: 'same', label: '그대로', ok: false, why: '질량은 속도 변화에 버티는 양입니다. 마찰이 0이면 가속도는 힘에 비례하고 질량에 반비례합니다.' },
              { id: 'double', label: '두 배', ok: false, why: '힘은 가속도를 키우고, 질량은 같은 힘의 가속도를 줄입니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          미는 힘 {fixed(force, 1)} N, 질량 {fixed(mass, 1)} kg, 마찰 계수 {fixed(mu, 2)}일 때 알짜힘은 {fixed(live.net, 2)} N이고 가속도는 {fixed(live.a, 2)} m/s²입니다.{' '}
          {Math.abs(live.v) < 0.04 && Math.abs(live.a) < 0.02
            ? '미는 힘이 최대 마찰을 넘지 못해 물체는 멈춰 있습니다. 힘은 있는데도 속도가 변하지 않는 경우입니다.'
            : mu === 0
              ? '마찰이 없으면 알짜힘이 곧 미는 힘이라, 화면의 가속도는 힘을 질량으로 나눈 값과 같습니다.'
              : `운동을 방해하는 마찰력의 크기는 μmg = ${fixed(mu * mass * G, 2)} N이고, 방향은 속도의 반대입니다.`}
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          const s = sim.current
          const dt = s.last ? Math.min(0.033, time - s.last) : 0.016
          s.last = time
          const frictionMax = mu * mass * G
          let net = force
          if (Math.abs(s.v) < 0.03) {
            if (Math.abs(force) <= frictionMax) {
              s.v = 0
              net = 0
            } else {
              net = force - Math.sign(force) * frictionMax
            }
          } else {
            net = force - Math.sign(s.v) * frictionMax
          }
          const a = mass > 0 ? net / mass : 0
          s.v += a * dt
          if (Math.abs(s.v) < 0.03 && Math.abs(force) <= frictionMax) s.v = 0
          s.x += s.v * dt
          s.a = a
          s.net = net

          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const ground = h * 0.7
          ctx.strokeStyle = '#3d5c54'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(16, ground)
          ctx.lineTo(w - 16, ground)
          ctx.stroke()
          const spacing = 36
          const offset = ((s.x * 28) % spacing + spacing) % spacing
          ctx.strokeStyle = '#2c463f'
          for (let x = -spacing + offset; x < w; x += spacing) {
            ctx.beginPath()
            ctx.moveTo(x, ground)
            ctx.lineTo(x - 10, ground + 16)
            ctx.stroke()
          }
          const boxW = 48 + mass * 6
          const boxH = 40
          const bx = w / 2 - boxW / 2
          const by = ground - boxH
          ctx.fillStyle = '#d7f3ef'
          ctx.fillRect(bx, by, boxW, boxH)
          const cy = by + boxH / 2
          if (Math.abs(force) > 0.2) {
            arrow(ctx, w / 2, cy, w / 2 + force * 4, cy, '#f0b429')
          }
          if (Math.abs(net - force) > 0.2 && Math.abs(s.v) > 0.03) {
            const dir = -Math.sign(s.v)
            arrow(ctx, w / 2, cy + 16, w / 2 + dir * frictionMax * 3, cy + 16, '#e07a5f')
          }
        }}
      />
      <Readouts
        items={[
          { label: '알짜힘', value: `${fixed(live.net, 2)} N` },
          { label: '가속도', value: `${fixed(live.a, 2)} m/s²` },
          { label: '속도', value: `${fixed(live.v, 2)} m/s` },
        ]}
      />
      <Note>노란 화살표는 미는 힘, 붉은 화살표는 움직이는 동안의 마찰력입니다. 바닥 눈금이 흐르면 물체가 이동하는 중입니다.</Note>
    </LabShell>
  )
}

function afterVelocities(mode: 'elastic' | 'inelastic', m1: number, m2: number, u1: number, u2: number) {
  if (mode === 'inelastic') {
    const shared = (m1 * u1 + m2 * u2) / (m1 + m2)
    return [shared, shared]
  }
  const v1 = ((m1 - m2) / (m1 + m2)) * u1 + ((2 * m2) / (m1 + m2)) * u2
  const v2 = ((2 * m1) / (m1 + m2)) * u1 + ((m2 - m1) / (m1 + m2)) * u2
  return [v1, v2]
}

export function MomentumLab() {
  const { engage } = useProgress()
  const [m1, setM1] = useState(2)
  const [m2, setM2] = useState(1)
  const [u1, setU1] = useState(2)
  const [u2, setU2] = useState(-1)
  const [mode, setMode] = useState<'elastic' | 'inelastic'>('elastic')
  const sim = useRef({ x1: 70, x2: 250, v1: 2, v2: -1, done: false, last: 0 })
  const [v1, v2] = afterVelocities(mode, m1, m2, u1, u2)
  const p0 = m1 * u1 + m2 * u2
  const p1 = m1 * v1 + m2 * v2
  const ke0 = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2
  const ke1 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2

  const reset = (next?: Partial<{ m1: number; m2: number; u1: number; u2: number }>) => {
    const a = next?.m1 ?? m1
    const b = next?.m2 ?? m2
    const c = next?.u1 ?? u1
    const d = next?.u2 ?? u2
    sim.current = { x1: 70, x2: 280, v1: c, v2: d, done: false, last: 0 }
    void a
    void b
  }

  return (
    <LabShell
      id="momentum"
      steps={[
        { key: 'mass', label: '카트 질량을 바꿔 보기' },
        { key: 'mode', label: '탄성·비탄성 중 하나를 고르기' },
      ]}
      controls={
        <>
          <Slider label="왼쪽 질량" min={0.5} max={5} step={0.1} unit="kg" value={m1} display={fixed(m1, 1)} onChange={(value) => { setM1(value); reset({ m1: value }); engage('momentum', 'mass') }} />
          <Slider label="오른쪽 질량" min={0.5} max={5} step={0.1} unit="kg" value={m2} display={fixed(m2, 1)} onChange={(value) => { setM2(value); reset({ m2: value }); engage('momentum', 'mass') }} />
          <Slider label="왼쪽 처음 속도" min={-4} max={4} step={0.1} unit="m/s" value={u1} display={fixed(u1, 1)} onChange={(value) => { setU1(value); reset({ u1: value }); engage('momentum', 'speed') }} />
          <Slider label="오른쪽 처음 속도" min={-4} max={4} step={0.1} unit="m/s" value={u2} display={fixed(u2, 1)} onChange={(value) => { setU2(value); reset({ u2: value }); engage('momentum', 'speed') }} />
          <div className="flex gap-2">
            {(['elastic', 'inelastic'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  reset()
                  engage('momentum', 'mode')
                }}
                className={`rounded-full px-3 py-2 text-sm ${mode === item ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}
              >
                {item === 'elastic' ? '탄성 충돌' : '붙는 충돌'}
              </button>
            ))}
          </div>
        </>
      }
      result={
        <>
          충돌 전 운동량 합은 {fixed(p0, 2)} kg·m/s, 충돌 후는 {fixed(p1, 2)} kg·m/s입니다. 외부 힘이 없는 직선 충돌이라 둘은 같습니다.
          운동에너지는 {fixed(ke0, 2)} J에서 {fixed(ke1, 2)} J로 {mode === 'elastic' ? '유지됩니다.' : '줄어듭니다. 줄어든 양은 소리·열·변형으로 간 것입니다.'}
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          const s = sim.current
          const dt = s.last ? Math.min(0.033, time - s.last) : 0.016
          s.last = time
          const width1 = 36 + m1 * 10
          const width2 = 36 + m2 * 10
          if (!s.done && s.x1 + width1 >= s.x2) {
            const [a, b] = afterVelocities(mode, m1, m2, s.v1, s.v2)
            s.v1 = a
            s.v2 = b
            s.done = true
            s.x1 = s.x2 - width1 - 1
          }
          s.x1 += s.v1 * dt * 36
          s.x2 += s.v2 * dt * 36
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const ground = h * 0.72
          ctx.strokeStyle = '#3d5c54'
          ctx.beginPath()
          ctx.moveTo(12, ground)
          ctx.lineTo(w - 12, ground)
          ctx.stroke()
          const drawCart = (x: number, width: number, color: string) => {
            ctx.fillStyle = color
            ctx.fillRect(x, ground - 42, width, 36)
            ctx.fillStyle = '#10161c'
            ctx.beginPath()
            ctx.arc(x + 10, ground - 2, 5, 0, Math.PI * 2)
            ctx.arc(x + width - 10, ground - 2, 5, 0, Math.PI * 2)
            ctx.fill()
          }
          drawCart(s.x1, width1, '#9dede2')
          drawCart(s.x2, width2, '#f0b429')
        }}
      />
      <Readouts
        items={[
          { label: '나중 속도 왼쪽', value: `${fixed(v1, 2)} m/s` },
          { label: '나중 속도 오른쪽', value: `${fixed(v2, 2)} m/s` },
          { label: '운동량 차', value: sci(p1 - p0, 1) },
        ]}
      />
      <Note>숫자는 충돌 직후 공식으로 바로 계산됩니다. 애니메이션은 그 속도로 이어집니다.</Note>
    </LabShell>
  )
}

export function EnergyLab() {
  const { engage } = useProgress()
  const [height, setHeight] = useState(1)
  const [mass, setMass] = useState(1)
  const [mu, setMu] = useState(0)
  const sim = useRef({ x: -Math.sqrt(1 / 1.2), dir: 1, specific: G, last: 0, clock: 0, y: 1, v: 0, hist: [] as { t: number; pe: number; ke: number; total: number }[] })
  const applied = useRef(height)
  if (applied.current !== height) {
    applied.current = height
    sim.current.x = -Math.sqrt(height / 1.2)
    sim.current.dir = 1
    sim.current.specific = G * height
    sim.current.hist = []
    sim.current.clock = 0
  }
  const chart = useChartHistory(() => sim.current.hist.slice(-80))
  const live = useChartHistory(() => ({ y: sim.current.y, v: sim.current.v, specific: sim.current.specific }))

  return (
    <LabShell
      id="energy"
      steps={[
        { key: 'height', label: '놓는 높이를 바꿔 보기' },
        { key: 'mass', label: '질량을 바꿔 속력을 비교하기' },
      ]}
      controls={
        <>
          <Slider label="놓는 높이" min={0.25} max={1.6} step={0.05} unit="m" value={height} display={fixed(height, 2)} onChange={(value) => { setHeight(value); engage('energy', 'height') }} />
          <Slider label="질량" min={0.5} max={5} step={0.1} unit="kg" value={mass} display={fixed(mass, 1)} onChange={(value) => { setMass(value); engage('energy', 'mass') }} />
          <Slider label="마찰 계수" min={0} max={0.35} step={0.01} value={mu} display={fixed(mu, 2)} onChange={(value) => { setMu(value); engage('energy', 'friction') }} />
          <Predict
            prompt="마찰이 없을 때 질량을 바꿔도 같은 높이의 속력은?"
            choices={[
              { id: 'same', label: '같다', ok: true, why: 'mgh와 ½mv²에서 m이 약분되어 v = √(2gΔh)입니다. 무거운 공도 가벼운 공도 같은 속력으로 내려옵니다. 에너지는 질량만큼 더 큽니다.' },
              { id: 'faster', label: '무거우면 더 빠르다', ok: false, why: '무거우면 위치에너지도 운동에너지도 같이 커집니다. 속력 자체는 높이 차이가 정합니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          지금 높이 {fixed(live.y, 2)} m, 속력 {fixed(Math.abs(live.v), 2)} m/s입니다. 위치에너지 {fixed(mass * G * live.y, 2)} J, 운동에너지 {fixed(0.5 * mass * live.v * live.v, 2)} J,
          합은 {fixed(mass * live.specific, 2)} J입니다.{' '}
          {mu === 0
            ? '마찰이 0이면 이 합이 처음 높이의 mgh와 같습니다. 질량을 바꿔도 속력 그래프의 모양은 유지되고, 에너지 값만 질량에 비례해 커집니다.'
            : '마찰이 켜지면 역학적 에너지가 열로 빠져 반대편 언덕을 처음 높이까지 오르지 못합니다.'}
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          const s = sim.current
          const dt = s.last ? Math.min(0.033, time - s.last) : 0.016
          s.last = time
          const yOf = (x: number) => 1.2 * x * x
          const dydx = (x: number) => 2.4 * x
          let x = s.x
          let specific = Math.max(0, s.specific)
          let y = yOf(x)
          let v2 = 2 * (specific - G * y)
          if (v2 < 1e-4) {
            s.dir *= -1
            const limit = Math.sqrt(Math.max(specific, 0) / G / 1.2)
            x = s.dir > 0 ? -limit + 0.002 : limit - 0.002
            y = yOf(x)
            v2 = 0
          }
          const speed = Math.sqrt(Math.max(0, v2))
          const ds = Math.sqrt(1 + dydx(x) ** 2)
          x += s.dir * (speed / ds) * dt
          x = Math.max(-1.25, Math.min(1.25, x))
          if (mu > 0 && speed > 0.02) specific = Math.max(0, specific - mu * G * speed * dt)
          y = yOf(x)
          s.x = x
          s.specific = specific
          s.y = y
          s.v = speed
          s.clock += dt
          if (s.hist.length === 0 || s.clock - s.hist[s.hist.length - 1].t > 0.08) {
            s.hist.push({
              t: Number(s.clock.toFixed(1)),
              pe: mass * G * y,
              ke: 0.5 * mass * speed * speed,
              total: mass * specific,
            })
            if (s.hist.length > 80) s.hist.shift()
          }
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          ctx.beginPath()
          ctx.strokeStyle = '#3d5c54'
          ctx.lineWidth = 3
          for (let i = 0; i <= 60; i += 1) {
            const px = -1.25 + (2.5 * i) / 60
            const sx = 24 + ((px + 1.25) / 2.5) * (w - 48)
            const sy = h - 28 - (yOf(px) / 2.1) * (h - 56)
            if (i === 0) ctx.moveTo(sx, sy)
            else ctx.lineTo(sx, sy)
          }
          ctx.stroke()
          const sx = 24 + ((x + 1.25) / 2.5) * (w - 48)
          const sy = h - 28 - (y / 2.1) * (h - 56)
          ctx.fillStyle = '#f0b429'
          ctx.beginPath()
          ctx.arc(sx, sy - 8, 8 + mass, 0, Math.PI * 2)
          ctx.fill()
        }}
      />
      <ScienceChart
        data={chart}
        xKey="t"
        lines={[
          { key: 'pe', name: '위치', color: '#7ee0d0' },
          { key: 'ke', name: '운동', color: '#f0b429' },
          { key: 'total', name: '합', color: '#f6f3ea' },
        ]}
      />
      <Note>가로축은 시간(초), 세로는 에너지(J)입니다. 마찰이 0이면 흰 선이 수평입니다.</Note>
    </LabShell>
  )
}

export function GravityLab() {
  const { engage } = useProgress()
  const [mass1, setMass1] = useState(6)
  const [mass2, setMass2] = useState(6)
  const [distance, setDistance] = useState(30)
  const grav = 6.6743e-11
  const m1 = mass1 * 1e24
  const m2 = mass2 * 1e24
  const r = distance * 1e6
  const force = (grav * m1 * m2) / (r * r)
  const data = Array.from({ length: 36 }, (_, index) => {
    const dist = 10 + index * 3
    const radius = dist * 1e6
    return { r: dist, F: Number((((grav * m1 * m2) / (radius * radius)) / 1e24).toFixed(2)) }
  })

  return (
    <LabShell
      id="gravity"
      steps={[
        { key: 'mass', label: '질량을 바꿔 보기' },
        { key: 'distance', label: '거리를 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="왼쪽 질량" min={1} max={20} step={0.5} unit="×10²⁴ kg" value={mass1} display={fixed(mass1, 1)} onChange={(value) => { setMass1(value); engage('gravity', 'mass') }} />
          <Slider label="오른쪽 질량" min={1} max={20} step={0.5} unit="×10²⁴ kg" value={mass2} display={fixed(mass2, 1)} onChange={(value) => { setMass2(value); engage('gravity', 'mass') }} />
          <Slider label="중심 거리" min={10} max={100} step={1} unit="×10³ km" value={distance} onChange={(value) => { setDistance(value); engage('gravity', 'distance') }} />
        </>
      }
      result={
        <>
          두 질량의 곱은 {(mass1 * mass2).toFixed(1)}×10⁴⁸ kg²이고 거리는 {distance}×10³ km입니다. 중력은 {sci(force, 2)} N입니다.
          거리를 두 배로 하면 이 힘은 4분의 1이 됩니다. 지구 질량이 약 5.97×10²⁴ kg이므로, 슬라이더 6은 지구와 비슷한 크기입니다.
        </>
      }
    >
      <Stage
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const gap = 70 + distance * 1.3
          const left = w / 2 - gap / 2
          const right = w / 2 + gap / 2
          const radius = (value: number) => 16 + value * 1.3
          ctx.fillStyle = '#9dede2'
          ctx.beginPath()
          ctx.arc(left, h * 0.42, radius(mass1), 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#f0b429'
          ctx.beginPath()
          ctx.arc(right, h * 0.42, radius(mass2), 0, Math.PI * 2)
          ctx.fill()
          arrow(ctx, left + radius(mass1) + 8, h * 0.42, right - radius(mass2) - 8, h * 0.42, '#f6f3ea')
          arrow(ctx, right - radius(mass2) - 8, h * 0.42 + 14, left + radius(mass1) + 8, h * 0.42 + 14, '#f6f3ea')
        }}
      />
      <ScienceChart data={data} xKey="r" lines={[{ key: 'F', name: 'F / 10²⁴ N', color: '#7ee0d0' }]} />
      <Note>그래프 가로는 거리(×10³ km), 세로는 힘을 10²⁴ N으로 나눈 값입니다. 지금 거리는 {distance}입니다. 곡선이 1/r²입니다.</Note>
    </LabShell>
  )
}

export function ShmLab() {
  const { engage } = useProgress()
  const [mass, setMass] = useState(1)
  const [k, setK] = useState(20)
  const [amplitude, setAmplitude] = useState(0.12)
  const omega = Math.sqrt(k / mass)
  const period = (2 * Math.PI) / omega
  const live = useChartHistory(() => {
    const t = performance.now() / 1000
    const x = amplitude * Math.cos(omega * t)
    const v = -amplitude * omega * Math.sin(omega * t)
    return { x, v, t: t % (period * 2) }
  })
  const data = Array.from({ length: 80 }, (_, index) => {
    const t = (index / 79) * period * 2
    return { t: Number(t.toFixed(2)), x: Number((amplitude * Math.cos(omega * t) * 100).toFixed(2)) }
  })

  return (
    <LabShell
      id="shm"
      steps={[
        { key: 'mass', label: '질량을 바꿔 주기를 보기' },
        { key: 'k', label: '용수철 상수를 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="질량" min={0.3} max={4} step={0.1} unit="kg" value={mass} display={fixed(mass, 1)} onChange={(value) => { setMass(value); engage('shm', 'mass') }} />
          <Slider label="용수철 상수" min={5} max={80} step={1} unit="N/m" value={k} onChange={(value) => { setK(value); engage('shm', 'k') }} />
          <Slider label="처음 변위" min={0.03} max={0.2} step={0.01} unit="m" value={amplitude} display={fixed(amplitude, 2)} onChange={(value) => { setAmplitude(value); engage('shm', 'amp') }} />
        </>
      }
      result={
        <>
          각속도 ω = √(k/m) = {fixed(omega, 2)} rad/s, 주기 T = {fixed(period, 2)} s입니다. 지금 위치는 {fixed(live.x * 100, 1)} cm,
          속도는 {fixed(live.v, 2)} m/s입니다. 진폭을 바꿔도 주기는 그대로이고, 질량을 키우거나 용수철을 부드럽게 하면 주기가 길어집니다.
          용수철 에너지 ½kx²와 운동에너지 ½mv²의 합은 ½kA² = {fixed(0.5 * k * amplitude * amplitude, 3)} J로 일정합니다.
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          const x = amplitude * Math.cos(omega * time)
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const top = 18
          const rest = h * 0.45
          const y = rest + (x / 0.2) * (h * 0.28)
          ctx.strokeStyle = '#9dede2'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(w / 2, top)
          const coils = 8
          for (let i = 0; i <= coils; i += 1) {
            const yy = top + ((y - 20 - top) * i) / coils
            const xx = w / 2 + (i % 2 === 0 ? -16 : 16)
            ctx.lineTo(i === 0 ? w / 2 : xx, yy)
          }
          ctx.lineTo(w / 2, y - 18)
          ctx.stroke()
          ctx.fillStyle = '#f0b429'
          ctx.fillRect(w / 2 - 22 - mass * 3, y - 16, 44 + mass * 6, 28)
          ctx.strokeStyle = '#3d5c54'
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(w / 2 - 70, rest)
          ctx.lineTo(w / 2 + 70, rest)
          ctx.stroke()
          ctx.setLineDash([])
        }}
      />
      <ScienceChart data={data} xKey="t" lines={[{ key: 'x', name: '위치 (cm)', color: '#f0b429' }]} />
      <Readouts
        items={[
          { label: '주기', value: `${fixed(period, 2)} s` },
          { label: '위치', value: `${fixed(live.x * 100, 1)} cm` },
          { label: '속도', value: `${fixed(live.v, 2)} m/s` },
        ]}
      />
      <Note>점선은 평형점입니다. 그래프는 두 주기 동안의 위치이고, 진폭만 바꾸면 높이만 변합니다.</Note>
    </LabShell>
  )
}
