const { spawn } = require('node:child_process');
const fs = require('node:fs');
if (fs.existsSync('.env')) process.loadEnvFile('.env');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const envArgs = args.filter((arg) => arg.startsWith('--api='));
if (envArgs.length > 1 || (envArgs[0] && !['--api=dev', '--api=prod'].includes(envArgs[0]))) {
  console.error('Uso: pnpm start -- --api=dev|prod'); process.exit(1);
}
const target = envArgs[0] === '--api=prod' ? 'prod' : 'dev';
const key = target === 'prod' ? 'EXPO_PUBLIC_PROD_API_URL' : 'EXPO_PUBLIC_DEV_API_URL';
try { const url = new URL(process.env[key]); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
catch { console.error(`Configura ${key} con una URL HTTP(S) válida en .env`); process.exit(1); }
const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), 'start', '--clear', ...args.filter((arg) => !arg.startsWith('--api='))], {
  stdio: 'inherit', env: { ...process.env, EXPO_PUBLIC_API_ENV: target },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 0));
