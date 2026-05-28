import { test } from 'node:test';
import assert from 'node:assert';
import { cRed, cGreen, cCyan, cYellow, cDim, cBold, stripAnsi } from './colors.ts';

test('color functions wrap text with ANSI escape sequences', () => {
  assert.match(cRed('hello'), /\x1b\[31m.*hello.*\x1b\[39m/);
  assert.match(cGreen('hello'), /\x1b\[32m.*hello.*\x1b\[39m/);
  assert.match(cCyan('hello'), /\x1b\[36m.*hello.*\x1b\[39m/);
  assert.match(cYellow('hello'), /\x1b\[33m.*hello.*\x1b\[39m/);
});

test('cBold and cDim add bold/dim sequences', () => {
  assert.match(cBold('x'), /\x1b\[1m.*x.*\x1b\[22m/);
  assert.match(cDim('x'), /\x1b\[2m.*x.*\x1b\[22m/);
});

test('stripAnsi removes color codes', () => {
  assert.equal(stripAnsi(cRed('hello')), 'hello');
  assert.equal(stripAnsi(cBold(cCyan('mixed'))), 'mixed');
});
