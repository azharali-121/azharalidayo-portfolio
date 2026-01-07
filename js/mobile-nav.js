/**
 * Mobile Navigation Handler
 * Handles hamburger menu toggle and URL-based active state
 */

(function() {
    'use strict';

    // DOM Elements
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navToggle || !navMenu) {
        console.warn('Mobile nav: Required elements not found');
        return;
    }

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        const isActive = navMenu.classList.contains('active');
        
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update ARIA attribute
        navToggle.setAttribute('aria-expanded', !isActive);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = !isActive ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Set active navigation link based on current page URL
     */
    function setActiveLink() {
        // Get current page filename
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to matching link
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check if link matches current page
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Toggle menu on hamburger click
    navToggle.addEventListener('click', toggleMenu);
    
    // Handle keyboard activation (Enter/Space)
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Handle nav link clicks - just close menu
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = navMenu.contains(e.target) || navToggle.contains(e.target);
        if (!isClickInside && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Set active link on page load
    setActiveLink();

    console.log('✅ Mobile navigation initialized');
})();

