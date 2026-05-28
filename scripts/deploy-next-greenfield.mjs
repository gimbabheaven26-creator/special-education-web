#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  buildVercelDeployArgs,
  buildVercelLinkArgs,
  extractDeploymentUrl,
  parseDeployOptions,
} from './lib/next-greenfield-deploy.mjs';

function printHelp() {
  console.log(`Usage: node scripts/deploy-next-greenfield.mjs --project <vercel-project> [options]

Options:
  --project <name>        Vercel project name or id. Can also use VERCEL_PROJECT.
  --team <slug-or-id>     Vercel team scope. Can also use VERCEL_TEAM.
  --target <target>       Vercel target. Defaults to preview.
  --prod                  Deploy as production.
  --skip-checks           Skip lint, test, and build.
  --no-link               Skip vercel link.
  --no-verify             Skip live Playwright smoke verification.
  --allow-any-branch      Do not enforce codex/next-greenfield.
  --dry-run               Print commands without executing them.

Examples:
  npm run deploy:next-greenfield -- --project special-education-next --target preview
  npm run deploy:next-greenfield -- --project special-education-next --team my-team --prod
`);
}

function run(command, args, { env = process.env, dryRun = false } = {}) {
  const rendered = [command, ...args].join(' ');
  if (dryRun) {
    console.log(`[dry-run] ${rendered}`);
    return { stdout: '', status: 0 };
  }

  console.log(`$ ${rendered}`);
  const result = spawnSync(command, args, {
    env,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`${rendered} failed with exit code ${result.status ?? 'unknown'}`);
  }
  return result;
}

function currentBranch({ dryRun = false } = {}) {
  if (dryRun) return 'codex/next-greenfield';
  const result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

async function main() {
  const options = parseDeployOptions();
  if (options.help) {
    printHelp();
    return;
  }

  if (!options.project && !options.noLink) {
    throw new Error('Missing Vercel project. Pass --project <name> or set VERCEL_PROJECT.');
  }

  const branch = currentBranch({ dryRun: options.dryRun });
  if (!options.allowAnyBranch && branch !== 'codex/next-greenfield') {
    throw new Error(`Expected codex/next-greenfield branch, got ${branch ?? 'unknown'}.`);
  }

  if (!options.skipChecks) {
    run('npm', ['run', 'lint'], { dryRun: options.dryRun });
    run('npm', ['run', 'test'], { dryRun: options.dryRun });
    run('npm', ['run', 'build'], {
      dryRun: options.dryRun,
      env: { ...process.env, NEXT_PRIVATE_BUILD_WORKER: '0' },
    });
  }

  if (!options.noLink) {
    run('vercel', buildVercelLinkArgs(options), { dryRun: options.dryRun });
  }

  const deploy = run('vercel', buildVercelDeployArgs(options), { dryRun: options.dryRun });
  const deploymentUrl = extractDeploymentUrl(deploy.stdout);
  if (!options.dryRun && !deploymentUrl) {
    throw new Error('Vercel deploy completed but no deployment URL was found in output.');
  }

  if (deploymentUrl && !options.noVerify) {
    run('node', ['scripts/verify-next-greenfield-deploy.mjs', deploymentUrl], { dryRun: options.dryRun });
  }

  console.log(options.dryRun
    ? 'Dry run completed.'
    : `SEW Next deployment verified: ${deploymentUrl}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  if (message.includes('token') || message.includes('vercel')) {
    console.error('If Vercel auth fails, run `vercel login` or set a valid VERCEL_TOKEN outside git.');
  }
  process.exit(1);
});
