import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** Reads a C# source file. Resolves relative paths against the test's CWD (Node test runner sets cwd to the grader's directory). */
export function readCSharp(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), 'utf8');
}

export function hasPattern(src: string, pattern: RegExp): boolean {
  return pattern.test(src);
}

export function hasNoPattern(src: string, pattern: RegExp): boolean {
  return !pattern.test(src);
}

/** Detects `using Namespace.Path;` (with optional whitespace). */
export function usesNamespace(src: string, ns: string): boolean {
  const escaped = ns.replace(/\./g, '\\.');
  return new RegExp(`\\busing\\s+${escaped}\\s*;`).test(src);
}

/** Detects `class Foo`, `struct Foo`, or `enum Foo` declarations. */
export function declaresType(src: string, kind: 'class' | 'struct' | 'enum', name: string): boolean {
  return new RegExp(`\\b${kind}\\s+${name}\\b`).test(src);
}

export interface AstSite {
  /** Approximate body source for the enclosing block, if available. Fallback: empty string. */
  body: string;
}

export interface MethodCallsResult {
  count: number;
  sites: AstSite[];
}

let _csharpParser: any = null;
function loadCSharpParser(): any | null {
  if (_csharpParser !== null) return _csharpParser;
  try {
    // Lazy require so missing tree-sitter on a platform doesn't crash other helpers.
    const Parser = require('tree-sitter');
    const CSharp = require('tree-sitter-c-sharp');
    const p = new Parser();
    p.setLanguage(CSharp);
    _csharpParser = p;
    return p;
  } catch {
    _csharpParser = false;
    return null;
  }
}

/**
 * Counts call sites of `methodName(...)` in the source. Uses tree-sitter AST when
 * available; falls back to a regex that matches `methodName(` not preceded by `.` or `:`
 * (a coarse approximation for top-level calls).
 */
export function methodCallsAst(src: string, methodName: string): MethodCallsResult {
  const parser = loadCSharpParser();
  if (parser) {
    const tree = parser.parse(src);
    const sites: AstSite[] = [];
    function walk(node: any) {
      if (node.type === 'invocation_expression') {
        const fn = node.childForFieldName?.('function');
        const text = fn?.text ?? node.firstChild?.text ?? '';
        // Match `name(...)` or `obj.name(...)`.
        if (text === methodName || text.endsWith('.' + methodName)) {
          sites.push({ body: '' });
        }
      }
      for (let i = 0; i < node.childCount; i++) walk(node.child(i));
    }
    walk(tree.rootNode);
    return { count: sites.length, sites };
  }
  // Regex fallback. Skips dotted member access (still catches `foo.bar(` once for `bar`, which is acceptable for our use).
  const matches = src.match(new RegExp(`\\b${methodName}\\s*\\(`, 'g')) ?? [];
  return { count: matches.length, sites: matches.map(() => ({ body: '' })) };
}

/**
 * Reads a top-level numeric/string field from a Unity YAML asset (`.asset`, `.prefab`).
 * Dotted path is interpreted as YAML mapping descent (e.g. `MonoBehaviour.cardCost`).
 * Returns `undefined` if not found. Numbers are returned as `number`, strings as `string`.
 */
export function serializedAssetField(unityAssetPath: string, fieldPath: string): unknown {
  const text = fs.readFileSync(path.resolve(unityAssetPath), 'utf8');
  const parts = fieldPath.split('.');
  const lines = text.split(/\r?\n/);
  // Find the top-level key (e.g. "MonoBehaviour:")
  let idx = lines.findIndex(l => l.startsWith(`${parts[0]}:`));
  if (idx < 0) return undefined;

  // From here, scan child fields (lines starting with "  " indent) until we exit the mapping.
  let currentIndent = 2;
  let target = parts.slice(1).join('.');
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith(' ')) break;
    const m = line.match(/^(\s+)([^:]+):\s*(.*)$/);
    if (!m) continue;
    const [, indent, key, rest] = m;
    if (indent.length !== currentIndent) continue;
    if (key.trim() === target) {
      const value = rest.trim();
      if (value === '') return null;
      const asNum = Number(value);
      return Number.isNaN(asNum) ? value : asNum;
    }
  }
  return undefined;
}
