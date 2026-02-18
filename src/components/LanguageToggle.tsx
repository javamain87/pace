import { useTranslation } from 'react-i18next'
import { useLocale } from '../hooks/useLocale'

export function LanguageToggle() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  const toggle = () => {
    const next = locale === 'ko' ? 'en' : 'ko'
    setLocale(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-sm text-[#AAB2C0] hover:text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50 rounded px-2 py-1"
      aria-label={t('actions.switchLanguage')}
    >
      {locale === 'ko' ? '한국어' : 'English'}
    </button>
  )
}
