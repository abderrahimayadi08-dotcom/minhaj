const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
// Copy as 404.html so GitHub Pages serves it for any subpath (SPA fallback)
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
console.log('404.html created');
