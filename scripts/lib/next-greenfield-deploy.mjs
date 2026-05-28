export const DEFAULT_TARGET = 'preview';
export const GREENFIELD_META = 'sew-next-greenfield=true';

function readOption(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  return value && !value.startsWith('--') ? value : undefined;
}

export function hasFlag(argv, name) {
  return argv.includes(name);
}

export function normalizeBaseUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Deployment URL is required.');
  }
  const url = new URL(input);
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString().replace(/\/+$/, '');
}

export function buildSmokeTargets(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  return [
    {
      label: 'cockpit',
      url: `${normalized}/next`,
      text: 'SEW Next',
    },
    {
      label: 'results',
      url: `${normalized}/next/results`,
      text: 'SEW Next Results',
    },
    {
      label: 'full mock',
      url: `${normalized}/next/practice?mode=mock&variant=full`,
      text: '실전형 23문항 모드',
    },
  ];
}

export function parseDeployOptions(argv = process.argv.slice(2), env = process.env) {
  const prod = hasFlag(argv, '--prod');
  const target = prod ? 'production' : readOption(argv, '--target') ?? env.VERCEL_TARGET ?? DEFAULT_TARGET;

  return {
    project: readOption(argv, '--project') ?? env.VERCEL_PROJECT,
    team: readOption(argv, '--team') ?? env.VERCEL_TEAM,
    target,
    prod,
    dryRun: hasFlag(argv, '--dry-run'),
    skipChecks: hasFlag(argv, '--skip-checks'),
    noLink: hasFlag(argv, '--no-link'),
    noVerify: hasFlag(argv, '--no-verify'),
    allowAnyBranch: hasFlag(argv, '--allow-any-branch'),
    help: hasFlag(argv, '--help') || hasFlag(argv, '-h'),
  };
}

export function buildVercelLinkArgs({ project, team }) {
  if (!project) {
    throw new Error('Missing Vercel project. Pass --project <name> or set VERCEL_PROJECT.');
  }
  const args = ['link', '--yes', '--project', project];
  if (team) args.push('--team', team);
  return args;
}

export function buildVercelDeployArgs({ target = DEFAULT_TARGET, prod = false }) {
  const args = ['deploy', '--yes'];
  if (prod || target === 'production') {
    args.push('--prod');
  } else {
    args.push('--target', target);
  }
  args.push('--meta', GREENFIELD_META);
  return args;
}

export function extractDeploymentUrl(output) {
  const matches = output.match(/https:\/\/[^\s]+/g) ?? [];
  return matches.find((url) => url.includes('.vercel.app')) ?? matches[0] ?? null;
}

export function isAllowedRscFetchWarning(message, { allowRscFetchWarnings = false } = {}) {
  return allowRscFetchWarnings
    && message.includes('Failed to fetch RSC payload')
    && message.includes('Falling back to browser navigation');
}
