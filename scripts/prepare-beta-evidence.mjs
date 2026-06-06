import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const requestedRunId = process.argv[2];
const runId = requestedRunId || new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
const runDir = join(rootPath, 'docs', 'evidence', 'runs', runId);
const templatePath = join(rootPath, 'docs', 'evidence', 'PAYGATE_V1_LIVE_REPLAY_TEMPLATE.md');

await mkdir(join(runDir, 'screenshots'), { recursive: true });
await mkdir(join(runDir, 'transcripts'), { recursive: true });

const template = await readFile(templatePath, 'utf8');
const content = template.replaceAll('{{RUN_ID}}', runId).replaceAll('{{DATE_ISO}}', new Date().toISOString());

await writeFile(join(runDir, 'README.md'), content);
await writeFile(join(runDir, 'screenshots', '.gitkeep'), '');
await writeFile(join(runDir, 'transcripts', '.gitkeep'), '');

console.log(`Created beta evidence run folder: docs/evidence/runs/${runId}`);
