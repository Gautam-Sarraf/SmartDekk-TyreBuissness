const testimonials = [
    {
        name: "Cameron Williamson",
        quote: "Fantastic service! The team at Smart Dekk AS helped me find the perfect tires for my car. Quick installation and friendly staff - highly recommend!",
        rating: 5,
        image: "assets/guy-1.jpg"
    },
    {
        name: "Guy Hawkins",
        quote: "Incredible quality and value for money. The product exceeded my expectations, and the delivery was prompt. Everything was perfect!",
        rating: 4,
        image: "assets/guy-2.jpg"
    },
    {
        name: "Marvin McKinney",
        quote: "A truly seamless experience from start to finish. Their attention to detail and customer care is unmatched. I will definitely be a returning customer and highly recommend their services.",
        rating: 5,
        image: "assets/guy-3.jpg"
    }
];

let currentIndex = 0;

/**
 * Renders a rating icon string (stars).
 * @param {number} rating - The rating value (1-5).
 * @returns {string} HTML string for the stars.
 */
function renderRating(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += `<span style="display: inline-block;">${i < rating ? '★' : '☆'}</span>`;
    }
    return `<div class="testi-rating">${stars}</div>`;
}

/**
 * Gets the testimonial object for a given index, handling wrapping.
 * @param {number} index - The desired index.
 * @returns {object} The testimonial data.
 */
function getTestimonial(index) {
    const len = testimonials.length;
    // The modulo operator handles wrapping around
    const wrappedIndex = (index % len + len) % len;
    return testimonials[wrappedIndex];
}

/**
 * Renders the active (large) testimonial card with the full-height image layout.
 * @param {object} testimonial - The data for the active testimonial.
 */
function renderActiveCard(testimonial) {
    const activeItem = document.getElementById('active-item');
    activeItem.innerHTML = `
        <!-- Left Column: Full Height Image -->
        <div class="testi-image-col" style="background-image: url('${testimonial.image}')">
            <div class="testi-name-overlay">
                ${testimonial.name}
            </div>
        </div>
        <!-- Right Column: Quote and Details -->
        <div class="testi-quote-col">
            <div class="testi-quote-icon"></div>
            <p class="testi-quote-text">${testimonial.quote}</p>
            <div class="testi-user-name">${testimonial.name}</div>
            ${renderRating(testimonial.rating)}
        </div>
    `;
}

/**
 * Renders a side (small) testimonial card.
 * @param {string} elementId - 'prev-item' or 'next-item'.
 * @param {object} testimonial - The data for the side testimonial.
 */
function renderSideCard(elementId, testimonial) {
    const sideItem = document.getElementById(elementId);
    // Ensure the placeholder card structure is used for the side items
    sideItem.querySelector('.testi-user-image-overlay').style.backgroundImage = `url('${testimonial.image}')`;
    sideItem.querySelector('.testi-name-placeholder').textContent = testimonial.name;
}

/**
 * Updates all three visible testimonial slots (prev, active, next).
 */
function updateCarousel() {
    const prevData = getTestimonial(currentIndex - 1);
    const activeData = getTestimonial(currentIndex);
    const nextData = getTestimonial(currentIndex + 1);

    renderActiveCard(activeData);
    renderSideCard('prev-item', prevData);
    renderSideCard('next-item', nextData);
}

/**
 * Navigates to the next testimonial.
 */
function nextTestimonial() {
    currentIndex++;
    updateCarousel();
}

/**
 * Navigates to the previous testimonial.
 */
function prevTestimonial() {
    currentIndex--;
    updateCarousel();
}

// Initialize the carousel on page load
window.onload = updateCarousel;

// ------------------------------
// Trustee Logos: Seamless JS Marquee
// ------------------------------
function initTrusteeMarquee() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // Respect reduced motion
  }

  const container = document.querySelector('.carousel-container');
  const track = container?.querySelector('.logo-track');
  let slides = track?.querySelectorAll('.logo-slide');
  if (!container || !track || !slides || slides.length === 0) return;

  // Enable JS mode to disable CSS keyframe animation
  container.classList.add('js-marquee');

  let slideWidth = 0; // width of a single set
  let x = 0;          // current translateX
  let lastTs = 0;     // last timestamp for rAF
  let paused = false;
  const pxPerSec = 40; // scroll speed; adjust if needed

  function measure() {
    // Use the first slide's full width; ensure it's fully rendered
    const first = slides[0];
    slideWidth = first ? first.getBoundingClientRect().width : 0;
  }

  function trackWidthPx() {
    return track.getBoundingClientRect().width;
  }

  function ensureFilled() {
    const containerW = container.getBoundingClientRect().width;
    // Make sure we have at least container + one slide worth of content to cover wrap points
    // This avoids blank space on ultra-wide viewports
    let safety = 0;
    while (trackWidthPx() < containerW + slideWidth && safety < 20) {
      const clone = slides[0].cloneNode(true);
      track.appendChild(clone);
      slides = track.querySelectorAll('.logo-slide');
      safety++;
    }
  }

  function onImagesReady(cb) {
    const imgs = track.querySelectorAll('img');
    let remaining = imgs.length;
    if (remaining === 0) return cb();
    imgs.forEach(img => {
      if (img.complete) {
        if (--remaining === 0) cb();
      } else {
        img.addEventListener('load', () => { if (--remaining === 0) cb(); }, { once: true });
        img.addEventListener('error', () => { if (--remaining === 0) cb(); }, { once: true });
      }
    });
  }

  function step(ts) {
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000; // seconds
    lastTs = ts;

    if (!paused && slideWidth > 0) {
      x -= pxPerSec * dt;
      // Snap forward when one full slide has passed to avoid gaps
      if (x <= -slideWidth) {
        x += slideWidth;
      }
      track.style.transform = `translateX(${x}px)`;
    }

    requestAnimationFrame(step);
  }

  // Pause on hover
  container.addEventListener('mouseenter', () => { paused = true; });
  container.addEventListener('mouseleave', () => { paused = false; });

  // Recalculate on resize (debounced)
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const currentProgress = slideWidth ? (x % slideWidth) : 0;
      measure();
      ensureFilled();
      // keep visual position consistent after resize
      if (slideWidth > 0) x = currentProgress;
    }, 100);
  });

  // Initial measure after images load
  onImagesReady(() => {
    measure();
    ensureFilled();
    requestAnimationFrame(step);
  });
}

// Run marquee after full load to ensure DOM and assets exist
window.addEventListener('load', initTrusteeMarquee);
