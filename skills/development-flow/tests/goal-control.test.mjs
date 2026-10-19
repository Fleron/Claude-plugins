import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/goal-control.mjs', import.meta.url));
const identityVariable = 'DEVELOPMENT_FLOW_CLAUDE_SESSION_ID';
const rootVariable = 'DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_ROOT';
const contextVariable = 'DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_CONTEXT';

function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'goal-control-test-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const pluginData = path.join(temporary, 'native-plugin-data');
  fs.mkdirSync(pluginData, { mode: 0o700 });
  const configDir = path.join(temporary, "native'config");
  fs.mkdirSync(configDir, { mode: 0o700 });
  const env = { ...process.env, TMPDIR: temporary, CLAUDE_CONFIG_DIR: configDir, CLAUDE_PLUGIN_DATA: pluginData };
  delete env[identityVariable];
  delete env[rootVariable];
  delete env[contextVariable];
  delete env.CLAUDE_ENV_FILE;
  const root = path.join(configDir, 'runtime', `development-flow-goal-control-${process.getuid()}`);
  const requestEnvironment = (sessionId = 'session-a') => ({
    [identityVariable]: sessionId,
    [rootVariable]: root,
    [contextVariable]: createHash('sha256').update(JSON.stringify([sessionId, pluginData])).digest('hex'),
  });
  const run = (args, input = {}, overrides = {}) => spawnSync(process.execPath, [script, ...args], {
    env: { ...env, ...overrides },
    input: JSON.stringify(input),
    encoding: 'utf8',
  });
  const request = (state = 'paused', reason = 'User requested a pause', sessionId = 'session-a') => {
    const result = run(['request', state, reason], {}, requestEnvironment(sessionId));
    assert.equal(result.status, 0, result.stderr);
    return result;
  };
  return { temporary, env, root, run, request, requestEnvironment };
}

test('manifest hook commands are inert in Codex and dispatch in Claude', (t) => {
  const { temporary, env, request } = fixture(t);
  const pluginRoot = fileURLToPath(new URL('../', import.meta.url));
  const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'hooks/hooks.json'), 'utf8'));
  const commands = Object.fromEntries(Object.entries(manifest.hooks)
    .map(([event, definitions]) => [event, definitions[0].hooks[0].command]));
  const codexEnv = { PATH: process.env.PATH, CODEX_PLUGIN_ROOT: pluginRoot };
  for (const command of Object.values(commands)) {
    const result = spawnSync('/bin/sh', ['-c', command], { env: codexEnv, input: '{}', encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
  }
  const envFile = path.join(temporary, 'session.env');
  const claudeEnv = { ...env, CLAUDE_PLUGIN_ROOT: pluginRoot, CLAUDE_ENV_FILE: envFile };
  const started = spawnSync('/bin/sh', ['-c', commands.SessionStart], {
    env: claudeEnv, input: JSON.stringify({ session_id: 'session-a', source: 'startup' }), encoding: 'utf8',
  });
  assert.equal(started.status, 0, started.stderr);
  assert.match(fs.readFileSync(envFile, 'utf8'), /DEVELOPMENT_FLOW_CLAUDE_SESSION_ID/);
  request();
  const stopped = spawnSync('/bin/sh', ['-c', commands.Stop], {
    env: claudeEnv, input: JSON.stringify({ session_id: 'session-a' }), encoding: 'utf8',
  });
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.equal(JSON.parse(stopped.stdout).continue, false);
});

