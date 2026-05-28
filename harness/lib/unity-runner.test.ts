import { test } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { resolveUnityEditor, parseNUnit3Xml, unityCompile, type CompileResult } from './unity-runner.ts';

test('resolveUnityEditor honors UNITY_EDITOR_PATH env var', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'unity-'));
  const fake = path.join(tmp, 'Unity');
  fs.writeFileSync(fake, '');
  process.env.UNITY_EDITOR_PATH = fake;
  try {
    assert.equal(resolveUnityEditor(), fake);
  } finally {
    delete process.env.UNITY_EDITOR_PATH;
    fs.rmSync(tmp, { recursive: true });
  }
});

test('resolveUnityEditor autodetects under /Applications/Unity/Hub/Editor on macOS', { skip: process.platform !== 'darwin' }, () => {
  delete process.env.UNITY_EDITOR_PATH;
  const editor = resolveUnityEditor();
  // May be null if Unity not installed; that's fine for CI. If non-null, it must be the standard layout.
  if (editor) assert.match(editor, /\/Applications\/Unity\/Hub\/Editor\/6000\./);
});

test('parseNUnit3Xml extracts test results', () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<test-run id="1" testcasecount="2" result="Passed" total="2" passed="2" failed="0">
  <test-suite type="Assembly" name="MyTests">
    <test-suite type="TestSuite" name="MyClass">
      <test-case fullname="MyClass.A" result="Passed"></test-case>
      <test-case fullname="MyClass.B" result="Failed">
        <failure><message>nope</message></failure>
      </test-case>
    </test-suite>
  </test-suite>
</test-run>`;
  const results = parseNUnit3Xml(xml);
  assert.equal(results.length, 2);
  assert.equal(results[0].name, 'MyClass.A');
  assert.equal(results[0].outcome, 'Passed');
  assert.equal(results[1].outcome, 'Failed');
  assert.equal(results[1].message, 'nope');
});

test('unityCompile fails fast when no editor is resolvable', async () => {
  delete process.env.UNITY_EDITOR_PATH;
  // Use a path that definitely doesn't exist so autodetect also fails.
  const r: CompileResult = await unityCompile('/tmp/no-such-project-xyz', { editorPath: '/nope/Unity' });
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].message.length > 0);
});
