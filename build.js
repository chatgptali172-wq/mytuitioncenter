const fs = require('fs');
const path = require('path');

// Pull the URL securely from the Cloudflare Environment Variable
const envApiBase = process.env.API_BASE;

if (!envApiBase) {
  console.error("\n❌ ERROR: API_BASE environment variable is missing!");
  console.error("Please add it in your Cloudflare Pages dashboard under Settings -> Environment variables.\n");
  process.exit(1);
}

const mainJsPath = path.join(__dirname, 'assets', 'js', 'main.js');
let jsContent = fs.readFileSync(mainJsPath, 'utf8');

// Replace the secure placeholder with the actual environment variable URL
jsContent = jsContent.replace(
  /const API_BASE = '.*';/, 
  `const API_BASE = '${envApiBase}';`
);

fs.writeFileSync(mainJsPath, jsContent);
console.log('✅ API_BASE securely injected into main.js');
