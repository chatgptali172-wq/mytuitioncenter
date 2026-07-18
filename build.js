const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const apiBase = process.env.API_BASE;

if (apiBase) {
  content = content.replace(/const API_BASE = '[^']+';/g, `const API_BASE = '${apiBase}';`);
  fs.writeFileSync(indexPath, content);
  console.log(`[Build] Successfully injected API_BASE: ${apiBase}`);
} else {
  console.log('[Build] No API_BASE environment variable found. Using hardcoded URL.');
}
