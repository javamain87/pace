import { useId } from 'react'

/** NumberInput와 동일한 값(KRW) 사용. step 10,000원. 슬라이더와 숫자 입력 동기화는 부모에서 value/onChange로 처리. */
const STEP_KRW = 10000

export type SliderInputProps = {
  label?: string
  value: number
  onChange: (valueKrw: number) => void
  min?: number
  max: number
  step?: number
  disabled?: boolean
  className?: string
}

export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step: _step = STEP_KRW,
  disabled = false,
  className = '',
}: SliderInputProps) {
  const id = useId()
  const minStep = Math.round(min / STEP_KRW) * STEP_KRW
  const maxStep = Math.round(max / STEP_KRW) * STEP_KRW
  const valueClamped = Math.min(Math.max(Math.round(value / STEP_KRW) * STEP_KRW, minStep), maxStep)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (Number.isNaN(v)) return
    onChange(v * STEP_KRW)
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
      <input
        id={id}
        type="range"
        min={minStep / STEP_KRW}
        max={maxStep / STEP_KRW}
        step={1}
        value={valueClamped / STEP_KRW}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 rounded-full bg-[#161A21] appearance-none accent-[#4C8BF5]"
      />
    </div>
  )
}
