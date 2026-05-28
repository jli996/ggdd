import type { CommandType, SearchItem } from './types.ts';

export interface ClearcutLoggerOptions {
  skillVersion: string | null;
}

/**
 * No-op telemetry sink. Call sites remain identical to MWG's ClearcutLogger,
 * but no events are emitted unless GGDD_TELEMETRY_ENDPOINT is set AND a future
 * implementation actually wires up a transport.
 *
 * TRACKED TODO (spec §8.3 item 1): decide before public launch whether to
 * (a) wire to an opt-in endpoint or (b) strip this class entirely.
 */
export class ClearcutLogger {
  private readonly endpoint: string | undefined;

  constructor(_opts: ClearcutLoggerOptions) {
    this.endpoint = process.env.GGDD_TELEMETRY_ENDPOINT;
  }

  async logSearchResult(_latencyMs: number, _success: boolean, _items: SearchItem[]): Promise<void> {
    // no-op
  }

  async logRetrieveResult(_latencyMs: number, _success: boolean, _guideId: string): Promise<void> {
    // no-op
  }

  async logToolCommand(_latencyMs: number, _success: boolean, _command: CommandType): Promise<void> {
    // no-op
  }
}
