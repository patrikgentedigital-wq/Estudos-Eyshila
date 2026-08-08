export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetweenDates(later: Date, earlierIso: string): number {
  const earlier = new Date(earlierIso);
  if (Number.isNaN(earlier.getTime())) return 30;
  return Math.max(0, (later.getTime() - earlier.getTime()) / 86_400_000);
}
