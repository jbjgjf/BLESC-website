document.addEventListener('DOMContentLoaded', () => {
  
  // --- Intro Animation Sequence ---
  const introOverlay = document.getElementById('intro-overlay');
  
  // Timings for the intro sequence (in milliseconds)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('blesc-intro-seen') === '1'; } catch (e) {}
  const skipIntro = prefersReducedMotion || introSeen;

  // Remember the intro has played so repeat visits go straight to content
  try { sessionStorage.setItem('blesc-intro-seen', '1'); } catch (e) {}

  const TIMINGS = skipIntro ? {
    bloomStart: 0,
    logoFadeIn: 0,
    logoFadeOut: 0,
    overlayFadeOut: 0,
    sequenceComplete: 50
  } : {
    bloomStart: 50,        // Start flower blooming
    logoFadeIn: 1050,      // Reveal the blesc wordmark once the curtain is white
    logoFadeOut: 1550,     // Fade the wordmark out
    overlayFadeOut: 1800,  // Fade the whole overlay away
    sequenceComplete: 2050 // Remove overlay and unlock scroll
  };

  // On skip, hide the overlay instantly instead of running the fade sequence
  if (skipIntro) {
    introOverlay.style.display = 'none';
    document.body.classList.remove('is-locked');
  }

  // Step 1: Start flower bloom
  setTimeout(() => {
    introOverlay.classList.add('anim-bloom');
  }, TIMINGS.bloomStart);

  // Step 2: Reveal the Blesc wordmark logo on white
  setTimeout(() => {
    introOverlay.classList.add('anim-logo');
  }, TIMINGS.logoFadeIn);

  // Step 3: Fade out the wordmark logo
  setTimeout(() => {
    introOverlay.classList.add('anim-logo-fade');
  }, TIMINGS.logoFadeOut);

  // Step 4: Fade out the entire intro overlay
  setTimeout(() => {
    introOverlay.classList.add('anim-fade-out');
  }, TIMINGS.overlayFadeOut);

  // Step 5: Sequence complete (unlock scroll & cleanup overlay)
  setTimeout(() => {
    document.body.classList.remove('is-locked');
    introOverlay.style.display = 'none';
  }, TIMINGS.sequenceComplete);

  // --- Scroll-reactive Header ---
  const header = document.querySelector('header');
  const updateHeaderState = () => {
    header.classList.toggle('header-scrolled', window.scrollY > 8);
  };
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  // --- Mobile Navigation Overlay Menu ---
  const menuTrigger = document.querySelector('.menu-trigger');
  const menuClose = document.querySelector('.menu-close');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.nav-mobile a');

  const openMobileMenu = () => {
    mobileOverlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileOverlay.classList.remove('is-active');
    // Restore scroll state depending on whether the intro is running
    if (!introOverlay.classList.contains('anim-fade-out')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  menuTrigger.addEventListener('click', openMobileMenu);
  menuClose.addEventListener('click', closeMobileMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --- Scroll Reveal Animations ---
  // Create styles for scroll reveal dynamically to keep CSS files clean
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 1.0s var(--ease-expo-out), transform 1.0s var(--ease-expo-out);
    }
    .reveal.active {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Select elements to reveal on scroll
  const revealElements = [
    ...document.querySelectorAll('section > .section-container > *'),
    ...document.querySelectorAll('.stat-item'),
    ...document.querySelectorAll('.limit-item'),
    ...document.querySelectorAll('.benefit-item'),
    ...document.querySelectorAll('.team-member'),
    document.querySelector('.hero-title'),
    document.querySelector('.hero-subtitle'),
    document.querySelector('.hero-ctas')
  ];

  // Initialize elements with reveal class
  revealElements.forEach(el => {
    // Avoid double adding if already present
    if (el.tagName !== 'STYLE' && !el.classList.contains('hero-flower-wrapper')) {
      el.classList.add('reveal');
    }
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, observerOptions);

  // --- Stat Count-Up Animation ---
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const format = (n) => prefix + n.toLocaleString('en-US') + suffix;

    if (prefersReducedMotion || isNaN(target)) {
      el.textContent = format(isNaN(target) ? 0 : target);
      return;
    }

    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  const countElements = document.querySelectorAll('.count-up');

  // Start observing once the intro overlay is faded out
  setTimeout(() => {
    revealElements.forEach(el => {
      observer.observe(el);
    });
    countElements.forEach(el => {
      countObserver.observe(el);
    });
  }, TIMINGS.sequenceComplete);

});
