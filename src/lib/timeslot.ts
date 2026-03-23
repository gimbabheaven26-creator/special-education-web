const LABELS = ['새벽①', '새벽②', '오전', '오후①', '오후②', '저녁'] as const;

export interface Timeslot {
  date: string;
  slot: number;
  label: string;
  key: string;
}

/**
 * 현재(또는 지정된) 시각의 KST 기준 4시간 타임슬롯을 반환한다.
 * - slot 0: 00-03시 (새벽①)
 * - slot 1: 04-07시 (새벽②)
 * - slot 2: 08-11시 (오전)
 * - slot 3: 12-15시 (오후①)
 * - slot 4: 16-19시 (오후②)
 * - slot 5: 20-23시 (저녁)
 */
export function getKSTTimeslot(now?: Date): Timeslot {
  const d = now ?? new Date();

  const kstDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(d);
  const kstHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      hour12: false,
    }).format(d),
  );

  const slot = Math.floor(kstHour / 4);
  const label = LABELS[slot];
  const key = `${kstDate}-S${slot}`;

  return { date: kstDate, slot, label, key };
}
