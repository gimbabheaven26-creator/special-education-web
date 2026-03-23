/**
 * RadarChart 좌표 계산 유틸.
 * 순수 수학 함수로 SVG 좌표를 계산한다.
 * 컴포넌트(RadarChart.tsx)와 테스트에서 공용으로 사용.
 */

export const RADAR_RADIUS_RATIO = 0.35;
export const LABEL_OFFSET = 24;
export const GUIDE_LEVELS = [0.25, 0.5, 0.75, 1.0] as const;

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function angleFor(i: number, n: number): number {
  return (2 * Math.PI * i) / n - Math.PI / 2;
}

export function pointAt(
  i: number,
  ratio: number,
  n: number,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number } {
  const angle = angleFor(i, n);
  return {
    x: cx + radius * ratio * Math.cos(angle),
    y: cy + radius * ratio * Math.sin(angle),
  };
}

/** 데이터 값 → SVG 좌표 배열 */
export function computeRadarPoints(
  data: ReadonlyArray<{ label: string; value: number }>,
  size: number,
): Array<{ x: number; y: number }> {
  const n = data.length;
  if (n === 0) return [];
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * RADAR_RADIUS_RATIO;

  return data.map((d, i) => {
    const ratio = clamp(d.value, 0, 100) / 100;
    return pointAt(i, ratio, n, cx, cy, radius);
  });
}

/** 동심원 가이드 폴리곤 points 문자열 배열 (25/50/75/100%) */
export function computeGuidePoints(n: number, size: number): string[] {
  if (n === 0) return [];
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * RADAR_RADIUS_RATIO;

  return GUIDE_LEVELS.map((level) =>
    Array.from({ length: n }, (_, i) => {
      const p = pointAt(i, level, n, cx, cy, radius);
      return `${p.x},${p.y}`;
    }).join(' '),
  );
}

/** 라벨 위치 + textAnchor 계산 */
export function computeLabelPosition(
  i: number,
  n: number,
  size: number,
): { x: number; y: number; anchor: string } {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * RADAR_RADIUS_RATIO;
  const labelRadius = radius + LABEL_OFFSET;
  const angle = angleFor(i, n);
  const x = cx + labelRadius * Math.cos(angle);
  const y = cy + labelRadius * Math.sin(angle);

  const cos = Math.cos(angle);
  let anchor = 'middle';
  if (cos > 0.3) anchor = 'start';
  else if (cos < -0.3) anchor = 'end';

  return { x, y, anchor };
}
