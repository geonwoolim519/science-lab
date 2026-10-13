import { CATEGORIES } from './categories'
import { THEORIES } from './theories'
import type { Theory } from '../types'

export function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, '').replace(/·/g, '')
}

export function searchTheories(query: string): Theory[] {
  const q = normalize(query)
  if (!q) return THEORIES
  return THEORIES.filter((theory) => {
    const category = CATEGORIES.find((item) => item.id === theory.category)
    const blob = normalize(
      [
        theory.title,
        theory.tagline,
        theory.glance,
        theory.basic,
        theory.university,
        theory.deep,
        category?.name ?? '',
        ...theory.keywords,
        ...theory.concepts.flatMap((concept) => [concept.title, concept.body]),
        ...theory.applications.flatMap((item) => [item.title, item.body]),
      ].join(' '),
    )
    return blob.includes(q)
  })
}
