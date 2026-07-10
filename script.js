document.addEventListener('DOMContentLoaded', () => {
  
  // --- Intro Animation Sequence ---
  const introOverlay = document.getElementById('intro-overlay');
  
  // Timings for the intro sequence (in milliseconds)
  const TIMINGS = {
    bloomStart: 100,      // Start flower blooming (scaling/rotating)
    logoFadeIn: 3600,     // Fade in the Blesc black logo (increased from 2400)
    logoFadeOut: 4800,    // Fade out the Blesc black logo (reduced from 4400)
    overlayFadeOut: 5600, // Fade out the entire overlay
    sequenceComplete: 6400 // Remove overlay and unlock scroll
  };

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

  // Start observing once the intro overlay is faded out
  setTimeout(() => {
    revealElements.forEach(el => {
      observer.observe(el);
    });
  }, TIMINGS.sequenceComplete);

});
