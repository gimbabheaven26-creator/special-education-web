/**
 * scripts/lib/cli-utils.mjs
 *
 * 공용 CLI 파서. 외부 의존성 없음 (yargs/commander 불필요).
 * 모든 스크립트가 일관된 --flag 패턴을 사용하도록 한다.
 */

/**
 * CLI 인자를 파싱한다.
 *
 * @param {object} schema - 플래그 정의
 *   키: 플래그 이름 (e.g. 'subject', 'dry-run')
 *   값: { type: 'string'|'boolean'|'number'|'array', default?, description?, choices? }
 * @param {string[]} [argv] - process.argv.slice(2)
 * @returns {Record<string, any>}
 *
 * @example
 * const args = parseArgs({
 *   subject: { type: 'string', description: '과목 slug' },
 *   type: { type: 'string', choices: ['multiple', 'ox', 'fill_in'] },
 *   'dry-run': { type: 'boolean', default: false },
 *   limit: { type: 'number', default: 100 },
 *   years: { type: 'array', description: '연도 목록 (쉼표 구분)' },
 * });
 */
export function parseArgs(schema, argv = process.argv.slice(2)) {
  const result = {};

  // 기본값 초기화
  for (const [name, config] of Object.entries(schema)) {
    result[camelCase(name)] = config.default ?? null;
  }

  let i = 0;
  const positionals = [];

  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      printHelp(schema);
      process.exit(0);
    }

    if (!arg.startsWith('--')) {
      positionals.push(arg);
      i++;
      continue;
    }

    const flagName = arg.slice(2);
    const config = schema[flagName];

    if (!config) {
      console.error(`Unknown flag: --${flagName}`);
      console.error(`Use --help to see available flags.`);
      process.exit(1);
    }

    const key = camelCase(flagName);

    if (config.type === 'boolean') {
      result[key] = true;
      i++;
      continue;
    }

    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) {
      console.error(`Flag --${flagName} requires a value`);
      process.exit(1);
    }

    i++;
    const raw = argv[i];

    if (config.type === 'number') {
      result[key] = Number(raw);
      if (isNaN(result[key])) {
        console.error(`--${flagName}: "${raw}" is not a valid number`);
        process.exit(1);
      }
    } else if (config.type === 'array') {
      result[key] = raw.split(',').map(v => v.trim());
    } else {
      result[key] = raw;
    }

    if (config.choices && !config.choices.includes(result[key])) {
      console.error(
        `--${flagName}: "${result[key]}" is not valid.\n` +
        `Expected: ${config.choices.join(', ')}`
      );
      process.exit(1);
    }

    i++;
  }

  // positionals를 _positionals 키에 저장
  if (positionals.length > 0) {
    result._positionals = positionals;
  }

  return result;
}

/**
 * --help 출력
 */
function printHelp(schema) {
  const scriptName = process.argv[1]?.split('/').pop() || 'script';
  console.log(`\nUsage: node ${scriptName} [options]\n`);
  console.log('Options:');

  for (const [name, config] of Object.entries(schema)) {
    const typeStr = config.type === 'boolean' ? '' : ` <${config.type}>`;
    const choices = config.choices ? ` (${config.choices.join('|')})` : '';
    const def = config.default !== undefined ? ` [default: ${config.default}]` : '';
    const desc = config.description || '';
    console.log(`  --${name}${typeStr}  ${desc}${choices}${def}`);
  }

  console.log(`  --help           Show this help message\n`);
}

/**
 * kebab-case → camelCase
 */
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * 간단한 플래그 조회 (레거시 호환용).
 * parseArgs 없이 빠르게 하나의 플래그를 읽을 때 사용.
 *
 * @param {string} name - 플래그 이름 (e.g. '--subject')
 * @param {string[]} [argv]
 * @returns {string|null}
 */
export function getFlag(name, argv = process.argv.slice(2)) {
  const idx = argv.indexOf(name);
  return idx !== -1 && idx + 1 < argv.length ? argv[idx + 1] : null;
}

/**
 * boolean 플래그 확인 (레거시 호환용).
 *
 * @param {string} name - 플래그 이름 (e.g. '--dry-run')
 * @param {string[]} [argv]
 * @returns {boolean}
 */
export function hasFlag(name, argv = process.argv.slice(2)) {
  return argv.includes(name);
}
