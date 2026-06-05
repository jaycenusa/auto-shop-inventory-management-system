import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'

function readStoredValue<T>(key: string, initialValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      return JSON.parse(stored) as T
    }
  } catch {
    // ignore invalid or unavailable storage
  }
  return initialValue
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readStoredValue(key, initialValue),
  )

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota or privacy errors
    }
  }, [key, value])

  return [value, setValue]
}
