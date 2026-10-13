import { useState } from 'react'
import { Slider } from '../components/ui'
import { useProgress } from '../progress'
import { fixed } from './format'
import { LabShell, Note, Stage } from './kit'

type Boundary = 'divergent' | 'ocean' | 'continent' | 'transform'

export function PlatesLab() {
  const { engage } = useProgress()
  const [mode, setMode] = useState<Boundary>('divergent')
  const info: Record<Boundary, string> = {
    divergent: '판이 벌어지면 마그마가 올라와 새 지각이 됩니다. 해령이나 열곡, 현무암질 화산, 얕은 지진이 특징입니다.',
    ocean: '해양판이 대륙판 아래로 들어가면 해구와 화산호가 생깁니다. 지진은 깊어질 수 있습니다.',
    continent: '대륙끼리 모이면 밀도가 비슷해 깊게 들어가지 못하고 습곡 산맥이 높아집니다. 화산은 드뭅니다.',
    transform: '판이 서로 스치면 새 지각은 거의 없고 지진이 주된 결과입니다.',
  }
  return (
    <LabShell
      id="plates"
      steps={[
        { key: 'drag', label: '오른쪽 판을 끌어 보기' },
        { key: 'mode', label: '경계 유형을 바꿔 보기' },
      ]}
      controls={
        <div className="flex flex-wrap gap-2">
          {[
            ['divergent', '발산'],
            ['ocean', '해양-대륙'],
            ['continent', '대륙-대륙'],
            ['transform', '보존'],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => { setMode(id as Boundary); engage('plates', 'mode') }} className={`rounded-full px-3 py-2 text-sm ${mode === id ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
              {label}
            </button>
          ))}
        </div>
      }
      result={<>{info[mode]} 모든 경계가 화산을 만드는 것은 아닙니다. 판은 1년에 수 센티미터 규모로 움직이며, 구동에는 섭입하는 판의 무게와 맨틀의 흐름이 함께 작용합니다.</>}
    >
      <Stage
        height={220}
        draw={(ctx, w, h) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const y = h * 0.45
          ctx.fillStyle = '#c47b2b'
          if (mode === 'divergent') {
            ctx.fillRect(20, y, w * 0.38, 36)
            ctx.fillRect(w * 0.62, y, w * 0.3, 36)
            ctx.fillStyle = '#e07a5f'
            ctx.beginPath()
            ctx.moveTo(w / 2, y + 50)
            ctx.lineTo(w / 2 - 16, y)
            ctx.lineTo(w / 2 + 16, y)
            ctx.fill()
          } else if (mode === 'ocean') {
            ctx.fillStyle = '#3a7ca5'
            ctx.fillRect(16, y + 20, w * 0.45, 28)
            ctx.fillStyle = '#c47b2b'
            ctx.beginPath()
            ctx.moveTo(w * 0.4, y + 48)
            ctx.lineTo(w * 0.55, y - 10)
            ctx.lineTo(w - 16, y - 10)
            ctx.lineTo(w - 16, y + 40)
            ctx.fill()
            ctx.fillStyle = '#e07a5f'
            ctx.beginPath()
            ctx.arc(w * 0.72, y - 24, 10, 0, Math.PI * 2)
            ctx.fill()
          } else if (mode === 'continent') {
            ctx.fillStyle = '#d7b07a'
            ctx.beginPath()
            ctx.moveTo(20, y + 40)
            ctx.lineTo(w * 0.35, y + 40)
            ctx.lineTo(w * 0.5, y - 36)
            ctx.lineTo(w * 0.65, y + 40)
            ctx.lineTo(w - 20, y + 40)
            ctx.fill()
          } else {
            ctx.fillStyle = '#c47b2b'
            ctx.fillRect(16, y, w / 2 - 20, 34)
            ctx.fillStyle = '#8d6a45'
            ctx.fillRect(w / 2 + 4, y + 18, w / 2 - 24, 34)
          }
          ctx.fillStyle = '#9fb1aa'
          ctx.font = '12px sans-serif'
          ctx.fillText('판을 버튼으로 벌리고, 모으고, 스치게 할 수 있습니다.', 16, h - 16)
        }}
      />
      <div
        className="rounded-2xl bg-[#17211d] p-3 text-sm"
        onPointerDown={() => engage('plates', 'drag')}
      >
        오른쪽 판을 이 칸에서 좌우로 밀어 보세요. 경계 유형 버튼이 단면을 바꿉니다.
        <input
          type="range"
          min={-40}
          max={40}
          defaultValue={0}
          aria-label="판 이동"
          onChange={(event) => {
            const value = Number(event.target.value)
            engage('plates', 'drag')
            if (value > 15) setMode('divergent')
            else if (value < -15) setMode('ocean')
            else setMode('transform')
          }}
          className="mt-2"
        />
      </div>
      <Note>슬라이더를 벌리면 발산, 겹치면 해양-대륙 수렴, 가운데면 스침에 가깝게 둡니다. 대륙-대륙은 버튼으로 고릅니다.</Note>
    </LabShell>
  )
}

export function SeismicLab() {
  const { engage } = useProgress()
  const [liquid, setLiquid] = useState(true)
  const [crust, setCrust] = useState(35)
  const [sent, setSent] = useState<'both' | 'p' | 's'>('both')
  return (
    <LabShell
      id="seismic"
      steps={[
        { key: 'send', label: 'P파와 S파를 보내 보기' },
        { key: 'liquid', label: '외핵이 액체인지 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="지각 두께" min={8} max={70} step={1} unit="km" value={crust} onChange={(value) => { setCrust(value); engage('seismic', 'crust') }} />
          <div className="flex flex-wrap gap-2">
            {(['both', 'p', 's'] as const).map((item) => (
              <button key={item} type="button" onClick={() => { setSent(item); engage('seismic', 'send') }} className={`rounded-full px-3 py-2 text-sm ${sent === item ? 'bg-[#f6f3ea] text-[#10211e]' : 'bg-white/10'}`}>
                {item === 'both' ? '둘 다' : item === 'p' ? 'P파' : 'S파'}
              </button>
            ))}
            <button type="button" onClick={() => { setLiquid((value) => !value); engage('seismic', 'liquid') }} className="rounded-full bg-white/10 px-3 py-2 text-sm">
              외핵 {liquid ? '액체' : '고체로 가정'}
            </button>
          </div>
        </>
      }
      result={
        <>
          같은 층에서 P파가 S파보다 빠릅니다. 지각 대표값으로 P 6 km/s, S 3.5 km/s를 두었습니다.
          {liquid
            ? ' 외핵이 액체이면 S파는 전단을 전달하지 못해 멈춥니다. P파는 속력이 바뀐 채 계속 갑니다. 이 그림자가 외핵이 액체라는 증거입니다.'
            : ' 외핵을 고체로 가정하면 S파도 통과합니다. 실제 지구는 그렇지 않습니다.'}
        </>
      }
    >
      <Stage
        height={230}
        draw={(ctx, w, h, time) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          const layers = [
            { name: `지각 ${crust} km`, h: 28, p: 6, s: 3.5, color: '#8d6a45' },
            { name: '맨틀', h: 70, p: 10, s: 5.6, color: '#c47b2b' },
            { name: liquid ? '외핵 액체' : '외핵 가정', h: 54, p: 8, s: liquid ? 0 : 4, color: '#e07a5f' },
            { name: '내핵', h: 36, p: 11, s: liquid ? 0 : 3.5, color: '#f0b429' },
          ]
          let y = 16
          const progress = (time % 4) / 4
          layers.forEach((layer) => {
            ctx.fillStyle = layer.color
            ctx.globalAlpha = 0.85
            ctx.fillRect(16, y, w - 32, layer.h)
            ctx.globalAlpha = 1
            ctx.fillStyle = '#10211e'
            ctx.font = '12px sans-serif'
            ctx.fillText(`${layer.name}  P ${layer.p} / S ${layer.s}`, 24, y + 18)
            y += layer.h
          })
          const travel = (kind: 'p' | 's') => {
            let yy = 16
            let remain = progress * 28
            for (const layer of layers) {
              const speed = kind === 'p' ? layer.p : layer.s
              if (speed === 0) return yy
              const need = layer.h / speed
              if (remain <= need) return yy + remain * speed
              remain -= need
              yy += layer.h
            }
            return yy
          }
          if (sent !== 's') {
            ctx.fillStyle = '#f6f3ea'
            ctx.beginPath()
            ctx.arc(w * 0.72, travel('p'), 6, 0, Math.PI * 2)
            ctx.fill()
          }
          if (sent !== 'p') {
            ctx.fillStyle = '#10211e'
            ctx.beginPath()
            ctx.arc(w * 0.82, travel('s'), 6, 0, Math.PI * 2)
            ctx.fill()
          }
        }}
      />
      <Note>흰 점은 P, 검은 점은 S입니다. 속력은 층을 구분하는 대표값이고, 실제 맨틀은 깊이에 따라 더 빨라집니다. 표면파는 따로 표시하지 않았습니다.</Note>
    </LabShell>
  )
}

export function VolcanoLab() {
  const { engage } = useProgress()
  const [viscosity, setViscosity] = useState(0.3)
  const [gas, setGas] = useState(0.4)
  const [pressure, setPressure] = useState(0.5)
  const style = viscosity < 0.45 && gas < 0.5 ? '용암류 · 순상화산에 가깝습니다' : viscosity < 0.45 ? '분천 · 묽지만 기체가 뿜어 나옵니다' : gas < 0.45 ? '용암돔 · 끈끈해서 잘 흐르지 않습니다' : '폭발적 분연 · 기체가 빠지지 못합니다'
  return (
    <LabShell
      id="volcano"
      steps={[
        { key: 'visc', label: '점도를 바꿔 보기' },
        { key: 'gas', label: '기체량을 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="마그마 점도" min={0} max={1} step={0.01} value={viscosity} display={fixed(viscosity, 2)} onChange={(value) => { setViscosity(value); engage('volcano', 'visc') }} />
          <Slider label="기체량" min={0} max={1} step={0.01} value={gas} display={fixed(gas, 2)} onChange={(value) => { setGas(value); engage('volcano', 'gas') }} />
          <Slider label="압력" min={0} max={1} step={0.01} value={pressure} display={fixed(pressure, 2)} onChange={(value) => { setPressure(value); engage('volcano', 'pressure') }} />
        </>
      }
      result={
        <>
          지금 분출 양식은 {style}. 점도는 실리카가 많을수록 높아지고, 압력은 분출의 세기에 기여합니다.
          이 세 슬라이더로 화산폭발지수 같은 숫자를 계산하지는 않습니다. 양식의 차이만 구분합니다.
        </>
      }
    >
      <Stage
        height={220}
        draw={(ctx, w, h, time) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          ctx.fillStyle = '#5c4636'
          ctx.beginPath()
          ctx.moveTo(w * 0.2, h - 20)
          ctx.lineTo(w * 0.5, viscosity > 0.5 ? h * 0.42 : h * 0.55)
          ctx.lineTo(w * 0.8, h - 20)
          ctx.fill()
          ctx.fillStyle = '#e07a5f'
          if (viscosity < 0.45) {
            ctx.beginPath()
            ctx.moveTo(w * 0.5, h * 0.58)
            ctx.lineTo(w * 0.62, h - 20)
            ctx.lineTo(w * 0.48, h - 20)
            ctx.fill()
          }
          if (gas > 0.45) {
            for (let i = 0; i < 8; i += 1) {
              const y = ((time * (40 + pressure * 80) + i * 20) % 120)
              ctx.globalAlpha = 0.7
              ctx.fillStyle = viscosity > 0.45 ? '#d7d3cb' : '#f0b429'
              ctx.beginPath()
              ctx.arc(w * 0.5 + Math.sin(i + time) * 10 * pressure, h * 0.5 - y, 4 + gas * 4, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.globalAlpha = 1
          }
        }}
      />
      <Note>낮은 점도의 넓은 산은 순상화산, 높은 점도는 가파른 산에 가깝게 그렸습니다. 기둥은 기체가 빠져나오는 모습입니다.</Note>
    </LabShell>
  )
}

export function WaterLab() {
  const { engage } = useProgress()
  const [temp, setTemp] = useState(20)
  const [sun, setSun] = useState(1)
  const vapor = Math.pow(2, (temp - 10) / 10)
  const cycle = sun * (0.4 + vapor * 0.35)
  return (
    <LabShell
      id="water"
      steps={[
        { key: 'temp', label: '온도를 바꿔 보기' },
        { key: 'sun', label: '태양 에너지를 바꿔 보기' },
      ]}
      controls={
        <>
          <Slider label="기온" min={-5} max={40} step={1} unit="°C" value={temp} onChange={(value) => { setTemp(value); engage('water', 'temp') }} />
          <Slider label="태양 에너지" min={0.5} max={1.5} step={0.05} value={sun} display={fixed(sun, 2)} onChange={(value) => { setSun(value); engage('water', 'sun') }} />
        </>
      }
      result={
        <>
          10°C를 1로 둔 포화 수증기 지수는 {fixed(vapor, 2)}입니다. 따뜻한 공기는 더 많은 수증기를 품은 뒤에 응결합니다.
          순환 속도 지수는 {fixed(cycle, 2)}입니다. 행성 전체가 평형이면 긴 평균으로 증발과 강수는 맞지만, 따뜻하면 순환이 빨라지고 한 번의 강수가 더 세질 수 있습니다.
          {temp < 0 ? ' 영하에서는 강수의 일부가 눈이 됩니다.' : ''} 숫자는 mm가 아니라 상대 지수입니다.
        </>
      }
    >
      <Stage
        height={200}
        draw={(ctx, w, h, time) => {
          ctx.fillStyle = '#0b1014'
          ctx.fillRect(0, 0, w, h)
          ctx.fillStyle = '#3a7ca5'
          ctx.fillRect(0, h * 0.72, w, h * 0.28)
          ctx.fillStyle = '#8d6a45'
          ctx.fillRect(w * 0.55, h * 0.62, w * 0.45, h * 0.12)
          ctx.fillStyle = `rgba(240,180,41,${0.3 + sun * 0.4})`
          ctx.beginPath()
          ctx.arc(48, 42, 16 + sun * 6, 0, Math.PI * 2)
          ctx.fill()
          const drops = Math.round(4 + cycle * 4)
          for (let i = 0; i < drops; i += 1) {
            const phase = (time * cycle + i / drops) % 1
            const x = 40 + phase * (w * 0.7)
            const y = h * 0.75 - Math.sin(phase * Math.PI) * (40 + vapor * 20)
            ctx.fillStyle = temp < 0 ? '#f6f3ea' : '#9dede2'
            ctx.fillRect(x, y, temp < 0 ? 3 : 2, temp < 0 ? 3 : 8)
          }
        }}
      />
      <Note>파란 영역은 바다, 갈색은 육지입니다. 방울은 증발했다가 다시 떨어지는 순환을 단순화한 것입니다.</Note>
    </LabShell>
  )
}

export function GreenhouseLab() {
  const { engage } = useProgress()
  const [co2, setCo2] = useState(420)
  const [ch4, setCh4] = useState(1900)
  const absorbed = (1361 * 0.7) / 4
  const bare = (absorbed / 5.670374e-8) ** 0.25 - 273.15
  const co2Force = 5.35 * Math.log(co2 / 280)
  const ch4Force = 0.036 * (Math.sqrt(ch4) - Math.sqrt(722)) * 0.85
  const delta = (3 / 3.7) * (co2Force + ch4Force)
  return (
    <LabShell
      id="greenhouse"
      steps={[
        { key: 'co2', label: '이산화탄소 농도를 바꿔 보기' },
        { key: 'bare', label: '대기 없는 온도와 비교하기' },
      ]}
      controls={
        <>
          <Slider label="CO₂" min={180} max={800} step={5} unit="ppm" value={co2} onChange={(value) => { setCo2(value); engage('greenhouse', 'co2'); engage('greenhouse', 'bare') }} />
          <Slider label="CH₄" min={700} max={3000} step={20} unit="ppb" value={ch4} onChange={(value) => { setCh4(value); engage('greenhouse', 'ch4') }} />
        </>
      }
      result={
        <>
          반사율 0.3이면 대기가 없을 때의 유효 온도는 약 {fixed(bare, 1)}°C입니다. 자연 온실효과가 지표를 약 14°C 근처까지 데우므로, 그 차이는 대략 30°C가 넘습니다.
          280 ppm, 메탄 722 ppb를 기준으로 CO₂ 강제력은 {fixed(co2Force, 2)} W/m², 메탄의 단순 추정은 {fixed(ch4Force, 2)} W/m²입니다.
          2배당 3°C라는 평형 민감도 모형에서는 추가 온도가 약 {fixed(delta, 2)}°C입니다. 지금 관측된 상승은 바다가 열을 흡수하고 에어로졸이 햇빛을 가려 이 평형값과 다를 수 있습니다.
          온실효과 자체는 지구를 살 만하게 하는 과정이고, 온실기체 증가가 그 효과를 더하는 것이 온난화입니다.
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#0b1014] p-4">
          <div className="text-xs text-[#9fb1aa]">대기 없음</div>
          <div className="mt-1 text-2xl font-semibold">{fixed(bare, 1)}°C</div>
          <p className="mt-2 text-xs leading-5 text-[#d5e4de]">흡수한 태양 복사 {fixed(absorbed, 0)} W/m²만 내보낼 때의 온도입니다.</p>
        </div>
        <div className="rounded-2xl bg-[#0b1014] p-4">
          <div className="text-xs text-[#9fb1aa]">강화된 온실의 추가 평형</div>
          <div className="mt-1 text-2xl font-semibold">+{fixed(delta, 2)}°C</div>
          <p className="mt-2 text-xs leading-5 text-[#d5e4de]">산업화 전 기준의 모형값입니다. 자연 온실효과 약 +33°C와 단위가 다릅니다.</p>
        </div>
      </div>
      <Note>메탄 항은 √농도 차이에 0.85를 곱한 교육용 근사이고, 겹침을 모두 푼 IPCC 계산은 아닙니다. 수증기는 강력한 온실기체이지만 여기서는 기온이 오르면 따라 늘어나는 되먹임으로 민감도 안에 들어 있습니다.</Note>
    </LabShell>
  )
}
