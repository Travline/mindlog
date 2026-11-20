const { spawn } = require('node:child_process');
const fs = require('node:fs');
if (fs.existsSync('.env')) process.loadEnvFile('.env');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
if (args.some((arg) => arg.startsWith('--api='))) {
  console.error('La app usa EXPO_PUBLIC_PROD_API_URL; elimina el argumento --api.'); process.exit(1);
}
const key = 'EXPO_PUBLIC_PROD_API_URL';
try { const url = new URL(process.env[key]); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
catch { console.error(`Configura ${key} con una URL HTTP(S) válida en .env`); process.exit(1); }
const launchMode = args.some((arg) => arg === '--dev-client' || arg === '--go') ? [] : ['--dev-client'];
const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), 'start', ...launchMode, ...args], {
  stdio: 'inherit', env: process.env,
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 0));
