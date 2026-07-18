const fs = require('fs');
const path = require('path');

// Pull the URL securely from the Cloudflare Environment Variable
const envApiBase = process.env.API_BASE;

if (!envApiBase) {
  console.error("\n❌ ERROR: API_BASE environment variable is missing!");
  console.error("Please add it in your Cloudflare Pages dashboard under Settings -> Environment variables.\n");
  process.exit(1);
}

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace the secure placeholder with the actual environment variable URL
html = html.replace(
  "const API_BASE = '{{API_BASE}}';", 
  `const API_BASE = '${envApiBase}';`
);

fs.writeFileSync(indexPath, html);
console.log('✅ API_BASE securely injected into index.html');
