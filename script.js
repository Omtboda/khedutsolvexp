/**
 * ============================================================================
 * Khedut Solvexp Pvt. Ltd. - Production JavaScript Engine
 * ============================================================================
 * Pure Vanilla JavaScript (Zero Framework Dependencies)
 * 
 * Features Implemented:
 *  1. Hero Slideshow Engine (Right-to-Left Horizontal Sliding, 4 Slides, Dots, ARIA)
 *  2. Scroll Animation Observer (IntersectionObserver reveal, stagger delays)
 *  3. Animated Counters (IntersectionObserver, requestAnimationFrame, integer)
 *  4. Sticky Navigation (.scrolled at scrollY > 80, throttled RAF listener)
 *  5. Mobile Navigation (Hamburger, overlay, body scroll lock, Escape key)
 *  6. Factory Visit Interactive Map (Calibrated SVG Hotspots, tooltip, universal buttons)
 *  7. Shared Lightbox Component (Touch Swipe, Keyboard, full resolution zoom)
 *  8. Dedicated Gallery Modal (Certifications & Awards with click-to-lightbox)
 *  9. Manufacturing Process Tabs & Panels (Accessible tablist, aria-controls)
 * 10. Company Turnover Bar & Decimal Animations (Bar width fill & 2-decimal values)
 * 11. Contact Form Handler (Validation, mailto URL generator, visual feedback)
 * 12. Back to Top Button (Visibility at scrollY > innerHeight, smooth scroll)
 * 13. Smooth Scroll for Anchor Links (70px header offset calculation)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // SHARED UTILITIES
  // ==========================================================================

  /**
   * Throttles scroll/resize callbacks to requestAnimationFrame (60fps performance).
   * @param {Function} callback - Function to execute on animation frame
   * @returns {Function} Throttled event handler
   */
  const throttleRAF = (callback) => {
    let ticking = false;
    return () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  };

  /**
   * Cubic ease-out deceleration curve for natural counter animations.
   * @param {number} t - Progress between 0 and 1
   * @returns {number} Eased progress value
   */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // ==========================================================================
  // 1. HERO SLIDESHOW ENGINE (Smooth Right-to-Left Sliding Transition)
  // ==========================================================================
  /**
   * Hero slideshow controller:
   * - Smooth horizontal slide animation moving right to left
   * - Cycles through 4 slides with 6000ms auto-advance
   * - Interactive pagination dots with aria-selected
   * - Automatic pause on mouse hover and keyboard focus
   * - Respects user's prefers-reduced-motion preference
   */
  const initHeroSlideshow = () => {
    const heroSection = document.querySelector('.hero');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');

    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    const AUTO_ADVANCE_DELAY = 6000;
    const TRANSITION_DURATION = 850;
    let slideshowInterval = null;
    let isTransitioning = false;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Transitions from current slide to target slide.
     * @param {number} targetIndex - Target slide index
     * @param {'next'|'prev'} direction - Slide direction
     */
    const goToSlide = (targetIndex, direction = 'next') => {
      if (isTransitioning && !prefersReducedMotion) return;
      if (targetIndex === currentSlide && slides[currentSlide].classList.contains('active')) return;

      const prevIndex = currentSlide;
      currentSlide = (targetIndex + totalSlides) % totalSlides;

      const prevSlideEl = slides[prevIndex];
      const nextSlideEl = slides[currentSlide];

      if (prefersReducedMotion) {
        slides.forEach((s, idx) => s.classList.toggle('active', idx === currentSlide));
      } else {
        isTransitioning = true;

        // Reset all classes from other slides
        slides.forEach((s, idx) => {
          if (idx !== prevIndex && idx !== currentSlide) {
            s.className = 'hero-slide';
          }
        });

        if (direction === 'next') {
          // New slide enters from right (100% -> 0), previous exits to left (0 -> -100%)
          nextSlideEl.className = 'hero-slide';
          // Force layout reflow so the browser registers initial position at 100%
          void nextSlideEl.offsetWidth;

          prevSlideEl.className = 'hero-slide active slide-out-left';
          nextSlideEl.className = 'hero-slide active';
        } else {
          // Previous button: new slide enters from left (-100% -> 0), previous exits to right (0 -> 100%)
          nextSlideEl.className = 'hero-slide slide-in-left';
          void nextSlideEl.offsetWidth;

          prevSlideEl.className = 'hero-slide active slide-out-right';
          nextSlideEl.className = 'hero-slide active';
        }

        setTimeout(() => {
          prevSlideEl.className = 'hero-slide';
          nextSlideEl.className = 'hero-slide active';
          isTransitioning = false;
        }, TRANSITION_DURATION);
      }

      // Update dots state and accessibility
      dots.forEach((dot, i) => {
        const isCurrent = i === currentSlide;
        dot.classList.toggle('active', isCurrent);
        dot.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
    };

    const nextSlide = () => {
      goToSlide((currentSlide + 1) % totalSlides, 'next');
    };

    const prevSlide = () => {
      goToSlide((currentSlide - 1 + totalSlides) % totalSlides, 'prev');
    };

    const startAutoAdvance = () => {
      if (slideshowInterval || totalSlides <= 1) return;
      slideshowInterval = setInterval(nextSlide, AUTO_ADVANCE_DELAY);
    };

    const pauseAutoAdvance = () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
      }
    };

    const resetAutoAdvance = () => {
      pauseAutoAdvance();
      startAutoAdvance();
    };

    // Pagination dots click handler
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(dot.dataset.slide, 10);
        if (!isNaN(targetIndex) && targetIndex !== currentSlide) {
          const dir = targetIndex > currentSlide ? 'next' : 'prev';
          goToSlide(targetIndex, dir);
          resetAutoAdvance();
        }
      });
    });

    // Pause on hover or focus
    if (heroSection) {
      heroSection.addEventListener('mouseenter', pauseAutoAdvance);
      heroSection.addEventListener('mouseleave', startAutoAdvance);
      heroSection.addEventListener('focusin', pauseAutoAdvance);
      heroSection.addEventListener('focusout', startAutoAdvance);
    }

    // Set initial active state
    slides.forEach((s, idx) => {
      s.className = idx === 0 ? 'hero-slide active' : 'hero-slide';
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === 0);
      dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    });

    startAutoAdvance();
  };

  // ==========================================================================
  // 2. SCROLL ANIMATION OBSERVER (IntersectionObserver)
  // ==========================================================================
  const initScrollAnimations = () => {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-up'
    );

    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            if (el.classList.contains('stagger-item')) {
              const parent = el.parentElement;
              if (parent) {
                const siblings = Array.from(parent.querySelectorAll('.stagger-item'));
                const index = siblings.indexOf(el);
                if (index >= 0) {
                  el.style.transitionDelay = `${index * 100}ms`;
                }
              }
            }

            el.classList.add('revealed');
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  };

  // ==========================================================================
  // 3. ANIMATED COUNTERS
  // ==========================================================================
  const initAnimatedCounters = () => {
    const statElements = document.querySelectorAll('.stat-number');
    if (!statElements.length) return;

    const animateCounter = (element) => {
      const target = parseInt(element.dataset.target, 10);
      if (isNaN(target)) return;

      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      const duration = 2000;
      let startTime = null;

      const updateFrame = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        const currentInt = Math.floor(eased * target);
        const formatted = target >= 1000 ? currentInt.toLocaleString('en-IN') : currentInt;
        element.textContent = `${prefix}${formatted}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(updateFrame);
        } else {
          const finalFormatted = target >= 1000 ? target.toLocaleString('en-IN') : target;
          element.textContent = `${prefix}${finalFormatted}${suffix}`;
        }
      };

      window.requestAnimationFrame(updateFrame);
    };

    if (!('IntersectionObserver' in window)) {
      statElements.forEach((el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const formatted = target >= 1000 ? target.toLocaleString('en-IN') : target;
        el.textContent = `${prefix}${formatted}${suffix}`;
      });
      return;
    }

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statElements.forEach((el) => counterObserver.observe(el));
  };

  // ==========================================================================
  // 4, 12 & 13. STICKY NAV, ACTIVE HIGHLIGHTING & BACK TO TOP
  // ==========================================================================
  const initScrollController = () => {
    const siteHeader = document.querySelector('.site-header');
    const backToTopBtn = document.getElementById('back-to-top');
    const navLinks = Array.from(document.querySelectorAll('.site-header .nav-link, #main-nav .nav-link'));

    // Cache target sections in sequence
    const sectionEntries = [];
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        try {
          const targetSection = document.querySelector(href);
          if (targetSection) {
            sectionEntries.push({ link, section: targetSection, id: href });
          }
        } catch (e) {
          // ignore
        }
      }
    });

    const HEADER_OFFSET = 90;

    const handleScrollUpdates = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Sticky Header
      if (siteHeader) {
        if (scrollY > 80) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
      }

      // Back to Top Button
      if (backToTopBtn) {
        if (scrollY > windowHeight) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }

      // Active Section Highlighting
      if (sectionEntries.length > 0) {
        if (scrollY + windowHeight >= docHeight - 50) {
          sectionEntries.forEach((entry, idx) => {
            entry.link.classList.toggle('active', idx === sectionEntries.length - 1);
          });
          return;
        }

        let activeTarget = null;
        for (let i = 0; i < sectionEntries.length; i++) {
          const entry = sectionEntries[i];
          const top = entry.section.offsetTop - HEADER_OFFSET;
          const height = entry.section.offsetHeight;

          if (scrollY >= top && scrollY < top + height) {
            activeTarget = entry;
            break;
          }
        }

        if (!activeTarget && scrollY < sectionEntries[0].section.offsetTop - HEADER_OFFSET) {
          activeTarget = sectionEntries[0];
        }

        if (activeTarget) {
          sectionEntries.forEach((entry) => {
            entry.link.classList.toggle('active', entry.link === activeTarget.link);
          });
        }
      }
    };

    handleScrollUpdates();
    window.addEventListener('scroll', throttleRAF(handleScrollUpdates), { passive: true });

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  };

  // ==========================================================================
  // 5. MOBILE NAVIGATION
  // ==========================================================================
  const initMobileNavigation = () => {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const overlay = document.getElementById('mobile-nav-overlay');

    if (!hamburger || !mainNav) return;

    const setMobileMenuState = (isOpen) => {
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mainNav.classList.toggle('open', isOpen);

      if (overlay) {
        overlay.classList.toggle('active', isOpen);
      }

      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    const closeMobileMenu = () => setMobileMenuState(false);
    const toggleMobileMenu = () => {
      const isCurrentlyOpen = hamburger.classList.contains('open');
      setMobileMenuState(!isCurrentlyOpen);
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    if (overlay) {
      overlay.addEventListener('click', closeMobileMenu);
    }

    const links = mainNav.querySelectorAll('.nav-link, a');
    links.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  };

  // ==========================================================================
  // 6 & 7. FACTORY VISIT INTERACTIVE MAP & SHARED LIGHTBOX
  // ==========================================================================

  const factoryGalleries = {
    'refinery': {
      title: 'Refinery',
      images: [
        { src: 'factory/Refinery/_IF00368.jpg', alt: 'Refinery equipment and separators' },
        { src: 'factory/Refinery/_IF00392.jpg', alt: 'Refinery processing infrastructure' },
        { src: 'factory/Refinery/_IF00421.jpg', alt: 'Refinery interior piping view' },
        { src: 'factory/Refinery/_IF00442.jpg', alt: 'Refinery operational systems' },
        { src: 'factory/Refinery/_IF00554.jpg', alt: 'Refinery distillation area' }
      ]
    },
    'solvent-plant': {
      title: 'Solvent Plant',
      images: [
        { src: 'factory/solvent plant/_IF00595.jpg', alt: 'Solvent extraction control valves' },
        { src: 'factory/solvent plant/_IF00599.jpg', alt: 'Solvent plant extraction towers' },
        { src: 'factory/solvent plant/_IF00608.jpg', alt: 'Solvent plant distillation equipment' },
        { src: 'factory/solvent plant/_IF00652.jpg', alt: 'Solvent plant pumps and piping' },
        { src: 'factory/solvent plant/_IF00679.jpg', alt: 'Solvent extraction facility' }
      ]
    },
    'oil-cake-storage': {
      title: 'Oil Cake Storage',
      images: [
        { src: 'factory/OIL CAKE STORAGE/_IF01044.jpg', alt: 'Oil cake storage and dispatch warehouse' }
      ]
    },
    'oil-mill': {
      title: 'Oil Mill',
      images: [
        { src: 'factory/oil mill/_IF00891.jpg', alt: 'Oil mill mechanical seed expellers' },
        { src: 'factory/oil mill/_IF00931.jpg', alt: 'Oil mill pressing operations' },
        { src: 'factory/oil mill/_IF00985.jpg', alt: 'Oil mill heavy machinery hall' },
        { src: 'factory/oil mill/_IF01095.jpg', alt: 'Oil mill expeller drive system' },
        { src: 'factory/oil mill/_IF01130.jpg', alt: 'Oil mill raw material intake' }
      ]
    },
    'doc-storage': {
      title: 'D.O.C. Storage',
      images: [
        { src: 'factory/D.O.C STORAGE/_IF00754.jpg', alt: 'De-oiled cake (DOC) meal bulk storage facility' }
      ]
    }
  };

  let lightboxInstance = null;

  const initLightboxComponent = () => {
    const lightboxEl = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightboxEl ? lightboxEl.querySelector('.lightbox-close') : null;
    const prevBtn = lightboxEl ? lightboxEl.querySelector('.lightbox-prev') : null;
    const nextBtn = lightboxEl ? lightboxEl.querySelector('.lightbox-next') : null;
    const counterEl = document.getElementById('lightbox-counter');
    const overlayEl = lightboxEl ? lightboxEl.querySelector('.lightbox-overlay') : null;

    if (!lightboxEl || !lightboxImg) return;

    let currentImages = [];
    let currentIndex = 0;

    const updateDisplay = () => {
      if (!currentImages.length) return;

      const currentItem = currentImages[currentIndex];
      lightboxImg.src = currentItem.src || '';
      lightboxImg.alt = currentItem.alt || '';

      if (counterEl) {
        counterEl.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      }

      const hasMultiple = currentImages.length > 1;
      if (prevBtn) prevBtn.style.display = hasMultiple ? '' : 'none';
      if (nextBtn) nextBtn.style.display = hasMultiple ? '' : 'none';
      if (counterEl) counterEl.style.display = hasMultiple ? '' : 'none';
    };

    const openLightbox = (images, startIndex = 0) => {
      if (!images || !images.length) return;

      currentImages = images;
      currentIndex = Math.max(0, Math.min(startIndex, images.length - 1));

      updateDisplay();

      lightboxEl.removeAttribute('hidden');
      lightboxEl.hidden = false;
      lightboxEl.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightboxEl.setAttribute('hidden', '');
      lightboxEl.hidden = true;
      lightboxEl.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
      lightboxImg.alt = '';
      currentImages = [];
      currentIndex = 0;
    };

    const nextImage = () => {
      if (currentImages.length <= 1) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateDisplay();
    };

    const prevImage = () => {
      if (currentImages.length <= 1) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateDisplay();
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeLightbox();
      });
    }

    if (overlayEl) {
      overlayEl.addEventListener('click', (e) => {
        e.preventDefault();
        closeLightbox();
      });
    }

    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl) {
        closeLightbox();
      }
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextImage();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (lightboxEl.hasAttribute('hidden') || lightboxEl.hidden) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    });

    // Touch swipe navigation for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    lightboxEl.addEventListener(
      'touchstart',
      (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }
      },
      { passive: true }
    );

    lightboxEl.addEventListener(
      'touchend',
      (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchEndX = e.changedTouches[0].screenX;
          touchEndY = e.changedTouches[0].screenY;

          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;

          if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
              nextImage();
            } else {
              prevImage();
            }
          }
        }
      },
      { passive: true }
    );

    lightboxInstance = { openLightbox, closeLightbox, nextImage, prevImage };
  };

  /**
   * Connects Factory Hotspots and universal buttons to open Lightbox.
   * Handles interactive floating tooltip over the SVG map.
   */
  const initFactoryMap = () => {
    const mapContainer = document.getElementById('factory-map');
    const tooltip = document.getElementById('factory-tooltip');
    const hotspots = document.querySelectorAll('.factory-hotspot');
    const buttons = document.querySelectorAll('.factory-compartment-btn');

    const compartmentTitles = {
      'refinery': 'Refinery — 5 Photographs',
      'solvent-plant': 'Solvent Plant — 5 Photographs',
      'oil-cake-storage': 'Oil Cake Storage — 1 Photograph',
      'oil-mill': 'Oil Mill — 5 Photographs',
      'doc-storage': 'D.O.C. Storage — 1 Photograph'
    };

    // Tooltip tracking on SVG hotspots
    if (mapContainer && tooltip) {
      hotspots.forEach((spot) => {
        spot.addEventListener('mouseenter', (e) => {
          const comp = spot.dataset.compartment;
          tooltip.textContent = compartmentTitles[comp] || 'Click to view photos';
          tooltip.classList.add('visible');
        });

        spot.addEventListener('mousemove', (e) => {
          const rect = mapContainer.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y}px`;
        });

        spot.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      });
    }

    // Click handler for hotspots & buttons
    const handleCompartmentSelection = (compartmentKey) => {
      if (compartmentKey && factoryGalleries[compartmentKey] && lightboxInstance) {
        lightboxInstance.openLightbox(factoryGalleries[compartmentKey].images, 0);
      }
    };

    hotspots.forEach((spot) => {
      spot.addEventListener('click', (e) => {
        e.preventDefault();
        handleCompartmentSelection(spot.dataset.compartment);
      });

      spot.setAttribute('tabindex', '0');
      spot.setAttribute('role', 'button');
      spot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCompartmentSelection(spot.dataset.compartment);
        }
      });
    });

    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCompartmentSelection(btn.dataset.compartment);
      });
    });
  };

  // ==========================================================================
  // 8. DEDICATED GALLERY MODAL (Certifications & Awards)
  // ==========================================================================
  /**
   * Dedicated modal gallery controller:
   * - "View All Certifications" button displays all 9 certificates in clean grid
   * - "View All Awards" button displays all 11 awards in clean grid
   * - Clicking any image card in the modal launches full-resolution Lightbox
   * - Full keyboard accessibility (Escape closes modal)
   */
  const initGalleryModal = () => {
    const modalEl = document.getElementById('gallery-modal');
    const modalOverlay = document.getElementById('gallery-modal-overlay');
    const modalClose = document.getElementById('gallery-modal-close');
    const modalTitle = document.getElementById('gallery-modal-title');
    const modalSubtitle = document.getElementById('gallery-modal-subtitle');
    const modalGrid = document.getElementById('gallery-modal-grid');

    const btnCert = document.getElementById('btn-view-certifications');
    const btnAwards = document.getElementById('btn-view-awards');

    if (!modalEl || !modalGrid) return;

    // 9 Full Certification Images
    const certificationData = [
      { src: 'certifications/IMG_6845.png', title: 'Pollution Control Board Clearance', subtitle: 'GPCB Certified Environmental Standard' },
      { src: 'certifications/IMG_6846.png', title: 'Industrial Compliance Certificate', subtitle: 'Processing Safety & Emissions Protocol' },
      { src: 'certifications/IMG_6847.png', title: 'Factory Operations Authorization', subtitle: 'Statutory Safety & Boiler Approval' },
      { src: 'certifications/IMG_6848.png', title: 'Food Safety Audit Clearance', subtitle: 'Sanitation & Hygiene Verification' },
      { src: 'certifications/IMG_6849.png', title: 'Refinery Process Certification', subtitle: 'Edible Oil Refining Process Standard' },
      { src: 'certifications/IMG_6850.png', title: 'Quality System Assessment', subtitle: 'Batch Traceability & Verification' },
      { src: 'certifications/IMG_6851.png', title: 'Laboratory Quality Verification', subtitle: 'Internal Analytical Testing Approval' },
      { src: 'certifications/IMG_6852.png', title: 'Export Quality & Packaging Approval', subtitle: 'Transit Packaging Compliance' },
      { src: 'certifications/IMG_6853.png', title: 'ISO 22000:2018 Certification', subtitle: 'Food Safety Management Systems Standard' }
    ];

    // 11 Full Award Plaques
    const awardData = [
      { src: 'awards/IMG_6854.png', title: 'SEA Award 2013–2014', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6855.png', title: 'SEA Award 2014–2015', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6856.png', title: 'SEA Award 2015–2016', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6857.png', title: 'SEA Award 2016–2017', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6858.png', title: 'SEA Award 2017–2018', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6859.png', title: 'SEA Award 2018–2019', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6860.png', title: 'SEA Award 2019–2020', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6861.png', title: 'SEA Award 2020–2021', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6862.png', title: 'SEA Award 2021–2022', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6863.png', title: 'SEA Award 2022–2023', subtitle: 'Highest Processor of Groundnut Oilcake' },
      { src: 'awards/IMG_6864.png', title: 'SEA Award 2023–2024', subtitle: 'Highest Processor of Groundnut Oilcake' }
    ];

    let currentModalItems = [];

    const openModal = (type) => {
      const isCert = type === 'certifications';
      currentModalItems = isCert ? certificationData : awardData;

      modalTitle.textContent = isCert ? 'Quality Certifications (9 Documents)' : 'Awards & Recognition (11 Honors)';
      modalSubtitle.textContent = isCert
        ? 'Official statutory clearances, food-safety compliance certificates, and ISO accreditations'
        : 'The Solvent Extractors\' Association of India (SEA) Awards — 2013-14 through 2023-24';

      // Render cards
      modalGrid.innerHTML = '';
      currentModalItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'gallery-modal-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Enlarge ${item.title}`);

        card.innerHTML = `
          <div class="gallery-modal-card-img-wrap">
            <img src="${item.src}" alt="${item.title}" loading="lazy">
          </div>
          <div class="gallery-modal-card-caption">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem; color: var(--warm-ivory);">${item.title}</div>
              <div style="font-size: 0.8rem; color: var(--warm-sand); opacity: 0.85; margin-top: 2px;">${item.subtitle}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6m0-6L10 14m-1 7H4a1 1 0 01-1-1V5a1 1 0 011-1h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        `;

        const openInLightbox = () => {
          if (lightboxInstance) {
            lightboxInstance.openLightbox(
              currentModalItems.map((c) => ({ src: c.src, alt: c.title })),
              index
            );
          }
        };

        card.addEventListener('click', openInLightbox);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openInLightbox();
          }
        });

        modalGrid.appendChild(card);
      });

      modalEl.removeAttribute('hidden');
      modalEl.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modalEl.setAttribute('hidden', '');
      modalEl.hidden = true;
      document.body.style.overflow = '';
      modalGrid.innerHTML = '';
    };

    if (btnCert) {
      btnCert.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('certifications');
      });
    }

    if (btnAwards) {
      btnAwards.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('awards');
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (e) => {
      if (!modalEl.hasAttribute('hidden') && !modalEl.hidden) {
        if (e.key === 'Escape') {
          // If lightbox is not open on top, close the modal
          const lightboxEl = document.getElementById('lightbox');
          if (!lightboxEl || lightboxEl.hasAttribute('hidden') || lightboxEl.hidden) {
            closeModal();
          }
        }
      }
    });
  };

  // ==========================================================================
  // 9. PROCESS TABS
  // ==========================================================================
  const initProcessTabs = () => {
    const tabs = document.querySelectorAll('.process-tab');
    const panels = document.querySelectorAll('.process-panel');

    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPanelId = tab.getAttribute('aria-controls');

        tabs.forEach((t) => {
          const isSelected = t === tab;
          t.classList.toggle('active', isSelected);
          t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });

        panels.forEach((panel) => {
          const isCurrent = panel.id === targetPanelId;
          panel.classList.toggle('active', isCurrent);
        });
      });
    });
  };

  // ==========================================================================
  // 10. TURNOVER BAR & DECIMAL VALUE ANIMATIONS
  // ==========================================================================
  const initTurnoverAnimations = () => {
    const barFills = document.querySelectorAll('.turnover-bar-fill');
    const turnoverValues = document.querySelectorAll('.turnover-value');

    if (!barFills.length && !turnoverValues.length) return;

    const animateDecimalCounter = (element) => {
      const target = parseFloat(element.dataset.target);
      if (isNaN(target)) return;

      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      const duration = 2000;
      let startTime = null;

      const updateFrame = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        const currentVal = eased * target;
        const formatted = currentVal.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        element.textContent = `${prefix}${formatted}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(updateFrame);
        } else {
          const finalFormatted = target.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
          element.textContent = `${prefix}${finalFormatted}${suffix}`;
        }
      };

      window.requestAnimationFrame(updateFrame);
    };

    if (!('IntersectionObserver' in window)) {
      barFills.forEach((bar) => {
        bar.style.width = `${bar.dataset.width || 0}%`;
      });
      turnoverValues.forEach((val) => {
        const target = parseFloat(val.dataset.target) || 0;
        const prefix = val.dataset.prefix || '';
        const suffix = val.dataset.suffix || '';
        val.textContent = `${prefix}${target.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}${suffix}`;
      });
      return;
    }

    const barObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const targetWidth = bar.dataset.width || bar.getAttribute('data-width');
            bar.style.width = targetWidth ? `${targetWidth}%` : '0%';
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.2 }
    );

    barFills.forEach((bar) => barObserver.observe(bar));

    const valueObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateDecimalCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    turnoverValues.forEach((val) => valueObserver.observe(val));
  };

  // ==========================================================================
  // 11. CONTACT FORM HANDLING
  // ==========================================================================
  const initContactForm = () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = contactForm.querySelector('.form-submit, button[type="submit"]');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const inputsToWatch = [nameInput, emailInput, phoneInput, subjectInput, messageInput];
    inputsToWatch.forEach((field) => {
      if (field) {
        field.addEventListener('input', () => {
          field.classList.remove('error');
        });
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      let firstInvalidField = null;

      const validateRequired = (field) => {
        if (!field) return true;
        const val = field.value.trim();
        if (!val) {
          field.classList.add('error');
          if (!firstInvalidField) firstInvalidField = field;
          return false;
        }
        field.classList.remove('error');
        return true;
      };

      if (!validateRequired(nameInput)) isValid = false;

      if (!validateRequired(emailInput)) {
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('error');
        if (!firstInvalidField) firstInvalidField = emailInput;
        isValid = false;
      }

      if (!validateRequired(subjectInput)) isValid = false;
      if (!validateRequired(messageInput)) isValid = false;

      if (!isValid) {
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      const emailSubject = `[Website Inquiry] ${subject}`;
      const emailBody = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        '',
        'Message:',
        message
      ].join('\n');

      const mailtoUrl = `mailto:khedutsolvexp@gmail.com?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`;

      window.open(mailtoUrl, '_blank');

      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Opening Email Client...';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = 'Message Sent!';
          contactForm.reset();

          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 2000);
        }, 1200);
      } else {
        contactForm.reset();
      }
    });
  };

  // ==========================================================================
  // 12. SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================================================
  const initSmoothScroll = () => {
    const HEADER_OFFSET = 75;
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        if (!href || href === '#') {
          if (href === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }

        if (!href.startsWith('#') || href.length === 1) return;

        try {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            e.preventDefault();

            const elementPosition = targetElement.getBoundingClientRect().top;
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            const targetPosition = elementPosition + currentScroll - HEADER_OFFSET;

            window.scrollTo({
              top: Math.max(0, targetPosition),
              behavior: 'smooth'
            });

            if (window.history && window.history.pushState) {
              window.history.pushState(null, '', href);
            }
          }
        } catch (err) {
          // ignore
        }
      });
    });
  };

  // ==========================================================================
  // BOOTSTRAP ALL MODULES
  // ==========================================================================
  initHeroSlideshow();
  initScrollAnimations();
  initAnimatedCounters();
  initScrollController();
  initMobileNavigation();
  initLightboxComponent();
  initFactoryMap();
  initGalleryModal();
  initProcessTabs();
  initTurnoverAnimations();
  initContactForm();
  initSmoothScroll();
});
