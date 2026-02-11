/**
 * Mobile Navigation Handler
 * Handles hamburger menu toggle and URL-based active state
 */

(function() {
    'use strict';

    function initMobileNav() {
        // DOM Elements
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navToggle || !navMenu) {
            // Mobile nav elements not found - disabled
            return;
        }

        // Ensure toggle button is not treated as a submit button
        if (!navToggle.getAttribute('type')) {
            navToggle.setAttribute('type', 'button');
        }

        // Set initial ARIA state for accessibility
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        const isActive = navMenu.classList.contains('active');
        
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update ARIA attribute
        navToggle.setAttribute('aria-expanded', !isActive);
        
        // Manage focus and tab order for accessibility
        navMenu.setAttribute('aria-hidden', isActive);
        navLinks.forEach(link => {
            link.tabIndex = !isActive ? 0 : -1;
            // Ensure pointer events work on nav links
            link.style.pointerEvents = !isActive ? 'auto' : 'auto';
        });
        
        // Enable pointer events on nav menu when active
        navMenu.style.pointerEvents = !isActive ? 'auto' : 'auto';
        
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
        
        // Reset focus management
        navMenu.setAttribute('aria-hidden', 'true');
        navLinks.forEach(link => {
            link.tabIndex = -1;
            // Ensure pointer events always work
            link.style.pointerEvents = 'auto';
        });
        
        // Keep pointer events enabled on nav menu
        navMenu.style.pointerEvents = 'auto';
        
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
            
            // Skip download links
            if (link.hasAttribute('download')) return;
            
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

        // Handle nav link clicks - update active state and close menu
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));

                // Add active class to clicked link (unless it's a download link)
                if (!link.hasAttribute('download')) {
                    link.classList.add('active');
                }

                // Close mobile menu
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

        // Navbar scroll state
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Set active link on page load
        setActiveLink();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }

    // Production: Console logging disabled
})();

