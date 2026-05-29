import { test } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(__dirname, 'index.ts');

function send(child: ReturnType<typeof spawn>, msg: object) {
  child.stdin!.write(JSON.stringify(msg) + '\n');
}

function readJsonLine(buf: { acc: string }, child: ReturnType<typeof spawn>): Promise<any> {
  return new Promise((resolve, reject) => {
    const onData = (chunk: Buffer) => {
      buf.acc += chunk.toString();
      const newlineIdx = buf.acc.indexOf('\n');
      if (newlineIdx >= 0) {
        const line = buf.acc.slice(0, newlineIdx);
        buf.acc = buf.acc.slice(newlineIdx + 1);
        child.stdout!.off('data', onData);
        try { resolve(JSON.parse(line)); }
        catch (e) { reject(e); }
      }
    };
    child.stdout!.on('data', onData);
  });
}

test('MCP server lists ggdd_search and ggdd_retrieve tools', async () => {
  const child = spawn('node', ['--experimental-strip-types', SERVER]);
  const buf = { acc: '' };
  try {
    // initialize
    send(child, {
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '0.0.0' },
      },
    });
    const initResp = await readJsonLine(buf, child);
    assert.equal(initResp.id, 1);
    assert.ok(initResp.result);

    // initialized notification
    send(child, { jsonrpc: '2.0', method: 'notifications/initialized' });

    // tools/list
    send(child, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const listResp = await readJsonLine(buf, child);
    assert.equal(listResp.id, 2);
    const names = listResp.result.tools.map((t: any) => t.name).sort();
    assert.deepEqual(names, ['ggdd_retrieve', 'ggdd_search', 'ggdd_search_by_tag', 'ggdd_tags']);
  } finally {
    child.kill();
  }
});

test('MCP server ggdd_search returns top match for a relevant query', async () => {
  const child = spawn('node', ['--experimental-strip-types', SERVER]);
  const buf = { acc: '' };
  try {
    send(child, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0.0.0' } } });
    await readJsonLine(buf, child);
    send(child, { jsonrpc: '2.0', method: 'notifications/initialized' });

    send(child, {
      jsonrpc: '2.0', id: 2, method: 'tools/call',
      params: { name: 'ggdd_search', arguments: { query: 'keyboard input in Unity' } },
    });
    const resp = await readJsonLine(buf, child);
    assert.equal(resp.id, 2);
    const text = resp.result.content[0].text;
    const parsed = JSON.parse(text);
    assert.ok(parsed.length >= 1);
    assert.equal(parsed[0].id, 'new-input-system-basics');
  } finally {
    child.kill();
  }
});

test('MCP server lists ggdd_tags and ggdd_search_by_tag', async () => {
  const child = spawn('node', ['--experimental-strip-types', SERVER]);
  const buf = { acc: '' };
  try {
    send(child, {
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0.0.0' } },
    });
    await readJsonLine(buf, child);
    send(child, { jsonrpc: '2.0', method: 'notifications/initialized' });

    send(child, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const listResp = await readJsonLine(buf, child);
    const names = listResp.result.tools.map((t: any) => t.name).sort();
    assert.ok(names.includes('ggdd_tags'));
    assert.ok(names.includes('ggdd_search_by_tag'));
  } finally {
    child.kill();
  }
});
