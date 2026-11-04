const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAW_CV_SERVICE_URL = (process.env.CV_SERVICE_URL || 'http://127.0.0.1:5001').replace(/\/+$/, '');
const CV_SERVICE_URL = /^https?:\/\//i.test(RAW_CV_SERVICE_URL)
  ? RAW_CV_SERVICE_URL
  : `https://${RAW_CV_SERVICE_URL}`;
const SERVICE_SCRIPT = path.resolve(__dirname, '../../cv_service/server.py');
const CV_ROOT = path.resolve(__dirname, '../../../CV');
const EXPECTED_VERSION = '8';

let child = null;
let starting = null;
let healthyUntil = 0;

function markHealthy() {
  healthyUntil = Date.now() + 30000;
}

function markUnhealthy() {
  healthyUntil = 0;
}

async function fetchHealth(timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${CV_SERVICE_URL}/health`, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function isHealthy(timeoutMs = 2000) {
  return Boolean(await fetchHealth(timeoutMs));
}

function killProcessTree(pid) {
  if (!pid) return;

  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } else {
      process.kill(pid, 'SIGTERM');
    }
  } catch (error) {
    console.error(`[cv-service] Could not stop process ${pid}: ${error.message}`);
  }
}

function stopChild() {
  if (!child || child.killed) return;
  killProcessTree(child.pid);
  child = null;
}

function resolvePython() {
  const candidates = [
    process.env.CV_PYTHON,
    path.join(CV_ROOT, '.venv', 'Scripts', 'python.exe'),
    path.join(CV_ROOT, '.venv', 'bin', 'python'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return process.env.CV_PYTHON || 'python';
}

function spawnService() {
  if (child && !child.killed) return child;

  const python = resolvePython();
  const configuredPort = new URL(CV_SERVICE_URL).port || '5001';
  console.log(`[cv-service] Starting CV bridge with: ${python}`);

  child = spawn(python, [SERVICE_SCRIPT], {
    cwd: path.dirname(SERVICE_SCRIPT),
    env: {
      ...process.env,
      CV_DIR: CV_ROOT,
      CV_SERVICE_PORT: process.env.CV_SERVICE_PORT || configuredPort,
      PYTHONUNBUFFERED: '1',
      TF_CPP_MIN_LOG_LEVEL: process.env.TF_CPP_MIN_LOG_LEVEL || '2',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[cv-service] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[cv-service] ${chunk}`));
  child.on('error', (error) => {
    console.error(`[cv-service] Failed to start: ${error.message}`);
    child = null;
  });
  child.on('exit', (code) => {
    console.log(`[cv-service] Bridge stopped with code ${code}`);
    child = null;
  });

  return child;
}

async function ensureCVService() {
  if (Date.now() < healthyUntil) return true;

  const health = await fetchHealth();

  if (health) {
    if (!EXPECTED_VERSION || String(health.version) === EXPECTED_VERSION) {
      markHealthy();
      return true;
    }

    console.log(`[cv-service] Restarting outdated bridge (v${health.version} -> v${EXPECTED_VERSION})`);
    stopChild();
    killProcessTree(process.platform === 'win32' ? health.parentPid : health.pid);
    if (health.pid && health.pid !== health.parentPid) killProcessTree(health.pid);
    healthyUntil = 0;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  if (!starting) {
    starting = (async () => {
      spawnService();

      for (let attempt = 0; attempt < 45; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const current = await fetchHealth(2500);
        if (current && (!EXPECTED_VERSION || String(current.version) === EXPECTED_VERSION)) {
          console.log('[cv-service] Bridge is ready');
          markHealthy();
          return true;
        }
      }

      console.error('[cv-service] Bridge did not become ready in time');
      return false;
    })().finally(() => {
      starting = null;
    });
  }

  return starting;
}

function stopCVService() {
  stopChild();
}

module.exports = {
  CV_SERVICE_URL,
  ensureCVService,
  isHealthy,
  markUnhealthy,
  stopCVService,
};
