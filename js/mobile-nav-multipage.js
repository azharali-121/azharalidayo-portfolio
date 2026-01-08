/**
 * Multi-Page Mobile Navigation Handler
 * Handles hamburger menu toggle, page navigation, and responsive behavior
 */
(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const body = document.body;

        if (!navToggle || !navMenu) {
            // Navigation elements not found
            return;
        }

        // Toggle mobile menu
        function toggleMenu() {
            const isExpanded = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Update ARIA attributes
            navToggle.setAttribute('aria-expanded', isExpanded);
            navMenu.setAttribute('aria-hidden', !isExpanded);
            
            // Production: Menu toggle logging disabled
        }

        // Close mobile menu
        function closeMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Update ARIA attributes
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            
            // Production: Menu close logging disabled
        }

        // Hamburger toggle click
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Nav link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Close menu when navigating to another page
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideNav = navMenu.contains(e.target) || navToggle.contains(e.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close menu on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
                navToggle.focus(); // Return focus to toggle button
            }
        });

        // Close menu on window resize to desktop
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });

        // Set active page in navigation
        function setActivePage() {
            const currentPage = window.location.pathname.split('/').pop() || 'home.html';
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkPage = link.getAttribute('href');
                
                if (linkPage === currentPage || 
                    (currentPage === '' && linkPage === 'home.html') ||
                    (currentPage === 'index.html' && linkPage === 'home.html')) {
                    link.classList.add('active');
                }
            });
        }

        // Initialize active page
        setActivePage();

        // Production: Console logging disabled
    }
})();
