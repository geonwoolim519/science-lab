import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type State = {
  completed: string[]
  engaged: Record<string, string[]>
}

const KEY = 'science-lab-progress-v1'
const EMPTY: State = { completed: [], engaged: {} }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<State>
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id) => typeof id === 'string') : [],
      engaged: parsed.engaged && typeof parsed.engaged === 'object' ? parsed.engaged : {},
    }
  } catch {
    return EMPTY
  }
}

type ProgressApi = {
  completed: string[]
  engaged: Record<string, string[]>
  engage: (id: string, key: string) => void
  complete: (id: string) => void
  resetOne: (id: string) => void
  resetAll: () => void
}

const ProgressContext = createContext<ProgressApi | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo<ProgressApi>(
    () => ({
      completed: state.completed,
      engaged: state.engaged,
      engage: (id, key) => {
        setState((current) => {
          const keys = current.engaged[id] ?? []
          if (keys.includes(key)) return current
          return { ...current, engaged: { ...current.engaged, [id]: [...keys, key] } }
        })
      },
      complete: (id) => {
        setState((current) =>
          current.completed.includes(id) ? current : { ...current, completed: [...current.completed, id] },
        )
      },
      resetOne: (id) => {
        setState((current) => ({
          completed: current.completed.filter((item) => item !== id),
          engaged: { ...current.engaged, [id]: [] },
        }))
      },
      resetAll: () => setState(EMPTY),
    }),
    [state],
  )

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('ProgressProvider가 필요합니다.')
  return value
}
