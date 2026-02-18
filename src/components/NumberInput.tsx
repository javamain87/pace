import { useId } from 'react'
import { useTranslation } from 'react-i18next'

/** KRW는 정수로 저장, UI에는 만원 단위로 표시. step 10,000원(1만원). */
const STEP_KRW = 10000

export type NumberInputProps = {
  label?: string
  value: number
  onChange: (valueKrw: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = STEP_KRW,
  disabled = false,
  className = '',
}: NumberInputProps) {
  const { t } = useTranslation()
  const id = useId()
  const valueManwon = Math.round(value / STEP_KRW)
  const minManwon = Math.round(min / STEP_KRW)
  const maxManwon = max !== undefined ? Math.round(max / STEP_KRW) : undefined
  const stepManwon = Math.round(step / STEP_KRW) || 1

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10)
    if (Number.isNaN(parsed)) return
    const clamped = maxManwon !== undefined
      ? Math.min(Math.max(parsed, minManwon), maxManwon)
      : Math.max(parsed, minManwon)
    onChange(clamped * STEP_KRW)
  }

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm text-[#AAB2C0] mb-1"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          min={minManwon}
          max={maxManwon}
          step={stepManwon}
          value={valueManwon}
          onChange={handleChange}
          disabled={disabled}
          className="w-24 rounded-lg border border-[#161A21] bg-[#161A21] px-3 py-2 text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
        />
        <span className="text-sm text-[#AAB2C0]">{t('fields.manwon')}</span>
      </div>
    </div>
  )
}
