const fs = require('fs');
const path = require('path');

// Output directory
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create public dir if it doesn't exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// 1. Copy assets to public
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(PUBLIC_DIR, 'assets');
if (fs.existsSync(assetsSrc)) {
  copyDirectory(assetsSrc, assetsDest);
}

// Additional files like manifest.json, sw.js, sitemap.xml, robots.txt, llms.txt
const rootFiles = ['manifest.json', 'sw.js', 'sitemap.xml', 'robots.txt', 'llms.txt'];
for (const file of rootFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(PUBLIC_DIR, file));
  }
}

// Inject API_BASE securely into the copied main.js inside public/assets/js/
const envApiBase = process.env.API_BASE;
if (envApiBase) {
  const mainJsPath = path.join(PUBLIC_DIR, 'assets', 'js', 'main.js');
  if (fs.existsSync(mainJsPath)) {
    let jsContent = fs.readFileSync(mainJsPath, 'utf8');
    jsContent = jsContent.replace(
      /const API_BASE = '.*';/, 
      `const API_BASE = '${envApiBase}';`
    );
    fs.writeFileSync(mainJsPath, jsContent);
    console.log('✅ API_BASE securely injected into public/assets/js/main.js');
  }
} else {
  console.warn("⚠️ WARNING: API_BASE environment variable is missing! Skipping injection.");
}

// 2. Read components
const componentsDir = path.join(__dirname, 'src', 'components');
const components = {};

if (fs.existsSync(componentsDir)) {
  const compFiles = fs.readdirSync(componentsDir);
  for (const file of compFiles) {
    if (file.endsWith('.html')) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      components[file] = content;
    }
  }
}

// 3. Process pages
const pagesDir = path.join(__dirname, 'src', 'pages');

if (fs.existsSync(pagesDir)) {
  const pages = fs.readdirSync(pagesDir);
  
  for (const page of pages) {
    if (page.endsWith('.html')) {
      let content = fs.readFileSync(path.join(pagesDir, page), 'utf8');
      
      // Replace includes
      for (const [compName, compContent] of Object.entries(components)) {
        const includeTag = `<!-- INCLUDE: ${compName} -->`;
        // Replace all occurrences
        content = content.split(includeTag).join(compContent);
      }
      
      // Write to public
      fs.writeFileSync(path.join(PUBLIC_DIR, page), content);
      console.log(`✅ Built ${page} to public/`);
    }
  }
}

console.log('🎉 Build complete! Site is ready in public/ directory.');
