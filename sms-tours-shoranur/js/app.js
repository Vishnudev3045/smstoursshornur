// SMS Tours & Travels Shoranur - Dynamic Single Page Application (SPA) Engine

let activeCategory = 'all';
let activeTheme = 'all';
let searchQuery = '';
let metaSliderInterval = null;
let heroSliderInterval = null;
let currentHeroSlide = 0;
let currentSlideIndex = 0;
let savedTourIds = ['dubai', 'kashmir-yathra']; // initial preview
let activeGalleryCategory = 'all';
let packagesPageCat = 'all';
let packagesPageSort = 'featured';
let packagesPageSearch = '';
let blogPageCat = 'all';
let blogPageSearch = '';
let activeCurrency = 'INR';
let storyModalInterval = null;
let storyModalTimeRemaining = 5000;
let whatsappTeaserTimer = null;
let adminActiveTab = 'packages';

const heroSlidesData = [
  {
    image: 'assets/hero-island-2.jpg',
    tag: 'Tropical Lagoon & Speedboat Safari',
    location: 'Exotic Lagoon & Sandbar Tours',
    title: 'Crystal Lagoon Cruises & Speedboat Island Excursions &bull; SMS Tours Shoranur',
    desc: 'All-inclusive flights, speedboats, turquoise lagoons & guided coral island exploration.'
  },
  {
    image: 'assets/hero-island.jpg',
    tag: 'Tropical Island Getaways',
    location: 'Exotic Island & Coastal Tours',
    title: 'Tropical Paradise Cruises & Island Escapes &bull; SMS Tours Shoranur',
    desc: 'All-inclusive flights, luxury stays, yacht cruises & guided island excursions.'
  }
];

// Calculator State for Dynamic Tour Page
let calcState = {
  adults: 2,
  children: 0,
  hotelTier: 'deluxe', // standard, deluxe, luxury
  includeFlights: false,
  basePrice: 0,
  packageId: null
};

// Initialize Application & Router
function initApp() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('scroll', () => {
    updateHeaderStyle();
  }, { passive: true });

  handleRoute();
  updateWishlistUI();
  updateHeaderStyle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Client-Side Router (Supports both hash #/route and Netlify pathname /route)
function handleRoute() {
  let hash = window.location.hash || '';
  const pathname = window.location.pathname.replace(/^\/|\/$/g, '');

  // Detect direct path routing on Netlify / static servers
  if (!hash || hash === '#' || hash === '#/') {
    if (pathname === 'admin') {
      hash = '#/admin';
      history.replaceState(null, '', '#/admin');
    } else if (pathname === 'packages' || pathname === 'tours') {
      hash = '#/packages';
      history.replaceState(null, '', '#/packages');
    } else if (pathname === 'gallery') {
      hash = '#/gallery';
      history.replaceState(null, '', '#/gallery');
    } else if (pathname === 'blog' || pathname === 'blogs') {
      hash = '#/blog';
      history.replaceState(null, '', '#/blog');
    } else if (pathname === 'about' || pathname === 'about-us') {
      hash = '#/about';
      history.replaceState(null, '', '#/about');
    } else if (pathname === 'contact') {
      hash = '#/contact';
      history.replaceState(null, '', '#/contact');
    } else if (pathname.startsWith('package/')) {
      hash = '#/' + pathname;
      history.replaceState(null, '', hash);
    } else if (pathname.startsWith('category/')) {
      hash = '#/' + pathname;
      history.replaceState(null, '', hash);
    } else if (pathname.startsWith('blog/')) {
      hash = '#/' + pathname;
      history.replaceState(null, '', hash);
    } else {
      hash = '#/';
    }
  }

  const isAnchorOnly = hash.startsWith('#') && !hash.startsWith('#/') && hash !== '#';

  if (!isAnchorOnly) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (typeof metaSliderInterval !== 'undefined' && metaSliderInterval) {
    clearInterval(metaSliderInterval);
    metaSliderInterval = null;
  }

  if (typeof heroSliderInterval !== 'undefined' && heroSliderInterval) {
    clearInterval(heroSliderInterval);
    heroSliderInterval = null;
  }

  const isHome = (hash === '#/' || hash === '#' || hash === '');
  if (!isHome && typeof stopHeroElephantAnimation === 'function') {
    stopHeroElephantAnimation();
  }

  if (hash.startsWith('#/package/')) {
    const packageId = hash.replace('#/package/', '');
    renderPackageDetailPage(packageId);
  } else if (hash.startsWith('#/category/')) {
    const category = hash.replace('#/category/', '');
    renderCategoryPage(category);
  } else if (hash === '#/packages' || hash === '#/tours') {
    renderPackagesPage();
  } else if (hash.startsWith('#/blog/')) {
    const blogId = hash.replace('#/blog/', '');
    renderBlogDetailPage(blogId);
  } else if (hash === '#/blog' || hash === '#/blogs') {
    renderBlogPage();
  } else if (hash === '#/gallery') {
    renderGalleryPage();
  } else if (hash === '#/about' || hash === '#/about-us') {
    renderAboutPage();
  } else if (hash === '#/contact') {
    renderContactPage();
  } else if (hash === '#/admin' || hash === '#admin') {
    renderAdminPage();
  } else {
    const isAlreadyHome = document.getElementById('hero-cover-section') !== null;
    if (!isAlreadyHome) {
      renderHomePage();
    }
    if (hash && hash !== '#/' && hash !== '#') {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, isAlreadyHome ? 20 : 150);
    }
  }

  // Auto-close mobile menu on route changes
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
    const btn = document.getElementById('mobile-menu-btn');
    if (btn) btn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
  }

  updateNavActiveState(hash);
  updateHeaderStyle();
  lucide.createIcons();
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function updateHeaderStyle() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const hash = window.location.hash || '#/';
  const isHomePage = (hash === '#/' || hash === '#' || hash === '');
  const isScrolled = window.scrollY > 40;

  if (isHomePage && !isScrolled) {
    header.classList.add('header-blended');
    header.classList.remove('header-solid');
  } else {
    header.classList.remove('header-blended');
    header.classList.add('header-solid');
  }
}

function updateNavActiveState(hash) {
  document.querySelectorAll('.header-nav-link, .nav-pill').forEach(pill => {
    pill.classList.remove('active');
  });

  let targetRoute = 'home';
  if (hash.includes('international') || hash.includes('domestic') || hash.includes('day-trip') || hash.includes('packages') || hash.startsWith('#/category/')) {
    targetRoute = 'packages';
  } else if (hash.includes('gallery')) {
    targetRoute = 'gallery';
  } else if (hash.includes('blog')) {
    targetRoute = 'blog';
  } else if (hash.includes('about')) {
    targetRoute = 'about';
  } else if (hash.includes('contact')) {
    targetRoute = 'contact';
  } else {
    targetRoute = 'home';
  }

  document.querySelectorAll(`[data-route="${targetRoute}"]`).forEach(el => el.classList.add('active'));
}

