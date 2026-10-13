import type { Theory } from '../types'
import { physicsTheories } from './theories/physics'
import { chemistryTheories } from './theories/chemistry'
import { biologyTheories } from './theories/biology'
import { analysisTheories, earthTheories, materialsTheories, semiconductorTheories } from './theories/rest'

export const THEORIES: Theory[] = [
  ...physicsTheories,
  ...chemistryTheories,
  ...biologyTheories,
  ...earthTheories,
  ...materialsTheories,
  ...analysisTheories,
  ...semiconductorTheories,
]

export function theoryById(id: string) {
  return THEORIES.find((theory) => theory.id === id)
}

export function theoriesIn(category: string) {
  return THEORIES.filter((theory) => theory.category === category)
}

if (import.meta.env.DEV) {
  const ids = new Set(THEORIES.map((theory) => theory.id))
  if (ids.size !== 40) console.warn('이론 개수', THEORIES.length)
  for (const theory of THEORIES) {
    for (const related of theory.related) {
      if (!ids.has(related)) console.warn('없는 연결', theory.id, related)
    }
  }
}
