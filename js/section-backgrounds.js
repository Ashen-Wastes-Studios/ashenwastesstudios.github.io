// SECTION-BASED BACKGROUND IMAGES
// Changes background image as user scrolls through different sections
// Each section can have its own background image via data-bg-image attribute

(function() {
  'use strict';

  // Check if we should activate this system
  const useSectionBgs = document.body.dataset.sectionBgs === 'true';
  if (!useSectionBgs) return;

  // Background image mapping by section id and mission elements
  const sectionImages = {
    // World-building / lore sections
    'ark-before-storm': 'img/ark-corporate-boardroom.jpg',
    'humanitarian-lie': 'img/ark-corporate-boardroom.jpg',
    'the-origin': 'img/kuiper-belt-discovery.jpg',
    'lazarus-initiative': 'img/lazarus-training-facility.jpg',
    'the-coup': 'img/coup-boardroom-chaos.jpg',
    'biochip': 'img/voss-statue-crystal.jpg',
    'prelude': 'img/player-alone-room.jpg',
    
    // Campaign sections
    'campaign': 'img/cyberpunk-urban-warfare.jpg',
    'side-missions': 'img/underground-music-venue.jpg',
    'campaign-part2': 'img/apocalyptic-wasteland.jpg',
    'the-return': 'img/cosmic-warp-journey.jpg',
    
    // Side story / epilogue
    'song-from-beyond': 'img/underground-warlord-territory.jpg',
    'epilogue': 'img/ai-mindscape.jpg',
    'before-beginning': 'img/kethvar-primordial-void.jpg',
    
    // Fallback sections use dark gradient
    'the-world-2': null,
    'locations': null,
    'factions': null,
    'daily-life': null,
    'core-themes': null,
    'the-world-later': null,
    'clusterfuck': null,
    'reconstruction': null,
    'elevator-drop': null,
    'second-elevator': null,
    'elemental-corruption': null,
    'elemental-warp': null,
    'after-warp': null,
    'gameplay': null,
    'tagline': null,
    'tagline-final': null
  };
  
  // Mission-specific background images (checked first)
  const missionImages = {
    'mission-section': 'img/cynchure-core-people.jpg'
  };

  // Current and target background
  let currentImage = null;
  let targetImage = null;
  let transitionTimer = null;

  // Image preload cache
  const imageCache = new Map();

  function preloadImage(src) {
    if (!src || imageCache.has(src)) return;
    const img = new Image();
    img.onload = () => imageCache.set(src, img);
    img.src = src;
  }

  // Preload all section images
  Object.values(sectionImages).forEach(src => {
    if (src) preloadImage(src);
  });

  // Get the section image for a given section id
  function getSectionImage(sectionId) {
    return missionImages[sectionId] || sectionImages[sectionId] || null;
  }

  // Get currently visible section (checks mission-level elements first)
  function getVisibleSection() {
    const sections = document.querySelectorAll('section[id], [id], .mission-section');
    const viewportCenter = window.innerHeight / 2;
    let closestSection = null;
    let closestDistance = Infinity;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      // Check for mission-section class first
      if (section.classList.contains('mission-section')) {
        const sectionId = 'mission-section';
        if (rect.top < viewportCenter && rect.bottom > viewportCenter * 0.3) {
          const distance = Math.abs(rect.top - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = sectionId;
          }
        }
        return;
      }
      const sectionId = section.id;
      
      // Skip sections without id or without background mapping
      if (!sectionId || !getSectionImage(sectionId)) return;
      
      // Check if section is visible (partially in viewport)
      if (rect.top < viewportCenter && rect.bottom > viewportCenter * 0.3) {
        const distance = Math.abs(rect.top - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = sectionId;
        }
      }
    });

    return closestSection;
  }

  // Apply background image to the page
  function applyBackground(imageSrc) {
    const bgContainer = document.getElementById('section-bg-container');
    if (!bgContainer) return;

    if (imageSrc === currentImage) return;

    // Fade out current
    bgContainer.style.opacity = '0';
    bgContainer.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
      if (imageSrc) {
        bgContainer.style.backgroundImage = `url('${imageSrc}')`;
        bgContainer.style.backgroundSize = 'cover';
        bgContainer.style.backgroundPosition = 'center';
        bgContainer.style.backgroundRepeat = 'no-repeat';
        bgContainer.style.opacity = '0.6';
      } else {
        bgContainer.style.backgroundImage = 'none';
        bgContainer.style.background = 'linear-gradient(180deg, rgba(3,3,8,0.8) 0%, rgba(8,4,4,0.6) 50%, rgba(3,3,8,0.8) 100%)';
        bgContainer.style.opacity = '1';
      }
      currentImage = imageSrc;
    }, 300);
  }

  // Handle scroll
  function handleScroll() {
    const visibleSection = getVisibleSection();
    const newImage = visibleSection ? getSectionImage(visibleSection) : null;

    if (newImage !== targetImage) {
      targetImage = newImage;
      applyBackground(targetImage);
    }
  }

  // Initialize
  function init() {
    // Create background container if it doesn't exist
    let bgContainer = document.getElementById('section-bg-container');
    if (!bgContainer) {
      bgContainer = document.createElement('div');
      bgContainer.id = 'section-bg-container';
      bgContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.3s ease;
      `;
      document.body.prepend(bgContainer);
    }

    // Set initial background
    const initialSection = getVisibleSection();
    const initialImage = initialSection ? getSectionImage(initialSection) : null;
    applyBackground(initialImage);

    // Listen for scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 50);
    }, { passive: true });

    // Also check on resize
    window.addEventListener('resize', handleScroll);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
