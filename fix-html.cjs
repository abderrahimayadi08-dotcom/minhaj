const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const idx = html.indexOf('</body>');
if (idx !== -1) {
  const fixed = html.slice(0, idx) + html.slice(idx);
  fs.writeFileSync(path.join(dist, 'index.html'), fixed);
  console.log('fixed');
}
