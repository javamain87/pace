export function getMotivationMessage(
  totalSaved: number,
  todaySaved: number,
  monthlySaved: number
): string {
  const COFFEE_PRICE = 5_500
  const MEAL_PRICE = 12_000

  if (todaySaved >= COFFEE_PRICE * 3 && todaySaved > 0) {
    return `오늘 커피 ${Math.floor(todaySaved / COFFEE_PRICE)}잔 아꼈어요!`
  }
  if (todaySaved >= COFFEE_PRICE && todaySaved > 0) {
    return '오늘 커피 한 잔 아꼈어요 ☕'
  }
  if (todaySaved >= MEAL_PRICE && todaySaved > 0) {
    return '오늘 점심 값만큼 아꼈어요'
  }
  if (monthlySaved >= 100_000 && monthlySaved > 0) {
    return '이번 달 10만원 넘게 모았어요!'
  }
  if (totalSaved >= 50_000 && totalSaved < 100_000) {
    return '저녁 한 끼 값은 충분해요'
  }
  if (totalSaved >= 100_000 && totalSaved < 300_000) {
    return '영화 몇 편 보기 충분해요 🎬'
  }
  if (totalSaved >= 300_000) {
    return '맛있는 저녁 한 끼 가능해요 🍽️'
  }
  if (totalSaved > 0) {
    return '조금씩 모이다 보면 커져요'
  }
  return '첫 저축을 시작해 보세요'
}
