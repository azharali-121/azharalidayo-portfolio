/**
 * Education & Achievements - Scroll Animation Controller
 * Triggers animations when elements enter viewport
 */

(function() {
    'use strict';

    // Configuration
    const OBSERVER_OPTIONS = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Create Intersection Observer
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, OBSERVER_OPTIONS);

    // Initialize on DOM ready
    function initScrollAnimations() {
        // Observe timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => observer.observe(item));

        // Observe PITP certificate cards
        const pitpCards = document.querySelectorAll('.pitp-certificate-card');
        pitpCards.forEach(card => observer.observe(card));

        // Observe certificate cards
        const certificateCards = document.querySelectorAll('.certificate-card');
        certificateCards.forEach(card => observer.observe(card));

        // Observe achievement badges
        const achievementBadges = document.querySelectorAll('.achievement-badge');
        achievementBadges.forEach(badge => observer.observe(badge));
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Smooth scroll for mobile badge container
    const achievementsBadges = document.querySelector('.achievements-badges');
    if (achievementsBadges && window.innerWidth <= 768) {
        let isScrolling = false;
        let scrollTimeout;

        achievementsBadges.addEventListener('scroll', () => {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        });
    }
})();
