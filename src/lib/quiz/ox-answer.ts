export function normalizeOXAnswer(answer: string | number | boolean): string {
  const value = String(answer).trim().toUpperCase();

  if (value === 'O' || value === '1' || value === 'TRUE') return 'O';
  if (value === 'X' || value === '0' || value === 'FALSE') return 'X';

  return value;
}
