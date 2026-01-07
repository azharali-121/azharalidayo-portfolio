/**
 * Testimonials Animation
 * Handles revealing testimonial cards with animation when scrolled into view
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get all testimonial cards
  const testimonialCards = document.querySelectorAll('.testimonial-card');

  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Add 'visible' class when element is in viewport
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stop observing after animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null, // viewport
    threshold: 0.1, // trigger when 10% of the element is visible
    rootMargin: '0px 0px -50px 0px' // trigger slightly before element comes into view
  });

  // Observe each testimonial card
  testimonialCards.forEach(card => {
    observer.observe(card);
  });

  // Fallback for browsers that don't support Intersection Observer
  if (!('IntersectionObserver' in window)) {
    testimonialCards.forEach(card => {
      card.classList.add('visible');
    });
  }
});