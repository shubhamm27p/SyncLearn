const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/mcq_engine', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = content.replace(/const\s+(fetch[A-Za-z0-9_]+)\s*=\s*async\s*\(\)\s*=>\s*\{/g, 'async function $1() {');
    if (content !== replaced) {
      fs.writeFileSync(filePath, replaced, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
