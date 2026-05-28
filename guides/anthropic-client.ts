import Anthropic from '@anthropic-ai/sdk';

export interface RequestOpts {
  /** When true, returns the constructed messages payload instead of calling the API. Used in tests. */
  dryRun?: boolean;
}

export class MissingAnthropicKeyError extends Error {
  constructor() { super('ANTHROPIC_API_KEY not set. Add it to .env or export it.'); this.name = 'MissingAnthropicKeyError'; }
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingAnthropicKeyError();
  return _client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export interface CompleteArgs {
  system: string;
  user: string;
  maxTokens?: number;
}

export async function complete(args: CompleteArgs, opts: RequestOpts = {}): Promise<string> {
  const payload = {
    model: 'claude-sonnet-4-6',
    max_tokens: args.maxTokens ?? 2048,
    system: [{ type: 'text' as const, text: args.system, cache_control: { type: 'ephemeral' as const } }],
    messages: [{ role: 'user' as const, content: args.user }],
  };
  if (opts.dryRun) return JSON.stringify(payload);

  const client = getClient();
  const resp = await client.messages.create(payload);
  const block = resp.content[0];
  if (block.type !== 'text') throw new Error(`Unexpected content block type: ${block.type}`);
  return block.text;
}
