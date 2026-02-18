import { useCallback, useEffect, useState } from 'react'
import i18n from '../i18n'

const STORAGE_KEY = 'pace-locale'

export type Locale = 'ko' | 'en'

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ko' || stored === 'en') return stored
  } catch {
    // ignore
  }
  return 'ko'
}

export function useLocale(): { locale: Locale; setLocale: (lng: Locale) => void } {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale())

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  const setLocale = useCallback((lng: Locale) => {
    setLocaleState(lng)
    i18n.changeLanguage(lng)
    try {
      localStorage.setItem(STORAGE_KEY, lng)
    } catch {
      // ignore
    }
  }, [])

  return { locale, setLocale }
}
