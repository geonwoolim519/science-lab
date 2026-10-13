import { useMemo, useState } from 'react'
import { Slider } from '../components/ui'
import { useProgress } from '../progress'
import { fixed } from './format'
import { LabShell, Note, ScienceChart, Stage } from './kit'

type Lattice = 'bcc' | 'fcc' | 'hcp'

function rotate(p: number[], rotX: number, rotY: number) {
  let [x, y, z] = p
  const cy = Math.cos(rotY)
  const sy = Math.sin(rotY)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cx = Math.cos(rotX)
  const sx = Math.sin(rotX)
  const y1 = y * cx - z1 * sx
  const z2 = y * sx + z1 * cx
  return { x: x1, y: y1, z: z2 }
}

function cubeCorners() {
  const points: number[][] = []
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) points.push([x, y, z])
  return points
}

function latticePoints(kind: Lattice) {
  if (kind === 'bcc') return [...cubeCorners(), [0, 0, 0]]
  if (kind === 'fcc') {
    return [...cubeCorners(), [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
  }
  const s3 = Math.sqrt(3)
  const c = 1.633
  const basal = [[0, 0, 0], [1, 0, 0], [0.5, s3 / 2, 0], [-0.5, s3 / 2, 0], [-1, 0, 0], [-0.5, -s3 / 2, 0], [0.5, -s3 / 2, 0]]
  const mid = [[0.5, s3 / 6, c / 2], [-0.5, s3 / 6, c / 2], [0, -s3 / 3, c / 2]]
  const top = basal.map(([x, y]) => [x, y, c])
  return [...basal, ...mid, ...top]
}

const META = {
  bcc: { name: 'BCC 체심입방', cn: 8, apf: '68%', count: '2' },
  fcc: { name: 'FCC 면심입방', cn: 12, apf: '74%', count: '4' },
  hcp: { name: 'HCP 육방최밀', cn: 12, apf: '74%', count: '6 (관례 셀)' },
}

export function CrystalLab() {
  const { engage } = useProgress()
  const [kind, setKind] = useState<Lattice>('fcc')
  const [rotY, setRotY] = useState(0.6)
  const [rotX, setRotX] = useState(0.4)
  const [zoom, setZoom] = useState(1)
  const meta = META[kind]
  return (
    <LabShell
      id="crystal"
      steps={[
        { key: 'kind', label: 'BCC, FCC, HCP를 바꿔 보기' },
        { key: 'rot', label: '돌려 보기' },
      ]}
      controls={
        <>
          <div className="flex gap-2">
            {(Object.keys(META) as Lattice[]).map((item) => (
              <button key={item} type="button" onClick={() => { setKind(item); engage('crystal', 'kind') }} className={`rounded-full px-3 py-2 text-sm ${kind === item ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <Slider label="가로 회전" min={0} max={6.28} step={0.02} value={rotY} display="" onChange={(value) => { setRotY(value); engage('crystal', 'rot') }} />
          <Slider label="세로 회전" min={-1} max={1.4} step={0.02} value={rotX} display="" onChange={setRotX} />
          <Slider label="확대" min={0.7} max={1.6} step={0.05} value={zoom} display={fixed(zoom, 2)} onChange={setZoom} />
        </>
      }
      result={
        <>
          {meta.name}의 배위수는 {meta.cn}, 딱딱한 구 모형의 충전율은 약 {meta.apf}, 단위격자에 세는 원자 수는 {meta.count}입니다.
          모서리와 면의 원자는 이웃 격자와 공유되므로, 그림의 공 개수와 셀에 속하는 원자 수는 다릅니다.
        </>
      }
    >
      <Stage
        height={260}
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const points = latticePoints(kind)
            .map((point) => ({ ...rotate(point, rotX, rotY), raw: point }))
            .sort((a, b) => a.z - b.z)
          for (const point of points) {
            const x = w / 2 + point.x * 42 * zoom
            const y = h / 2 - point.y * 42 * zoom
            const radius = kind === 'hcp' ? 10 * zoom : 12 * zoom
            ctx.fillStyle = '#9dede2'
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        }}
      />
      <Note>FCC와 HCP는 빈틈이 가장 적고 이웃이 12개입니다. 철은 온도에 따라 BCC와 FCC를 오갑니다. 구의 크기는 겹쳐 보이지 않게 맞춘 그림입니다.</Note>
    </LabShell>
  )
}

type Defect = 'perfect' | 'vacancy' | 'sub' | 'inter' | 'dislocation'

export function DefectLab() {
  const { engage } = useProgress()
  const [kind, setKind] = useState<Defect>('perfect')
  const text: Record<Defect, string> = {
    perfect: '결함이 없는 격자는 이론상 매우 강하지만, 실제 금속은 전위가 있어 그보다 낮은 응력에서 미끄러집니다.',
    vacancy: '공공은 원자가 빠져 확산이 일어날 길을 만듭니다. 온도가 높을수록 공공이 많아집니다.',
    sub: '다른 크기의 원자가 자리를 차지하면 주변이 변형되어 전위의 이동을 방해하고, 고용 강화가 될 수 있습니다.',
    inter: '작은 원자가 틈새에 들어가면 격자를 크게 변형합니다. 철 속의 탄소가 대표적이고 강철을 단단하게 합니다.',
    dislocation: '여분의 반평면 같은 선 결함이 움직이면 소성 변형이 됩니다. 전위가 서로 엉키면 오히려 더 밀기 어려워 가공 경화가 됩니다.',
  }
  return (
    <LabShell
      id="defect"
      steps={[
        { key: 'kind', label: '결함 종류를 바꿔 보기' },
        { key: 'two', label: '전위와 공공을 비교하기' },
      ]}
      controls={
        <div className="flex flex-wrap gap-2">
          {[
            ['perfect', '완전'],
            ['vacancy', '공공'],
            ['sub', '치환'],
            ['inter', '침입'],
            ['dislocation', '전위'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setKind(id as Defect)
                engage('defect', 'kind')
                if (id === 'vacancy' || id === 'dislocation') engage('defect', 'two')
              }}
              className={`rounded-full px-3 py-2 text-sm ${kind === id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}
            >
              {label}
            </button>
          ))}
        </div>
      }
      result={<>{text[kind]} 결함이 항상 재료를 약하게만 만드는 것은 아닙니다. 전위는 연성을 주고, 그 이동을 막으면 강도는 올라갑니다.</>}
    >
      <div className="grid grid-cols-6 gap-2 rounded-2xl bg-[#0b1014] p-4">
        {Array.from({ length: 36 }, (_, index) => {
          const row = Math.floor(index / 6)
          const col = index % 6
          const missing = kind === 'vacancy' && index === 15
          const shifted = kind === 'dislocation' && col > 2 && row < 3
          const sub = kind === 'sub' && index === 16
          const inter = kind === 'inter' && index === 15
          if (missing) return <span key={index} className="h-6" />
          return (
            <span key={index} className="relative h-6">
              <span
                className="absolute h-5 w-5 rounded-full"
                style={{
                  background: sub ? '#f0b429' : '#9dede2',
                  left: shifted ? 6 : 0,
                  top: 0,
                }}
              />
              {inter ? <span className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[#e07a5f]" /> : null}
            </span>
          )
        })}
      </div>
      <Note>위쪽 세 줄이 한 칸 밀린 그림이 칼날 전위의 단면입니다. 노란 공은 치환 원자, 작은 붉은 공은 침입 원자입니다.</Note>
    </LabShell>
  )
}

const E = 200000
const YIELD = 250

function flow(ep: number) {
  if (ep < 0.1) return YIELD + 1700 * ep
  return 420 - 700 * (ep - 0.1)
}

export function StressLab() {
  const { engage } = useProgress()
  const [force, setForce] = useState(0)
  const [area, setArea] = useState(120)
  const [ep, setEp] = useState(0)
  const [broken, setBroken] = useState(false)
  const stress = broken ? 0 : (force * 1000) / area
  const strain = broken ? ep : ep + stress / E
  const state = useMemo(() => {
    if (broken) return '파괴'
    if (ep === 0 && stress < YIELD) return '탄성'
    if (stress >= 420) return '파괴 직전'
    if (ep > 0 && stress < flow(ep) - 1) return '탄성 회복 중'
    return '소성'
  }, [broken, ep, stress])

  const update = (nextForce: number, nextArea: number) => {
    if (broken) return
    const nextStress = (nextForce * 1000) / nextArea
    if (nextStress >= 430) {
      setBroken(true)
      setEp(0.2)
      return
    }
    setBroken(false)
    setEp((current) => {
      if (nextStress <= YIELD && current === 0) return 0
      if (nextStress > flow(current) && current < 0.1) return Math.min(0.1, Math.max(0, (nextStress - YIELD) / 1700))
      return current
    })
  }

  const path = useMemo(() => {
    const points = [{ strain: 0, stress: 0 }]
    if (ep > 0) points.push({ strain: Number(ep.toFixed(4)), stress: Number(flow(ep).toFixed(1)) })
    points.push({ strain: Number(strain.toFixed(4)), stress: Number(stress.toFixed(1)) })
    return points
  }, [ep, strain, stress])

  return (
    <LabShell
      id="stress"
      steps={[
        { key: 'force', label: '힘을 늘려 항복을 넘겨 보기' },
        { key: 'unload', label: '힘을 줄여 영구 변형 보기' },
      ]}
      controls={
        <>
          <Slider
            label="당기는 힘"
            min={0}
            max={50}
            step={0.5}
            unit="kN"
            value={force}
            display={fixed(force, 1)}
            onChange={(value) => {
              setForce(value)
              update(value, area)
              engage('stress', 'force')
              if (value < force) engage('stress', 'unload')
            }}
          />
          <Slider
            label="처음 단면적"
            min={80}
            max={200}
            step={5}
            unit="mm²"
            value={area}
            onChange={(value) => {
              setArea(value)
              update(force, value)
              engage('stress', 'area')
            }}
          />
          <button type="button" className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => { setForce(0); setEp(0); setBroken(false) }}>
            새 시편
          </button>
        </>
      }
      result={
        <>
          공학 응력은 {fixed(stress, 1)} MPa, 공학 변형률은 {fixed(strain * 100, 2)}%입니다. 지금은 {state} 구간입니다.
          연강형 모형에서 영률은 200 GPa, 항복은 250 MPa, 최대는 약 420 MPa입니다. 탄성 변형은 1%보다 훨씬 작아 그래프에서 거의 세로로 보입니다.
          항복을 넘긴 뒤 힘을 0으로 낮추면 소성 변형률 {fixed(ep * 100, 2)}%가 남습니다. 가는 막대는 같은 힘에서 응력이 커서 더 일찍 항복합니다.
        </>
      }
    >
      <div className="flex h-24 items-center justify-center rounded-2xl bg-[#0b1014]">
        <div
          className="h-8 rounded-sm bg-[#9dede2]"
          style={{
            width: `${Math.min(92, 28 * (1 + strain))}%`,
            height: broken ? 0 : `${Math.max(8, 32 / Math.sqrt(1 + ep))}px`,
            background: broken ? 'transparent' : '#9dede2',
            outline: broken ? '2px dashed #e07a5f' : 'none',
          }}
        />
      </div>
      <ScienceChart data={path} xKey="strain" lines={[{ key: 'stress', name: '응력 MPa', color: '#f0b429' }]} />
      <Note>가로는 변형률, 세로는 응력(MPa)입니다. 곡선은 교육용으로 단순화한 연강 모형이며 모든 금속의 표준 곡선은 아닙니다.</Note>
    </LabShell>
  )
}
