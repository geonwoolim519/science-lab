export type ElCat =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'

export type ChemElement = {
  z: number
  sym: string
  name: string
  mass: number
  period: number
  group: number
  cat: ElCat
  radius: number
  en: number | null
  config: string
}

const RAW = `
1,H,수소,1.008,1,1,nonmetal,31,2.2,1s¹
2,He,헬륨,4.0026,1,18,noble,28,,1s²
3,Li,리튬,6.94,2,1,alkali,128,0.98,[He] 2s¹
4,Be,베릴륨,9.0122,2,2,alkaline,96,1.57,[He] 2s²
5,B,붕소,10.81,2,13,metalloid,84,2.04,[He] 2s² 2p¹
6,C,탄소,12.011,2,14,nonmetal,76,2.55,[He] 2s² 2p²
7,N,질소,14.007,2,15,nonmetal,71,3.04,[He] 2s² 2p³
8,O,산소,15.999,2,16,nonmetal,66,3.44,[He] 2s² 2p⁴
9,F,플루오린,18.998,2,17,halogen,57,3.98,[He] 2s² 2p⁵
10,Ne,네온,20.18,2,18,noble,58,,[He] 2s² 2p⁶
11,Na,나트륨,22.99,3,1,alkali,166,0.93,[Ne] 3s¹
12,Mg,마그네슘,24.305,3,2,alkaline,141,1.31,[Ne] 3s²
13,Al,알루미늄,26.982,3,13,post,121,1.61,[Ne] 3s² 3p¹
14,Si,규소,28.085,3,14,metalloid,111,1.9,[Ne] 3s² 3p²
15,P,인,30.974,3,15,nonmetal,107,2.19,[Ne] 3s² 3p³
16,S,황,32.06,3,16,nonmetal,105,2.58,[Ne] 3s² 3p⁴
17,Cl,염소,35.45,3,17,halogen,102,3.16,[Ne] 3s² 3p⁵
18,Ar,아르곤,39.948,3,18,noble,106,,[Ne] 3s² 3p⁶
19,K,칼륨,39.098,4,1,alkali,203,0.82,[Ar] 4s¹
20,Ca,칼슘,40.078,4,2,alkaline,176,1,[Ar] 4s²
21,Sc,스칸듐,44.956,4,3,transition,170,1.36,[Ar] 4s² 3d¹
22,Ti,타이타늄,47.867,4,4,transition,160,1.54,[Ar] 4s² 3d²
23,V,바나듐,50.942,4,5,transition,153,1.63,[Ar] 4s² 3d³
24,Cr,크로뮴,51.996,4,6,transition,139,1.66,[Ar] 4s¹ 3d⁵
25,Mn,망가니즈,54.938,4,7,transition,139,1.55,[Ar] 4s² 3d⁵
26,Fe,철,55.845,4,8,transition,132,1.83,[Ar] 4s² 3d⁶
27,Co,코발트,58.933,4,9,transition,126,1.88,[Ar] 4s² 3d⁷
28,Ni,니켈,58.693,4,10,transition,124,1.91,[Ar] 4s² 3d⁸
29,Cu,구리,63.546,4,11,transition,132,1.9,[Ar] 4s¹ 3d¹⁰
30,Zn,아연,65.38,4,12,transition,122,1.65,[Ar] 4s² 3d¹⁰
31,Ga,갈륨,69.723,4,13,post,122,1.81,[Ar] 4s² 3d¹⁰ 4p¹
32,Ge,저마늄,72.63,4,14,metalloid,120,2.01,[Ar] 4s² 3d¹⁰ 4p²
33,As,비소,74.922,4,15,metalloid,119,2.18,[Ar] 4s² 3d¹⁰ 4p³
34,Se,셀레늄,78.971,4,16,nonmetal,120,2.55,[Ar] 4s² 3d¹⁰ 4p⁴
35,Br,브로민,79.904,4,17,halogen,120,2.96,[Ar] 4s² 3d¹⁰ 4p⁵
36,Kr,크립톤,83.798,4,18,noble,116,,[Ar] 4s² 3d¹⁰ 4p⁶
37,Rb,루비듐,85.468,5,1,alkali,220,0.82,[Kr] 5s¹
38,Sr,스트론튬,87.62,5,2,alkaline,195,0.95,[Kr] 5s²
39,Y,이트륨,88.906,5,3,transition,190,1.22,[Kr] 5s² 4d¹
40,Zr,지르코늄,91.224,5,4,transition,175,1.33,[Kr] 5s² 4d²
41,Nb,나이오븀,92.906,5,5,transition,164,1.6,[Kr] 5s¹ 4d⁴
42,Mo,몰리브데넘,95.95,5,6,transition,154,2.16,[Kr] 5s¹ 4d⁵
43,Tc,테크네튬,98,5,7,transition,147,1.9,[Kr] 5s² 4d⁵
44,Ru,루테늄,101.07,5,8,transition,146,2.2,[Kr] 5s¹ 4d⁷
45,Rh,로듐,102.91,5,9,transition,142,2.28,[Kr] 5s¹ 4d⁸
46,Pd,팔라듐,106.42,5,10,transition,139,2.2,[Kr] 4d¹⁰
47,Ag,은,107.87,5,11,transition,145,1.93,[Kr] 5s¹ 4d¹⁰
48,Cd,카드뮴,112.41,5,12,transition,144,1.69,[Kr] 5s² 4d¹⁰
49,In,인듐,114.82,5,13,post,142,1.78,[Kr] 5s² 4d¹⁰ 5p¹
50,Sn,주석,118.71,5,14,post,139,1.96,[Kr] 5s² 4d¹⁰ 5p²
51,Sb,안티모니,121.76,5,15,metalloid,139,2.05,[Kr] 5s² 4d¹⁰ 5p³
52,Te,텔루륨,127.6,5,16,metalloid,138,2.1,[Kr] 5s² 4d¹⁰ 5p⁴
53,I,아이오딘,126.9,5,17,halogen,139,2.66,[Kr] 5s² 4d¹⁰ 5p⁵
54,Xe,제논,131.29,5,18,noble,140,,[Kr] 5s² 4d¹⁰ 5p⁶
`

