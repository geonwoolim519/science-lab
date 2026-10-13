import { useState } from 'react'
import { Slider } from '../components/ui'
import { AA_KO, dnaComplement, toMrna, translate } from '../data/codons'
import { useProgress } from '../progress'
import { fixed } from './format'
import { LabShell, Note, Predict, ScienceChart, Stage } from './kit'

const PARENT = ['A', 'T', 'G', 'C', 'C', 'G', 'T', 'A']
const CHILD = PARENT.map((base) => dnaComplement(base))
const BASE_COLOR: Record<string, string> = { A: '#e15b5b', T: '#3b82f6', G: '#eab308', C: '#22c55e', U: '#a855f7' }

export function MembraneLab() {
  const { engage } = useProgress()
  const [left, setLeft] = useState(28)
  const [right, setRight] = useState(6)
  const [running, setRunning] = useState(true)
  const total = left + right
  return (
    <LabShell
      id="membrane"
      steps={[
        { key: 'count', label: '처음 농도를 바꿔 보기' },
        { key: 'run', label: '입자가 퍼지는 것을 보기' },
      ]}
      controls={
        <>
          <Slider label="왼쪽 입자" min={0} max={40} step={1} value={left} onChange={(value) => { setLeft(value); engage('membrane', 'count') }} />
          <Slider label="오른쪽 입자" min={0} max={40} step={1} value={right} onChange={(value) => { setRight(value); engage('membrane', 'count') }} />
          <button type="button" className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => { setRunning((value) => !value); engage('membrane', 'run') }}>
            {running ? '일시정지' : '다시 퍼뜨리기'}
          </button>
        </>
      }
      result={
        <>
          왼쪽 {left}개, 오른쪽 {right}개입니다. 막을 지날 수 있는 입자는 수가 많은 쪽에서 건너는 횟수가 더 많아, 알짜로는 진한 쪽에서 묽은 쪽으로 이동합니다.
          개수가 비슷해지면 양쪽 이동이 상쇄되어 농도는 더 이상 한쪽으로 흐르지 않습니다. 입자가 멈춘 것은 아닙니다. 이 막은 색소를 통과시키고, 물만 통과하는 삼투와는 규칙이 다릅니다.
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          if (running && Math.floor(time * 8) !== Math.floor((time - 0.016) * 8)) {
            if (left !== right && Math.random() < 0.7) {
              if (Math.random() < left / Math.max(total, 1)) setLeft((value) => Math.max(0, value - 1))
              else setRight((value) => Math.max(0, value - 1))
              if (Math.random() < left / Math.max(total, 1)) setRight((value) => value + 1)
              else setLeft((value) => value + 1)
            }
          }
          ctx.fillStyle = '#10211c'
          ctx.fillRect(0, 0, w / 2 - 4, h)
          ctx.fillStyle = '#163028'
          ctx.fillRect(w / 2 + 4, 0, w / 2, h)
          ctx.fillStyle = '#9dede2'
          ctx.fillRect(w / 2 - 3, 0, 6, h)
          const paint = (count: number, origin: number, width: number) => {
            for (let index = 0; index < count; index += 1) {
              const x = origin + ((index * 47) % Math.max(width - 16, 1)) + 8
              const y = 16 + ((index * 29) % (h - 32))
              ctx.beginPath()
              ctx.arc(x, y, 4, 0, Math.PI * 2)
              ctx.fillStyle = '#f0b429'
              ctx.fill()
            }
          }
          paint(left, 0, w / 2)
          paint(right, w / 2, w / 2)
        }}
      />
      <Note>가운데 막은 이 색소 입자를 통과시킵니다. 슬라이더를 움직이면 농도를 다시 불균형으로 만들 수 있습니다.</Note>
    </LabShell>
  )
}

