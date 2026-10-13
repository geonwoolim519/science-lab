export type CategoryId =
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'earth'
  | 'materials'
  | 'analysis'
  | 'semiconductor'

export type LevelId = 'basic' | 'university' | 'deep'

export type Theory = {
  id: string
  category: CategoryId
  title: string
  tagline: string
  level: 'basic' | 'university'
  keywords: string[]
  glance: string
  analogy?: { story: string; limit: string }
  basic: string
  university: string
  concepts: { title: string; body: string }[]
  applications: { title: string; body: string }[]
  formula?: {
    tex: string
    symbols: { sym: string; meaning: string }[]
    plain: string
  }
  deep: string
  related: string[]
}