export const ELEMENTS: ChemElement[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [z, sym, name, mass, period, group, cat, radius, en, config] = line.split(',')
    return {
      z: Number(z),
      sym,
      name,
      mass: Number(mass),
      period: Number(period),
      group: Number(group),
      cat: cat as ElCat,
      radius: Number(radius),
      en: en ? Number(en) : null,
      config,
    }
  })

export const CAT_LABEL: Record<ElCat, string> = {
  alkali: '알칼리 금속',
  alkaline: '알칼리 토금속',
  transition: '전이 금속',
  post: '전이후 금속',
  metalloid: '준금속',
  nonmetal: '비금속',
  halogen: '할로젠',
  noble: '비활성 기체',
}

export const CAT_COLOR: Record<ElCat, string> = {
  alkali: '#e07a5f',
  alkaline: '#e0b15a',
  transition: '#3f8f78',
  post: '#5d87b0',
  metalloid: '#8a6a4f',
  nonmetal: '#3d7f86',
  halogen: '#c45b86',
  noble: '#7d6b9d',
}

export const COMMON_NEUTRONS: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
  7: 7,
  8: 8,
  9: 10,
  10: 10,
  11: 12,
  12: 12,
  13: 14,
  14: 14,
  15: 16,
  16: 16,
  17: 18,
  18: 22,
  19: 20,
  20: 20,
}

const SPEC = [
  { id: '1s', boxes: 1 },
  { id: '2s', boxes: 1 },
  { id: '2p', boxes: 3 },
  { id: '3s', boxes: 1 },
  { id: '3p', boxes: 3 },
  { id: '4s', boxes: 1 },
  { id: '3d', boxes: 5 },
  { id: '4p', boxes: 3 },
]

export type OrbitalFill = { id: string; electrons: number[] }

function hund(count: number, boxes: number) {
  const electrons = Array.from({ length: boxes }, () => 0)
  let left = count
  for (let index = 0; index < boxes && left > 0; index += 1) {
    electrons[index] = 1
    left -= 1
  }
  for (let index = 0; index < boxes && left > 0; index += 1) {
    electrons[index] = 2
    left -= 1
  }
  return electrons
}

export function fillOrbitals(z: number): OrbitalFill[] {
  const counts: Record<string, number> = {}
  let left = z
  for (const orbital of SPEC) {
    const take = Math.min(left, orbital.boxes * 2)
    counts[orbital.id] = take
    left -= take
  }
  if (z === 24) {
    counts['4s'] = 1
    counts['3d'] = 5
  }
  if (z === 29) {
    counts['4s'] = 1
    counts['3d'] = 10
  }
  return SPEC.map((orbital) => ({
    id: orbital.id,
    electrons: hund(counts[orbital.id] ?? 0, orbital.boxes),
  })).filter((orbital) => orbital.electrons.some((count) => count > 0))
}

export function elementByZ(z: number) {
  return ELEMENTS.find((element) => element.z === z)
}
