export function localDateString(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const value = (type: string): string => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new Error(`Could not format ${type} for time zone ${timeZone}`);
    }
    return part.value;
  };

  return `${value('year')}-${value('month')}-${value('day')}`;
}
