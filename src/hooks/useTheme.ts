import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'crm-theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Single source of truth for the app's light/dark theme. Falls back to the OS
// preference only on first load (no stored choice yet); once the user toggles,
// that choice is persisted and wins over the OS preference from then on.
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void } {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return { theme, setTheme }
}
