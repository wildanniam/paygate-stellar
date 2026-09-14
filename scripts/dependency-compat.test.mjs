import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const plain = (value) => JSON.parse(JSON.stringify(value));

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server.address().port;
}

for (const scope of ['.', 'examples/express-paid-api']) {
  const requireScope = createRequire(new URL(`../${scope}/package.json`, import.meta.url));
  const sdk = requireScope('@stellar/stellar-sdk');
  // Resolve the parser from the SDK itself so a nested, unpatched copy cannot hide.
  const requireSdk = createRequire(requireScope.resolve('@stellar/stellar-sdk'));
  const toml = requireSdk('toml');

  test(`${scope}: StellarToml resolver accepts currencies and rejects invalid input`, async (t) => {
    let fixture = 'NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"\n[[CURRENCIES]]\ncode = "USDC"\ndisplay_decimals = 7\n';
    const server = createServer((_req, res) => res.end(fixture));
    const port = await listen(server);
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const resolveToml = () => sdk.StellarToml.Resolver.resolve(`127.0.0.1:${port}`, { allowHttp: true });
    const result = await resolveToml();
    assert.equal(result.NETWORK_PASSPHRASE, sdk.Networks.TESTNET);
    assert.deepEqual(plain(result.CURRENCIES), [{ code: 'USDC', display_decimals: 7 }]);
    fixture = 'broken = [';
    await assert.rejects(resolveToml(), /stellar.toml is invalid - Parsing error/);
  });

  test(`${scope}: patched TOML keeps prototype keys inert and limits nesting`, () => {
    const result = toml.parse('[__proto__]\npaygatePolluted = true\n');
    assert.equal(Object.hasOwn(result, '__proto__'), true);
    assert.equal(result.__proto__.paygatePolluted, true);
    assert.equal(Object.prototype.paygatePolluted, undefined);
    assert.equal(Object.getPrototypeOf(result), null);
    assert.throws(() => toml.parse(`value = ${'['.repeat(501)}0${']'.repeat(501)}`), /Maximum nesting depth/);
  });

  test(`${scope}: Stellar SDK still builds and reads signed Soroban transaction XDR`, () => {
    const signer = sdk.Keypair.random();
    const contractId = sdk.StrKey.encodeContract(Buffer.alloc(32, 1));
    const contract = new sdk.Contract(contractId);
    const tx = new sdk.TransactionBuilder(new sdk.Account(signer.publicKey(), '0'), {
      fee: sdk.BASE_FEE, networkPassphrase: sdk.Networks.TESTNET,
    }).addOperation(contract.call('withdraw', sdk.nativeToScVal(10n, { type: 'i128' })))
      .setTimeout(60).build();
    tx.sign(signer);
    const parsed = sdk.TransactionBuilder.fromXDR(tx.toXDR(), sdk.Networks.TESTNET);
    assert.equal(parsed.source, signer.publicKey());
    assert.equal(parsed.operations[0].type, 'invokeHostFunction');
    assert.equal(parsed.signatures.length, 1);
    assert.ok(signer.verify(parsed.hash(), parsed.signatures[0].signature()));
  });

  test(`${scope}: MPP CLI formatter remains compatible with patched TOON`, async () => {
    const requireMppx = createRequire(requireScope.resolve('mppx'));
    const incurEntry = requireMppx.resolve('incur');
    const { format } = await import(new URL('./Formatter.js', pathToFileURL(incurEntry)));
    const requireIncur = createRequire(incurEntry);
    const { decode } = await import(pathToFileURL(requireIncur.resolve('@toon-format/toon')));
    const sample = { status: 'paid', amount: '0.010', network: 'testnet' };
    assert.deepEqual(plain(decode(format(sample))), sample);
  });
}

for (const scope of ['.', 'backend', 'examples/express-paid-api']) {
  test(`${scope}: Express query parser preserves ordinary and repeated query values`, () => {
    const requireScope = createRequire(new URL(`../${scope}/package.json`, import.meta.url));
    const requireExpress = createRequire(requireScope.resolve('express'));
    const qs = requireExpress('qs');
    assert.deepEqual(qs.parse('city=Jakarta&tag=weather&tag=current'), {
      city: 'Jakarta', tag: ['weather', 'current'],
    });
    assert.deepEqual(qs.parse('filter[city]=Jakarta'), { filter: { city: 'Jakarta' } });
    assert.deepEqual(qs.parse('__proto__[paygatePolluted]=true'), {});
    assert.equal(Object.prototype.paygatePolluted, undefined);
  });
}

test('local Express adapter preserves route params, JSON requests and auth responses', async (t) => {
  const reservation = createServer();
  const port = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, ['backend/src/index.js'], {
    cwd: rootPath,
    env: {
      ...process.env, PORT: String(port), NODE_ENV: 'test',
      SESSION_SECRET: 'paygate-dependency-smoke-session-secret',
      SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
      PAYGATE_AUTH_CHALLENGE_STORE: 'memory', PAYGATE_REGISTRY_STORE: 'memory',
      PAYGATE_RATE_LIMIT_STORE: 'memory',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  t.after(async () => {
    if (child.exitCode !== null) return;
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Backend exited: ${output}`);
    try { ready = (await fetch(`${base}/health`)).ok; } catch { /* starting */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Backend did not start: ${output}`);
  const me = await fetch(`${base}/api/auth/me?action=logout&tag=a&tag=b`);
  assert.equal(me.status, 200);
  assert.equal((await me.json()).authenticated, false);
  const generated = await fetch(`${base}/api/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpointUrl: 'https://api.example.com', path: '/weather', price: '0.01' }),
  });
  assert.equal(generated.status, 200);
  const result = await generated.json();
  assert.match(result.middleware, /stellar/);
  assert.match(result.integration, /weather/);
  const invalid = await fetch(`${base}/api/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(invalid.status, 400);
});
