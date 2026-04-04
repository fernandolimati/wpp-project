import type { QuoteLeg, QuoteLineItem } from "../types"

const DOMESTIC_PREFIXES = ["K", "PH", "PA"]

function isDomesticAirport(icao: string): boolean {
  return DOMESTIC_PREFIXES.some((prefix) => icao.toUpperCase().startsWith(prefix))
}

export function calculateFET(legs: QuoteLeg[], lineItems: QuoteLineItem[]): number {
  const isDomestic = legs.every(
    (l) => isDomesticAirport(l.from) && isDomesticAirport(l.to)
  )
  if (!isDomestic) return 0

  const charterSubtotal = lineItems
    .filter((i) => i.type === "charter_fee")
    .reduce((sum, i) => sum + i.amount, 0)

  return charterSubtotal * 0.075
}
