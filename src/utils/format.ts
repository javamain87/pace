const STEP_KRW = 10000

/**
 * Format KRW as Korean-style "X만원" (e.g. 29040000 -> "2,904만원")
 */
export function formatKrWManwon(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0만원'
  const manwon = Math.round(value / STEP_KRW)
  return `${manwon.toLocaleString()}만원`
}

/** Format KRW to 만원 number for display/input (e.g. 29040000 -> 2904) */
export function formatKRWToManWon(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.round(value / STEP_KRW)
}

/** Format KRW with comma (e.g. 842300 -> "₩842,300") */
export function formatKRW(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '₩0'
  return `₩${Math.round(value).toLocaleString()}`
}

/** Parse 만원 input to KRW (e.g. 2904 -> 29040000). Empty/NaN/negative returns 0. */
export function parseManWonToKRW(input: string | number): number {
  const n = typeof input === 'number' ? input : parseInt(String(input).replace(/,/g, ''), 10)
  if (Number.isNaN(n) || !Number.isFinite(n) || n < 0) return 0
  return Math.max(0, Math.round(n) * STEP_KRW)
}
