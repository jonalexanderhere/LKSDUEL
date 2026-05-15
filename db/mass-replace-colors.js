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
    if (content.includes('orange-')) {
      console.log(`Updating colors in: ${filePath}`);
      const updatedContent = content.replace(/orange-/g, 'blue-');
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
  }
});

console.log('Mass color replacement complete.');
