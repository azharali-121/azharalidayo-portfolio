/**
 * Floating Action Button (FAB) - Message Icon (Multi-Page Version)
 * Appears after scrolling past hero section or on non-home pages
 * Navigates to contact page when clicked
 */

document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('fab-message');
    
    if (!fab) return;
    
    // Check if we're on the home page
    const currentPage = window.location.pathname.split('/').pop();
    const isHomePage = !currentPage || currentPage === 'home.html' || currentPage === 'index.html';
    
    if (isHomePage) {
        // Home page: Show FAB after scrolling past hero
        const heroSection = document.querySelector('.hero');
        
        if (heroSection) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Hero is visible - hide FAB
                            fab.classList.remove('fab-visible');
                        } else {
                            // Hero is not visible - show FAB
                            fab.classList.add('fab-visible');
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '-100px 0px 0px 0px'
                }
            );
            
            observer.observe(heroSection);
        }
    } else {
        // Other pages: Show FAB after scrolling a bit
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (window.scrollY > 300) {
                    fab.classList.add('fab-visible');
                } else {
                    fab.classList.remove('fab-visible');
                }
            }, 50);
        });
    }
    
    // Navigate to contact page on click
    fab.addEventListener('click', (e) => {
        e.preventDefault();
        
        // If already on contact page, scroll to form
        if (currentPage === 'contact.html') {
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                setTimeout(() => {
                    const firstInput = contactForm.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 600);
            }
        } else {
            // Navigate to contact page
            window.location.href = 'contact.html';
        }
    });
    
    // Add tooltip
    fab.setAttribute('title', 'Send a Message');
});
