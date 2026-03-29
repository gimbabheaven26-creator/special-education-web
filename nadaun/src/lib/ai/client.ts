import Anthropic from '@anthropic-ai/sdk';

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다. .env.local에 추가하세요.'
    );
  }
  return key;
}

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getApiKey() });
  }
  return client;
}