test('ordinary Stop and non-Claude SessionStart leave no state or output', (t) => {
  const { run, root } = fixture(t);
  for (const args of [['stop'], ['session-start']]) {
    const result = run(args, { session_id: 'session-a', source: 'startup' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
  }
  assert.equal(fs.existsSync(root), false);
});

test('a pause is private, bound to one session and consumed once', (t) => {
  const { run, root, request, env } = fixture(t);
  request();
  assert.equal(fs.statSync(path.dirname(root)).mode & 0o777, 0o700);
  assert.equal(fs.statSync(root).mode & 0o777, 0o700);
  assert.deepEqual(fs.readdirSync(env.CLAUDE_PLUGIN_DATA), []);
  const files = fs.readdirSync(root);
  assert.equal(files.length, 1);
  assert.match(files[0], /^[a-f0-9]{64}\.json$/);
  assert.equal(fs.statSync(path.join(root, files[0])).mode & 0o777, 0o600);
  assert.equal(run(['stop'], { session_id: 'session-b' }).stdout, '');
  const otherPluginData = path.join(path.dirname(root), 'other-plugin');
  fs.mkdirSync(otherPluginData, { mode: 0o700 });
  assert.equal(run(['stop'], { session_id: 'session-a' }, { CLAUDE_PLUGIN_DATA: otherPluginData }).stdout, '');
  const stopped = run(['stop'], { session_id: 'session-a' });
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.deepEqual(JSON.parse(stopped.stdout), {
    continue: false,
    stopReason: 'Native goal paused: User requested a pause',
  });
  assert.equal(run(['stop'], { session_id: 'session-a' }).stdout, '');
  assert.deepEqual(fs.readdirSync(root), []);
});

test('blocked is a pause reason and control characters are bounded and escaped', (t) => {
  const { run, request } = fixture(t);
  request('blocked', `Need "decision"\n\u001b${'x'.repeat(800)}`);
  const result = run(['stop'], { session_id: 'session-a' });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.continue, false);
  assert.match(output.stopReason, /^Work is blocked; native goal paused: Need "decision"  x/);
  assert.equal(output.stopReason.length, 'Work is blocked; native goal paused: '.length + 500);
  assert.doesNotMatch(output.stopReason, /[\u0000-\u001f\u007f-\u009f]/);
});

test('missing identity fails rather than guessing a session', (t) => {
  const { run, root } = fixture(t);
  const result = run(['request', 'paused', 'Stop']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing DEVELOPMENT_FLOW_CLAUDE_SESSION_ID/);
  assert.equal(fs.existsSync(root), false);
});

test('a request requires the root exported by SessionStart', (t) => {
  const { run, root } = fixture(t);
  const result = run(['request', 'paused', 'Stop'], {}, { [identityVariable]: 'session-a' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing or invalid DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_ROOT/);
  assert.equal(fs.existsSync(root), false);
});

test('a request requires the native context exported by SessionStart', (t) => {
  const { run, root } = fixture(t);
  const result = run(['request', 'paused', 'Stop'], {}, { [identityVariable]: 'session-a', [rootVariable]: root });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing or invalid DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_CONTEXT/);
});

test('Claude SessionStart fails clearly without native plugin data; other hosts stay inert', (t) => {
  const { run, temporary, root } = fixture(t);
  const envFile = path.join(temporary, 'session.env');
  const input = { session_id: 'session-a', source: 'startup' };
  const started = run(['session-start'], input, { CLAUDE_ENV_FILE: envFile, CLAUDE_PLUGIN_DATA: '' });
  assert.equal(started.status, 1);
  assert.match(started.stderr, /Missing or invalid CLAUDE_PLUGIN_DATA/);
  assert.equal(fs.existsSync(envFile), false);
  assert.equal(fs.existsSync(root), false);
  for (const args of [['session-start'], ['stop']]) {
    const otherHost = run(args, input, { CLAUDE_PLUGIN_DATA: '' });
    assert.equal(otherHost.status, 0, otherHost.stderr);
    assert.equal(otherHost.stdout, '');
  }
});

test('a sandbox TMPDIR change preserves the hook-selected request location', (t) => {
  const { run, temporary, env, root } = fixture(t);
  const envFile = path.join(temporary, 'session.env');
  const sandboxTemporary = path.join(temporary, 'sandbox');
  fs.mkdirSync(sandboxTemporary);
  const started = run(['session-start'], { session_id: 'session-a', source: 'startup' }, { CLAUDE_ENV_FILE: envFile });
  assert.equal(started.status, 0, started.stderr);
  const requested = spawnSync('/bin/sh', ['-c', '. "$1"; export TMPDIR="$2"; exec "$3" "$4" request paused "Stop"',
    'goal-test', envFile, sandboxTemporary, process.execPath, script], { env, encoding: 'utf8' });
  assert.equal(requested.status, 0, requested.stderr);
  assert.equal(fs.readdirSync(root).length, 1);
  const stopped = run(['stop'], { session_id: 'session-a' });
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.equal(JSON.parse(stopped.stdout).continue, false);
});

test('compaction preserves a request while startup, resume and clear discard stale requests', (t) => {
  const { run, request, temporary } = fixture(t);
  const envFile = path.join(temporary, 'session.env');
  for (const source of ['compact', 'startup', 'resume', 'clear']) {
    request();
    const started = run(['session-start'], { session_id: 'session-a', source }, { CLAUDE_ENV_FILE: envFile });
    assert.equal(started.status, 0, started.stderr);
    const stopped = run(['stop'], { session_id: 'session-a' });
    assert.equal(stopped.status, 0, stopped.stderr);
    assert.equal(Boolean(stopped.stdout), source === 'compact');
  }
});

test('SessionStart exports shell-safe identity that the request command can use', (t) => {
  const { run, temporary, env } = fixture(t);
  const envFile = path.join(temporary, 'session.env');
  const unintendedFile = path.join(temporary, 'unexpected');
  const sessionId = `session'$(touch ${unintendedFile})\nother`;
  const started = run(['session-start'], { session_id: sessionId, source: 'startup' }, { CLAUDE_ENV_FILE: envFile });
  assert.equal(started.status, 0, started.stderr);
  const request = spawnSync('/bin/sh', ['-c', '. "$1"; exec "$2" "$3" request paused "Stop"', 'goal-test', envFile, process.execPath, script], {
    env,
    encoding: 'utf8',
  });
  assert.equal(request.status, 0, request.stderr);
  assert.equal(fs.existsSync(unintendedFile), false);
  assert.equal(JSON.parse(run(['stop'], { session_id: sessionId }).stdout).continue, false);
});

test('simultaneous Stop hooks consume a request exactly once', async (t) => {
  const { env, request, root } = fixture(t);
  request();
  const outputs = await Promise.all(Array.from({ length: 8 }, () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, 'stop'], { env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(stderr));
      else resolve(stdout);
    });
    child.stdin.end(JSON.stringify({ session_id: 'session-a' }));
  })));
  assert.equal(outputs.filter(Boolean).length, 1);
  assert.equal(JSON.parse(outputs.find(Boolean)).continue, false);
  assert.deepEqual(fs.readdirSync(root), []);
});

test('unsafe request directories and files are rejected', (t) => {
  const { root, run, request, temporary, requestEnvironment } = fixture(t);
  fs.mkdirSync(path.dirname(root), { mode: 0o700 });
  fs.chmodSync(path.dirname(root), 0o777);
  assert.match(run(['request', 'paused', 'Stop'], {}, requestEnvironment()).stderr, /mode 0700/);
  fs.chmodSync(path.dirname(root), 0o700);
  fs.mkdirSync(root, { mode: 0o700 });
  fs.chmodSync(root, 0o777);
  assert.match(run(['request', 'paused', 'Stop'], {}, requestEnvironment()).stderr, /mode 0700/);
  fs.rmdirSync(root);
  fs.symlinkSync(temporary, root);
  assert.match(run(['request', 'paused', 'Stop'], {}, requestEnvironment()).stderr, /mode 0700/);
  fs.unlinkSync(root);
  request();
  const pending = path.join(root, fs.readdirSync(root)[0]);
  fs.chmodSync(pending, 0o644);
  const result = run(['stop'], { session_id: 'session-a' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsafe goal-control pause request/);
  assert.equal(result.stdout, '');
});
