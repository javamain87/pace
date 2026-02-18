import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './resources/ko.json'
import en from './resources/en.json'

const resources = {
  ko: { translation: ko },
  en: { translation: en },
}

function getInitialLanguage(): 'ko' | 'en' {
  try {
    const stored = localStorage.getItem('pace-locale')
    if (stored === 'ko' || stored === 'en') return stored
  } catch {
    // ignore
  }
  return 'ko'
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'ko',
  react: {
    useSuspense: false,
  },
})

export default i18n
