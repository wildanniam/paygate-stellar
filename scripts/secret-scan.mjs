import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SKIP_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.zip',
  '.gz',
  '.wasm',
]);

const SECRET_NAME = /(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|SERVICE_ROLE_KEY|API_KEY|ENCRYPTION_KEY)/i;
const ASSIGNMENT = /\b([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|SERVICE_ROLE_KEY|API_KEY|ENCRYPTION_KEY)[A-Z0-9_]*)\b\s*[:=]\s*([^#\n\r,]+)/g;

const RULES = [
  {
    id: 'stellar-secret-key',
    pattern: /\bS[A-Z2-7]{55}\b/g,
    message: 'Possible Stellar secret key',
  },
  {
    id: 'private-key-block',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    message: 'Possible private key block',
  },
  {
    id: 'jwt-token',
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    message: 'Possible committed JWT or service token',
  },
];

function listTrackedFiles() {
  const raw = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  return raw.split('\0').filter(Boolean);
}

function shouldScan(file) {
  const normalized = file.split(path.sep).join('/');
  if (normalized.includes('/node_modules/')) return false;
  if (normalized.startsWith('node_modules/')) return false;
  if (normalized.startsWith('.git/')) return false;
  if (normalized.startsWith('frontend/dist/')) return false;
  if (normalized.startsWith('dist/')) return false;
  return !SKIP_EXTENSIONS.has(path.extname(normalized).toLowerCase());
}

function lineNumberForIndex(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function redact(value) {
  const trimmed = value.trim();
  if (trimmed.length <= 8) return '[redacted]';
  return `${trimmed.slice(0, 4)}...[redacted]...${trimmed.slice(-4)}`;
}

function normalizeAssignedValue(rawValue) {
  const trimmed = rawValue.trim();
  const value = /^[`'"]/.test(trimmed) ? trimmed : trimmed.split(/\s+/)[0];
  return value
    .replace(/^[`'"]/, '')
    .replace(/[`'"];?$/, '')
    .trim();
}

function isAllowedPlaceholder(value) {
  const normalized = value.trim();
  const lower = normalized.toLowerCase();

  if (!normalized) return true;
  if (normalized === '...' || /^[GS]\.\.\.$/.test(normalized)) return true;
  if (normalized.includes('${')) return true;
  if (normalized.startsWith('process.env.')) return true;
  if (normalized.startsWith('import.meta.env.')) return true;
  if (normalized.startsWith('<') || normalized.endsWith('>')) return true;
  if (lower.includes('replace')) return true;
  if (lower.includes('placeholder')) return true;
  if (lower.includes('example')) return true;
  if (lower.includes('your-')) return true;
  if (lower.includes('copy_')) return true;
  if (lower.includes('changeme')) return true;
  if (lower.includes('dummy')) return true;
  if (lower.includes('smoke')) return true;
  if (lower.includes('phase') && lower.includes('secret')) return true;
  if (lower.includes('wrong') && lower.includes('secret')) return true;
  if (lower.includes('not-configured')) return true;
  if (/^[A-Z0-9_./:-]+$/.test(normalized) && SECRET_NAME.test(normalized)) return true;

  return false;
}

function addFinding(findings, file, line, rule, detail) {
  findings.push({
    file,
    line,
    rule,
    detail,
  });
}

async function scanFile(file, findings) {
  let content;
  try {
    content = await readFile(file, 'utf8');
  } catch {
    return;
  }

  for (const rule of RULES) {
    const matches = content.matchAll(rule.pattern);
    for (const match of matches) {
      addFinding(findings, file, lineNumberForIndex(content, match.index || 0), rule.id, rule.message);
    }
  }

  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!SECRET_NAME.test(line)) return;

    ASSIGNMENT.lastIndex = 0;
    const matches = line.matchAll(ASSIGNMENT);
    for (const match of matches) {
      const value = normalizeAssignedValue(match[2]);
      if (isAllowedPlaceholder(value)) continue;
      addFinding(
        findings,
        file,
        index + 1,
        'secret-assignment',
        `${match[1]} appears to be assigned a literal value: ${redact(value)}`,
      );
    }
  });
}

const findings = [];
const files = listTrackedFiles().filter(shouldScan);

for (const file of files) {
  await scanFile(file, findings);
}

if (findings.length > 0) {
  console.error('Potential secrets found in tracked files:');
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} [${finding.rule}] ${finding.detail}`);
  }
  process.exit(1);
}

console.log(`Secret scan passed (${files.length} tracked files scanned).`);
