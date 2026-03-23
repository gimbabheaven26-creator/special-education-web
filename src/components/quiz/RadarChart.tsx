'use client';

import {
  RADAR_RADIUS_RATIO,
  pointAt,
  computeRadarPoints,
  computeGuidePoints,
  computeLabelPosition,
} from './radar-utils';

// ─── React 컴포넌트 ─────────────────────────────────────────────────────────

interface RadarChartProps {
  data: ReadonlyArray<{ label: string; value: number }>; // value: 0-100
  size?: number; // default 300
}

/**
 * 순수 SVG 레이더 차트.
 * 동심원 가이드(25/50/75/100%), 축선, 한국어 라벨, 데이터 폴리곤을 렌더링한다.
 */
export function RadarChart({ data, size = 300 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const n = data.length;
  const radius = size * RADAR_RADIUS_RATIO;

  const guides = computeGuidePoints(n, size);
  const dataPoints = computeRadarPoints(data, size);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      role="img"
      aria-label="과목별 정답률 레이더 차트"
    >
      {/* 동심원 가이드 */}
      {guides.map((pts, gi) => (
        <polygon
          key={`guide-${gi}`}
          data-testid={`guide-${gi}`}
          points={pts}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.5}
          className="text-muted-foreground/30"
        />
      ))}

      {/* 축선 */}
      {data.map((_, i) => {
        const p = pointAt(i, 1, n, cx, cy, radius);
        return (
          <line
            key={`axis-${i}`}
            data-testid={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-muted-foreground/30"
          />
        );
      })}

      {/* 데이터 폴리곤 */}
      {n > 0 && (
        <polygon
          data-testid="data-polygon"
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          className="fill-primary/20 stroke-primary"
          strokeWidth={2}
        />
      )}

      {/* 데이터 점 */}
      {dataPoints.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          className="fill-primary"
        />
      ))}

      {/* 라벨 */}
      {data.map((d, i) => {
        const pos = computeLabelPosition(i, n, size);
        return (
          <text
            key={`label-${i}`}
            data-testid={`label-${d.label}`}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.anchor}
            dominantBaseline="central"
            className="fill-foreground text-xs"
            fontSize={11}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
