#!/usr/bin/env node

import { chromium } from '@playwright/test';
import {
  buildSmokeTargets,
  isAllowedRscFetchWarning,
  normalizeBaseUrl,
} from './lib/next-greenfield-deploy.mjs';

function printHelp() {
  console.log(`Usage: node scripts/verify-next-greenfield-deploy.mjs <deployment-url>

Verifies the SEW Next greenfield deployment renders the Next-owned product surface.

Checks:
  - /next cockpit renders
  - /next/results renders
  - /next/practice?mode=mock&variant=full renders
  - no page errors or browser console errors
  - no horizontal overflow on desktop and mobile

Options:
  --allow-rsc-fetch-warnings  Allow known Next dev/RSC fallback console errors.
`);
}

async function verifyTarget(page, target, options) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      if (!isAllowedRscFetchWarning(text, options)) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  const response = await page.goto(target.url, { waitUntil: 'domcontentloaded' });
  const status = response?.status() ?? 0;
  if (status >= 500 || status === 0) {
    throw new Error(`${target.label}: unexpected HTTP status ${status}`);
  }

  await page.getByText(target.text).first().waitFor({ timeout: 15_000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);

  const overflow = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  if (overflow.scrollWidth > overflow.width + 1) {
    throw new Error(`${target.label}: horizontal overflow ${overflow.scrollWidth} > ${overflow.width}`);
  }

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error(`${target.label}: browser errors\n${[...pageErrors, ...consoleErrors].join('\n')}`);
  }

  return { label: target.label, status, url: target.url };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return;
  }

  const baseUrl = normalizeBaseUrl(argv.find((arg) => !arg.startsWith('--')));
  const options = {
    allowRscFetchWarnings: argv.includes('--allow-rsc-fetch-warnings'),
  };
  const targets = buildSmokeTargets(baseUrl);
  const browser = await chromium.launch();

  try {
    const results = [];
    for (const viewport of [
      { label: 'desktop', width: 1440, height: 1000 },
      { label: 'mobile', width: 390, height: 844 },
    ]) {
      for (const target of targets) {
        const page = await browser.newPage({ viewport });
        try {
          const result = await verifyTarget(page, target, options);
          results.push({ viewport: viewport.label, ...result });
        } finally {
          await page.close();
        }
      }
    }

    console.log(JSON.stringify({ ok: true, baseUrl, results }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
