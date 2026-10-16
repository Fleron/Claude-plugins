#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const identityVariable = 'DEVELOPMENT_FLOW_CLAUDE_SESSION_ID';
const rootVariable = 'DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_ROOT';
const contextVariable = 'DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_CONTEXT';
const userId = process.getuid();
const pluginData = process.env.CLAUDE_PLUGIN_DATA;
const configDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const rootName = `development-flow-goal-control-${userId}`;
const root = process.argv[2] === 'request'
  ? process.env[rootVariable]
  : path.join(configDir, 'runtime', rootName);

function sessionIdentity(value) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || value.length > 512 || value.includes('\0')) {
    throw new Error('Invalid Claude session identity.');
  }
  return value;
}

function privateDirectory(directory, create) {
  if (create) {
    try {
      fs.mkdirSync(directory, { mode: 0o700 });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  let stat;
  try {
    stat = fs.lstatSync(directory);
  } catch (error) {
    if (error.code === 'ENOENT' && !create) return false;
    throw error;
  }
  if (!stat.isDirectory() || stat.uid !== userId || (stat.mode & 0o777) !== 0o700) {
    throw new Error(`Goal-control directory must be owned by this user with mode 0700: ${directory}`);
  }
  return true;
}

function privateRoot(create = false) {
  if (!root || !path.isAbsolute(root)) throw new Error('Missing or invalid Claude runtime root.');
  return privateDirectory(path.dirname(root), create) && privateDirectory(root, create);
}

function contextKey(sessionId) {
  if (!pluginData || !path.isAbsolute(pluginData)) {
    throw new Error('Missing or invalid CLAUDE_PLUGIN_DATA in Claude hook.');
  }
  return createHash('sha256').update(JSON.stringify([sessionId, pluginData])).digest('hex');
}

function requestPath(key) {
  return path.join(root, `${key}.json`);
}

function cleanReason(reason) {
  if (typeof reason !== 'string') throw new Error('A pause reason is required.');
  const cleaned = reason.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').trim().slice(0, 500);
  if (!cleaned) throw new Error('A pause reason is required.');
  return cleaned;
}

function requestPause(state, reason) {
  if (!['paused', 'blocked'].includes(state)) throw new Error('Use request paused|blocked "reason".');
  const sessionId = sessionIdentity(process.env[identityVariable]);
  if (!sessionId) {
    throw new Error(`Missing ${identityVariable}. Reload the development-flow plugin in a fresh Claude session.`);
  }
  if (!root || !path.isAbsolute(root) || path.basename(root) !== rootName || path.basename(path.dirname(root)) !== 'runtime') {
    throw new Error(`Missing or invalid ${rootVariable}. Reload the development-flow plugin in a fresh Claude session.`);
  }
  const key = process.env[contextVariable];
  if (!key || !/^[a-f0-9]{64}$/.test(key)) {
    throw new Error(`Missing or invalid ${contextVariable}. Reload the development-flow plugin in a fresh Claude session.`);
  }
  const request = { sessionId, key, state, reason: cleanReason(reason) };
  privateRoot(true);
  const target = requestPath(key);
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(request), { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, target);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  process.stdout.write(`Native Claude goal pause requested (${state}). End the turn after the requested wrap-up.\n`);
}

function sessionStart(input) {
  if (!process.env.CLAUDE_ENV_FILE) return;
  const sessionId = sessionIdentity(input.session_id);
  if (!sessionId) throw new Error('SessionStart did not provide a Claude session identity.');
  const key = contextKey(sessionId);
  privateRoot(true);
  if (['startup', 'resume', 'clear'].includes(input.source)) {
    fs.rmSync(requestPath(key), { force: true });
  }
  const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
  fs.appendFileSync(process.env.CLAUDE_ENV_FILE,
    `\nexport ${identityVariable}=${quote(sessionId)}\nexport ${rootVariable}=${quote(root)}\nexport ${contextVariable}=${quote(key)}\n`);
}

function stop(input) {
  const sessionId = sessionIdentity(input.session_id);
  if (!sessionId || !pluginData) return;
  const key = contextKey(sessionId);
  if (!privateRoot()) return;
  const pending = requestPath(key);
  const claimed = `${pending}.${randomUUID()}.claimed`;
  try {
    fs.renameSync(pending, claimed);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  try {
    const stat = fs.lstatSync(claimed);
    if (!stat.isFile() || stat.uid !== userId || (stat.mode & 0o777) !== 0o600 || stat.size > 4096) {
      throw new Error('Unsafe goal-control pause request.');
    }
    const request = JSON.parse(fs.readFileSync(claimed, 'utf8'));
    if (request.sessionId !== sessionId || request.key !== key || !['paused', 'blocked'].includes(request.state)) {
      throw new Error('Invalid goal-control pause request.');
    }
    const reason = cleanReason(request.reason);
    const detail = request.state === 'blocked' ? 'Work is blocked; native goal paused' : 'Native goal paused';
    process.stdout.write(`${JSON.stringify({ continue: false, stopReason: `${detail}: ${reason}` })}\n`);
  } finally {
    fs.rmSync(claimed, { force: true });
  }
}

async function hookInput() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (Buffer.byteLength(input) > 1024 * 1024) throw new Error('Hook input is too large.');
  }
  return JSON.parse(input);
}

try {
  const [command, state, reason, ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error('Unexpected arguments.');
  if (command === 'request') requestPause(state, reason);
  else if (command === 'session-start' && !state) {
    if (process.env.CLAUDE_ENV_FILE) sessionStart(await hookInput());
  } else if (command === 'stop' && !state) stop(await hookInput());
  else throw new Error('Use session-start, stop, or request paused|blocked "reason".');
} catch (error) {
  process.stderr.write(`goal-control: ${error.message}\n`);
  process.exitCode = 1;
}
