const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const updated = content.replace(
        /<div className="flex items-center gap-1\.5">([\s\S]{1,200}disabled=\{page === 1\})/g,
        '<div className="flex flex-wrap items-center justify-end gap-1.5">$1'
      );
      
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('Fixed pagination in', fullPath);
      }
    }
  }
}

processDir('c:\\Users\\ADMIN\\Documents\\GitHub\\khang-baby\\front-end\\src\\pages');
