const ESC = '\x1b[';

function wrap(open: number, close: number, text: string): string {
  return `${ESC}${open}m${text}${ESC}${close}m`;
}

export const cRed = (s: string) => wrap(31, 39, s);
export const cGreen = (s: string) => wrap(32, 39, s);
export const cYellow = (s: string) => wrap(33, 39, s);
export const cBlue = (s: string) => wrap(34, 39, s);
export const cMagenta = (s: string) => wrap(35, 39, s);
export const cCyan = (s: string) => wrap(36, 39, s);
export const cBold = (s: string) => wrap(1, 22, s);
export const cDim = (s: string) => wrap(2, 22, s);

const ANSI_RE = /\x1b\[[0-9;]*m/g;
export function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}