export function OsmosisLab() {
  const { engage } = useProgress()
  const [outside, setOutside] = useState(1)
  const [volume, setVolume] = useState(1)
  const solute = 1
  const inside = solute / volume
  const burst = volume >= 1.75
  const shrink = volume <= 0.45
  return (
    <LabShell
      id="osmosis"
      steps={[
        { key: 'out', label: '바깥 농도를 바꿔 보기' },
        { key: 'watch', label: '세포 크기가 변하는 것을 보기' },
      ]}
      controls={
        <Slider
          label="바깥 용질 농도"
          min={0.3}
          max={2.5}
          step={0.05}
          value={outside}
          display={fixed(outside, 2)}
          onChange={(value) => {
            setOutside(value)
            engage('osmosis', 'out')
          }}
        />
      }
      result={
        <>
          세포 안 농도 {fixed(inside, 2)}, 바깥 {fixed(outside, 2)}입니다. 물은 용질이 더 진한 쪽으로 알짜 이동합니다.{' '}
          {Math.abs(inside - outside) < 0.08
            ? '등장에 가까워 부피가 안정됩니다.'
            : inside > outside
              ? '안이 더 진한 저장액이라 물이 들어와 동물세포 모형이 부풉니다.'
              : '밖이 더 진한 고장액이라 물이 빠져 세포가 쪼그라듭니다.'}
          {burst ? ' 세포벽이 없는 이 모형은 너무 부풀면 터진 것으로 표시합니다. 식물세포는 벽이 그 팽창을 막습니다.' : ''}
          {shrink ? ' 적혈구라면 가장자리가 찌그러지는 쪽에 가깝습니다.' : ''}
        </>
      }
    >
      <Stage
        draw={(ctx, w, h, time) => {
          const dt = 0.016
          const next = volume + (inside - outside) * 0.35 * dt
          const clamped = Math.max(0.35, Math.min(1.85, next))
          if (Math.abs(clamped - volume) > 0.002) {
            setVolume(clamped)
            engage('osmosis', 'watch')
          }
          void time
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const radius = 28 + volume * 36
          ctx.fillStyle = burst ? '#e07a5f' : '#7ee0d0'
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.fillStyle = '#10211e'
          ctx.font = '13px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(burst ? '터짐' : `부피 ${volume.toFixed(2)}`, w / 2, h / 2)
          ctx.textAlign = 'left'
        }}
      />
      <Note>용질은 막을 못 나가고 물만 이동합니다. 안쪽 용질의 양은 1로 고정이라, 부피가 늘면 안 농도는 옅어집니다.</Note>
    </LabShell>
  )
}

function activity(temp: number, ph: number, optPh: number) {
  const gt = Math.exp(-0.5 * ((temp - 37) / 12) ** 2) * (temp > 62 ? Math.exp(-(temp - 62) / 4) : 1)
  const gp = Math.exp(-0.5 * ((ph - optPh) / 1.1) ** 2)
  return gt * gp
}

export function EnzymeLab() {
  const { engage } = useProgress()
  const [temp, setTemp] = useState(37)
  const [ph, setPh] = useState(7)
  const [which, setWhich] = useState<'body' | 'pepsin'>('body')
  const opt = which === 'body' ? 7 : 2
  const now = activity(temp, ph, opt)
  const tempCurve = Array.from({ length: 33 }, (_, index) => ({ t: index * 2.5, a: Number(activity(index * 2.5, ph, opt).toFixed(3)) }))
  const phCurve = Array.from({ length: 29 }, (_, index) => ({ p: index * 0.5, a: Number(activity(temp, index * 0.5, opt).toFixed(3)) }))
  return (
    <LabShell
      id="enzyme"
      steps={[
        { key: 'temp', label: '온도를 바꿔 보기' },
        { key: 'ph', label: 'pH를 바꿔 보기' },
      ]}
      controls={
        <>
          <div className="flex gap-2">
            <button type="button" className={`rounded-full px-3 py-2 text-sm ${which === 'body' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`} onClick={() => setWhich('body')}>체온형 pH 7</button>
            <button type="button" className={`rounded-full px-3 py-2 text-sm ${which === 'pepsin' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`} onClick={() => { setWhich('pepsin'); setPh(2); engage('enzyme', 'ph') }}>펩신형 pH 2</button>
          </div>
          <Slider label="온도" min={0} max={80} step={1} unit="°C" value={temp} onChange={(value) => { setTemp(value); engage('enzyme', 'temp') }} />
          <Slider label="pH" min={0} max={14} step={0.1} value={ph} display={fixed(ph, 1)} onChange={(value) => { setPh(value); engage('enzyme', 'ph') }} />
        </>
      }
      result={
        <>
          지금 상대 활성은 최적의 {Math.round(now * 100)}%입니다. 조금 따뜻하면 충돌이 늘어 빨라지지만, 너무 높으면 단백질 구조가 풀려 활성이 떨어집니다.
          {which === 'pepsin' ? ' 펩신은 위산 환경인 pH 2 근처에서 잘 일하고, 중성에서는 맞지 않습니다.' : ' 이 효소는 pH 7 근처가 최적입니다. 효소마다 최적 pH는 다릅니다.'}
        </>
      }
    >
      <div className="text-xs text-[#9fb1aa]">온도에 따른 활성 · 지금 pH {fixed(ph, 1)}</div>
      <ScienceChart data={tempCurve} xKey="t" lines={[{ key: 'a', name: '활성', color: '#7ee0d0' }]} />
      <div className="text-xs text-[#9fb1aa]">pH에 따른 활성 · 지금 {temp}°C</div>
      <ScienceChart data={phCurve} xKey="p" lines={[{ key: 'a', name: '활성', color: '#f0b429' }]} />
      <Note>곡선은 최적점 주변의 종 모양 모형입니다. 기질 농도까지 다루면 미카엘리스-멘텐 식이 속도를 설명합니다.</Note>
    </LabShell>
  )
}

