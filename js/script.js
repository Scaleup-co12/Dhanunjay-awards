document.addEventListener('DOMContentLoaded', () => {
  const headFixed = document.getElementById('siteHeadFixed');
  const header = document.getElementById('siteHeader');

  if (headFixed) {
    const setHeaderHeightVar = () => {
      // Measure while unscrolled (compact state is shorter, topbar collapsed)
      // so the hero's resting gap below the navbar reflects the full-size height.
      const wasScrolled = header && header.classList.contains('is-scrolled');
      if (wasScrolled) {
        header.classList.remove('is-scrolled');
        headFixed.classList.remove('is-scrolled');
      }
      document.documentElement.style.setProperty('--header-height', `${headFixed.offsetHeight}px`);
      if (wasScrolled) {
        header.classList.add('is-scrolled');
        headFixed.classList.add('is-scrolled');
      }
    };
    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);
  }

  if (header) {
    const SCROLL_THRESHOLD = 24;
    const updateHeaderState = () => {
      const isScrolled = window.scrollY > SCROLL_THRESHOLD;
      header.classList.toggle('is-scrolled', isScrolled);
      headFixed?.classList.toggle('is-scrolled', isScrolled);
    };
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    updateHeaderState();
  }

  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  document.querySelectorAll('.dropdown-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.nav-dropdown');
      const isOpen = parent.classList.contains('open');

      document.querySelectorAll('.nav-dropdown.open').forEach((other) => {
        if (other !== parent) {
          other.classList.remove('open');
          other.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        }
      });

      parent.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.querySelectorAll('.phone-choice-toggle').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const parent = btn.closest('.phone-choice');
      const isOpen = parent.classList.contains('open');

      document.querySelectorAll('.phone-choice.open').forEach((other) => {
        if (other !== parent) {
          other.classList.remove('open');
          other.querySelector('.phone-choice-toggle').setAttribute('aria-expanded', 'false');
        }
      });

      parent.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.phone-choice')) {
      document.querySelectorAll('.phone-choice.open').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.phone-choice-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  const socialFab = document.querySelector('.social-fab');
  if (socialFab) {
    const fabToggle = socialFab.querySelector('.social-fab-toggle');
    fabToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = socialFab.classList.contains('open');
      socialFab.classList.toggle('open', !isOpen);
      fabToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (event) => {
      if (socialFab.classList.contains('open') && !event.target.closest('.social-fab')) {
        socialFab.classList.remove('open');
        fabToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && socialFab.classList.contains('open')) {
        socialFab.classList.remove('open');
        fabToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const dotsWrap = carousel.parentElement.querySelector('[data-carousel-dots]');
    const items = Array.from(track.children);
    if (!items.length) return;

    let dots = [];
    let pageStarts = [0];

    const itemStep = () => {
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || '0');
      return items[0].getBoundingClientRect().width + gap;
    };

    // One dot per screenful of cards, not one per card — the dots mark how
    // many times you'd actually need to scroll to see everything.
    const buildPageStarts = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const step = itemStep();
      const perView = Math.max(1, Math.round(track.clientWidth / step));
      const pageStep = step * perView;
      const starts = [0];
      let pos = pageStep;
      while (pos < maxScroll) {
        starts.push(pos);
        pos += pageStep;
      }
      if (maxScroll > 0) starts.push(maxScroll);
      return starts;
    };

    const closestPageIndex = (scrollLeft) => {
      let activeIndex = 0;
      let closestGap = Infinity;
      pageStarts.forEach((start, index) => {
        const gap = Math.abs(start - scrollLeft);
        if (gap < closestGap) {
          closestGap = gap;
          activeIndex = index;
        }
      });
      return activeIndex;
    };

    const renderDots = () => {
      pageStarts = buildPageStarts();
      dotsWrap.innerHTML = '';
      dots = pageStarts.map((start, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => {
          track.scrollTo({ left: start, behavior: 'smooth' });
        });
        dotsWrap.appendChild(dot);
        return dot;
      });
    };

    const updateState = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const scrollLeft = track.scrollLeft;

      if (prevBtn) prevBtn.disabled = scrollLeft <= 8;
      if (nextBtn) nextBtn.disabled = scrollLeft >= maxScroll - 8;

      const activeIndex = closestPageIndex(scrollLeft);
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
    };

    const goToPage = (delta) => {
      const activeIndex = closestPageIndex(track.scrollLeft);
      const targetIndex = Math.min(pageStarts.length - 1, Math.max(0, activeIndex + delta));
      track.scrollTo({ left: pageStarts[targetIndex], behavior: 'smooth' });
    };

    prevBtn?.addEventListener('click', () => goToPage(-1));
    nextBtn?.addEventListener('click', () => goToPage(1));

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateState();
        ticking = false;
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderDots();
        updateState();
      }, 150);
    });

    renderDots();
    updateState();
  });

  document.querySelectorAll('[data-hero-marquee]').forEach((marquee) => {
    const track = marquee.querySelector('[data-hero-marquee-track]');
    if (!track) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = 0.6; // px per frame — slow, smooth continuous scroll
    let isPaused = false;
    let resumeTimer = null;
    let rafId = null;

    // Content is duplicated once in the HTML, so half the scrollWidth is
    // exactly one full set — looping there is invisible since set two is identical.
    const setWidth = () => track.scrollWidth / 2;

    function wrap() {
      const width = setWidth();
      if (marquee.scrollLeft >= width) {
        marquee.scrollLeft -= width;
      } else if (marquee.scrollLeft < 0) {
        marquee.scrollLeft += width;
      }
    }

    function tick() {
      if (!isPaused) {
        marquee.scrollLeft += speed;
        wrap();
      }
      rafId = requestAnimationFrame(tick);
    }

    function pauseTemporarily() {
      isPaused = true;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => { isPaused = false; }, 1200);
    }

    marquee.addEventListener('wheel', pauseTemporarily, { passive: true });
    marquee.addEventListener('touchstart', pauseTemporarily, { passive: true });
    marquee.addEventListener('pointerdown', pauseTemporarily);
    marquee.addEventListener('scroll', wrap);

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }
  });

  const lightbox = document.getElementById('lightbox');
  const gallery = document.querySelector('[data-lightbox-gallery]');

  if (lightbox && gallery) {
    const items = Array.from(gallery.querySelectorAll('.felicitation-item'));
    const lightboxImage = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    let currentIndex = 0;

    function show(index) {
      currentIndex = (index + items.length) % items.length;
      const item = items[currentIndex];
      lightboxImage.src = item.getAttribute('href');
      lightboxImage.alt = item.querySelector('img').alt;
    }

    function open(index) {
      show(index);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    items.forEach((item, index) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        open(index);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(currentIndex - 1));
    nextBtn.addEventListener('click', () => show(currentIndex + 1));

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(currentIndex - 1);
      if (event.key === 'ArrowRight') show(currentIndex + 1);
    });
  }

  document.querySelectorAll('[data-youtube-embed]').forEach((frame) => {
    const playBtn = frame.querySelector('.play-btn');
    const videoId = frame.dataset.youtubeId;
    if (!playBtn || !videoId) return;

    playBtn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      frame.innerHTML = '';
      frame.appendChild(iframe);
    });
  });

  const categoryList = document.querySelector('[data-category-list]');
  const productGrid = document.querySelector('[data-product-grid]');

  if (categoryList && productGrid) {
    const links = Array.from(categoryList.querySelectorAll('.category-link'));
    const cards = Array.from(productGrid.querySelectorAll('.product-card'));
    const showingLabel = document.querySelector('[data-showing-label]');
    const emptyState = document.querySelector('[data-catalog-empty]');
    const dropdownLinks = Array.from(document.querySelectorAll('.dropdown-panel a'));

    function syncDropdownHighlight(activeCat) {
      dropdownLinks.forEach((link) => {
        const linkUrl = new URL(link.getAttribute('href'), window.location.href);
        const samePage = linkUrl.pathname.replace(/\.html$/, '') === window.location.pathname.replace(/\.html$/, '');
        link.classList.toggle('active', samePage && linkUrl.searchParams.get('cat') === activeCat);
      });
    }

    function applyCategory(cat, updateUrl) {
      const match = links.find((link) => link.dataset.cat === cat);
      const activeLink = match || links[0];
      const activeCat = activeLink.dataset.cat;

      links.forEach((link) => link.classList.toggle('is-active', link === activeLink));
      syncDropdownHighlight(activeCat);

      let visibleCount = 0;
      cards.forEach((card) => {
        const show = card.dataset.cat === activeCat;
        card.hidden = !show;
        if (show) visibleCount++;
      });

      if (showingLabel) {
        showingLabel.innerHTML = `Showing <strong>${activeLink.textContent.trim()}</strong>`;
      }
      if (emptyState) emptyState.hidden = visibleCount > 0;

      if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('cat', activeCat);
        window.history.replaceState(null, '', url);
      }
    }

    links.forEach((link) => {
      link.addEventListener('click', () => applyCategory(link.dataset.cat, true));
    });

    const initialCat = new URLSearchParams(window.location.search).get('cat') || '';
    applyCategory(initialCat, false);
  }
});
