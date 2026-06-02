const {spawn} = require('child_process');
const fs = require('fs');

process.env.HOME = 'C:\\Users\\rt';
process.env.TMPDIR = 'C:\\Users\\rt\\AppData\\Local\\Temp';
process.env.OPENCLAW_ALLOW_INSECURE_PRIVATE_WS = '1';
process.env.OPENCLAW_GATEWAY_TOKEN = '3KryiMKwZTWiwbcAiDfWQRX4zfkjd4cf';
process.env.OPENCLAW_SERVICE_KIND = 'node';

const out = fs.createWriteStream('C:\\Temp\\oc-node.log');
const p = spawn('C:\\Program Files\\nodejs\\node.exe',
  ['C:\\Users\\rt\\AppData\\Roaming\\npm\\node_modules\\openclaw\\dist\\index.js',
   'node', 'run', '--host', '127.0.0.1', '--port', '55114'],
  {stdio: ['ignore', 'pipe', 'pipe']});

p.stdout.on('data', d => { process.stdout.write(d); out.write(d); });
p.stderr.on('data', d => { process.stderr.write(d); out.write(d); });
p.on('exit', (code) => { console.log('\nProcess exited with code:', code); out.end(); });

// Kill after 10 seconds
setTimeout(() => { p.kill(); }, 10000);