const STEPS_ATP = [
  { id: 0, name: '해당과정', detail: '포도당 → 피루브산 2개. 순 ATP 2, NADH 2. 세포질에서 일어나고 산소가 없어도 이 단계는 갑니다.', atp: '2', nadh: '2', fadh: '0' },
  { id: 1, name: '피루브산 산화', detail: '피루브산 2개가 아세틸 CoA가 되며 CO₂가 나가고 NADH 2가 생깁니다.', atp: '0', nadh: '2', fadh: '0' },
  { id: 2, name: '시트르산 회로', detail: '두 바퀴에서 ATP 2, NADH 6, FADH₂ 2. 남은 탄소는 CO₂로 나갑니다.', atp: '2', nadh: '6', fadh: '2' },
  { id: 3, name: '전자전달계', detail: '전자가 막 단백질을 지나며 양성자 기울기를 만들고, 그 흐름이 ATP를 만듭니다. 산소가 전자를 최종적으로 받습니다.', atp: '약 26–28', nadh: '사용', fadh: '사용' },
]

export function AtpLab() {
  const { engage } = useProgress()
  const [step, setStep] = useState(0)
  const current = STEPS_ATP[step]
  return (
    <LabShell
      id="atp"
      steps={[
        { key: 'step', label: '단계를 넘겨 보기' },
        { key: 'end', label: '전자전달계까지 가기' },
      ]}
      controls={
        <div className="flex flex-wrap gap-2">
          {STEPS_ATP.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setStep(item.id)
                engage('atp', 'step')
                if (item.id === 3) engage('atp', 'end')
              }}
              className={`rounded-full px-3 py-2 text-sm ${step === item.id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      }
      result={
        <>
          {current.name}: {current.detail} 이 단계의 ATP {current.atp}, NADH {current.nadh}, FADH₂ {current.fadh}.
          NADH 하나당 약 2.5, FADH₂ 하나당 약 1.5 ATP로 보면 포도당 1분자의 합은 약 30–32입니다. 예전 교과서의 36이나 38은 정수로 맞춘 근사이고, 셔틀과 양성자 누수 때문에 하나의 정수로 고정되지 않습니다.
        </>
      }
    >
      <div className="grid grid-cols-4 gap-1">
        {STEPS_ATP.map((item) => (
          <div key={item.id} className={`rounded-xl px-2 py-3 text-center text-xs ${item.id <= step ? 'bg-[#1f8a80] text-white' : 'bg-white/5 text-[#9fb1aa]'}`}>
            {item.name}
          </div>
        ))}
      </div>
      <Note>산소가 없으면 전자전달계가 멈추고, 해당과정을 이어 가려고 발효로 NAD⁺를 되돌립니다. 그때 ATP는 해당과정의 2개 수준입니다.</Note>
    </LabShell>
  )
}

export function DnaLab() {
  const { engage } = useProgress()
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [filled, setFilled] = useState<(string | null)[]>(Array(PARENT.length).fill(null))
  const [message, setMessage] = useState('이중나선을 연 뒤, 강조된 칸의 짝을 고르세요.')
  const correct = filled.every((base, index) => base === CHILD[index])

  function pick(choice: string) {
    const base = PARENT[cursor]
    if (choice !== CHILD[cursor]) {
      setMessage(`${choice}는 ${base}와 쌍이 아닙니다. A-T, G-C만 맞습니다.`)
      return
    }
    const next = filled.map((item, place) => (place === cursor ? choice : item))
    setFilled(next)
    if (next.every((item, place) => item === CHILD[place])) engage('dna', 'pair')
    const following = next.findIndex((item, place) => place > cursor && item == null)
    const any = next.findIndex((item) => item == null)
    if (following >= 0) setCursor(following)
    else if (any >= 0) setCursor(any)
    setMessage(`${base}의 짝은 ${choice}입니다.`)
  }

  return (
    <LabShell
      id="dna"
      steps={[
        { key: 'open', label: '이중나선을 열기' },
        { key: 'pair', label: '여덟 칸의 짝을 모두 맞추기' },
      ]}
      controls={
        <>
          <button
            type="button"
            className="rounded-full bg-[#f6f3ea] px-4 py-2 text-sm font-semibold text-[#10211e]"
            onClick={() => {
              setOpen(true)
              engage('dna', 'open')
            }}
          >
            이중나선 열기
          </button>
          <Predict
            prompt="A의 맞은편에 오는 염기는?"
            choices={[
              { id: 't', label: 'T', ok: true, why: '아데닌은 티민과 수소결합 2개로 맞습니다. G는 C와 3개로 맞습니다.' },
              { id: 'g', label: 'G', ok: false, why: '폭과 수소결합이 맞지 않습니다. A-T, G-C만 쌍입니다.' },
              { id: 'c', label: 'C', ok: false, why: 'C의 짝은 G입니다.' },
            ]}
          />
        </>
      }
      result={
        <>
          {message}
          {correct
            ? ' 부모 가닥과 새 가닥이 만나 똑같은 서열의 DNA가 두 벌이 됩니다. 각 DNA는 옛 가닥 하나와 새 가닥 하나를 가지므로 반보존적 복제입니다.'
            : ''}
        </>
      }
    >
      <div className="space-y-3 rounded-2xl bg-[#0b1014] p-3">
        <div className="flex justify-between gap-1">
          {PARENT.map((base, index) => (
            <span key={index} className="grid h-10 flex-1 place-items-center rounded-md text-sm font-bold text-[#10211e]" style={{ background: BASE_COLOR[base], outline: open && cursor === index ? '2px solid #f6f3ea' : 'none' }}>
              {base}
            </span>
          ))}
        </div>
        <div className="text-center text-[11px] tracking-wide text-[#9fb1aa]">5′ 부모 가닥 · 아래는 3′ 방향의 새 가닥</div>
        <div className="flex justify-between gap-1">
          {PARENT.map((base, index) => {
            const value = open ? filled[index] : dnaComplement(base)
            return open ? (
              <button
                key={index}
                type="button"
                onClick={() => setCursor(index)}
                className="grid h-10 flex-1 place-items-center rounded-md text-sm font-bold"
                style={{
                  background: value ? BASE_COLOR[value] : '#24332e',
                  color: value ? '#10211e' : '#d7f3ef',
                  outline: cursor === index ? '2px solid #f6f3ea' : 'none',
                }}
              >
                {value ?? '·'}
              </button>
            ) : (
              <span key={index} className="grid h-10 flex-1 place-items-center rounded-md text-sm font-bold text-[#10211e]" style={{ background: BASE_COLOR[value ?? 'A'] }}>
                {value}
              </span>
            )
          })}
        </div>
        {open ? (
          <div className="grid grid-cols-4 gap-2 pt-1">
            {['A', 'T', 'G', 'C'].map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => pick(choice)}
                className="h-12 rounded-xl text-lg font-bold text-[#10211e]"
                style={{ background: BASE_COLOR[choice] }}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <Note>닫혀 있을 때는 이미 짝이 있습니다. 열면 강조된 칸의 짝을 고릅니다. 실제 중합효소는 5′→3′으로만 잇고, 반대 가닥은 짧은 조각으로 합성합니다. 이 화면은 그 규칙 중 염기쌍만 확인합니다.</Note>
    </LabShell>
  )
}

export function TranscriptionLab() {
  const { engage } = useProgress()
  const [dna, setDna] = useState(['A', 'T', 'G', 'G', 'C', 'C', 'T', 'T', 'T', 'A', 'A', 'A'])
  const [picked, setPicked] = useState(0)
  const mrna = toMrna(dna)
  const protein = translate(mrna)
  return (
    <LabShell
      id="transcription"
      steps={[
        { key: 'edit', label: 'DNA 염기를 바꿔 보기' },
        { key: 'codon', label: '아미노산 이름을 눌러 보기' },
      ]}
      controls={
        <div className="flex flex-wrap gap-2">
          {['ATGTTTTAA', 'ATGGCCTTTAAA'].map((preset) => (
            <button
              key={preset}
              type="button"
              className="rounded-full bg-white/10 px-3 py-2 text-xs"
              onClick={() => {
                const bases = preset.padEnd(12, 'A').slice(0, 12).split('')
                setDna(bases)
                engage('transcription', 'edit')
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      }
      result={
        <>
          코딩 가닥의 T를 U로 바꾸면 mRNA가 됩니다. 실제 효소는 반대편 주형 가닥을 읽지만 결과는 같습니다.
          세 글자가 코돈 하나이고, 종결 코돈을 만나면 사슬이 끝납니다. 코돈을 누르면 아미노산 이름을 확인할 수 있습니다.
        </>
      }
    >
      <div className="rounded-2xl bg-[#0b1014] p-3">
        <div className="mb-2 text-[11px] text-[#9fb1aa]">코딩 가닥 5′ → 3′. 칸을 누른 뒤 염기를 고르세요.</div>
        <div className="flex gap-1">
          {dna.map((base, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPicked(index)}
              className="grid h-9 flex-1 place-items-center rounded-md text-sm font-bold text-[#10211e]"
              style={{ background: BASE_COLOR[base], outline: picked === index ? '2px solid white' : 'none' }}
            >
              {base}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {['A', 'T', 'G', 'C'].map((base) => (
            <button
              key={base}
              type="button"
              className="rounded-full px-3 py-1 text-sm font-bold text-[#10211e]"
              style={{ background: BASE_COLOR[base] }}
              onClick={() => {
                setDna((current) => current.map((item, index) => (index === picked ? base : item)))
                engage('transcription', 'edit')
              }}
            >
              {base}
            </button>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-[#9fb1aa]">mRNA</div>
        <div className="mt-1 font-semibold tracking-widest text-[#f6f3ea]">{mrna.join('')}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {protein.map((item) => (
            <button
              key={item.codon}
              type="button"
              onClick={() => engage('transcription', 'codon')}
              className="rounded-2xl bg-white/10 px-3 py-2 text-left text-xs"
            >
              <div className="font-semibold">{item.codon}</div>
              <div>{item.aa === 'Stop' ? '종결' : `${item.aa} · ${AA_KO[item.aa]}`}</div>
            </button>
          ))}
        </div>
      </div>
      <Note>같은 아미노산에 코돈이 여러 개일 수 있습니다. 예를 들어 페닐알라닌은 UUU와 UUC입니다.</Note>
    </LabShell>
  )
}

function splitAlleles(geno: string) {
  return [geno[0], geno[1]]
}

export function MendelLab() {
  const { engage } = useProgress()
  const [p1, setP1] = useState('Yy')
  const [p2, setP2] = useState('Yy')
  const options = ['YY', 'Yy', 'yy']
  const cells = splitAlleles(p1).flatMap((a) => splitAlleles(p2).map((b) => (a + b).split('').sort().reverse().join('')))
  const yellow = cells.filter((cell) => cell.includes('Y')).length
  return (
    <LabShell
      id="mendel"
      steps={[
        { key: 'parent', label: '부모 유전자형을 고르기' },
        { key: 'hetero', label: '둘 다 Yy인 경우를 보기' },
      ]}
      controls={
        <>
          <div className="text-sm">부모 1</div>
          <div className="flex gap-2">
            {options.map((item) => (
              <button key={item} type="button" onClick={() => { setP1(item); engage('mendel', 'parent'); if (item === 'Yy' && p2 === 'Yy') engage('mendel', 'hetero') }} className={`rounded-full px-3 py-2 text-sm ${p1 === item ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>{item}</button>
            ))}
          </div>
          <div className="text-sm">부모 2</div>
          <div className="flex gap-2">
            {options.map((item) => (
              <button key={item} type="button" onClick={() => { setP2(item); engage('mendel', 'parent'); if (p1 === 'Yy' && item === 'Yy') engage('mendel', 'hetero') }} className={`rounded-full px-3 py-2 text-sm ${p2 === item ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>{item}</button>
            ))}
          </div>
        </>
      }
      result={
        <>
          네 칸은 각 부모가 대립유전자 하나를 1/2로 물려 줄 때의 조합입니다. 노랑은 {yellow}/4, 초록은 {4 - yellow}/4입니다.
          {p1 === 'Yy' && p2 === 'Yy' ? ' Yy × Yy이면 유전자형은 YY 1, Yy 2, yy 1이고 표현형은 노랑 3 : 초록 1입니다. 자손 수가 적으면 이 비율에서 흔들려도 이상하지 않습니다.' : ' Y가 하나라도 있으면 이 완전 우성 모형에서는 노란 씨입니다.'}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {cells.map((cell, index) => (
          <div key={index} className={`rounded-2xl px-3 py-4 text-center font-semibold ${cell.includes('Y') ? 'bg-[#f0b429] text-[#1c1915]' : 'bg-[#1f8a80] text-white'}`}>
            {cell}
            <div className="text-xs font-medium">{cell.includes('Y') ? '노랑' : '초록'}</div>
          </div>
        ))}
      </div>
      <Note>Y는 노랑 우성, y는 초록 열성인 완두 씨 색깔 모형입니다. 우성은 더 강하거나 더 흔하다는 뜻이 아닙니다.</Note>
    </LabShell>
  )
}

export function SelectionLab() {
  const { engage } = useProgress()
  const [env, setEnv] = useState<'sand' | 'rock'>('sand')
  const [pop, setPop] = useState<number[]>(() => Array.from({ length: 40 }, (_, index) => (index < 20 ? 0 : 1)))
  const [history, setHistory] = useState<{ gen: number; dark: number }[]>([{ gen: 0, dark: 50 }])
  const dark = pop.filter((gene) => gene === 1).length / pop.length

  const next = (times: number) => {
    let current = pop
    const points = [...history]
    for (let step = 0; step < times; step += 1) {
      const fit = (gene: number) => (env === 'sand' ? (gene === 0 ? 0.9 : 0.42) : gene === 0 ? 0.38 : 0.9)
      const survivors = current.filter((gene) => Math.random() < fit(gene))
      const pool = survivors.length ? survivors : current
      current = Array.from({ length: current.length }, () => pool[Math.floor(Math.random() * pool.length)])
      points.push({ gen: points.length, dark: Math.round((current.filter((gene) => gene === 1).length / current.length) * 100) })
    }
    setPop(current)
    setHistory(points.slice(-40))
    engage('selection', 'gen')
  }

  return (
    <LabShell
      id="selection"
      steps={[
        { key: 'env', label: '환경을 바꿔 보기' },
        { key: 'gen', label: '세대를 진행하기' },
      ]}
      controls={
        <>
          <div className="flex gap-2">
            <button type="button" className={`rounded-full px-3 py-2 text-sm ${env === 'sand' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`} onClick={() => { setEnv('sand'); engage('selection', 'env') }}>밝은 모래</button>
            <button type="button" className={`rounded-full px-3 py-2 text-sm ${env === 'rock' ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`} onClick={() => { setEnv('rock'); engage('selection', 'env') }}>검은 바위</button>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-[#f6f3ea] px-3 py-2 text-sm font-semibold text-[#10211e]" onClick={() => next(1)}>다음 세대</button>
            <button type="button" className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => next(10)}>+10세대</button>
          </div>
        </>
      }
      result={
        <>
          어두운 개체의 비율은 {Math.round(dark * 100)}%입니다. {env === 'sand' ? '밝은 모래에서는 밝은 딱정벌레가 덜 잡혀 자손을 더 남깁니다.' : '검은 바위에서는 어두운 개체가 더 잘 남습니다.'}
          {' '}개체는 색을 스스로 바꾸지 않습니다. 이미 있던 차이 중에서 더 많이 살아남은 형질이 다음 세대에 늘어납니다. 마흔 마리처럼 작은 무리에서는 우연한 죽음도 비율을 흔듭니다.
        </>
      }
    >
      <div className="flex flex-wrap gap-1 rounded-2xl bg-[#0b1014] p-3">
        {pop.map((gene, index) => (
          <span key={index} className="h-4 w-4 rounded-full" style={{ background: gene === 0 ? '#d6c4a2' : '#2a2622', outline: '1px solid #9fb1aa' }} />
        ))}
      </div>
      <ScienceChart data={history} xKey="gen" lines={[{ key: 'dark', name: '어두운 비율 %', color: '#f6f3ea' }]} />
      <Note>적합도는 모래에서 밝음 0.90·어두움 0.42, 바위에서는 그 반대로 두었습니다. 생존한 개체가 다음 세대를 무작위로 채웁니다.</Note>
    </LabShell>
  )
}
