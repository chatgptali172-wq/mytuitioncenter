const fs = require('fs');
const path = require('path');

// Output directory is ROOT
const PUBLIC_DIR = __dirname;

// Inject API_BASE securely into the main.js
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
    console.log('✅ API_BASE securely injected into assets/js/main.js');
  }
} else {
  console.warn("⚠️ WARNING: API_BASE environment variable is missing! Skipping injection.");
}

// Read components
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

// Process pages
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
      
      // Write to root
      fs.writeFileSync(path.join(PUBLIC_DIR, page), content);
      console.log(`✅ Built ${page} to root`);
    }
  }
}

console.log('🎉 Build complete! Site generated in root directory.');
