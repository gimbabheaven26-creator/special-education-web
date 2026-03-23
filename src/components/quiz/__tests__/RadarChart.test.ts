/**
 * RadarChart SVG 좌표 계산 로직 테스트.
 *
 * JSX 렌더링 대신 순수 수학 함수(radar-utils.ts) 수준에서 검증한다.
 */
import { describe, it, expect } from 'vitest';
import { computeRadarPoints, computeGuidePoints, computeLabelPosition } from '../radar-utils';

describe('RadarChart 좌표 계산', () => {
  const sampleData = [
    { label: '시각장애', value: 80 },
    { label: '청각장애', value: 60 },
    { label: '지체장애', value: 40 },
    { label: '지적장애', value: 90 },
    { label: '자폐성장애', value: 55 },
  ];

  describe('computeRadarPoints', () => {
    it('데이터 포인트 수만큼 좌표를 생성한다', () => {
      const points = computeRadarPoints(sampleData, 300);
      expect(points).toHaveLength(sampleData.length);
    });

    it('각 좌표는 유효한 x, y를 갖는다', () => {
      const points = computeRadarPoints(sampleData, 300);
      for (const p of points) {
        expect(typeof p.x).toBe('number');
        expect(typeof p.y).toBe('number');
        expect(Number.isNaN(p.x)).toBe(false);
        expect(Number.isNaN(p.y)).toBe(false);
      }
    });

    it('value=100이면 반지름 끝에 위치한다', () => {
      const data = [
        { label: 'A', value: 100 },
        { label: 'B', value: 100 },
        { label: 'C', value: 100 },
      ];
      const size = 300;
      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.35;
      const points = computeRadarPoints(data, size);

      for (const p of points) {
        const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        expect(dist).toBeCloseTo(radius, 1);
      }
    });

    it('value=0이면 중심에 위치한다', () => {
      const data = [
        { label: 'A', value: 0 },
        { label: 'B', value: 0 },
        { label: 'C', value: 0 },
      ];
      const size = 300;
      const cx = size / 2;
      const cy = size / 2;
      const points = computeRadarPoints(data, size);

      for (const p of points) {
        expect(p.x).toBeCloseTo(cx, 1);
        expect(p.y).toBeCloseTo(cy, 1);
      }
    });

    it('value를 0~100으로 클램핑한다', () => {
      const data = [
        { label: 'A', value: -10 },
        { label: 'B', value: 150 },
        { label: 'C', value: 50 },
      ];
      const size = 300;
      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.35;
      const points = computeRadarPoints(data, size);

      // -10 → 0 → 중심
      expect(points[0].x).toBeCloseTo(cx, 1);

      // 150 → 100 → 반지름 끝
      const dist1 = Math.sqrt((points[1].x - cx) ** 2 + (points[1].y - cy) ** 2);
      expect(dist1).toBeCloseTo(radius, 1);
    });

    it('빈 데이터이면 빈 배열을 반환한다', () => {
      const points = computeRadarPoints([], 300);
      expect(points).toHaveLength(0);
    });
  });

  describe('computeGuidePoints', () => {
    it('4개 가이드 레벨(25/50/75/100%)을 반환한다', () => {
      const guides = computeGuidePoints(5, 300);
      expect(guides).toHaveLength(4);
    });

    it('각 가이드는 n개 꼭짓점 좌표 문자열이다', () => {
      const guides = computeGuidePoints(5, 300);
      for (const g of guides) {
        const pairs = g.split(' ');
        expect(pairs).toHaveLength(5);
      }
    });

    it('n=0이면 빈 배열을 반환한다', () => {
      const guides = computeGuidePoints(0, 300);
      expect(guides).toHaveLength(0);
    });
  });

  describe('computeLabelPosition', () => {
    it('라벨 위치와 textAnchor를 반환한다', () => {
      const pos = computeLabelPosition(0, 5, 300);
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
      expect(['start', 'middle', 'end']).toContain(pos.anchor);
    });

    it('12시 방향(i=0)은 middle anchor다', () => {
      const pos = computeLabelPosition(0, 5, 300);
      expect(pos.anchor).toBe('middle');
    });
  });
});
