export const AA_KO: Record<string, string> = {
  Phe: '페닐알라닌',
  Leu: '류신',
  Ser: '세린',
  Tyr: '티로신',
  Cys: '시스테인',
  Trp: '트립토판',
  Pro: '프롤린',
  His: '히스티딘',
  Gln: '글루타민',
  Arg: '아르지닌',
  Ile: '아이소류신',
  Met: '메티오닌',
  Thr: '트레오닌',
  Asn: '아스파라긴',
  Lys: '라이신',
  Val: '발린',
  Ala: '알라닌',
  Asp: '아스파르트산',
  Glu: '글루탐산',
  Gly: '글리신',
  Stop: '종결',
}

export const CODONS: Record<string, string> = {
  UUU: 'Phe', UUC: 'Phe', UUA: 'Leu', UUG: 'Leu',
  UCU: 'Ser', UCC: 'Ser', UCA: 'Ser', UCG: 'Ser',
  UAU: 'Tyr', UAC: 'Tyr', UAA: 'Stop', UAG: 'Stop',
  UGU: 'Cys', UGC: 'Cys', UGA: 'Stop', UGG: 'Trp',
  CUU: 'Leu', CUC: 'Leu', CUA: 'Leu', CUG: 'Leu',
  CCU: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro',
  CAU: 'His', CAC: 'His', CAA: 'Gln', CAG: 'Gln',
  CGU: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg',
  AUU: 'Ile', AUC: 'Ile', AUA: 'Ile', AUG: 'Met',
  ACU: 'Thr', ACC: 'Thr', ACA: 'Thr', ACG: 'Thr',
  AAU: 'Asn', AAC: 'Asn', AAA: 'Lys', AAG: 'Lys',
  AGU: 'Ser', AGC: 'Ser', AGA: 'Arg', AGG: 'Arg',
  GUU: 'Val', GUC: 'Val', GUA: 'Val', GUG: 'Val',
  GCU: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala',
  GAU: 'Asp', GAC: 'Asp', GAA: 'Glu', GAG: 'Glu',
  GGU: 'Gly', GGC: 'Gly', GGA: 'Gly', GGG: 'Gly',
}

const COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' }

export function dnaComplement(base: string) {
  return COMPLEMENT[base] ?? 'N'
}

export function toMrna(coding: string[]) {
  return coding.map((base) => (base === 'T' ? 'U' : base))
}

export function translate(mrna: string[]) {
  const codons: { codon: string; aa: string }[] = []
  for (let index = 0; index + 2 < mrna.length; index += 3) {
    const codon = mrna.slice(index, index + 3).join('')
    const aa = CODONS[codon] ?? '?'
    codons.push({ codon, aa })
    if (aa === 'Stop') break
  }
  return codons
}
