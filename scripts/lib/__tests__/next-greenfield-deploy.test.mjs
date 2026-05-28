import { describe, expect, it } from 'vitest';
import {
  buildSmokeTargets,
  buildVercelDeployArgs,
  buildVercelLinkArgs,
  isAllowedRscFetchWarning,
  normalizeBaseUrl,
  parseDeployOptions,
} from '../next-greenfield-deploy.mjs';

describe('next greenfield deploy helpers', () => {
  it('normalizes deployment URLs without losing the origin path', () => {
    expect(normalizeBaseUrl('https://sew-next.vercel.app/')).toBe('https://sew-next.vercel.app');
    expect(normalizeBaseUrl('https://example.com/base/')).toBe('https://example.com/base');
  });

  it('builds the required smoke targets for the Next-owned product surface', () => {
    expect(buildSmokeTargets('https://sew-next.vercel.app/')).toEqual([
      {
        label: 'cockpit',
        url: 'https://sew-next.vercel.app/next',
        text: 'SEW Next',
      },
      {
        label: 'results',
        url: 'https://sew-next.vercel.app/next/results',
        text: 'SEW Next Results',
      },
      {
        label: 'full mock',
        url: 'https://sew-next.vercel.app/next/practice?mode=mock&variant=full',
        text: '실전형 23문항 모드',
      },
    ]);
  });

  it('parses explicit project and team options without reading secrets', () => {
    expect(parseDeployOptions([
      '--project',
      'special-education-next',
      '--team',
      'edu-team',
      '--prod',
      '--skip-checks',
    ])).toMatchObject({
      project: 'special-education-next',
      team: 'edu-team',
      target: 'production',
      skipChecks: true,
    });
  });

  it('falls back to env project metadata for non-interactive deploys', () => {
    expect(parseDeployOptions([], {
      VERCEL_PROJECT: 'sew-next',
      VERCEL_TEAM: 'team-next',
    })).toMatchObject({
      project: 'sew-next',
      team: 'team-next',
      target: 'preview',
    });
  });

  it('builds non-interactive Vercel link and deploy args', () => {
    expect(buildVercelLinkArgs({ project: 'sew-next', team: 'team-next' })).toEqual([
      'link',
      '--yes',
      '--project',
      'sew-next',
      '--team',
      'team-next',
    ]);
    expect(buildVercelDeployArgs({ target: 'preview', prod: false })).toEqual([
      'deploy',
      '--yes',
      '--target',
      'preview',
      '--meta',
      'sew-next-greenfield=true',
    ]);
    expect(buildVercelDeployArgs({ target: 'production', prod: true })).toEqual([
      'deploy',
      '--yes',
      '--prod',
      '--meta',
      'sew-next-greenfield=true',
    ]);
  });

  it('recognizes the known Next dev RSC fallback warning only when explicitly allowed', () => {
    const warning = 'Failed to fetch RSC payload for http://localhost:3000/next. Falling back to browser navigation.';

    expect(isAllowedRscFetchWarning(warning, { allowRscFetchWarnings: true })).toBe(true);
    expect(isAllowedRscFetchWarning(warning, { allowRscFetchWarnings: false })).toBe(false);
    expect(isAllowedRscFetchWarning('ReferenceError: boom', { allowRscFetchWarnings: true })).toBe(false);
  });
});
