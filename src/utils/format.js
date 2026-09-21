export function formatFcfa(value) {
  const num = Number(value || 0);
  const rounded = Math.round(num);
  return `${rounded.toLocaleString('fr-FR').replace(/ /g, ' ')} FCFA`;
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(value) {
  if (!value) return '';
  return value;
}
