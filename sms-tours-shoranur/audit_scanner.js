const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const dataJs = fs.readFileSync('js/data.js', 'utf8');
const css = fs.readFileSync('css/styles.css', 'utf8');

console.log('=== AUDIT CHECK 1: EVENT HANDLERS ===');
const combined = html + '\n' + appJs;
const handlerRegex = /on(?:click|change|input|submit|mouseenter|mouseleave|touchstart|touchend)=["']([^"']+)["']/g;
const handlerCalls = new Set();
let match;
while ((match = handlerRegex.exec(combined)) !== null) {
  const code = match[1];
  const fnMatch = code.match(/([a-zA-Z0-9_]+)\s*\(/);
  if (fnMatch) {
    handlerCalls.add(fnMatch[1]);
  }
}

const missingFns = [];
for (const fn of handlerCalls) {
  const defRegex = new RegExp('(function\\s+' + fn + '\\b|const\\s+' + fn + '\\s*=|let\\s+' + fn + '\\s*=|window\\.' + fn + '\\s*=)');
  if (!defRegex.test(appJs) && !defRegex.test(dataJs) && !defRegex.test(html)) {
    missingFns.push(fn);
  }
}
console.log('Total event handler function calls:', handlerCalls.size);
console.log('Missing/Undefined functions:', missingFns);

console.log('\n=== AUDIT CHECK 2: DOM ELEMENT IDs REFERENCED IN JS ===');
// Find document.getElementById('...') in appJs
const idRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
const referencedIds = new Set();
while ((match = idRegex.exec(appJs)) !== null) {
  referencedIds.add(match[1]);
}

const missingIds = [];
for (const id of referencedIds) {
  // Check if id exists in index.html or is dynamically generated in appJs
  const idPattern = 'id="' + id + '"';
  const idPatternSingle = "id='" + id + "'";
  const idPatternLiteral = 'id=`' + id + '`';
  if (!html.includes(idPattern) && !html.includes(idPatternSingle) &&
      !appJs.includes(idPattern) && !appJs.includes(idPatternSingle) && !appJs.includes(idPatternLiteral)) {
    missingIds.push(id);
  }
}
console.log('Total document.getElementById calls:', referencedIds.size);
console.log('Missing IDs:', missingIds);

console.log('\n=== AUDIT CHECK 3: ROUTE & HASH DESTINATIONS ===');
// Find navigateTo('#/...') and href="#/..."
const routeRegex = /href=["'](#[^"']*)["']|navigateTo\(["'](#[^"']*)["']\)/g;
const routes = new Set();
while ((match = routeRegex.exec(combined)) !== null) {
  const r = match[1] || match[2];
  if (r && r.startsWith('#/')) {
    routes.add(r);
  }
}
console.log('Total SPA routes used in links/buttons:', Array.from(routes));

console.log('\n=== AUDIT CHECK 4: PACKAGE ID INTEGRITY ===');
// Parse tourPackages from store.json or data.js
let store = JSON.parse(fs.readFileSync('data/store.json', 'utf8'));
const validPkgIds = new Set(store.tourPackages.map(p => p.id));
console.log('Valid tour package IDs (' + validPkgIds.size + '):', Array.from(validPkgIds));

// Check any hardcoded package links in app.js and index.html
const pkgLinkRegex = /#\/package\/([a-zA-Z0-9_-]+)/g;
const deadPkgLinks = new Set();
while ((match = pkgLinkRegex.exec(combined)) !== null) {
  const pId = match[1];
  if (!validPkgIds.has(pId) && !validPkgIds.has(pId.replace('-2024', ''))) {
    deadPkgLinks.add(pId);
  }
}
console.log('Invalid or dead package links:', Array.from(deadPkgLinks));

console.log('\n=== AUDIT CHECK 5: GALLERY & BLOG LINK INTEGRITY ===');
const validBlogIds = new Set(store.blogs.map(b => b.id));
const blogLinkRegex = /#\/blog\/([a-zA-Z0-9_-]+)/g;
const deadBlogLinks = new Set();
while ((match = blogLinkRegex.exec(combined)) !== null) {
  const bId = match[1];
  if (!validBlogIds.has(bId)) {
    deadBlogLinks.add(bId);
  }
}
console.log('Valid Blog IDs:', Array.from(validBlogIds));
console.log('Dead Blog Links:', Array.from(deadBlogLinks));
