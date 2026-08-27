const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function parseEventDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function formatFullEventDate(value) {
  const d = parseEventDate(value);
  if (!d) return '';
  return `${String(d.day).padStart(2, '0')} de ${MONTHS[d.month - 1]}. de ${d.year}`;
}

export function eventMonthShort(value) {
  const d = parseEventDate(value);
  return d ? MONTHS[d.month - 1] : '';
}
