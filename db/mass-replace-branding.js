const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetExtensions = ['.tsx', '.ts', '.css', '.js'];
const srcDir = path.join(__dirname, '..', 'src');

walkDir(srcDir, (filePath) => {
  if (targetExtensions.includes(path.extname(filePath))) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Phoenix Arena')) {
      console.log(`Updating branding in: ${filePath}`);
      // Replace with SCTF26 for short mentions, or we could use APP.fullName but it requires importing APP which might cause circular deps in some files.
      // So I'll use SCTF26 for simple text replacements.
      const updatedContent = content.replace(/Phoenix Arena/g, 'SCTF26');
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
  }
});

console.log('Branding replacement complete.');
