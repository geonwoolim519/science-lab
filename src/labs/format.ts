const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'

function sup(exp: number) {
  return String(exp)
    .replace('-', '⁻')
    .replace(/\d/g, (digit) => SUP[Number(digit)] ?? digit)
}

export function sci(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '—'
  const sign = value < 0 ? '−' : ''
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 0.01 && abs < 10000) {
    return sign + abs.toLocaleString('en-US', { maximumFractionDigits: digits })
  }
  const exp = Math.floor(Math.log10(abs))
  const mant = abs / 10 ** exp
  return `${sign}${mant.toFixed(digits)}×10${sup(exp)}`
}

export function fixed(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '—'
  const sign = value < 0 ? '−' : ''
  return sign + Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
