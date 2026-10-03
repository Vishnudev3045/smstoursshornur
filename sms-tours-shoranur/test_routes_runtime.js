const fs = require('fs');

// Create a minimal DOM environment
const elements = new Map();

class FakeClassList {
  constructor() { this.classes = new Set(); }
  add(...c) { c.forEach(x => this.classes.add(x)); }
  remove(...c) { c.forEach(x => this.classes.delete(x)); }
  toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
  contains(c) { return this.classes.has(c); }
}

class FakeElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.classList = new FakeClassList();
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.src = '';
    this.min = '';
    this.checked = false;
  }
  scrollIntoView() {}
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k]; }
  addEventListener() {}
  removeEventListener() {}
  querySelector(sel) { return new FakeElement(); }
  querySelectorAll(sel) { return []; }
}

const html = fs.readFileSync('index.html', 'utf8');
// Parse all IDs in index.html and create them
const idRegex = /id=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(html)) !== null) {
  elements.set(m[1], new FakeElement(m[1]));
}

// Add global mocks
global.window = {
  location: { hash: '#/' },
  addEventListener: () => {},
  scrollTo: () => {},
  open: () => {},
  scrollY: 0,
  innerWidth: 1024,
  innerHeight: 768
};
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: (id) => elements.get(id) || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
    return new FakeElement();
  },
  querySelectorAll: (sel) => [],
  createElement: (tag) => new FakeElement('', tag),
  body: new FakeElement('body')
};
global.lucide = { createIcons: () => {} };
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Load data.js
const dataCode = fs.readFileSync('js/data.js', 'utf8');
eval(dataCode);
for (const k in global.window) {
  global[k] = global.window[k];
}

// Load app.js
const appCode = fs.readFileSync('js/app.js', 'utf8');
eval(appCode);

console.log('App and Data loaded successfully without syntax errors.');

const routesToTest = [
  () => renderHomePage(),
  () => renderPackagesPage(),
  () => renderCategoryPage('international'),
  () => renderCategoryPage('domestic'),
  () => renderCategoryPage('day-trip'),
  () => renderGalleryPage(),
  () => renderBlogPage(),
  () => renderAboutPage(),
  () => renderContactPage(),
  () => renderAdminPage(),
  () => openBookingModal(),
  () => openBookingModal('dubai'),
  () => openStoryModal('story-dubai'),
  () => openStoryModal('story-kashmir'),
  () => closeBookingModal(),
  () => closeStoryModal(),
  () => toggleWishlistModal(),
  () => closeWishlistModal(),
  () => openLightbox(0),
  () => closeLightbox()
];

// Test all packages
tourPackages.forEach(pkg => {
  routesToTest.push(() => renderPackageDetailPage(pkg.id));
});

// Test all blogs
companyInfo.blogs.forEach(blog => {
  routesToTest.push(() => renderBlogDetailPage(blog.id));
});

console.log(`Running ${routesToTest.length} test cases...`);
let passed = 0;
let failed = 0;

routesToTest.forEach((fn, idx) => {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    console.error(`FAILED test case #${idx}:`, err.message);
  }
});

console.log(`Test Results: ${passed} passed, ${failed} failed.`);
