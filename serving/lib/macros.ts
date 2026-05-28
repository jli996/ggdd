import { resolveInclude } from './include.ts';

const INCLUDE_RE = /^!include\s+(\S+)\s*$/gm;

export function expandIncludes(source: string, fromFile: string): string {
  return source.replace(INCLUDE_RE, (_match, includeArg: string) => {
    return resolveInclude(includeArg, fromFile);
  });
}
