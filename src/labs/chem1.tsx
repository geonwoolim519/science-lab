import { useMemo, useState } from 'react'
import { Slider } from '../components/ui'
import { CAT_COLOR, CAT_LABEL, COMMON_NEUTRONS, ELEMENTS, elementByZ, fillOrbitals } from '../data/elements'
import { useProgress } from '../progress'
import { fixed, sci } from './format'
import { LabShell, Note, Readouts } from './kit'

export function AtomLab() {
  const { engage } = useProgress()
  const [protons, setProtons] = useState(6)
  const [neutrons, setNeutrons] = useState(6)
  const [electrons, setElectrons] = useState(6)
  const element = elementByZ(protons)
  const charge = protons - electrons
  const common = COMMON_NEUTRONS[protons]
  const shells = [2, 8, 8, 2]
  let left = electrons
  const placed = shells.map((cap) => {
    const take = Math.min(cap, left)
    left -= take
    return take
  })

  return (
    <LabShell
      id="atom"
      steps={[
        { key: 'proton', label: '양성자 수로 원소를 바꿔 보기' },
        { key: 'neutron', label: '중성자를 바꿔 동위원소를 보기' },
      ]}
      controls={
        <>
          <Slider label="양성자" min={1} max={20} step={1} value={protons} onChange={(value) => { setProtons(value); engage('atom', 'proton') }} />
          <Slider label="중성자" min={0} max={28} step={1} value={neutrons} onChange={(value) => { setNeutrons(value); engage('atom', 'neutron') }} />
          <Slider label="전자" min={0} max={20} step={1} value={electrons} onChange={(value) => { setElectrons(value); engage('atom', 'electron') }} />
        </>
      }
      result={
        <>
          양성자 {protons}개는 {element?.name ?? '알 수 없는 핵'}입니다. 질량수는 {protons + neutrons}입니다.{' '}
          {common === undefined
            ? ''
            : neutrons === common
              ? `중성자 ${neutrons}개는 이 원소에서 가장 흔한 쪽에 가깝습니다.`
              : `중성자가 흔한 값 ${common}과 다르므로 동위원소입니다. 원소 이름은 그대로입니다.`}{' '}
          {charge === 0 ? '전자 수가 양성자와 같아 중성 원자입니다.' : charge > 0 ? `전자가 ${charge}개 부족해 전하 +${charge}인 양이온입니다.` : `전자가 ${-charge}개 많아 전하 ${charge}인 음이온입니다.`}
        </>
      }
    >
      <div className="relative h-56 overflow-hidden rounded-2xl bg-[#0b1014]">
        <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e07a5f] text-center text-xs font-semibold text-[#1c1915]">
          p {protons}
          <br />n {neutrons}
        </div>
        {placed.map((count, shell) =>
          Array.from({ length: count }, (_, index) => {
            const radius = 46 + shell * 28
            const angle = (index / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2
            return (
              <span
                key={`${shell}-${index}`}
                className="absolute h-3 w-3 rounded-full bg-[#7ee0d0]"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )
          }),
        )}
      </div>
      <Readouts
        items={[
          { label: '원소', value: element ? `${element.sym}` : '—' },
          { label: '질량수', value: String(protons + neutrons) },
          { label: '전하', value: charge > 0 ? `+${charge}` : String(charge) },
        ]}
      />
      <Note>바깥 점은 전자의 정확한 궤도가 아니라, 껍질에 몇 개 있는지를 세는 보어식 그림입니다. 20번을 넘는 전자 배치는 다음 실험의 오비탈이 더 맞습니다.</Note>
    </LabShell>
  )
}

export function ConfigLab() {
  const { engage } = useProgress()
  const [z, setZ] = useState(8)
  const element = elementByZ(z)
  const orbitals = fillOrbitals(z)
  const hint =
    element?.cat === 'alkali'
      ? '바깥 전자가 1개라 +1 이온이 되기 쉽습니다.'
      : element?.cat === 'alkaline'
        ? '바깥 전자 2개를 잃고 +2가 되기 쉽습니다.'
        : element?.cat === 'halogen'
          ? '전자 1개를 얻어 −1이 되기 쉽습니다.'
          : element?.cat === 'noble'
            ? '바깥 껍질이 채워져 반응이 거의 없습니다.'
            : element?.cat === 'transition'
              ? 'd 오비탈이 채워지는 중이라 이온 전하가 여러 가지일 수 있습니다.'
              : '바깥 전자 수가 결합의 개수를 가늠하게 합니다.'

  return (
    <LabShell
      id="config"
      steps={[
        { key: 'z', label: '원자번호를 옮겨 보기' },
        { key: 'edge', label: '1족이나 17족, 18족을 찍어 보기' },
      ]}
      controls={
        <>
          <Slider
            label="원자번호"
            min={1}
            max={36}
            step={1}
            value={z}
            onChange={(value) => {
              setZ(value)
              engage('config', 'z')
              const picked = elementByZ(value)
              if (picked && (picked.cat === 'alkali' || picked.cat === 'halogen' || picked.cat === 'noble')) {
                engage('config', 'edge')
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            {[3, 9, 11, 17, 18, 24, 29].map((atomic) => (
              <button
                key={atomic}
                type="button"
                onClick={() => {
                  setZ(atomic)
                  engage('config', 'z')
                  engage('config', 'edge')
                }}
                className="rounded-full bg-white/10 px-3 py-1.5 text-sm"
              >
                {elementByZ(atomic)?.sym}
              </button>
            ))}
          </div>
        </>
      }
      result={
        <>
          {element?.name}의 전자배치는 {element?.config}입니다. {hint} 상자는 훈트 규칙대로 먼저 홀전자를 채웁니다.
          {z === 24 || z === 29 ? ' 이 원소는 4s와 3d 순서가 단순 쌓음과 다른 예외입니다.' : ''}
        </>
      }
    >
      <div className="space-y-2 rounded-2xl bg-[#0b1014] p-3">
        {orbitals.map((orbital) => (
          <div key={orbital.id} className="flex items-center gap-2">
            <div className="w-8 text-xs text-[#9dede2]">{orbital.id}</div>
            <div className="flex gap-1">
              {orbital.electrons.map((count, index) => (
                <div key={index} className="grid h-8 w-8 place-items-center rounded-md border border-white/15 text-sm">
                  {count === 2 ? '↑↓' : count === 1 ? '↑' : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Note>화살표 하나는 스핀이 다른 전자 자리입니다. 한 칸에는 최대 둘이고, 방향은 반대입니다.</Note>
    </LabShell>
  )
}

export function PeriodicLab() {
  const { engage } = useProgress()
  const [z, setZ] = useState(8)
  const [mode, setMode] = useState<'cat' | 'radius' | 'en'>('cat')
  const selected = elementByZ(z)
  const maxRadius = 220
  const colorFor = (atomic: number) => {
    const element = elementByZ(atomic)
    if (!element) return '#333'
    if (mode === 'cat') return CAT_COLOR[element.cat]
    if (mode === 'radius') {
      const t = element.radius / maxRadius
      return `rgb(${Math.round(40 + t * 180)}, ${Math.round(120 - t * 40)}, ${Math.round(110 - t * 40)})`
    }
    if (element.en == null) return '#2a3330'
    const t = element.en / 4
    return `rgb(${Math.round(40 + t * 200)}, ${Math.round(90 + (1 - t) * 80)}, ${Math.round(80 + t * 40)})`
  }

  return (
    <LabShell
      id="periodic"
      steps={[
        { key: 'pick', label: '원소를 하나 고르기' },
        { key: 'mode', label: '반지름이나 전기음성도 색으로 보기' },
      ]}
      controls={
        <div className="flex flex-wrap gap-2">
          {[
            ['cat', '분류'],
            ['radius', '원자반지름'],
            ['en', '전기음성도'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id as 'cat' | 'radius' | 'en')
                engage('periodic', 'mode')
              }}
              className={`rounded-full px-3 py-2 text-sm ${mode === id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}
            >
              {label}
            </button>
          ))}
        </div>
      }
      result={
        selected ? (
          <>
            {selected.name}({selected.sym})은 원자번호 {selected.z}, 원자량 {selected.mass}, 전자배치 {selected.config}입니다.
            공유 반지름 대표값은 {selected.radius} pm
            {selected.en == null ? '이고, 비활성 기체라 전기음성도는 여기 비교에서 비워 두었습니다.' : `, 전기음성도는 ${selected.en}입니다.`}
            {' '}
            {CAT_LABEL[selected.cat]}입니다. 주족 원소는 오른쪽으로 갈수록 대체로 작아지고 전기음성도는 커지며, 아래로 갈수록 껍질이 늘어 커집니다.
          </>
        ) : null
      }
    >
      <div className="overflow-x-auto rounded-2xl bg-[#0b1014] p-2">
        <div className="grid min-w-[680px] gap-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
          {ELEMENTS.map((element) => (
            <button
              key={element.z}
              type="button"
              onClick={() => {
                setZ(element.z)
                engage('periodic', 'pick')
              }}
              className="rounded-md px-0.5 py-1 text-center text-[10px] leading-tight text-[#10211e]"
              style={{
                gridColumn: element.group,
                gridRow: element.period,
                background: colorFor(element.z),
                outline: element.z === z ? '2px solid #f6f3ea' : 'none',
              }}
            >
              <div className="opacity-70">{element.z}</div>
              <div className="font-semibold">{element.sym}</div>
            </button>
          ))}
        </div>
      </div>
      <Note>반지름 색은 밝을수록 크고, 전기음성도 색은 붉을수록 셉니다. 값은 경향을 보기 위한 대표값입니다. 표는 1번부터 54번까지입니다.</Note>
    </LabShell>
  )
}

export function IonicLab() {
  const { engage } = useProgress()
  const [moved, setMoved] = useState(false)
  const [distance, setDistance] = useState(280)
  const k = 8.9875517923e9
  const e = 1.602176634e-19
  const r = distance * 1e-12
  const force = moved ? (k * e * e) / (r * r) : 0

  return (
    <LabShell
      id="ionic"
      steps={[
        { key: 'move', label: '전자를 옮겨 이온 만들기' },
        { key: 'distance', label: '이온 사이 거리를 바꿔 보기' },
      ]}
      controls={
        <>
          <button
            type="button"
            onClick={() => {
              setMoved(true)
              engage('ionic', 'move')
            }}
            className="rounded-full bg-[#f6f3ea] px-4 py-2 text-sm font-semibold text-[#10211e]"
          >
            전자를 Na에서 Cl로 옮기기
          </button>
          <Slider
            label="이온 사이 거리"
            min={200}
            max={600}
            step={10}
            unit="pm"
            value={distance}
            onChange={(value) => {
              setDistance(value)
              engage('ionic', 'distance')
            }}
          />
        </>
      }
      result={
        moved ? (
          <>
            Na는 전자 하나를 잃어 Na⁺가 되고 Cl은 Cl⁻가 됩니다. 서로 다른 전하이므로 끌어당깁니다.
            거리 {distance} pm에서 한 쌍의 쿨롱 힘은 약 {sci(force, 2)} N입니다. 거리를 두 배로 하면 이 힘은 4분의 1이 됩니다.
            소금 결정은 이런 쌍 하나가 아니라 +와 −가 번갈아 쌓인 격자입니다.
          </>
        ) : (
          <>아직 중성 원자입니다. 전자가 이동하기 전에는 이 단순 모형에서 이온 인력이 없습니다. 버튼을 누르면 Na⁺와 Cl⁻가 됩니다.</>
        )
      }
    >
      <div className="flex h-48 items-center justify-around rounded-2xl bg-[#0b1014] px-4">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f0b429] font-semibold text-[#1c1915]">
            {moved ? 'Na⁺' : 'Na'}
          </div>
        </div>
        <div className="text-center text-xs text-[#9dede2]">
          {moved ? `${fixed(distance, 0)} pm` : '전자 이동 전'}
          <div className="mt-2 h-px w-24 bg-white/30" />
        </div>
        <div className="relative text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#7ee0d0] font-semibold text-[#10211e]">
            {moved ? 'Cl⁻' : 'Cl'}
          </div>
          {!moved ? <span className="absolute -right-1 top-0 h-3 w-3 rounded-full bg-[#f6f3ea]" /> : null}
        </div>
      </div>
      {moved ? (
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 18 }, (_, index) => (
            <div key={index} className={`h-6 rounded ${index % 2 === 0 ? 'bg-[#f0b429]' : 'bg-[#7ee0d0]'}`} />
          ))}
        </div>
      ) : null}
      <Note>아래 줄은 Na⁺와 Cl⁻가 번갈아 놓인 격자의 한 단면입니다. 힘의 숫자는 이온 한 쌍만의 쿨롱 힘입니다.</Note>
    </LabShell>
  )
}

type El = 'H' | 'O' | 'C'
type Atom = { id: string; el: El; x: number; y: number }

const PRESETS: Record<string, Atom[]> = {
  H2: [
    { id: 'a', el: 'H', x: 35, y: 50 },
    { id: 'b', el: 'H', x: 65, y: 50 },
  ],
  O2: [
    { id: 'a', el: 'O', x: 35, y: 50 },
    { id: 'b', el: 'O', x: 65, y: 50 },
  ],
  H2O: [
    { id: 'o', el: 'O', x: 50, y: 42 },
    { id: 'h1', el: 'H', x: 32, y: 68 },
    { id: 'h2', el: 'H', x: 68, y: 68 },
  ],
  CO2: [
    { id: 'o1', el: 'O', x: 22, y: 50 },
    { id: 'c', el: 'C', x: 50, y: 50 },
    { id: 'o2', el: 'O', x: 78, y: 50 },
  ],
}

function bondPairs(atoms: Atom[]) {
  if (atoms.length === 2) return [[0, 1]] as [number, number][]
  const oxygen = atoms.filter((atom) => atom.el === 'O').length
  const hydrogen = atoms.filter((atom) => atom.el === 'H').length
  const carbon = atoms.filter((atom) => atom.el === 'C').length
  if (oxygen === 1 && hydrogen === 2 && carbon === 0) {
    const center = atoms.findIndex((atom) => atom.el === 'O')
    return atoms.map((_, index) => index).filter((index) => index !== center).map((index) => [center, index] as [number, number])
  }
  if (carbon === 1 && oxygen === 2 && hydrogen === 0) {
    const center = atoms.findIndex((atom) => atom.el === 'C')
    return atoms.map((_, index) => index).filter((index) => index !== center).map((index) => [center, index] as [number, number])
  }
  return [] as [number, number][]
}

function describe(atoms: Atom[]) {
  const count = (el: El) => atoms.filter((atom) => atom.el === el).length
  const h = count('H')
  const o = count('O')
  const c = count('C')
  if (atoms.length === 2 && h === 2) return { name: '수소 분자 H₂', shared: '전자쌍 1개', note: '수소는 각각 손이 하나라 단일 결합입니다.' }
  if (atoms.length === 2 && o === 2) return { name: '산소 분자 O₂', shared: '전자쌍 2개', note: '산소는 손이 두 개라 이중 결합으로 맞춥니다.' }
  if (h === 2 && o === 1 && c === 0) return { name: '물 H₂O', shared: '단일 결합 2개', note: '산소가 수소 둘과 전자쌍을 하나씩 나눕니다.' }
  if (c === 1 && o === 2 && h === 0) return { name: '이산화탄소 CO₂', shared: '이중 결합 2개', note: '탄소의 손 4개가 산소 둘과 각각 두 쌍으로 맞습니다.' }
  return { name: '아직 맞지 않는 조합', shared: '—', note: 'H는 1개, O는 2개, C는 4개의 공유 자리를 맞추면 H₂, O₂, H₂O, CO₂가 됩니다.' }
}

export function CovalentLab() {
  const { engage } = useProgress()
  const [atoms, setAtoms] = useState<Atom[]>(PRESETS.H2O)
  const [drag, setDrag] = useState<string | null>(null)
  const info = useMemo(() => describe(atoms), [atoms])

  return (
    <LabShell
      id="covalent"
      steps={[
        { key: 'preset', label: '분자 버튼을 눌러 조립하기' },
        { key: 'drag', label: '원자를 끌어 위치 바꾸기' },
      ]}
      controls={
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([name, preset]) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setAtoms(preset.map((atom) => ({ ...atom })))
                engage('covalent', 'preset')
              }}
              className="rounded-full bg-white/10 px-3 py-2 text-sm"
            >
              {name}
            </button>
          ))}
        </div>
      }
      result={
        <>
          지금 조합은 {info.name}입니다. 공유된 것은 {info.shared}. {info.note} 전자를 한 원자가 가져가는 이온결합과 달리, 공유결합은 핵 사이에 전자쌍을 둡니다.
        </>
      }
    >
      <div
        className="relative h-56 rounded-2xl bg-[#0b1014]"
        onPointerMove={(event) => {
          if (!drag) return
          const bounds = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - bounds.left) / bounds.width) * 100
          const y = ((event.clientY - bounds.top) / bounds.height) * 100
          setAtoms((current) => current.map((atom) => (atom.id === drag ? { ...atom, x, y } : atom)))
        }}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <svg className="absolute inset-0 h-full w-full">
          {bondPairs(atoms).map(([from, to]) => (
            <line
              key={`${atoms[from].id}-${atoms[to].id}`}
              x1={`${atoms[from].x}%`}
              y1={`${atoms[from].y}%`}
              x2={`${atoms[to].x}%`}
              y2={`${atoms[to].y}%`}
              stroke="#f6f3ea"
              strokeWidth={info.name.includes('산소 분자') || info.name.includes('이산화탄소') ? 5 : 2}
            />
          ))}
        </svg>
        {atoms.map((atom) => (
          <button
            key={atom.id}
            type="button"
            onPointerDown={(event) => {
              setDrag(atom.id)
              event.currentTarget.setPointerCapture(event.pointerId)
              engage('covalent', 'drag')
            }}
            className="absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-semibold text-[#10211e]"
            style={{ left: `${atom.x}%`, top: `${atom.y}%`, background: atom.el === 'H' ? '#f6f3ea' : atom.el === 'O' ? '#e07a5f' : '#f0b429' }}
          >
            {atom.el}
          </button>
        ))}
      </div>
      <Note>선은 공유 전자쌍입니다. CO₂와 O₂는 쌍이 두 개라 선을 겹쳐 이중 결합으로 표시합니다. 원자를 끌어 각도를 바꿔 볼 수 있습니다.</Note>
    </LabShell>
  )
}
