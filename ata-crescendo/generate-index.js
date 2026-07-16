const fs = require('fs');
const path = require('path');

function getAllJsonFiles(dir, baseDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      result.push(...getAllJsonFiles(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Lee el título y compositor del JSON
      let title = entry.name.replace('.json', '');
      let composer = '';
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content);
        title = data.title || data.Title || title;
        composer = data.composer || data.Composer || data.composer || '';
      } catch (e) {}
      result.push({
        filename: entry.name,
        path: relativePath.replace(/\\/g, '/'),
        title: title,
        composer: composer
      });
    }
  }
  return result;
}

const libraryPath = './library';
const index = getAllJsonFiles(libraryPath);
fs.writeFileSync('./library/index.json', JSON.stringify(index, null, 2), 'utf8');
console.log(`✅ Índice generado con ${index.length} archivos.`);