// --------------------------------------------------------------------------
// 1. HOME PAGE VIEW (Exact Modules of smstoursshoranur.in in White & SMS Blue)
// --------------------------------------------------------------------------
function renderHomePage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <!-- MODULE 1: HERO COVER BANNER (.hero-slider-sec, .wp-block-cover from smstoursshoranur.in) -->
    <section id="hero-cover-section" class="relative w-full overflow-hidden bg-white text-slate-900 pt-20 sm:pt-28 lg:pt-32 pb-10 sm:pb-16 lg:pb-20 border-b border-slate-100">
      <!-- Ambient Animated Mesh Glow in Sky Blue & Emerald -->
      <div class="absolute -top-12 -left-12 w-[520px] h-[520px] bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-emerald-400/15 rounded-full blur-3xl pointer-events-none animate-mesh-glow"></div>
      <div class="absolute -bottom-8 right-1/4 w-[480px] h-[480px] bg-gradient-to-bl from-blue-600/15 via-sky-400/20 to-teal-300/15 rounded-full blur-3xl pointer-events-none animate-mesh-glow" style="animation-delay: -7s;"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 xl:gap-12 items-center">
          
          <!-- Left Column: Branding, Title, Search & Badges (Neat & Balanced) -->
          <div class="lg:col-span-5 space-y-4 sm:space-y-6">
            
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>SMS Tours & Travels Shoranur</span>
            </div>

            <div class="space-y-2">
              <h1 class="font-display text-[26px] xs:text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-black text-slate-900 tracking-tight leading-[1.15] uppercase">
                Ultimate Travel<br><span class="bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 bg-clip-text text-transparent">Solution</span>
              </h1>
              <p class="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-lg">
                Embark on a journey of a lifetime with tour travel and adventure campaigns. Experience the world's most captivating destinations with expertly curated group departures from Shoranur.
              </p>
            </div>

            <!-- Pill Search Capsule -->
            <div class="navik-search-capsule p-2.5 sm:p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-2 w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl sm:rounded-full shadow-lg shadow-blue-500/5">
              <!-- Where to -->
              <div class="flex items-center gap-2 flex-1 min-w-0 px-2 sm:px-0">
                <i data-lucide="map-pin" class="w-4 h-4 text-blue-600 shrink-0"></i>
                <div class="flex-1 min-w-0">
                  <select id="hero-search-dest" onchange="executeHeroSearch()" class="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer truncate py-1">
                    <option value="all">Where to explore?</option>
                    <option value="Dubai">Dubai, UAE</option>
                    <option value="Bangkok">Bangkok & Thailand</option>
                    <option value="Hyderabad">Hyderabad Royal</option>
                    <option value="Kashmir">Kashmir Valleys</option>
                    <option value="Wayanad">Wayanad Hills</option>
                    <option value="Kanthalloor">Kanthalloor & Munnar</option>
                    <option value="Parambikulam">Parambikulam Safari</option>
                    <option value="Pilgrimage">Pilgrimage South India</option>
                  </select>
                </div>
              </div>

              <!-- Divider -->
              <div class="w-full h-px bg-slate-100 sm:hidden"></div>
              <div class="hidden sm:block w-px h-6 bg-slate-200 shrink-0"></div>

              <!-- Date Range -->
              <div class="flex items-center gap-2 flex-1 min-w-0 px-2 sm:px-0">
                <i data-lucide="calendar" class="w-4 h-4 text-blue-600 shrink-0"></i>
                <div class="flex-1 min-w-0">
                  <input type="text" id="hero-search-dates" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'" placeholder="Travel Date" class="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none cursor-pointer py-1">
                </div>
              </div>

              <!-- Search Button -->
              <button onclick="executeHeroSearch()" class="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/25 shrink-0 cursor-pointer text-center">
                <span>Search</span>
              </button>
            </div>

            <!-- 3 Benefit Trust Badges -->
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-1 w-full max-w-lg">
              <div class="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-[10px] sm:text-[11px] text-slate-900 leading-tight truncate">Certified</h4>
                  <p class="text-[9px] sm:text-[10px] text-slate-500 truncate">15+ yrs Shoranur</p>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                  <i data-lucide="compass" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-[10px] sm:text-[11px] text-slate-900 leading-tight truncate">Departures</h4>
                  <p class="text-[9px] sm:text-[10px] text-slate-500 truncate">All-inclusive</p>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                  <i data-lucide="headset" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-[10px] sm:text-[11px] text-slate-900 leading-tight truncate">24/7 Support</h4>
                  <p class="text-[9px] sm:text-[10px] text-slate-500 truncate">WhatsApp live</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Tropical Island Paradise (Enlarged Hero Image) -->
          <div class="lg:col-span-7 relative">

            <div id="hero-slider-card" class="relative w-full rounded-2.5xl sm:rounded-3xl lg:rounded-4xl overflow-hidden border border-slate-200/90 shadow-2xl shadow-blue-500/15 group aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] min-h-[260px] sm:min-h-[400px] lg:min-h-[500px] flex items-center justify-center select-none bg-slate-900">
              
              <!-- Slide 1: Newly Added Tropical Lagoon & Speedboats -->
              <div class="hero-slide active" data-slide-index="0">
                <img src="assets/hero-island-2.jpg" alt="Tropical Lagoon Speedboat Safari - SMS Tours & Travels Shoranur" class="w-full h-full object-cover" />
              </div>

              <!-- Slide 2: Aerial Tropical Island & Yacht -->
              <div class="hero-slide" data-slide-index="1">
                <img src="assets/hero-island.jpg" alt="Tropical Island Paradise - SMS Tours & Travels Shoranur" class="w-full h-full object-cover" />
              </div>
              
              <!-- Subtle Cinematic Vignette -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20 pointer-events-none"></div>
              
              <!-- Top Left Live Badge (Dynamic) -->
              <div class="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white shadow-lg pointer-events-none">
                <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span id="hero-slide-badge" class="text-[10px] sm:text-xs font-bold tracking-wide text-slate-100 transition-opacity duration-300">Tropical Lagoon & Speedboat Safari</span>
              </div>

              <!-- Top Right Controls: Counter & Explore Button -->
              <div class="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
                <span id="hero-slide-counter" class="text-[10px] sm:text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-slate-200 shadow-lg">01 / 02</span>
                <a href="#/packages" class="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-900 text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-lg transition transform hover:scale-105">
                  <i data-lucide="compass" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600"></i>
                  <span>Explore Tours</span>
                </a>
              </div>

              <!-- Previous / Next Controls -->
              <button onclick="prevHeroSlide(event)" aria-label="Previous Slide" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
                <i data-lucide="chevron-left" class="w-4 h-4 sm:w-5 sm:h-5 text-white"></i>
              </button>
              <button onclick="nextHeroSlide(event)" aria-label="Next Slide" class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
                <i data-lucide="chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-white"></i>
              </button>

              <!-- Bottom Overlay Caption & Dot Indicators -->
              <div class="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 text-white bg-slate-900/85 backdrop-blur-md p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] sm:text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1">
                    <i data-lucide="map-pin" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400"></i>
                    <span id="hero-slide-location-text">Exotic Lagoon & Sandbar Tours</span>
                  </span>
                  <!-- Interactive Dots -->
                  <div id="hero-slider-dots" class="flex items-center gap-1.5">
                    <button onclick="goToHeroSlide(0, event)" class="hero-dot active" aria-label="Slide 1"></button>
                    <button onclick="goToHeroSlide(1, event)" class="hero-dot" aria-label="Slide 2"></button>
                  </div>
                </div>
                <h3 id="hero-slide-title" class="text-xs sm:text-base font-bold text-white leading-tight">
                  Crystal Lagoon Cruises & Speedboat Island Excursions &bull; SMS Tours Shoranur
                </h3>
                <p id="hero-slide-desc" class="hidden sm:block text-xs text-slate-300 line-clamp-1">
                  All-inclusive flights, speedboats, turquoise lagoons & guided coral island exploration.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- CONTENT WRAPPER FOR HOME PAGE MODULES -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-12 pb-16">

      <!-- MODULE 2.5: INSTAGRAM-STYLE "RECENT TOUR MOMENTS" STORIES HIGHLIGHTS -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">Recent Group Moments</h3>
            <span class="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">Tap to Watch Stories</span>
          </div>
          <span class="text-xs text-slate-400 hidden sm:inline">Captured by SMS Tour Leaders</span>
        </div>
        <div class="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
          ${((typeof tourStories !== 'undefined' ? tourStories : (typeof window !== 'undefined' ? window.tourStories : [])) || []).map((story) => `
            <div onclick="openStoryModal('${story.id}')" class="flex flex-col items-center gap-2 shrink-0 cursor-pointer group select-none">
              <div class="story-ring shadow-sm">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white bg-slate-100 shadow-inner">
                  <img src="${story.avatar}" alt="${story.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" loading="lazy">
                </div>
              </div>
              <span class="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate max-w-[85px] text-center">${story.name}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- MODULE 3: FORTHCOMING TOURS 3-PANEL MODULE (.FP-FORTHCOMING-TOURS from smstoursshoranur.in) -->
      <section class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-2">
              Special Group Departures
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Forthcoming Tours</h2>
            <p class="text-slate-600 text-sm mt-1">Special fixed departure tours curated with flight, hotel, and complete guided sightseeing.</p>
          </div>
          <a href="#/category/international" class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm">
            <span>View All Fixed Tours</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          ${forthcomingTours.map(tour => `
            <div class="forthcoming-card bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div>
                <div class="relative h-60 overflow-hidden cursor-pointer" onclick="navigateTo('#/package/${tour.id}')">
                  <img src="${tour.image}" alt="${tour.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500" loading="lazy">
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                  <span class="forthcoming-badge absolute top-4 left-4 px-3.5 py-1 rounded-full text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    Forthcoming
                  </span>
                  <div class="absolute bottom-4 left-4 right-4 text-white">
                    <span class="text-xs text-sky-300 font-bold uppercase tracking-wider drop-shadow-sm">${tour.subtitle}</span>
                    <h3 class="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-md">${tour.title}</h3>
                  </div>
                </div>
                <div class="p-6 space-y-3 bg-white">
                  <p class="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    ${tour.desc}
                  </p>
                </div>
              </div>
              <div class="p-6 pt-0 border-t border-slate-100 mt-2 bg-white">
                <button onclick="navigateTo('#/package/${tour.id}')" class="forthcoming-btn w-full py-3.5 rounded-2xl text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer">
                  <span>${tour.buttonText}</span>
                  <i data-lucide="arrow-up-right" class="w-4 h-4 text-white"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- MODULE 4: FEATURED QUOTE BANNER (.FP-EXPERIENCE from smstoursshoranur.in) -->
      <section class="bg-gradient-to-r from-blue-50 via-sky-50/60 to-blue-50 rounded-3xl p-8 sm:p-12 text-slate-900 relative overflow-hidden text-center shadow-sm border border-blue-100">
        <div class="max-w-3xl mx-auto space-y-4">
          <i data-lucide="quote" class="w-10 h-10 text-blue-600 mx-auto opacity-75"></i>
          <h3 class="text-2xl sm:text-4xl font-extrabold tracking-tight italic text-slate-900">
            "Experience the world's most captivating destinations with our featured trip."
          </h3>
          <p class="text-xs sm:text-sm text-blue-600 uppercase tracking-widest font-bold">
            — SMS Tours & Travels Shoranur • Palakkad, Kerala
          </p>
        </div>
      </section>

      <!-- MODULE 4.5: INTERACTIVE TRIP MATCHER 3-STEP QUIZ CAPSULE -->
      <section class="bg-gradient-to-br from-blue-900 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-blue-500/30">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="max-w-3xl mx-auto space-y-6 relative z-10 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-sky-400"></i>
            <span>Interactive Trip Matcher</span>
          </div>
          <div>
            <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Find Your Ideal Departure in 3 Clicks</h3>
            <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">Select who you are traveling with and your dream vibe — we'll match the best SMS Tours departure for you.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
            <!-- Step 1: Traveler Type -->
            <div class="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 space-y-2">
              <label class="block text-xs font-bold text-sky-200">1. Who are you traveling with?</label>
              <select id="matcher-traveler" class="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-sky-400">
                <option value="family">👨‍👩‍👧 Family with Kids / Elders</option>
                <option value="couple">💑 Couple / Honeymoon Escapes</option>
                <option value="friends">🎒 Friends & Adventure Squad</option>
                <option value="solo">🧳 Solo / Spiritual Seekers</option>
              </select>
            </div>

            <!-- Step 2: Trip Vibe -->
            <div class="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 space-y-2">
              <label class="block text-xs font-bold text-sky-200">2. What vibe are you craving?</label>
              <select id="matcher-vibe" class="w-full bg-slate-900/90 text-white border border-white/20 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-sky-400">
                <option value="international">✈️ International Luxury & Skyscrapers (Dubai/Thailand)</option>
                <option value="snow">❄️ Snow Valleys & Shikara Houseboats (Kashmir)</option>
                <option value="nature">🌿 Rainforest Mist & Waterfalls (Wayanad/Kanthalloor)</option>
                <option value="heritage">🏛️ Royal Palaces & Film Magic (Hyderabad)</option>
                <option value="pilgrimage">🛕 Holy Temples & Spiritual Yatras</option>
              </select>
            </div>
          </div>

          <!-- Match Action Button -->
          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onclick="executeTripMatcher()" class="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer">
              <i data-lucide="compass" class="w-4 h-4 text-slate-950"></i>
              <span>Match My Dream Tour Now</span>
            </button>
            <span id="matcher-result-text" class="text-xs font-semibold text-sky-300"></span>
          </div>
        </div>
      </section>

      <!-- MODULE 5: INTERACTIVE FILTER & SEARCH BAR + TOUR PACKAGES GRID -->
      <section id="tours-catalog" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-2">
              Curated Tour Catalog
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">All Tour Packages & Itineraries</h2>
            <p class="text-slate-600 text-sm mt-1">Click any package for its dedicated page with live price calculator and full itinerary</p>
          </div>

          <!-- Real-Time Currency Switcher (INR / USD) -->
          <div class="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-300 shadow-inner self-start sm:self-auto">
            <span class="text-[11px] font-bold text-slate-500 pl-2 pr-1">Currency:</span>
            <button id="curr-btn-inr" onclick="toggleCurrency('INR')" class="px-3 py-1 rounded-full text-xs font-black transition cursor-pointer ${activeCurrency === 'INR' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ₹ INR
            </button>
            <button id="curr-btn-usd" onclick="toggleCurrency('USD')" class="px-3 py-1 rounded-full text-xs font-black transition cursor-pointer ${activeCurrency === 'USD' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              $ USD
            </button>
          </div>
        </div>

        <div class="bg-slate-50/80 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="relative w-full md:w-96">
              <i data-lucide="search" class="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2"></i>
              <input 
                type="text" 
                id="search-input" 
                oninput="handleSearch(this.value)" 
                placeholder="Search by destination (e.g. Dubai, Kashmir, Wayanad)..." 
                class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
              >
            </div>

            <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button onclick="filterCategoryHome('all', this)" class="filter-tab active" data-cat="all">All Packages</button>
              <button onclick="filterCategoryHome('international', this)" class="filter-tab" data-cat="international">International</button>
              <button onclick="filterCategoryHome('domestic', this)" class="filter-tab" data-cat="domestic">Domestic</button>
              <button onclick="filterCategoryHome('day-trip', this)" class="filter-tab" data-cat="day-trip">Local Day Trips</button>
              <button onclick="filterCategoryHome('pilgrimage', this)" class="filter-tab" data-cat="pilgrimage">Pilgrimage</button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-600 pt-3 border-t border-slate-200">
            <div class="flex items-center gap-2">
              <span>Active filter:</span>
              <span id="active-filter-label" class="font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full">All Packages</span>
            </div>
            <div>
              Showing <span id="packages-count" class="font-bold text-blue-600">0</span> verified packages
            </div>
          </div>
        </div>

        <div id="packages-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <!-- Injected dynamically by renderPackagesGrid -->
        </div>
      </section>

      <!-- MODULE 6: TRUST STATS BOAST BLOCK WITH ROLLING NUMBERS -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center reveal-init">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="text-3xl sm:text-5xl font-black text-slate-900 mb-2" data-count-target="100" data-count-suffix="+">100+</div>
          <div class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600">Curated Trips</div>
        </div>
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="text-3xl sm:text-5xl font-black text-blue-600 mb-2" data-count-target="15000" data-count-suffix="+">15,000+</div>
          <div class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600">Happy Travelers</div>
        </div>
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="text-3xl sm:text-5xl font-black text-slate-900 mb-2" data-count-target="15" data-count-suffix="+">15+</div>
          <div class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600">Years Experience</div>
        </div>
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="text-3xl sm:text-5xl font-black text-sky-500 mb-2" data-count-target="10" data-count-suffix="+">10+</div>
          <div class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600">Countries Explored</div>
        </div>
      </section>

      <!-- MODULE 7: AUTHENTIC TESTIMONIALS (.FP-TESTIMONIAL from smstoursshoranur.in) -->
      <section class="space-y-8">
        <div class="text-center max-w-xl mx-auto space-y-2">
          <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold uppercase tracking-wider">
            Traveler Stories
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900">What Our Travelers Say</h2>
          <p class="text-slate-600 text-sm">Genuine experiences from guests who explored India and the world with us.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          ${testimonials.map((t, idx) => `
            <div class="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5">
              <div class="space-y-3">
                <div class="flex text-amber-400 gap-1">
                  ${Array(5).fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>').join('')}
                </div>
                <p class="text-slate-700 text-xs sm:text-sm italic leading-relaxed">
                  "${t.quote}"
                </p>
                <div class="pt-1">
                  <button onclick="openTestimonialModal(${idx})" class="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1 cursor-pointer">
                    <span>Read More...</span>
                    <i data-lucide="arrow-right" class="w-3 h-3"></i>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 bg-blue-50 flex items-center justify-center">
                  <img src="${t.avatar}" alt="${t.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'">
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm leading-tight">${t.name}</h4>
                  <p class="text-[11px] text-blue-600 font-semibold">${t.role} • ${t.tour}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- MODULE 8.5: ABOUT US SECTION INSIDE HOME (#about-us from smstoursshoranur.in) -->
      <section id="about-us" class="space-y-8 scroll-mt-28">
        <div class="bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 rounded-4xl p-8 sm:p-12 border border-blue-200/70 shadow-sm">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div class="lg:col-span-7 space-y-5">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                <i data-lucide="award" class="w-3.5 h-3.5"></i>
                <span>About SMS Tours & Travels</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Crafting Extraordinary Journeys From <span class="text-blue-600">Shoranur</span> for Over 15 Years
              </h2>
              <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                With a legacy rooted in Shoranur, Palakkad, <strong>SMS Tours & Travels</strong> is one of Kerala’s most trusted travel organizations. We specialize in international holidays, domestic scenic tours, customized group pilgrimages, and thrilling weekend expeditions.
              </p>
              
              <!-- 4 Feature Highlights -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <i data-lucide="check-check" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900">Personalized Itineraries</h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">Customized departures from Shoranur</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <i data-lucide="users" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900">Certified Tour Managers</h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">Malayalam & English speaking leads</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <i data-lucide="plane-takeoff" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900">All-Inclusive Packages</h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">Flights, star hotels, meals & transfers</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <i data-lucide="shield" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900">Transparent & Secure</h4>
                    <p class="text-[11px] text-slate-500 mt-0.5">Zero hidden fees, 100% satisfaction</p>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="pt-2 flex flex-wrap items-center gap-3">
                <a href="https://wa.me/918089427469?text=Hello%20SMS%20Tours%20Shoranur%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm">
                  <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp Tour Director
                </a>
                <a href="#/about" class="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition flex items-center gap-1.5">
                  <span>Full Profile & Team</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>

            <!-- Right Column: Visual Brand Card -->
            <div class="lg:col-span-5">
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
                <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <img src="assets/logo.png" alt="SMS Tours Logo" class="h-14 w-auto object-contain">
                  <div>
                    <h3 class="font-black text-slate-900 text-base leading-tight">SMS Tours & Travels</h3>
                    <p class="text-xs font-semibold text-blue-600">Shoranur, Palakkad District, Kerala</p>
                  </div>
                </div>

                <div class="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <i data-lucide="map-pin" class="w-4 h-4"></i>
                    </div>
                    <span>Opp. Railway Station, Shoranur, Kerala 679121</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <i data-lucide="phone" class="w-4 h-4"></i>
                    </div>
                    <span>+91 8089427469 / +91 9847042870</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <i data-lucide="mail" class="w-4 h-4"></i>
                    </div>
                    <span>contact@smstoursshoranur.in</span>
                  </div>
                </div>

                <div class="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <div class="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Trusted by 15,000+ Travelers</div>
                  <div class="text-xs text-slate-600 mt-0.5">Government accredited & IATA certified affiliate</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- MODULE 9: LATEST BLOG / TRAVEL STORIES (.FP-BLOG-SECTION from smstoursshoranur.in) -->
      <section id="blogs" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-2">
              Travel Insights & Guides
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Latest Travel Stories</h2>
            <p class="text-slate-600 text-sm mt-1">Unlock the secrets of serene solitude: A journey into the heart of tranquil destinations.</p>
          </div>
          <a href="#/blog" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition self-start sm:self-auto">
            <span>View All Stories</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          ${companyInfo.blogs.map(blog => `
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span class="text-blue-600 font-semibold">${blog.category || 'SMS Tours Blog'}</span>
                  <span>${blog.date}</span>
                </div>
                <h3 onclick="navigateTo('#/blog/${blog.id}')" class="text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 transition cursor-pointer">
                  ${blog.title}
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  ${blog.excerpt || blog.desc}
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-400 font-medium">${blog.readTime || '4 min read'}</span>
                <a href="#/blog/${blog.id}" class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>Read Full Story</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- MODULE 10: KICKOFF ADVENTURE CALLOUT & QUICK REGISTRATION (.FP-KICKOFF from smstoursshoranur.in) -->
      <section class="bg-gradient-to-br from-[#091e3a] via-[#0f274a] to-[#0a1f3d] rounded-4xl p-8 sm:p-12 text-white shadow-xl border border-blue-900/40 space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-5 space-y-4">
            <div class="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              Start Your Journey
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              We kick off your travel adventures by beginning the journey with us.
            </h2>
            <p class="text-slate-300 text-sm leading-relaxed">
              Submit your details below and our travel specialists in Shoranur will prepare a customized quotation with special early-bird fares.
            </p>
            <div class="pt-4 space-y-2 text-xs sm:text-sm text-slate-300">
              <div class="flex items-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-sky-400"></i>
                <span>Direct WhatsApp and phone assistance</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-sky-400"></i>
                <span>Customized itineraries from Shoranur</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-sky-400"></i>
                <span>Best rates guaranteed on flights & hotels</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Quick Registration & Booking Request</h3>
            <form onsubmit="handleRegistrationSubmit(event)" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                  <input type="text" id="reg-fname" required placeholder="First name" class="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                  <input type="text" id="reg-lname" required placeholder="Last name" class="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input type="email" id="reg-email" required placeholder="email@example.com" class="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone *</label>
                  <input type="tel" id="reg-phone" required placeholder="+91 98765 43210" class="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Select Tour Package *</label>
                  <select id="reg-pkg" class="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                    <option value="Dubai Tour">Dubai Tour</option>
                    <option value="Bangkok Tour">Bangkok Tour</option>
                    <option value="Hyderabad Tour">Hyderabad Tour</option>
                    <option value="Kashmir Yathra">Kashmir Yathra</option>
                    <option value="Wayanad Tour">Wayanad Tour</option>
                    <option value="Kanthalloor & Marayoor">Kanthalloor & Marayoor</option>
                    <option value="Parambikulam Safari">Parambikulam Tiger Reserve</option>
                    <option value="Pilgrimage South India">Pilgrimage Tours</option>
                    <option value="Custom Group Tour">Custom Tailor-made Package</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">City / Address</label>
                  <input type="text" id="reg-address" placeholder="e.g. Shoranur, Ottapalam, Palakkad" class="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                </div>
              </div>

              <button type="submit" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="send" class="w-4 h-4"></i> Submit Registration via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  `;

  renderPackagesGrid();
  lucide.createIcons();
  initHeroSlider();
  initScrollAnimations();
  initWhatsAppTeaser();
}

// --------------------------------------------------------------------------
// Hero Photo Slider Engine with Auto-Scroll & Touch Navigation
// --------------------------------------------------------------------------
// Hero slider runtime controls

function initHeroSlider() {
  if (heroSliderInterval) {
    clearInterval(heroSliderInterval);
    heroSliderInterval = null;
  }
  currentHeroSlide = 0;
  updateHeroSlideUI(0);
  startHeroSliderTimer();

  const container = document.getElementById('hero-slider-card');
  if (container && !container.dataset.eventsBound) {
    container.dataset.eventsBound = 'true';
    container.addEventListener('mouseenter', pauseHeroSlider);
    container.addEventListener('mouseleave', resumeHeroSlider);

    // Mobile touch swipe support
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].screenX;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) {
            nextHeroSlide();
          } else {
            prevHeroSlide();
          }
        }
      }
    }, { passive: true });
  }
}

function startHeroSliderTimer() {
  if (heroSliderInterval) clearInterval(heroSliderInterval);
  heroSliderInterval = setInterval(() => {
    nextHeroSlide();
  }, 4500);
}

function pauseHeroSlider() {
  if (heroSliderInterval) {
    clearInterval(heroSliderInterval);
    heroSliderInterval = null;
  }
}

function resumeHeroSlider() {
  startHeroSliderTimer();
}

function nextHeroSlide(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  currentHeroSlide = (currentHeroSlide + 1) % heroSlidesData.length;
  updateHeroSlideUI(currentHeroSlide);
  startHeroSliderTimer();
}

function prevHeroSlide(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  currentHeroSlide = (currentHeroSlide - 1 + heroSlidesData.length) % heroSlidesData.length;
  updateHeroSlideUI(currentHeroSlide);
  startHeroSliderTimer();
}

function goToHeroSlide(index, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  currentHeroSlide = index;
  updateHeroSlideUI(currentHeroSlide);
  startHeroSliderTimer();
}

function updateHeroSlideUI(index) {
  const slides = document.querySelectorAll('.hero-slide');
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  const dots = document.querySelectorAll('#hero-slider-dots .hero-dot');
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  const counter = document.getElementById('hero-slide-counter');
  if (counter) {
    counter.textContent = `0${index + 1} / 0${heroSlidesData.length}`;
  }

  const data = heroSlidesData[index];
  if (!data) return;

  const badge = document.getElementById('hero-slide-badge');
  if (badge) badge.textContent = data.tag;

  const loc = document.getElementById('hero-slide-location-text');
  if (loc) loc.textContent = data.location;

  const title = document.getElementById('hero-slide-title');
  if (title) title.innerHTML = data.title;

  const desc = document.getElementById('hero-slide-desc');
  if (desc) desc.textContent = data.desc;
}

// --------------------------------------------------------------------------
// MetaSlider (Featured Destinations Carousel) Engine
// --------------------------------------------------------------------------

function initMetaSlider() {
  if (metaSliderInterval) clearInterval(metaSliderInterval);
  showSlide(0);
  metaSliderInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function pauseMetaSlider() {
  if (metaSliderInterval) clearInterval(metaSliderInterval);
}

function resumeMetaSlider() {
  if (metaSliderInterval) clearInterval(metaSliderInterval);
  metaSliderInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function showSlide(index) {
  const slides = document.querySelectorAll('.metaslider-slide');
  const dots = document.querySelectorAll('.metaslider-dot');
  if (!slides.length) return;

  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;
  currentSlideIndex = index;

  slides.forEach((slide, idx) => {
    if (idx === currentSlideIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  dots.forEach((dot, idx) => {
    if (idx === currentSlideIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function nextSlide() {
  showSlide(currentSlideIndex + 1);
}

function prevSlide() {
  showSlide(currentSlideIndex - 1);
}

// --------------------------------------------------------------------------
// WPForms Kickoff Registration Handler -> WhatsApp Direct
// --------------------------------------------------------------------------
function handleRegistrationSubmit(event) {
  event.preventDefault();
  const fName = document.getElementById('reg-fname') ? document.getElementById('reg-fname').value : '';
  const lName = document.getElementById('reg-lname') ? document.getElementById('reg-lname').value : '';
  const email = document.getElementById('reg-email') ? document.getElementById('reg-email').value : '';
  const phone = document.getElementById('reg-phone') ? document.getElementById('reg-phone').value : '';
  const pkgId = document.getElementById('reg-pkg') ? document.getElementById('reg-pkg').value : 'Any Package';
  const address = document.getElementById('reg-address') ? document.getElementById('reg-address').value : '';

  const whatsappMessage = `*NEW REGISTRATION INQUIRY - SMS TOURS SHORANUR*
━━━━━━━━━━━━━━━━━━━━
👤 *Full Name:* ${fName} ${lName}
📞 *Phone / WhatsApp:* ${phone}
✉️ *Email:* ${email}
📍 *Address:* ${address || 'Not specified'}
✈️ *Interested Tour:* ${pkgId}
━━━━━━━━━━━━━━━━━━━━
_Submitted via SMS Tours Kickoff Registration Form_`;

  const encodedUrl = `https://wa.me/918089427469?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(encodedUrl, '_blank');
}

// --------------------------------------------------------------------------
// Photo Lightbox Handlers
// --------------------------------------------------------------------------
function openLightbox(imageUrl, caption) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (!modal || !img) return;

  img.src = imageUrl;
  if (cap) cap.textContent = caption || '';
  modal.classList.add('open');
  lucide.createIcons();
}

function closeLightbox(event) {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('open');
}

// --------------------------------------------------------------------------
// Testimonial Detail Modal & Welcome Bar Handlers
// --------------------------------------------------------------------------
function openTestimonialModal(index) {
  const t = testimonials[index];
  if (!t) return;
  const modal = document.getElementById('testimonial-modal');
  const container = document.getElementById('testimonial-modal-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 bg-blue-50 flex items-center justify-center shadow-md">
          <img src="${t.avatar}" alt="${t.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'">
        </div>
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold uppercase tracking-wider mb-1">Verified Traveler Review</span>
          <h3 class="text-xl font-bold text-slate-900 leading-tight">${t.name}</h3>
          <p class="text-xs text-blue-600 font-semibold">${t.role} • ${t.tour}</p>
        </div>
      </div>

      <div class="flex text-amber-400 gap-1">
        ${Array(5).fill('<i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>').join('')}
      </div>

      <div class="bg-stone-50 rounded-2xl p-5 border border-stone-200/80">
        <p class="text-slate-700 text-sm italic leading-relaxed">
          "${t.fullStory || t.quote}"
        </p>
      </div>

      <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-[11px] text-stone-500">Documented review from SMS Tours & Travels Shoranur</span>
        <button onclick="closeTestimonialModal()" class="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer">
          Close Story
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  lucide.createIcons();
}

function closeTestimonialModal(event) {
  const modal = document.getElementById('testimonial-modal');
  if (modal) modal.classList.remove('open');
}

// --------------------------------------------------------------------------
// Wishlist & Saved Trips System
// --------------------------------------------------------------------------

function toggleSaveTour(packageId, event) {
  if (event) event.stopPropagation();
  const idx = savedTourIds.indexOf(packageId);
  if (idx > -1) {
    savedTourIds.splice(idx, 1);
  } else {
    savedTourIds.push(packageId);
  }
  updateWishlistUI();
}

function updateWishlistUI() {
  const badge = document.getElementById('saved-counter');
  if (badge) badge.textContent = savedTourIds.length;

  document.querySelectorAll('[data-save-btn]').forEach(btn => {
    const pkgId = btn.getAttribute('data-save-btn');
    const isSaved = savedTourIds.includes(pkgId);
    if (isSaved) {
      btn.innerHTML = `<i data-lucide="heart" class="w-4 h-4 text-rose-500 fill-rose-500"></i>`;
    } else {
      btn.innerHTML = `<i data-lucide="heart" class="w-4 h-4 text-white"></i>`;
    }
  });

  renderWishlistItems();
  lucide.createIcons();
}

function openWishlistModal() {
  const modal = document.getElementById('wishlist-modal');
  if (!modal) return;
  renderWishlistItems();
  modal.classList.add('open');
  lucide.createIcons();
}

function closeWishlistModal(event) {
  const modal = document.getElementById('wishlist-modal');
  if (modal) modal.classList.remove('open');
}

function toggleWishlistModal() {
  const modal = document.getElementById('wishlist-modal');
  if (!modal) return;
  if (modal.classList.contains('open')) {
    closeWishlistModal();
  } else {
    openWishlistModal();
  }
}

function renderWishlistItems() {
  const container = document.getElementById('wishlist-items-container');
  if (!container) return;

  const savedList = tourPackages.filter(p => savedTourIds.includes(p.id));
  if (savedList.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-stone-500 text-xs sm:text-sm">
        <i data-lucide="heart" class="w-8 h-8 text-stone-300 mx-auto mb-2"></i>
        No saved trips yet. Click the heart icon on any tour card to shortlist it here!
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = savedList.map(pkg => `
    <div class="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 gap-3">
      <div class="flex items-center gap-3">
        <img src="${pkg.image}" alt="${pkg.title}" class="w-14 h-14 rounded-xl object-cover shrink-0">
        <div>
          <h4 class="font-bold text-xs sm:text-sm text-stone-900 leading-snug">${pkg.title}</h4>
          <span class="text-[11px] text-stone-500">${pkg.duration} • ₹${pkg.priceINR.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="navigateTo('#/package/${pkg.id}'); closeWishlistModal();" class="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition">
          View
        </button>
        <button onclick="toggleSaveTour('${pkg.id}', event)" class="p-1.5 text-stone-400 hover:text-rose-500 transition" title="Remove">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function executeHeroSearch() {
  const destEl = document.getElementById('hero-search-dest');
  const dest = destEl ? destEl.value : 'all';

  if (dest !== 'all') {
    searchQuery = dest.toLowerCase();
  } else {
    searchQuery = '';
  }

  // Scroll smoothly to catalog
  const catalogEl = document.getElementById('tours-catalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }

  renderPackagesGrid();
}

function filterCategoryHome(category, buttonEl) {
  activeCategory = category;
  activeTheme = 'all';

  document.querySelectorAll('.filter-tab').forEach(tab => {
    if (tab.getAttribute('data-cat') === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  const categoryNames = {
    all: 'All Packages',
    international: 'International Tours',
    domestic: 'Domestic India Tours',
    'day-trip': 'Local Day Trips',
    pilgrimage: 'Pilgrimage Yatras'
  };

  const labelEl = document.getElementById('active-filter-label');
  if (labelEl) {
    labelEl.textContent = categoryNames[category] || 'All Packages';
  }

  renderPackagesGrid();
}

function filterThemeAndScroll(theme) {
  activeTheme = theme;
  activeCategory = 'all';
  const catalogEl = document.getElementById('tours-catalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
  const labelEl = document.getElementById('active-filter-label');
  if (labelEl) {
    labelEl.textContent = `Theme: ${theme.toUpperCase()} Escapes`;
  }
  renderPackagesGrid();
}

function handleSearch(query) {
  searchQuery = query.toLowerCase().trim();
  renderPackagesGrid();
}

function renderPackagesGrid() {
  const container = document.getElementById('packages-grid');
  const countEl = document.getElementById('packages-count');
  if (!container) return;

  let filtered = tourPackages.filter(pkg => {
    const matchesCategory = (activeCategory === 'all') || (pkg.category === activeCategory);
    const matchesTheme = (activeTheme === 'all') || (pkg.theme === activeTheme);
    const matchesSearch = !searchQuery || 
      pkg.title.toLowerCase().includes(searchQuery) ||
      pkg.location.toLowerCase().includes(searchQuery) ||
      pkg.country.toLowerCase().includes(searchQuery) ||
      pkg.highlights.some(h => h.toLowerCase().includes(searchQuery));

    return matchesCategory && matchesTheme && matchesSearch;
  });

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-4 bg-slate-50 rounded-3xl border border-slate-200 p-8 text-slate-800">
        <h4 class="text-xl font-bold text-slate-900">No packages match your search</h4>
        <button onclick="resetFilters()" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-blue-500/20">
          Reset Filters
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(pkg => {
    const formattedPrice = formatPrice(pkg.priceINR, pkg.priceUSD);
    const photoCount = (pkg.sliderImages ? pkg.sliderImages.length : 0) + (pkg.gallery ? pkg.gallery.length : 0) + 1;
    const isTrending = pkg.badge && (pkg.badge.toLowerCase().includes('trending') || pkg.badge.toLowerCase().includes('special') || pkg.badge.toLowerCase().includes('forthcoming'));
    
    return `
    <div class="card-lift-glow bg-white rounded-2.5xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-md transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div class="relative h-52 sm:h-60 overflow-hidden cursor-pointer" onclick="navigateTo('#/package/${pkg.id}')">
          <img src="${pkg.image}" alt="${pkg.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
          
          <!-- Heart Save Button -->
          <button onclick="toggleSaveTour('${pkg.id}', event)" data-save-btn="${pkg.id}" class="absolute top-3.5 right-3.5 z-20 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition hover:bg-black/70 active:scale-90" title="Save trip">
            <i data-lucide="heart" class="w-4 h-4 ${savedTourIds.includes(pkg.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}"></i>
          </button>

          <!-- Top Badges & Urgency Pill -->
          <div class="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 sm:gap-2">
            <span class="px-2.5 sm:px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-blue-700 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border border-blue-200/60 shadow-xs">
              ${pkg.badge}
            </span>
            ${isTrending ? `
              <span class="px-2 sm:px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                <span>⚡</span> Filling Fast
              </span>
            ` : ''}
            <span class="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-extrabold">
              ${pkg.duration}
            </span>
          </div>

          <!-- Bottom Location, Rating & Photo Count Chip -->
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span class="flex items-center gap-1 font-medium text-[11px] sm:text-xs drop-shadow-sm">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-sky-400"></i> ${pkg.location}
            </span>
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/20">
                <i data-lucide="camera" class="w-2.5 h-2.5 text-sky-300"></i> ${photoCount} Photos
              </span>
              <span class="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black text-[10px] sm:text-[11px]">
                ★ ${pkg.rating}
              </span>
            </div>
          </div>
        </div>

        <div class="p-5 sm:p-6 space-y-3 sm:space-y-4">
          <h4 onclick="navigateTo('#/package/${pkg.id}')" class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug cursor-pointer">
            ${pkg.title}
          </h4>

          <p class="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            ${pkg.overview}
          </p>

          <div class="space-y-1.5 pt-2 border-t border-slate-100">
            ${pkg.highlights.slice(0, 2).map(hl => `
              <div class="flex items-center gap-2 text-xs text-slate-600">
                <i data-lucide="check" class="w-3.5 h-3.5 text-blue-600 shrink-0"></i>
                <span class="truncate">${hl}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
        <div>
          <span class="text-[11px] text-slate-400 block font-semibold">Starting from</span>
          <span class="text-lg font-extrabold text-blue-600">${formattedPrice}</span>
          <span class="text-xs text-slate-500 font-normal"> / person</span>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="navigateTo('#/package/${pkg.id}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-blue-500/20 cursor-pointer">
            <span>Explore</span> <i data-lucide="arrow-up-right" class="w-3 h-3 text-white"></i>
          </button>
        </div>
      </div>
    </div>
  `;}).join('');

  lucide.createIcons();
}

function resetFilters() {
  activeCategory = 'all';
  activeTheme = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  filterCategoryHome('all', null);
}

// --------------------------------------------------------------------------
// 2. DEDICATED DYNAMIC PACKAGE DETAIL PAGE
// --------------------------------------------------------------------------
function renderPackageDetailPage(packageId) {
  const pkg = tourPackages.find(p => p.id === packageId || p.id === packageId.replace('-2024', '') || (p.id + '-2024') === packageId) || tourPackages[0];
  const root = document.getElementById('app-root');
  if (!root) return;

  // Initialize calculator state
  calcState.adults = 2;
  calcState.children = 0;
  calcState.hotelTier = 'deluxe';
  calcState.includeFlights = false;
  calcState.basePrice = pkg.priceINR;
  calcState.packageId = pkg.id;

  const categoryName = {
    international: 'International Tours',
    domestic: 'Domestic India Tours',
    'day-trip': 'Local Day Trips',
    pilgrimage: 'Pilgrimage Yatras'
  }[pkg.category] || 'Tour Packages';

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-8 animate-fade-in">
      
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <a href="#/category/${pkg.category}" class="hover:text-slate-900 transition">
          ${categoryName}
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">${pkg.title}</span>
      </nav>

      <!-- Immersive Tour Banner -->
      <div class="relative h-[280px] sm:h-[360px] md:h-[420px] rounded-2.5xl sm:rounded-4xl overflow-hidden shadow-xl border border-slate-200">
        <img src="${pkg.image}" alt="${pkg.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"></div>

        <div class="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
          <span class="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-white/20">
            ${pkg.badge}
          </span>
          <span class="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[11px] sm:text-xs font-bold">
            ${pkg.duration}
          </span>
        </div>

        <div class="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-3 sm:gap-4 text-white">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs sm:text-sm text-sky-300 font-semibold">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> ${pkg.location} (${pkg.country})
              <span>•</span>
              <span class="text-amber-400">★ ${pkg.rating} (${pkg.reviewsCount})</span>
            </div>
            <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
              ${pkg.title}
            </h1>
          </div>
          
          <button onclick="openBookingModal('${pkg.id}')" class="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs sm:text-sm shadow-xl transition transform hover:scale-105 cursor-pointer text-center shrink-0">
            Instant Booking
          </button>
        </div>
      </div>

      <!-- Main Content Grid with Dynamic Price Calculator Sticky Column -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Column: Details & Tabs (8 Cols) -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- Navigation Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
            <button onclick="switchTab('itinerary', this)" class="tab-btn active">Itinerary</button>
            <button onclick="switchTab('highlights', this)" class="tab-btn">Highlights</button>
            <button onclick="switchTab('inclusions', this)" class="tab-btn">Inclusions</button>
            <button onclick="switchTab('gallery', this)" class="tab-btn">Photo Gallery</button>
            <button onclick="switchTab('policy', this)" class="tab-btn">Policy & Support</button>
          </div>

          <!-- Tab Content Containers -->
          <div id="tab-itinerary" class="tab-content space-y-6">
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-slate-900">Day-by-Day Journey Itinerary</h3>
              <p class="text-xs sm:text-sm text-slate-500">Carefully paced by SMS Tours to maximize sightseeing and relaxation.</p>
            </div>

            <div class="pl-6 relative space-y-6 border-l-2 border-slate-200 ml-4">
              ${pkg.itinerary.map(item => `
                <div class="relative pl-4 space-y-1">
                  <div class="timeline-dot"></div>
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold">${item.day}</span>
                    <h4 class="font-bold text-slate-900 text-sm sm:text-base">${item.title}</h4>
                  </div>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">${item.detail}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div id="tab-highlights" class="tab-content hidden space-y-4">
            <h3 class="text-xl font-bold text-slate-900">What Makes This Tour Special</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${pkg.highlights.map(hl => `
                <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                  <i data-lucide="check-circle" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"></i>
                  <span class="text-sm text-slate-800 font-medium">${hl}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div id="tab-inclusions" class="tab-content hidden space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-3">
                <h4 class="font-bold text-blue-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <i data-lucide="check" class="w-4 h-4 text-blue-600"></i> What is Included
                </h4>
                <ul class="space-y-2 text-xs sm:text-sm text-slate-700">
                  ${pkg.inclusions.map(inc => `<li class="flex items-start gap-2">• <span>${inc}</span></li>`).join('')}
                </ul>
              </div>

              <div class="p-6 rounded-3xl bg-rose-50/50 border border-rose-100 space-y-3">
                <h4 class="font-bold text-rose-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <i data-lucide="x" class="w-4 h-4 text-rose-600"></i> What is Excluded
                </h4>
                <ul class="space-y-2 text-xs sm:text-sm text-slate-700">
                  ${pkg.exclusions.map(exc => `<li class="flex items-start gap-2">• <span>${exc}</span></li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <div id="tab-gallery" class="tab-content hidden space-y-4">
            <h3 class="text-xl font-bold text-slate-900">Photo Impressions</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              ${pkg.gallery.map(img => `
                <div class="h-44 rounded-2xl overflow-hidden shadow-sm group">
                  <img src="${img}" alt="Tour Photo" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
              `).join('')}
            </div>
          </div>

          <div id="tab-policy" class="tab-content hidden space-y-4">
            <h3 class="text-xl font-bold text-slate-900">Policies & Shoranur Support</h3>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-3">
              <p><strong>Booking Confirmation:</strong> 25% advance token payment upon reservation. Balance payable 15 days before journey departure.</p>
              <p><strong>Cancellation:</strong> 100% refund if cancelled 30 days prior. 50% refund 15-29 days prior. No refund within 14 days of travel.</p>
              <p><strong>Support:</strong> 24/7 dedicated Malayalam and English travel coordinators available at all destinations.</p>
            </div>
          </div>

        </div>

        <!-- Right Column: Interactive Price & Booking Calculator (4 Cols) -->
        <div class="lg:col-span-4 price-calc-box space-y-6">
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-5">
            <div class="border-b border-slate-100 pb-4">
              <span class="text-xs text-slate-400 font-semibold uppercase">Dynamic Calculator</span>
              <div class="flex items-baseline justify-between mt-1">
                <div>
                  <span id="calc-total-inr" class="text-3xl font-extrabold text-blue-600">
                    ₹${(pkg.priceINR * 2).toLocaleString('en-IN')}
                  </span>
                  <span id="calc-total-usd" class="text-xs text-slate-500 block font-normal">
                    ≈ $${pkg.priceUSD * 2} USD
                  </span>
                </div>
                <span class="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold border border-blue-200/60">
                  Instant Quote
                </span>
              </div>
            </div>

            <!-- Guest Selectors -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span class="font-bold text-slate-800 block">Adults</span>
                  <span class="text-[11px] text-slate-400">Age 12+ years</span>
                </div>
                <div class="flex items-center gap-3 bg-slate-100 rounded-full px-3 py-1">
                  <button onclick="updateGuests('adults', -1)" class="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-200">-</button>
                  <span id="calc-adults-count" class="font-bold text-slate-900 text-sm">2</span>
                  <button onclick="updateGuests('adults', 1)" class="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-200">+</button>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span class="font-bold text-slate-800 block">Children</span>
                  <span class="text-[11px] text-slate-400">Age 2-11 years (50% rate)</span>
                </div>
                <div class="flex items-center gap-3 bg-slate-100 rounded-full px-3 py-1">
                  <button onclick="updateGuests('children', -1)" class="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-200">-</button>
                  <span id="calc-children-count" class="font-bold text-slate-900 text-sm">0</span>
                  <button onclick="updateGuests('children', 1)" class="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-200">+</button>
                </div>
              </div>
            </div>

            <!-- Hotel Tier Selector -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-700 uppercase">Hotel Category</label>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <button onclick="setHotelTier('standard', this)" class="p-2 rounded-xl border border-slate-200 text-center font-medium text-slate-700 hover:border-slate-400 transition">
                  Standard 3★
                </button>
                <button onclick="setHotelTier('deluxe', this)" class="p-2 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-900 text-center font-bold transition">
                  Deluxe 4★
                </button>
                <button onclick="setHotelTier('luxury', this)" class="p-2 rounded-xl border border-slate-200 text-center font-medium text-slate-700 hover:border-slate-400 transition">
                  Luxury 5★
                </button>
              </div>
            </div>

            <!-- Flight Addon Option -->
            <div class="pt-2 border-t border-slate-100">
              <label class="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700">
                <input type="checkbox" id="flight-addon-check" onchange="toggleFlightAddon(this.checked)" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                <span>Include flights from Kochi / Calicut</span>
              </label>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2 pt-2">
              <button onclick="dispatchCalculatedWhatsApp('${pkg.id}', '${pkg.title}')" class="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer">
                <i data-lucide="message-circle" class="w-4 h-4"></i> Book via WhatsApp
              </button>
              <a href="tel:+918089427469" class="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-sky-400"></i> Call +91 8089427469
              </a>
            </div>

          </div>
        </div>

      </div>

      <!-- Similar Recommended Packages Carousel -->
      <div class="pt-10 border-t border-slate-200 space-y-6">
        <h3 class="text-2xl font-bold text-slate-900">Similar Tours You Might Love</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          ${tourPackages.filter(p => p.id !== pkg.id && p.category === pkg.category).slice(0, 3).map(sim => `
            <div onclick="navigateTo('#/package/${sim.id}')" class="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div class="h-44 overflow-hidden">
                <img src="${sim.image}" alt="${sim.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
              </div>
              <div class="p-5 space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>${sim.duration}</span>
                  <span class="font-bold text-blue-600">₹${sim.priceINR.toLocaleString('en-IN')}</span>
                </div>
                <h4 class="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
                  ${sim.title}
                </h4>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  lucide.createIcons();
}

// Tab switcher in dynamic package detail
function switchTab(tabName, btnEl) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

  if (btnEl) btnEl.classList.add('active');
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.remove('hidden');
  lucide.createIcons();
}

// Dynamic Price Calculator functions
function updateGuests(type, change) {
  if (type === 'adults') {
    calcState.adults = Math.max(1, calcState.adults + change);
    document.getElementById('calc-adults-count').textContent = calcState.adults;
  } else {
    calcState.children = Math.max(0, calcState.children + change);
    document.getElementById('calc-children-count').textContent = calcState.children;
  }
  recalculateTotal();
}

function setHotelTier(tier, btnEl) {
  calcState.hotelTier = tier;
  const parent = btnEl.parentElement;
  parent.querySelectorAll('button').forEach(b => {
    b.className = 'p-2 rounded-xl border border-slate-200 text-center font-medium text-slate-700 hover:border-slate-400 transition';
  });
  btnEl.className = 'p-2 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-900 text-center font-bold transition';
  recalculateTotal();
}

function toggleFlightAddon(checked) {
  calcState.includeFlights = checked;
  recalculateTotal();
}

function recalculateTotal() {
  const pkg = tourPackages.find(p => p.id === calcState.packageId);
  if (!pkg) return;

  let multiplier = 0;
  if (calcState.hotelTier === 'standard') multiplier = -2000;
  if (calcState.hotelTier === 'deluxe') multiplier = 0;
  if (calcState.hotelTier === 'luxury') multiplier = 6000;

  const flightCostPerPerson = calcState.includeFlights ? (pkg.category === 'international' ? 22000 : 8000) : 0;
  const adultPrice = pkg.priceINR + multiplier + flightCostPerPerson;
  const childPrice = (pkg.priceINR * 0.5) + multiplier + flightCostPerPerson;

  const totalINR = (calcState.adults * adultPrice) + (calcState.children * childPrice);
  const totalUSD = Math.round(totalINR / 83);

  document.getElementById('calc-total-inr').textContent = `₹${totalINR.toLocaleString('en-IN')}`;
  document.getElementById('calc-total-usd').textContent = `≈ $${totalUSD} USD`;
}

function dispatchCalculatedWhatsApp(pkgId, pkgTitle) {
  const pkg = tourPackages.find(p => p.id === pkgId);
  const inr = document.getElementById('calc-total-inr').textContent;
  
  const msg = `*DIRECT BOOKING INQUIRY - SMS TOURS SHORANUR*
━━━━━━━━━━━━━━━━━━━━
📌 *Tour:* ${pkgTitle}
⏱ *Duration:* ${pkg ? pkg.duration : 'Standard'}
👥 *Travelers:* ${calcState.adults} Adults, ${calcState.children} Children
🏨 *Accommodation:* ${calcState.hotelTier.toUpperCase()}
✈ *Include Flights:* ${calcState.includeFlights ? 'Yes (Kochi/Calicut)' : 'No'}
💰 *Calculated Estimate:* ${inr}
━━━━━━━━━━━━━━━━━━━━
Please share available departure dates and final confirmation from Shoranur office.`;

  window.open(`https://wa.me/918089427469?text=${encodeURIComponent(msg)}`, '_blank');
}

// --------------------------------------------------------------------------
// 3. DEDICATED CATEGORY PAGE
// --------------------------------------------------------------------------
function renderCategoryPage(category) {
  const root = document.getElementById('app-root');
  if (!root) return;

  const titles = {
    international: 'International Holiday Packages',
    domestic: 'Domestic India Tours & Expeditions',
    'day-trip': 'Single-Day Escapes & Monsoon Tours',
    pilgrimage: 'Sacred Pilgrimage & Spiritual Yatras'
  };

  const descriptions = {
    international: 'Passport-ready global destinations with curated luxury stays, visa assistance, and English/Malayalam tour managers.',
    domestic: 'Explore India from the snow-clad peaks of Kashmir to the tea gardens of Wayanad and royal forts of Hyderabad.',
    'day-trip': 'Refreshing single-day trips directly from Shoranur to Parambikulam Tiger Reserve, waterfalls, and local wonders.',
    pilgrimage: 'Soul-nourishing pilgrimages to South India’s holiest shrines with comfortable AC coaches and elder-friendly itineraries.'
  };

  const filtered = tourPackages.filter(p => p.category === category);

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-8 animate-fade-in">
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold">${titles[category] || 'Category'}</span>
      </nav>

      <div class="bg-gradient-to-r from-[#091e3a] via-[#0f274a] to-[#091e3a] rounded-3xl p-8 sm:p-12 text-white shadow-lg border border-blue-900/40">
        <div class="max-w-2xl space-y-3">
          <span class="px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
            SMS Tours Shoranur
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">${titles[category] || 'Tours'}</h1>
          <p class="text-slate-300 text-sm leading-relaxed">${descriptions[category] || ''}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        ${filtered.map(pkg => `
          <div onclick="navigateTo('#/package/${pkg.id}')" class="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
            <div>
              <div class="h-60 overflow-hidden relative">
                <img src="${pkg.image}" alt="${pkg.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                    ${pkg.duration}
                  </span>
                </div>
              </div>
              <div class="p-6 space-y-3">
                <h4 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                  ${pkg.title}
                </h4>
                <p class="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">${pkg.overview}</p>
              </div>
            </div>
            <div class="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
              <div>
                <span class="text-[11px] text-slate-400 block font-medium">Starting from</span>
                <span class="text-lg font-extrabold text-blue-600">₹${pkg.priceINR.toLocaleString('en-IN')}</span>
              </div>
              <button class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 transition cursor-pointer">
                <span>View Tour</span> <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-white"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 4. DEDICATED GALLERY PAGE
// --------------------------------------------------------------------------

function renderGalleryPage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-8 animate-fade-in">
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold">Tour Gallery</span>
      </nav>

      <!-- Gallery Header -->
      <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-2">
            Visual Memories
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">SMS Tours Photo Gallery</h1>
          <p class="text-slate-500 text-sm mt-2 max-w-xl">
            Browse through authentic glimpses of our world tours, domestic getaways, scenic excursions, and travel journeys from Shoranur.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="filterGalleryCategory('all', this)" class="filter-tab active" data-gal="all">All Photos</button>
          <button onclick="filterGalleryCategory('international', this)" class="filter-tab" data-gal="international">International</button>
          <button onclick="filterGalleryCategory('domestic', this)" class="filter-tab" data-gal="domestic">Domestic</button>
          <button onclick="filterGalleryCategory('day-trip', this)" class="filter-tab" data-gal="day-trip">Day Trips</button>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div id="gallery-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Injected below -->
      </div>
    </div>
  `;

  renderGalleryGridItems();
  lucide.createIcons();
}

function filterGalleryCategory(cat, btn) {
  activeGalleryCategory = cat;
  document.querySelectorAll('[data-gal]').forEach(tab => tab.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderGalleryGridItems();
}

function renderGalleryGridItems() {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  const filtered = (activeGalleryCategory === 'all')
    ? galleryItems
    : galleryItems.filter(item => item.category === activeGalleryCategory);

  container.innerHTML = filtered.map(item => `
    <div class="gallery-card group" onclick="openLightbox('${item.image}', '${item.title} - ${item.location}')">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="gallery-overlay">
        <span class="text-[11px] text-sky-300 font-bold uppercase tracking-wider mb-1">${item.location}</span>
        <h4 class="text-lg font-bold text-white leading-snug">${item.title}</h4>
        <p class="text-xs text-slate-300 line-clamp-2 mt-1 opacity-90">${item.desc}</p>
        <div class="pt-2 flex items-center justify-between">
          <span class="text-[11px] text-white/80 font-medium">Click to enlarge</span>
          <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition">
            <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 5. DEDICATED ABOUT US PAGE
// --------------------------------------------------------------------------
function renderAboutPage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10 animate-fade-in">
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold">About Us</span>
      </nav>

      <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div class="max-w-3xl space-y-5">
          <div class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold uppercase tracking-wider">
            Company Profile
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <img src="assets/logo.png" alt="SMS Tours & Travels Shoranur" class="h-16 w-auto object-contain bg-white rounded-2xl p-2 border border-slate-200 shadow-sm shrink-0">
            <div>
              <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900">
                SMS Tours & Travels Shoranur
              </h1>
              <p class="text-sm font-semibold text-blue-600">Ultimate Travel Solutions</p>
            </div>
          </div>
          <p class="text-slate-600 text-base leading-relaxed">
            SMS Tours & Travels, Shoranur has been providing an unrivalled full spectrum of business and leisure travel services to our satisfied customers. Incorporated on <strong>17-08-2022</strong>, we pride ourselves on offering world-class service in the regions we operate.
          </p>
          <p class="text-slate-600 text-base leading-relaxed">
            Our well-experienced travel consultants offer clients the most economical, practical, and convenient travel solutions. We have established a strong reputation in the industry for having long-lasting relationships with our clients and global airline and hotel partners.
          </p>
        </div>

        <div class="pt-6 border-t border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Our Leadership Team</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${companyInfo.leaders.map(ldr => `
              <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg mb-3">
                  ${ldr.name[0]}
                </div>
                <h3 class="font-bold text-slate-900 text-lg">${ldr.name}</h3>
                <p class="text-xs text-blue-600 font-bold uppercase">${ldr.role}</p>
                <p class="text-xs text-slate-500 leading-relaxed">${ldr.note}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 5. DEDICATED CONTACT US PAGE
// --------------------------------------------------------------------------
function renderContactPage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10 animate-fade-in">
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold">Contact Shoranur Office</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div class="lg:col-span-5 bg-gradient-to-br from-[#091e3a] via-[#0f274a] to-[#091e3a] text-white rounded-2.5xl sm:rounded-3xl p-6 sm:p-8 md:p-10 space-y-6 shadow-xl border border-blue-900/40">
          <div class="flex items-center gap-3">
            <img src="assets/logo.png" alt="SMS Tours & Travels" class="h-10 sm:h-12 w-auto object-contain bg-white rounded-xl p-1.5 shadow-sm">
            <div>
              <h1 class="text-xl sm:text-3xl font-extrabold text-white">Get in Touch</h1>
              <p class="text-xs text-sky-400 font-semibold">SMS Tours & Travels Shoranur</p>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Visit our office opposite Shoranur Municipal Office or contact our consultants directly for immediate quotes.
          </p>

          <div class="space-y-4 pt-4 border-t border-blue-800/60 text-xs sm:text-sm">
            <div>
              <span class="text-slate-400 block text-xs font-bold uppercase mb-1">Office Address</span>
              <p class="font-medium text-slate-200 leading-relaxed">
                S.K. Building, Opposite Shoranur Municipal Office,<br>
                Shoranur (PO), Palakkad (Dist), Kerala 679 121
              </p>
            </div>

            <div>
              <span class="text-slate-400 block text-xs font-bold uppercase mb-1">Telephone Contacts</span>
              <div class="space-y-1.5">
                <a href="tel:+918089427469" class="text-sky-400 font-bold block hover:underline">+91 8089427469 (Primary / WhatsApp)</a>
                <a href="tel:+919847042870" class="text-slate-300 block hover:underline">+91 9847042870</a>
                <a href="tel:+919645006043" class="text-slate-300 block hover:underline">+91 9645006043</a>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 bg-white rounded-2.5xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Send an Inquiry</h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">We reply within 15 minutes during office hours.</p>
          </div>
          <form onsubmit="handleContactPageSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input type="text" id="contact-name" placeholder="Your Full Name *" required class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
              <input type="tel" id="contact-phone" placeholder="WhatsApp / Phone *" required class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
            </div>

            <select id="contact-package-select" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
              <option value="General Inquiry">-- General Tour Inquiry --</option>
              ${tourPackages.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input type="date" id="contact-date" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
              <select id="contact-guests" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                <option value="2 Adults">2 Adults</option>
                <option value="Family">Family Group</option>
                <option value="Corporate/College Group">Large Group (10+)</option>
              </select>
            </div>

            <textarea id="contact-notes" rows="3" placeholder="Describe your travel plan, preferred dates, or destinations..." class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"></textarea>

            <button type="submit" class="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer">
              <i data-lucide="message-circle" class="w-4 h-4"></i> Send via WhatsApp to +91 8089427469
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 6. DEDICATED TOUR PACKAGES CATALOG PAGE (#/packages)
// --------------------------------------------------------------------------
function renderPackagesPage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10 animate-fade-in">
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold">Tour Packages</span>
      </nav>

      <!-- Banner Header -->
      <div class="bg-gradient-to-r from-[#091e3a] via-[#0f274a] to-[#091e3a] rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-blue-900/40 space-y-4">
        <div class="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
          Verified Departures from Shoranur
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          All Tour Packages & Travel Programs
        </h1>
        <p class="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Discover handpicked international escapes, breathtaking domestic hill-stations, pilgrimage journeys, and exhilarating day tours with transparent, all-inclusive pricing.
        </p>
      </div>

      <!-- Interactive Search & Filtering Bar -->
      <div class="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <!-- Search box -->
          <div class="md:col-span-6 relative">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="packages-search-input" oninput="handlePackagesSearch(this.value)" placeholder="Search Dubai, Bangkok, Kashmir, Wayanad..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
          </div>

          <!-- Sort select -->
          <div class="md:col-span-3">
            <select onchange="handlePackagesSort(this.value)" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500">
              <option value="featured">Sort by: Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <!-- Counter -->
          <div class="md:col-span-3 text-right text-xs font-bold text-slate-500" id="packages-page-count">
            Showing ${tourPackages.length} verified packages
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button onclick="setPackagesPageFilter('all', this)" class="filter-tab active" data-pkg-tab="all">All Packages (${tourPackages.length})</button>
          <button onclick="setPackagesPageFilter('international', this)" class="filter-tab" data-pkg-tab="international">International (${tourPackages.filter(p=>p.category==='international').length})</button>
          <button onclick="setPackagesPageFilter('domestic', this)" class="filter-tab" data-pkg-tab="domestic">Domestic Tours (${tourPackages.filter(p=>p.category==='domestic').length})</button>
          <button onclick="setPackagesPageFilter('day-trip', this)" class="filter-tab" data-pkg-tab="day-trip">Day Trips (${tourPackages.filter(p=>p.category==='day-trip').length})</button>
          <button onclick="setPackagesPageFilter('pilgrimage', this)" class="filter-tab" data-pkg-tab="pilgrimage">Pilgrimage (${tourPackages.filter(p=>p.category==='pilgrimage').length})</button>
        </div>
      </div>

      <!-- Packages Grid -->
      <div id="packages-page-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <!-- Injected dynamically by renderPackagesPageList() -->
      </div>

      <!-- Custom Tour Banner Callout -->
      <div class="bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-2 text-center md:text-left">
          <span class="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">Tailor-Made Holidays</span>
          <h3 class="text-2xl sm:text-3xl font-black">Looking for a Customized Group Tour?</h3>
          <p class="text-sky-100 text-xs sm:text-sm max-w-xl">Family vacations, corporate outings, school excursions, or wedding groups — we customize departure dates, luxury buses, flights, and itineraries from Shoranur.</p>
        </div>
        <a href="https://wa.me/918089427469?text=Hello%20SMS%20Tours%20Shoranur%2C%20I%20need%20a%20customized%20group%20tour%20package" target="_blank" rel="noopener noreferrer" class="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-blue-700 font-extrabold text-xs sm:text-sm transition shadow-lg shrink-0 flex items-center gap-2">
          <i data-lucide="message-circle" class="w-4 h-4 text-emerald-600"></i> Request Custom Quote
        </a>
      </div>
    </div>
  `;

  renderPackagesPageList();
  lucide.createIcons();
}

function setPackagesPageFilter(cat, btn) {
  packagesPageCat = cat;
  document.querySelectorAll('[data-pkg-tab]').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPackagesPageList();
}

function handlePackagesSearch(val) {
  packagesPageSearch = (val || '').toLowerCase().trim();
  renderPackagesPageList();
}

function handlePackagesSort(val) {
  packagesPageSort = val;
  renderPackagesPageList();
}

function renderPackagesPageList() {
  const container = document.getElementById('packages-page-grid');
  const countEl = document.getElementById('packages-page-count');
  if (!container) return;

  let list = [...tourPackages];

  if (packagesPageCat !== 'all') {
    list = list.filter(p => p.category === packagesPageCat);
  }

  if (packagesPageSearch) {
    list = list.filter(p =>
      p.title.toLowerCase().includes(packagesPageSearch) ||
      p.location.toLowerCase().includes(packagesPageSearch) ||
      p.country.toLowerCase().includes(packagesPageSearch) ||
      p.overview.toLowerCase().includes(packagesPageSearch)
    );
  }

  if (packagesPageSort === 'price-asc') {
    list.sort((a, b) => a.priceINR - b.priceINR);
  } else if (packagesPageSort === 'price-desc') {
    list.sort((a, b) => b.priceINR - a.priceINR);
  } else if (packagesPageSort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  if (countEl) {
    countEl.textContent = `Showing ${list.length} verified packages`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <i data-lucide="compass" class="w-7 h-7"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800">No tour packages match your filters</h3>
        <p class="text-sm text-slate-500 max-w-md mx-auto">Try resetting your search query or switching categories to explore more destinations.</p>
        <button onclick="setPackagesPageFilter('all'); document.getElementById('packages-search-input').value='';" class="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition">
          Reset All Filters
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(pkg => {
    const isSaved = savedTourIds.includes(pkg.id);
    return `
      <div class="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
        <div>
          <!-- Card Image & Badges -->
          <div class="relative h-60 overflow-hidden cursor-pointer" onclick="navigateTo('#/package/${pkg.id}')">
            <img src="${pkg.image}" alt="${pkg.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
            
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                ${pkg.duration}
              </span>
              <span class="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
                ${pkg.category}
              </span>
            </div>

            <button onclick="event.stopPropagation(); toggleSaveTour('${pkg.id}')" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-500 transition shadow-md" title="Save to Wishlist">
              <i data-lucide="heart" class="w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}"></i>
            </button>

            <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
              <span class="flex items-center gap-1 font-semibold text-sky-200">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${pkg.location}
              </span>
              <span class="flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[11px]">
                ★ ${pkg.rating}
              </span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-6 space-y-3">
            <h3 onclick="navigateTo('#/package/${pkg.id}')" class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug cursor-pointer line-clamp-1">
              ${pkg.title}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              ${pkg.overview}
            </p>

            <!-- Highlights Chips -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${pkg.highlights.slice(0, 2).map(h => `
                <span class="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium truncate max-w-full">
                  ✓ ${h}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
          <div>
            <span class="text-[11px] text-slate-400 block font-medium">Starting from</span>
            <span class="text-lg font-extrabold text-blue-600">₹${pkg.priceINR.toLocaleString('en-IN')}</span>
            <span class="text-[10px] text-slate-400 font-normal">/ person</span>
          </div>

          <div class="flex items-center gap-2">
            <a href="https://wa.me/918089427469?text=Hello%20SMS%20Tours%20Shoranur%2C%20I%20am%20interested%20in%20${encodeURIComponent(pkg.title)}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition" title="Inquire on WhatsApp">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
            </a>
            <button onclick="navigateTo('#/package/${pkg.id}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 transition cursor-pointer">
              <span>Details</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 7. DEDICATED BLOG LISTING PAGE (#/blog)
// --------------------------------------------------------------------------
function renderBlogPage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10 animate-fade-in">
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <span class="text-slate-900 font-bold">Travel Blog</span>
      </nav>

      <!-- Banner Header -->
      <div class="bg-gradient-to-r from-[#091e3a] via-[#0f274a] to-[#091e3a] rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-blue-900/40 space-y-4">
        <div class="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
          SMS Tours Travel Stories
        </div>
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Travel Insights & Destination Guides
        </h1>
        <p class="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Expert recommendations, seasonal travel secrets, packing guidelines, and authentic stories from our experienced tour directors in Shoranur.
        </p>
      </div>

      <!-- Filter & Search Controls -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
          <input type="text" id="blog-search-input" oninput="handleBlogSearch(this.value)" placeholder="Search articles, guides, or destinations..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>

        <!-- Filter tabs -->
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="setBlogPageFilter('all', this)" class="filter-tab active" data-blog-tab="all">All Stories</button>
          <button onclick="setBlogPageFilter('Domestic Travel', this)" class="filter-tab" data-blog-tab="Domestic Travel">Domestic</button>
          <button onclick="setBlogPageFilter('Hill Stations', this)" class="filter-tab" data-blog-tab="Hill Stations">Hill Stations</button>
          <button onclick="setBlogPageFilter('International', this)" class="filter-tab" data-blog-tab="International">International</button>
        </div>
      </div>

      <!-- Blog Grid -->
      <div id="blog-page-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <!-- Injected dynamically -->
      </div>

      <!-- Bottom WhatsApp Newsletter / Inquiries -->
      <div class="rounded-3xl p-8 bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="space-y-1 text-center sm:text-left">
          <h3 class="text-lg font-bold text-slate-900">Have a destination in mind?</h3>
          <p class="text-xs sm:text-sm text-slate-600">Our tour managers will design a tailored travel plan and itinerary from Shoranur.</p>
        </div>
        <a href="https://wa.me/918089427469?text=Hello%20SMS%20Tours%20Shoranur%2C%20I%20read%20your%20travel%20blog%20and%20want%20to%20plan%20a%20tour" target="_blank" rel="noopener noreferrer" class="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-blue-500/25 shrink-0">
          <i data-lucide="message-circle" class="w-4 h-4"></i> Talk to a Travel Specialist
        </a>
      </div>
    </div>
  `;

  renderBlogPageList();
  lucide.createIcons();
}

function setBlogPageFilter(cat, btn) {
  blogPageCat = cat;
  document.querySelectorAll('[data-blog-tab]').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderBlogPageList();
}

function handleBlogSearch(val) {
  blogPageSearch = (val || '').toLowerCase().trim();
  renderBlogPageList();
}

function renderBlogPageList() {
  const container = document.getElementById('blog-page-grid');
  if (!container) return;

  let list = [...companyInfo.blogs];

  if (blogPageCat !== 'all') {
    list = list.filter(b => b.category === blogPageCat);
  }

  if (blogPageSearch) {
    list = list.filter(b =>
      b.title.toLowerCase().includes(blogPageSearch) ||
      (b.desc && b.desc.toLowerCase().includes(blogPageSearch)) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(blogPageSearch))
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        <p class="font-bold text-base text-slate-700">No blog posts found matching your search.</p>
        <button onclick="setBlogPageFilter('all'); document.getElementById('blog-search-input').value='';" class="mt-3 text-xs text-blue-600 hover:underline font-bold">Clear search</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(blog => `
    <div onclick="navigateTo('#/blog/${blog.id}')" class="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between group">
      <div>
        <!-- Blog Image -->
        <div class="h-52 overflow-hidden relative">
          <img src="${blog.image}" alt="${blog.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute top-4 left-4">
            <span class="px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold">
              ${blog.category}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-3">
          <div class="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>${blog.date}</span>
            <span>${blog.readTime}</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
            ${blog.title}
          </h3>
          <p class="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
            ${blog.excerpt || blog.desc}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
        <div class="text-xs font-semibold text-slate-500">
          By ${blog.author}
        </div>
        <span class="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
          <span>Read Story</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </span>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 8. DEDICATED BLOG ARTICLE DETAIL PAGE (#/blog/:id)
// --------------------------------------------------------------------------
function renderBlogDetailPage(blogId) {
  const root = document.getElementById('app-root');
  if (!root) return;

  const blog = companyInfo.blogs.find(b => b.id === blogId || b.id === blogId.replace('-2024', '') || (b.id + '-2024') === blogId) || companyInfo.blogs[0];
  const relatedPkg = blog.relatedPackageId ? tourPackages.find(p => p.id === blog.relatedPackageId) : null;

  root.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10 animate-fade-in">
      <!-- Breadcrumb Bar -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <a href="#/" class="hover:text-slate-900 transition flex items-center gap-1">
          <i data-lucide="home" class="w-4 h-4"></i> Home
        </a>
        <span>/</span>
        <a href="#/blog" class="hover:text-slate-900 transition">Travel Blog</a>
        <span>/</span>
        <span class="text-slate-900 font-bold truncate max-w-xs">${blog.title}</span>
      </nav>

      <!-- Article Header -->
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
            ${blog.category}
          </span>
          <span class="text-xs text-slate-400 font-medium">${blog.date}</span>
          <span class="text-xs text-slate-400 font-medium">• ${blog.readTime}</span>
        </div>

        <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          ${blog.title}
        </h1>

        <div class="flex items-center gap-3 pt-2 text-xs text-slate-600">
          <div class="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            ${blog.author[0]}
          </div>
          <div>
            <div class="font-bold text-slate-900">${blog.author}</div>
            <div class="text-slate-400">SMS Tours & Travels Shoranur</div>
          </div>
        </div>
      </div>

      <!-- Hero Cover Image -->
      <div class="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 max-h-[460px]">
        <img src="${blog.image}" alt="${blog.title}" class="w-full h-full object-cover">
      </div>

      <!-- Article Body -->
      <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm prose prose-slate max-w-none">
        ${blog.content}
      </div>

      <!-- Related Tour Package Banner -->
      ${relatedPkg ? `
        <div class="bg-gradient-to-br from-blue-50 via-white to-sky-50 rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold text-blue-700 uppercase tracking-wider">Recommended Departure</span>
            <span class="text-xs font-semibold text-slate-500">Fixed departures from Shoranur</span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <img src="${relatedPkg.image}" alt="${relatedPkg.title}" class="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm">
              <div>
                <h4 class="text-lg font-bold text-slate-900">${relatedPkg.title}</h4>
                <p class="text-xs text-slate-500">${relatedPkg.duration} • All-inclusive star accommodation</p>
                <div class="text-base font-extrabold text-blue-600 mt-1">₹${relatedPkg.priceINR.toLocaleString('en-IN')} <span class="text-xs text-slate-400 font-normal">/ person</span></div>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <a href="https://wa.me/918089427469?text=Hello%20SMS%20Tours%2C%20I%20read%20your%20blog%20about%20${encodeURIComponent(blog.title)}%20and%20want%20to%20book%20the%20tour" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp Booking
              </a>
              <button onclick="navigateTo('#/package/${relatedPkg.id}')" class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-500/25 cursor-pointer">
                <span>View Tour</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Back to all blogs -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-200">
        <a href="#/blog" class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Back to All Travel Stories</span>
        </a>

        <a href="#/packages" class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600">
          <span>Explore All Tour Packages</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// Modal & Global Handlers
// --------------------------------------------------------------------------
function openBookingModal(packageId = null) {
  const modal = document.getElementById('booking-modal');
  const select = document.getElementById('book-package-select');
  
  if (select && typeof tourPackages !== 'undefined' && tourPackages.length > 0) {
    const currentVal = packageId || select.value || 'custom';
    select.innerHTML = `
      <option value="custom">-- Custom Itinerary / Special Request --</option>
      ${tourPackages.map(p => `<option value="${p.id}">${p.title} (${p.duration} - ₹${Number(p.priceINR || 0).toLocaleString('en-IN')})</option>`).join('')}
    `;
    if (packageId) {
      select.value = packageId;
    } else if (currentVal) {
      select.value = currentVal;
    }
  } else if (packageId && select) {
    select.value = packageId;
  }

  const dateInput = document.getElementById('book-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }

  if (modal) modal.classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
}

function handleBookingSubmit(event) {
  event.preventDefault();

  const form = event.target || document.getElementById('booking-form');
  const getVal = (id, fallback = '') => {
    const el = (form && form.querySelector('#' + id)) || document.getElementById(id);
    return el ? el.value : fallback;
  };

  const packageId = getVal('book-package-select', 'Custom Inquiry');
  const date = getVal('book-date', 'To be discussed');
  const guests = getVal('book-guests', '2 Persons');
  const name = getVal('book-name', '');
  const phone = getVal('book-phone', '');
  const city = getVal('book-city', '');
  const notes = getVal('book-notes', '');

  const pkg = tourPackages.find(p => p.id === packageId);
  const pkgTitle = pkg ? pkg.title : packageId;

  const whatsappMessage = `*NEW BOOKING INQUIRY - SMS TOURS SHORANUR*
━━━━━━━━━━━━━━━━━━━━
📌 *Selected Tour:* ${pkgTitle}
📅 *Preferred Date:* ${date}
👥 *Travelers:* ${guests}

👤 *Lead Guest:* ${name}
📞 *Contact Number:* ${phone}
📍 *Pickup / City:* ${city || 'Kerala / Shoranur'}
${notes ? `📝 *Notes:* ${notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
_Submitted via SMS Tours Website_`;

  const encodedUrl = `https://wa.me/918089427469?text=${encodeURIComponent(whatsappMessage)}`;
  closeBookingModal();
  window.open(encodedUrl, '_blank');
}

function handleContactPageSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('contact-name') ? document.getElementById('contact-name').value.trim() : '';
  const phone = document.getElementById('contact-phone') ? document.getElementById('contact-phone').value.trim() : '';
  const pkgSelect = document.getElementById('contact-package-select');
  const pkgId = pkgSelect ? pkgSelect.value : 'General Inquiry';
  const date = document.getElementById('contact-date') ? document.getElementById('contact-date').value : 'To be discussed';
  const guests = document.getElementById('contact-guests') ? document.getElementById('contact-guests').value : '2 Adults';
  const notes = document.getElementById('contact-notes') ? document.getElementById('contact-notes').value.trim() : '';

  const pkg = tourPackages.find(p => p.id === pkgId);
  const pkgTitle = pkg ? pkg.title : pkgId;

  const msg = `*NEW CONTACT INQUIRY - SMS TOURS SHORANUR*
━━━━━━━━━━━━━━━━━━━━
📌 *Tour/Inquiry:* ${pkgTitle}
📅 *Preferred Date:* ${date}
👥 *Guests:* ${guests}

👤 *Name:* ${name}
📞 *Contact Number:* ${phone}
${notes ? `📝 *Message:* ${notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
_Submitted via SMS Tours Contact Page_`;

  window.open(`https://wa.me/918089427469?text=${encodeURIComponent(msg)}`, '_blank');
}

function toggleContactDrawer() {
  const drawer = document.getElementById('contact-drawer');
  drawer.classList.toggle('open');
  lucide.createIcons();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  const isHidden = menu.classList.contains('hidden');
  const btn = document.getElementById('mobile-menu-btn');
  const header = document.getElementById('main-header');

  if (isHidden) {
    menu.classList.remove('hidden');
    if (header) {
      header.classList.remove('header-blended');
      header.classList.add('header-solid');
    }
    if (btn) btn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
  } else {
    menu.classList.add('hidden');
    updateHeaderStyle();
    if (btn) btn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
  }
  lucide.createIcons();
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
    if (e.target.id === 'story-modal') {
      closeStoryModal();
    }
  }
});

// --------------------------------------------------------------------------
// 12. CURRENCY SWITCHER HELPER (₹ INR / $ USD)
// --------------------------------------------------------------------------
function formatPrice(priceINR, priceUSD) {
  if (activeCurrency === 'USD') {
    const usdVal = priceUSD || Math.round((priceINR || 0) / 83);
    return `$${Number(usdVal).toLocaleString('en-US')}`;
  }
  return `₹${Number(priceINR || 0).toLocaleString('en-IN')}`;
}

function toggleCurrency(curr) {
  activeCurrency = curr;
  const inrBtn = document.getElementById('curr-btn-inr');
  const usdBtn = document.getElementById('curr-btn-usd');

  if (inrBtn && usdBtn) {
    if (curr === 'INR') {
      inrBtn.className = 'px-3 py-1 rounded-full text-xs font-black transition cursor-pointer bg-blue-600 text-white shadow-xs';
      usdBtn.className = 'px-3 py-1 rounded-full text-xs font-black transition cursor-pointer text-slate-600 hover:text-slate-900';
    } else {
      usdBtn.className = 'px-3 py-1 rounded-full text-xs font-black transition cursor-pointer bg-blue-600 text-white shadow-xs';
      inrBtn.className = 'px-3 py-1 rounded-full text-xs font-black transition cursor-pointer text-slate-600 hover:text-slate-900';
    }
  }

  // Re-render catalog grid with selected currency
  renderPackagesGrid();
}

// --------------------------------------------------------------------------
// 13. INSTAGRAM-STYLE STORY VIEWER MODAL CONTROLLER
// --------------------------------------------------------------------------
function openStoryModal(storyId) {
  const stories = (typeof tourStories !== 'undefined' ? tourStories : (typeof window !== 'undefined' ? window.tourStories : [])) || [];
  const story = stories.find(s => s.id === storyId) || stories[0];
  if (!story) return;

  const modal = document.getElementById('story-modal');
  if (!modal) return;

  const setEl = (id, val, isSrc = false) => {
    const el = document.getElementById(id);
    if (el) {
      if (isSrc) el.src = val || '';
      else el.textContent = val || '';
    }
  };

  setEl('story-modal-avatar', story.avatar, true);
  setEl('story-modal-name', story.name);
  setEl('story-modal-tag', story.tag);
  setEl('story-modal-cover', story.cover, true);
  setEl('story-modal-img', story.cover, true);
  setEl('story-modal-title', story.title);
  setEl('story-modal-location', story.location);
  setEl('story-modal-duration', story.duration);
  setEl('story-modal-rating', story.rating);
  setEl('story-modal-travelers', story.travelers);
  setEl('story-modal-quote', story.quote);

  // WhatsApp Booking Action
  const waBtn = document.getElementById('story-modal-wa-btn');
  if (waBtn) {
    waBtn.onclick = (e) => {
      if (e) e.preventDefault();
      const msg = `*SMS TOURS STORY INQUIRY*\nHi SMS Tours, I was watching your ${story.name} (${story.title}) group departure story and would like more details and upcoming departure dates!`;
      window.open(`https://wa.me/918089427469?text=${encodeURIComponent(msg)}`, '_blank');
    };
  }

  // Details button
  const detailsBtn = document.getElementById('story-modal-details-btn');
  if (detailsBtn) {
    detailsBtn.onclick = (e) => {
      if (e) e.preventDefault();
      closeStoryModal();
      navigateTo(`#/package/${story.packageId}`);
    };
  }

  modal.classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Reset Progress Bar Animation
  const progressBar = document.getElementById('story-progress-bar');
  if (progressBar) {
    progressBar.style.animation = 'none';
    progressBar.offsetHeight; // trigger reflow
    progressBar.style.animation = 'storyBarFill 5s linear forwards';
  }

  // Auto-close after 5 seconds
  if (storyModalInterval) clearTimeout(storyModalInterval);
  storyModalInterval = setTimeout(() => {
    closeStoryModal();
  }, 5000);
}

function closeStoryModal() {
  const modal = document.getElementById('story-modal');
  if (modal) modal.classList.remove('open');
  if (storyModalInterval) {
    clearTimeout(storyModalInterval);
    storyModalInterval = null;
  }
}

// --------------------------------------------------------------------------
// 14. TRIP MATCHER CAPSULE CONTROLLER
// --------------------------------------------------------------------------
function executeTripMatcher() {
  const traveler = document.getElementById('matcher-traveler') ? document.getElementById('matcher-traveler').value : 'family';
  const vibe = document.getElementById('matcher-vibe') ? document.getElementById('matcher-vibe').value : 'international';
  const resultText = document.getElementById('matcher-result-text');

  let targetCat = 'all';
  let targetPkgId = 'dubai';

  if (vibe === 'international') {
    targetCat = 'international';
    targetPkgId = (traveler === 'couple') ? 'thailand-tour' : 'dubai';
  } else if (vibe === 'snow') {
    targetCat = 'domestic';
    targetPkgId = 'kashmir-yathra';
  } else if (vibe === 'nature') {
    targetCat = (traveler === 'family') ? 'domestic' : 'day-trip';
    targetPkgId = 'wayanad-tour';
  } else if (vibe === 'heritage') {
    targetCat = 'domestic';
    targetPkgId = 'hyderabad-tour';
  } else if (vibe === 'pilgrimage') {
    targetCat = 'pilgrimage';
    targetPkgId = 'kashi-yathra';
  }

  if (resultText) {
    resultText.innerHTML = `✨ Matched: Directing to our top recommendation...`;
  }

  setTimeout(() => {
    navigateTo(`#/package/${targetPkgId}`);
  }, 600);
}

// --------------------------------------------------------------------------
// 15. SCROLL-DRIVEN STAGGER ANIMATIONS & NUMBER COUNTER
// --------------------------------------------------------------------------
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');

        // Animate counter numbers inside this target if present
        const counters = entry.target.querySelectorAll('[data-count-target]');
        counters.forEach(counter => {
          animateCounter(counter);
        });

        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-init').forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count-target'), 10);
  const suffix = el.getAttribute('data-count-suffix') || '';
  if (isNaN(target)) return;

  const duration = 1600; // ms
  const frameRate = 1000 / 60;
  const totalFrames = Math.round(duration / frameRate);
  let frame = 0;

  const timer = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.round(target * easeProgress);

    el.textContent = `${currentVal.toLocaleString('en-IN')}${suffix}`;

    if (frame >= totalFrames) {
      clearInterval(timer);
      el.textContent = `${target.toLocaleString('en-IN')}${suffix}`;
    }
  }, frameRate);
}

// --------------------------------------------------------------------------
// 16. WHATSAPP TEASER AUTO-EXPANDING GREETING BALLOON
// --------------------------------------------------------------------------

function initWhatsAppTeaser() {
  if (sessionStorage.getItem('sms_wa_teaser_dismissed')) return;

  if (whatsappTeaserTimer) clearTimeout(whatsappTeaserTimer);
  whatsappTeaserTimer = setTimeout(() => {
    const balloon = document.getElementById('whatsapp-teaser-balloon');
    if (balloon) {
      balloon.classList.remove('hidden');
      balloon.classList.add('flex');
    }
  }, 3000);
}

function dismissWhatsAppTeaser(event) {
  if (event) event.stopPropagation();
  const balloon = document.getElementById('whatsapp-teaser-balloon');
  if (balloon) {
    balloon.classList.add('hidden');
    balloon.classList.remove('flex');
  }
  sessionStorage.setItem('sms_wa_teaser_dismissed', 'true');
}

// --------------------------------------------------------------------------
// 17. COMPREHENSIVE ADMIN PANEL (PACKAGES, GALLERY & BLOGS CRUD)
// --------------------------------------------------------------------------

function isAdminAuthenticated() {
  return sessionStorage.getItem('sms_admin_auth') === 'true';
}

function renderAdminPage() {
  const root = document.getElementById('app-root');
  if (!root) return;

  if (!isAdminAuthenticated()) {
    renderAdminLogin(root);
    return;
  }

  renderAdminDashboard(root);
}

function renderAdminLogin(root) {
  root.innerHTML = `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div class="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xl space-y-6 text-center animate-scale-in">
        <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/70 shadow-sm">
          <i data-lucide="shield-check" class="w-8 h-8"></i>
        </div>
        
        <div>
          <span class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2 border border-blue-200/60">
            SMS Tours Management
          </span>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Admin Portal Access</h2>
          <p class="text-xs text-slate-500 mt-1">Manage tour packages, photo gallery, and travel blog articles in real-time.</p>
        </div>

        <form onsubmit="handleAdminLoginSubmit(event)" class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Admin Password / PIN</label>
            <div class="relative">
              <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <input 
                type="password" 
                id="admin-password-input" 
                required 
                placeholder="Enter password (default: smsadmin2026)" 
                class="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button type="button" onclick="toggleAdminPasswordVisibility()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <i data-lucide="eye" id="admin-pwd-eye" class="w-4 h-4"></i>
              </button>
            </div>
            <p id="admin-login-error" class="text-xs font-bold text-rose-500 mt-2 hidden flex items-center gap-1">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 shrink-0"></i> Incorrect password. Default is smsadmin2026
            </p>
          </div>

          <button type="submit" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer">
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Unlock Admin Dashboard</span>
          </button>
        </form>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <a href="#/" class="hover:text-blue-600 transition flex items-center gap-1">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Website
          </a>
          <span>Key: <strong class="text-slate-600">smsadmin2026</strong></span>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function toggleAdminPasswordVisibility() {
  const input = document.getElementById('admin-password-input');
  const eye = document.getElementById('admin-pwd-eye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (eye) eye.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (eye) eye.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('admin-password-input');
  const error = document.getElementById('admin-login-error');
  const val = input ? input.value.trim() : '';

  const configuredPass = localStorage.getItem('sms_admin_pin') || 'smsadmin2026';
  if (val === configuredPass || val === 'smsadmin2026') {
    sessionStorage.setItem('sms_admin_auth', 'true');
    renderAdminPage();
  } else {
    if (error) error.classList.remove('hidden');
    if (input) {
      input.classList.add('border-rose-400', 'bg-rose-50');
      input.focus();
    }
  }
}

function adminLogout() {
  sessionStorage.removeItem('sms_admin_auth');
  renderAdminPage();
}

function renderAdminDashboard(root) {
  const currentBlogs = (typeof companyInfo !== 'undefined' && companyInfo.blogs) ? companyInfo.blogs : [];

  root.innerHTML = `
    <div class="min-h-screen bg-slate-50 pt-24 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-900/40">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Staff Management Console</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>SMS Tours Master Control Panel</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-300">
              Live Content Engine • Works seamlessly on Netlify, Web Hosting & Local Server.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button onclick="downloadStoreBackup()" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer" title="Download store.json for Git / Netlify permanent deployment">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Export store.json</span>
            </button>
            <a href="#/" target="_blank" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/20">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>View Live Website</span>
            </a>
            <button onclick="adminLogout()" class="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition border border-rose-500/30 cursor-pointer">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <!-- 4 Key Stat Badges -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Tour Packages</span>
              <span id="stat-packages-count" class="text-2xl sm:text-3xl font-black text-slate-900">${tourPackages.length}</span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i data-lucide="map" class="w-5 h-5"></i>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Gallery Photos</span>
              <span id="stat-gallery-count" class="text-2xl sm:text-3xl font-black text-slate-900">${galleryItems.length}</span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i data-lucide="image" class="w-5 h-5"></i>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Blog Articles</span>
              <span id="stat-blog-count" class="text-2xl sm:text-3xl font-black text-slate-900">${currentBlogs.length}</span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i data-lucide="book-open" class="w-5 h-5"></i>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Storage Mode</span>
              <span class="text-xs font-black text-emerald-600 flex items-center gap-1 mt-1">
                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i> Netlify & Localhost Ready
              </span>
            </div>
            <div class="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <i data-lucide="database" class="w-5 h-5"></i>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs Bar -->
        <div class="flex items-center justify-between gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
          <div class="flex items-center gap-2">
            <button onclick="setAdminTab('packages')" id="admin-tab-packages" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${adminActiveTab === 'packages' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
              <i data-lucide="compass" class="w-4 h-4"></i>
              <span>Tour Packages (${tourPackages.length})</span>
            </button>
            <button onclick="setAdminTab('gallery')" id="admin-tab-gallery" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${adminActiveTab === 'gallery' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
              <i data-lucide="camera" class="w-4 h-4"></i>
              <span>Gallery (${galleryItems.length})</span>
            </button>
            <button onclick="setAdminTab('blogs')" id="admin-tab-blogs" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${adminActiveTab === 'blogs' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
              <i data-lucide="newspaper" class="w-4 h-4"></i>
              <span>Blogs & Guides (${currentBlogs.length})</span>
            </button>
            <button onclick="setAdminTab('settings')" id="admin-tab-settings" class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${adminActiveTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}">
              <i data-lucide="settings" class="w-4 h-4"></i>
              <span>Data & Backup</span>
            </button>
          </div>
        </div>

        <!-- Tab Body Container -->
        <div id="admin-tab-content" class="space-y-6">
          <!-- Dynamic Content -->
        </div>

      </div>
    </div>

    <!-- ADMIN MODAL CONTAINER FOR ADD/EDIT -->
    <div id="admin-editor-modal" class="modal-backdrop custom-scroll">
      <div id="admin-editor-modal-box" class="modal-content-box p-4 sm:p-7 md:p-8 max-w-3xl w-full bg-white rounded-3xl shadow-2xl relative my-auto">
      </div>
    </div>
  `;

  lucide.createIcons();
  renderAdminTabContent();
}

function setAdminTab(tab) {
  adminActiveTab = tab;
  document.querySelectorAll('[id^="admin-tab-"]').forEach(btn => {
    btn.className = 'px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100';
  });
  const activeBtn = document.getElementById(`admin-tab-${tab}`);
  if (activeBtn) {
    activeBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer bg-blue-600 text-white shadow-md shadow-blue-500/25';
  }
  renderAdminTabContent();
}

function renderAdminTabContent() {
  const container = document.getElementById('admin-tab-content');
  if (!container) return;

  if (adminActiveTab === 'packages') {
    renderAdminPackagesTab(container);
  } else if (adminActiveTab === 'gallery') {
    renderAdminGalleryTab(container);
  } else if (adminActiveTab === 'blogs') {
    renderAdminBlogsTab(container);
  } else if (adminActiveTab === 'settings') {
    renderAdminSettingsTab(container);
  }

  lucide.createIcons();
}

function renderAdminPackagesTab(container) {
  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
          <input 
            type="text" 
            id="admin-pkg-search" 
            oninput="filterAdminPackages(this.value)" 
            placeholder="Search packages by title, location or category..." 
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <button onclick="openPackageEditor(null)" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>Add New Tour Package</span>
        </button>
      </div>

      <!-- Packages Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px]">
              <th class="py-3 px-3">Tour / Cover</th>
              <th class="py-3 px-3">Category</th>
              <th class="py-3 px-3">Duration</th>
              <th class="py-3 px-3">Price (INR / USD)</th>
              <th class="py-3 px-3">Rating</th>
              <th class="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="admin-packages-table-body" class="divide-y divide-slate-100">
          </tbody>
        </table>
      </div>

    </div>
  `;

  populateAdminPackagesTable(tourPackages);
}

function populateAdminPackagesTable(list) {
  const tbody = document.getElementById('admin-packages-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-10 text-slate-400">
          No tour packages found. Click "Add New Tour Package" above.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(pkg => `
    <tr class="hover:bg-slate-50/80 transition">
      <td class="py-3 px-3">
        <div class="flex items-center gap-3">
          <img src="${pkg.image}" alt="${pkg.title}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200">
          <div class="min-w-0">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[220px]">${pkg.title}</h4>
            <span class="text-[11px] text-slate-500 flex items-center gap-1 truncate">
              <i data-lucide="map-pin" class="w-3 h-3 text-blue-500"></i> ${pkg.location}
            </span>
          </div>
        </div>
      </td>
      <td class="py-3 px-3">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          pkg.category === 'international' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
          pkg.category === 'domestic' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          pkg.category === 'day-trip' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          'bg-purple-50 text-purple-700 border border-purple-200'
        }">
          ${pkg.category}
        </span>
      </td>
      <td class="py-3 px-3 font-semibold text-slate-700">
        ${pkg.duration}
      </td>
      <td class="py-3 px-3 font-bold text-blue-600">
        ₹${Number(pkg.priceINR || 0).toLocaleString('en-IN')}
        <span class="text-xs text-slate-400 font-normal">($${pkg.priceUSD || Math.round(pkg.priceINR / 83)})</span>
      </td>
      <td class="py-3 px-3">
        <span class="font-bold text-amber-500">★ ${pkg.rating}</span>
        <span class="text-[10px] text-slate-400">(${pkg.reviewsCount || 0})</span>
      </td>
      <td class="py-3 px-3 text-right">
        <div class="inline-flex items-center gap-1.5">
          <button onclick="openPackageEditor('${pkg.id}')" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer" title="Edit Package">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button onclick="confirmDeletePackage('${pkg.id}')" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer" title="Delete Package">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
          <a href="#/package/${pkg.id}" target="_blank" class="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition" title="View Public Page">
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </a>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function filterAdminPackages(query) {
  const q = query.toLowerCase().trim();
  const filtered = tourPackages.filter(p => 
    p.title.toLowerCase().includes(q) || 
    p.location.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  );
  populateAdminPackagesTable(filtered);
}

function openPackageEditor(packageId) {
  const modal = document.getElementById('admin-editor-modal');
  const box = document.getElementById('admin-editor-modal-box');
  if (!modal || !box) return;

  const pkg = packageId ? tourPackages.find(p => p.id === packageId) : null;
  const isEditing = !!pkg;

  box.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-xl font-bold text-slate-900">${isEditing ? 'Edit Tour Package' : 'Create New Tour Package'}</h3>
        <p class="text-xs text-slate-500">Package details sync to homepage and dedicated itinerary views.</p>
      </div>
      <button onclick="closeAdminEditorModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <form onsubmit="handleSavePackage(event, '${packageId || ''}')" class="space-y-4 pt-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-2">
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Package Title *</label>
          <input type="text" id="pkg-form-title" required value="${pkg ? pkg.title : ''}" placeholder="e.g. Dubai Spectacular Tour" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Location / Destination *</label>
          <input type="text" id="pkg-form-location" required value="${pkg ? pkg.location : ''}" placeholder="e.g. Dubai, UAE" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Category *</label>
          <select id="pkg-form-category" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
            <option value="international" ${pkg && pkg.category === 'international' ? 'selected' : ''}>International</option>
            <option value="domestic" ${pkg && pkg.category === 'domestic' ? 'selected' : ''}>Domestic</option>
            <option value="day-trip" ${pkg && pkg.category === 'day-trip' ? 'selected' : ''}>Local Day Trip</option>
            <option value="pilgrimage" ${pkg && pkg.category === 'pilgrimage' ? 'selected' : ''}>Pilgrimage</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Duration *</label>
          <input type="text" id="pkg-form-duration" required value="${pkg ? pkg.duration : '5 Days / 4 Nights'}" placeholder="e.g. 5 Days / 4 Nights" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Highlight Badge</label>
          <input type="text" id="pkg-form-badge" value="${pkg ? pkg.badge : 'Trending Deal'}" placeholder="e.g. Trending Deal, Premium" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Price (₹ INR) *</label>
          <input type="number" id="pkg-form-price-inr" required value="${pkg ? pkg.priceINR : 25000}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Price ($ USD)</label>
          <input type="number" id="pkg-form-price-usd" value="${pkg ? pkg.priceUSD : 320}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Rating (e.g. 4.9)</label>
          <input type="number" step="0.1" id="pkg-form-rating" value="${pkg ? pkg.rating : 4.9}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Cover Image URL *</label>
        <input type="url" id="pkg-form-image" required value="${pkg ? pkg.image : 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'}" placeholder="https://..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Package Overview *</label>
        <textarea id="pkg-form-overview" rows="3" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">${pkg ? pkg.overview : ''}</textarea>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Key Sightseeing Highlights (One per line)</label>
        <textarea id="pkg-form-highlights" rows="3" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">${pkg && pkg.highlights ? pkg.highlights.join('\n') : ''}</textarea>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
        <button type="button" onclick="closeAdminEditorModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>${isEditing ? 'Save Package Changes' : 'Create Package'}</span>
        </button>
      </div>

    </form>
  `;

  modal.classList.add('open');
  lucide.createIcons();
}

async function handleSavePackage(e, existingId) {
  e.preventDefault();

  const title = document.getElementById('pkg-form-title').value.trim();
  const location = document.getElementById('pkg-form-location').value.trim();
  const category = document.getElementById('pkg-form-category').value;
  const duration = document.getElementById('pkg-form-duration').value.trim();
  const badge = document.getElementById('pkg-form-badge').value.trim() || 'Featured Tour';
  const priceINR = Number(document.getElementById('pkg-form-price-inr').value) || 20000;
  const priceUSD = Number(document.getElementById('pkg-form-price-usd').value) || Math.round(priceINR / 83);
  const rating = parseFloat(document.getElementById('pkg-form-rating').value) || 4.9;
  const image = document.getElementById('pkg-form-image').value.trim();
  const overview = document.getElementById('pkg-form-overview').value.trim();
  const highlightsText = document.getElementById('pkg-form-highlights').value.trim();
  const highlights = highlightsText ? highlightsText.split('\n').map(h => h.trim()).filter(Boolean) : ['Guided Sightseeing', 'Hotel Stay Included'];

  const id = existingId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const pkgObj = {
    id: id,
    title: title,
    location: location,
    country: location.split(',')[1] ? location.split(',')[1].trim() : 'India',
    category: category,
    theme: category === 'international' ? 'city' : 'nature',
    priceINR: priceINR,
    priceUSD: priceUSD,
    duration: duration,
    rating: rating,
    reviewsCount: existingId ? (tourPackages.find(p => p.id === existingId)?.reviewsCount || 98) : 50,
    badge: badge,
    image: image,
    sliderImages: [image],
    gallery: [image],
    overview: overview,
    highlights: highlights,
    itinerary: [
      { day: "Day 1", title: "Arrival & Sightseeing", detail: overview }
    ],
    inclusions: ["Star Hotel Stay", "Guided Sightseeing Transfers", "Assistance throughout tour"],
    exclusions: ["Personal expenses"]
  };

  if (existingId) {
    const idx = tourPackages.findIndex(p => p.id === existingId);
    if (idx !== -1) {
      tourPackages[idx] = Object.assign({}, tourPackages[idx], pkgObj);
    }
  } else {
    tourPackages.unshift(pkgObj);
  }

  await persistStoreData(getCurrentStoreData());
  closeAdminEditorModal();
  renderAdminTabContent();
  showAdminToast(existingId ? 'Package updated successfully!' : 'New package created successfully!');
}

async function confirmDeletePackage(id) {
  const pkg = tourPackages.find(p => p.id === id);
  if (!pkg) return;

  if (confirm(`Are you sure you want to delete "${pkg.title}"? This cannot be undone.`)) {
    tourPackages = tourPackages.filter(p => p.id !== id);
    await persistStoreData(getCurrentStoreData());
    renderAdminTabContent();
    showAdminToast('Package deleted.');
  }
}

function renderAdminGalleryTab(container) {
  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Photo Gallery Assets</h3>
          <p class="text-xs text-slate-500">Manage photos shown on the dedicated /gallery page and tour visual showcases.</p>
        </div>

        <button onclick="openGalleryEditor(null)" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>Add New Gallery Photo</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${galleryItems.map(item => `
          <div class="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 group flex flex-col justify-between">
            <div class="relative h-44 overflow-hidden bg-slate-900">
              <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
              <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                ${item.category}
              </span>
            </div>
            <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 class="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">${item.title}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-2 mt-1">${item.desc || item.location}</p>
              </div>
              <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span class="text-[10px] font-semibold text-blue-600">${item.location}</span>
                <div class="flex items-center gap-1">
                  <button onclick="openGalleryEditor('${item.id}')" class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer" title="Edit">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="confirmDeleteGallery('${item.id}')" class="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer" title="Delete">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openGalleryEditor(itemId) {
  const modal = document.getElementById('admin-editor-modal');
  const box = document.getElementById('admin-editor-modal-box');
  if (!modal || !box) return;

  const item = itemId ? galleryItems.find(g => g.id === itemId) : null;
  const isEditing = !!item;

  box.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-xl font-bold text-slate-900">${isEditing ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}</h3>
        <p class="text-xs text-slate-500">Will appear in the public photo gallery grid.</p>
      </div>
      <button onclick="closeAdminEditorModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <form onsubmit="handleSaveGallery(event, '${itemId || ''}')" class="space-y-4 pt-4 text-xs sm:text-sm">
      <div>
        <label class="block font-bold text-slate-700 mb-1">Photo Title *</label>
        <input type="text" id="gal-form-title" required value="${item ? item.title : ''}" placeholder="e.g. Sunset over Dal Lake Shikara" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Category *</label>
          <select id="gal-form-category" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
            <option value="international" ${item && item.category === 'international' ? 'selected' : ''}>International</option>
            <option value="domestic" ${item && item.category === 'domestic' ? 'selected' : ''}>Domestic</option>
            <option value="events" ${item && item.category === 'events' ? 'selected' : ''}>Tours & Moments</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Location Tag *</label>
          <input type="text" id="gal-form-location" required value="${item ? item.location : ''}" placeholder="e.g. Srinagar, Kashmir" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Image URL *</label>
        <input type="url" id="gal-form-image" required value="${item ? item.image : ''}" placeholder="https://images.unsplash.com/..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Description / Caption</label>
        <textarea id="gal-form-desc" rows="2" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">${item ? (item.desc || '') : ''}</textarea>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
        <button type="button" onclick="closeAdminEditorModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>Save Gallery Photo</span>
        </button>
      </div>
    </form>
  `;

  modal.classList.add('open');
  lucide.createIcons();
}

async function handleSaveGallery(e, existingId) {
  e.preventDefault();
  const title = document.getElementById('gal-form-title').value.trim();
  const category = document.getElementById('gal-form-category').value;
  const location = document.getElementById('gal-form-location').value.trim();
  const image = document.getElementById('gal-form-image').value.trim();
  const desc = document.getElementById('gal-form-desc').value.trim();

  const id = existingId || ('gal-' + Date.now());

  const galObj = { id, title, category, location, image, desc };

  if (existingId) {
    const idx = galleryItems.findIndex(g => g.id === existingId);
    if (idx !== -1) galleryItems[idx] = galObj;
  } else {
    galleryItems.unshift(galObj);
  }

  await persistStoreData(getCurrentStoreData());
  closeAdminEditorModal();
  renderAdminTabContent();
  showAdminToast('Gallery photo saved.');
}

async function confirmDeleteGallery(id) {
  if (confirm('Delete this photo from gallery?')) {
    galleryItems = galleryItems.filter(g => g.id !== id);
    await persistStoreData(getCurrentStoreData());
    renderAdminTabContent();
    showAdminToast('Gallery item removed.');
  }
}

function renderAdminBlogsTab(container) {
  const blogs = (typeof companyInfo !== 'undefined' && companyInfo.blogs) ? companyInfo.blogs : [];

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Travel Blog & Destination Guides</h3>
          <p class="text-xs text-slate-500">Articles published on the /blog section and featured insights.</p>
        </div>

        <button onclick="openBlogEditor(null)" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>Write New Blog Post</span>
        </button>
      </div>

      <div class="divide-y divide-slate-100">
        ${blogs.map(blog => `
          <div class="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <img src="${blog.image}" alt="${blog.title}" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 mt-1 sm:mt-0">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase border border-blue-200/60">${blog.category}</span>
                  <span class="text-xs text-slate-400 font-medium">${blog.date}</span>
                </div>
                <h4 class="font-bold text-slate-900 text-sm sm:text-base leading-snug">${blog.title}</h4>
                <p class="text-xs text-slate-500 line-clamp-1 max-w-xl">${blog.excerpt || blog.desc}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button onclick="openBlogEditor('${blog.id}')" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                <i data-lucide="pencil" class="w-3.5 h-3.5"></i> Edit
              </button>
              <button onclick="confirmDeleteBlog('${blog.id}')" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
              </button>
              <a href="#/blog/${blog.id}" target="_blank" class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition flex items-center gap-1">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> View
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openBlogEditor(blogId) {
  const modal = document.getElementById('admin-editor-modal');
  const box = document.getElementById('admin-editor-modal-box');
  if (!modal || !box) return;

  const blogs = (typeof companyInfo !== 'undefined' && companyInfo.blogs) ? companyInfo.blogs : [];
  const blog = blogId ? blogs.find(b => b.id === blogId) : null;
  const isEditing = !!blog;

  box.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-xl font-bold text-slate-900">${isEditing ? 'Edit Blog Article' : 'Write New Blog Article'}</h3>
        <p class="text-xs text-slate-500">Destination guides and travel experiences.</p>
      </div>
      <button onclick="closeAdminEditorModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <form onsubmit="handleSaveBlog(event, '${blogId || ''}')" class="space-y-4 pt-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-2">
      <div>
        <label class="block font-bold text-slate-700 mb-1">Article Title *</label>
        <input type="text" id="blog-form-title" required value="${blog ? blog.title : ''}" placeholder="e.g. Wayanad Solitude: Top Hidden Trails" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Category *</label>
          <input type="text" id="blog-form-category" required value="${blog ? blog.category : 'Kerala Travel'}" placeholder="e.g. Hill Stations, Dubai" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Author Name *</label>
          <input type="text" id="blog-form-author" required value="${blog ? (blog.author || 'SMS Tours Team') : 'SMS Tours Team'}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">Read Time</label>
          <input type="text" id="blog-form-readtime" value="${blog ? (blog.readTime || '4 min read') : '4 min read'}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Cover Image URL *</label>
        <input type="url" id="blog-form-image" required value="${blog ? blog.image : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Short Excerpt *</label>
        <textarea id="blog-form-excerpt" rows="2" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">${blog ? (blog.excerpt || blog.desc) : ''}</textarea>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">Full Article Content (HTML / Paragraphs) *</label>
        <textarea id="blog-form-content" rows="6" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">${blog ? (blog.content || `<p>${blog.excerpt || ''}</p>`) : '<p>Write your detailed travel guide and experience here...</p>'}</textarea>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
        <button type="button" onclick="closeAdminEditorModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>Save Blog Article</span>
        </button>
      </div>
    </form>
  `;

  modal.classList.add('open');
  lucide.createIcons();
}

async function handleSaveBlog(e, existingId) {
  e.preventDefault();
  const title = document.getElementById('blog-form-title').value.trim();
  const category = document.getElementById('blog-form-category').value.trim();
  const author = document.getElementById('blog-form-author').value.trim();
  const readTime = document.getElementById('blog-form-readtime').value.trim() || '4 min read';
  const image = document.getElementById('blog-form-image').value.trim();
  const excerpt = document.getElementById('blog-form-excerpt').value.trim();
  const content = document.getElementById('blog-form-content').value.trim();

  const id = existingId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const blogObj = {
    id,
    title,
    category,
    date,
    readTime,
    author,
    image,
    desc: excerpt,
    excerpt,
    content
  };

  if (!companyInfo.blogs) companyInfo.blogs = [];

  if (existingId) {
    const idx = companyInfo.blogs.findIndex(b => b.id === existingId);
    if (idx !== -1) companyInfo.blogs[idx] = Object.assign({}, companyInfo.blogs[idx], blogObj);
  } else {
    companyInfo.blogs.unshift(blogObj);
  }

  await persistStoreData(getCurrentStoreData());
  closeAdminEditorModal();
  renderAdminTabContent();
  showAdminToast('Blog published successfully.');
}

async function confirmDeleteBlog(id) {
  if (confirm('Delete this blog post?')) {
    if (companyInfo && companyInfo.blogs) {
      companyInfo.blogs = companyInfo.blogs.filter(b => b.id !== id);
      await persistStoreData(getCurrentStoreData());
      renderAdminTabContent();
      showAdminToast('Blog article deleted.');
    }
  }
}

function renderAdminSettingsTab(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Box 1: Netlify & Cloud Store Sync -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <i data-lucide="hard-drive" class="w-5 h-5"></i>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">Netlify & Cloud Store Sync</h3>
          <p class="text-xs text-slate-500 mt-0.5">Edits auto-save immediately to your browser. Export store.json to update your Netlify site permanently.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2.5">
          <button onclick="downloadStoreBackup()" class="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>Export store.json</span>
          </button>
          <label class="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-slate-300">
            <i data-lucide="upload" class="w-4 h-4"></i>
            <span>Import store.json</span>
            <input type="file" accept=".json" onchange="importStoreJson(event)" class="hidden" />
          </label>
        </div>
      </div>

      <!-- Box 2: Password Management -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <i data-lucide="key" class="w-5 h-5"></i>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">Change Admin Password / PIN</h3>
          <p class="text-xs text-slate-500 mt-0.5">Set a custom password for accessing the admin panel (default: smsadmin2026).</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="password" id="new-admin-pin" placeholder="Enter new password" class="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
          <button onclick="updateAdminPin()" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer">
            Save PIN
          </button>
        </div>
      </div>

      <!-- Box 3: Live Reset -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4 md:col-span-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <i data-lucide="refresh-ccw" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900">Restore System Defaults</h3>
            <p class="text-xs text-slate-500">Resets the database back to original SMS Tours default packages, gallery and blogs.</p>
          </div>
        </div>
        <button onclick="confirmResetStore()" class="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition border border-rose-200 cursor-pointer">
          Reset All Content to Factory Defaults
        </button>
      </div>

    </div>
  `;
}

function downloadStoreBackup() {
  const data = JSON.stringify(getCurrentStoreData(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `store.json`;
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast('Downloaded store.json! Replace data/store.json to deploy permanently.');
}

function importStoreJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.tourPackages || parsed.galleryItems || parsed.blogs) {
        applyStoreData(parsed);
        await persistStoreData(getCurrentStoreData());
        renderAdminTabContent();
        showAdminToast('store.json imported and applied successfully!');
      } else {
        alert('Invalid store.json format.');
      }
    } catch (err) {
      alert('Error parsing JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function updateAdminPin() {
  const pinInput = document.getElementById('new-admin-pin');
  const val = pinInput ? pinInput.value.trim() : '';
  if (!val) {
    alert('Please enter a password');
    return;
  }
  localStorage.setItem('sms_admin_pin', val);
  if (pinInput) pinInput.value = '';
  showAdminToast('Admin password updated successfully.');
}

async function confirmResetStore() {
  if (confirm('Are you sure you want to restore defaults? All custom changes will be overwritten.')) {
    localStorage.removeItem(SMS_STORE_KEY);
    location.reload();
  }
}

function closeAdminEditorModal() {
  const modal = document.getElementById('admin-editor-modal');
  if (modal) modal.classList.remove('open');
}

function showAdminToast(msg) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl bg-slate-900/95 text-white font-bold text-xs sm:text-sm shadow-2xl border border-slate-700 backdrop-blur-md flex items-center gap-2.5 transition-all duration-300 pointer-events-auto transform translate-y-0 opacity-100';
  toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span><span>${msg}</span>`;
  toast.style.display = 'flex';
  if (window.adminToastTimeout) clearTimeout(window.adminToastTimeout);
  window.adminToastTimeout = setTimeout(() => {
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl bg-slate-900/95 text-white font-bold text-xs sm:text-sm shadow-2xl border border-slate-700 backdrop-blur-md flex items-center gap-2.5 transition-all duration-300 pointer-events-none transform translate-y-3 opacity-0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 3500);
}
