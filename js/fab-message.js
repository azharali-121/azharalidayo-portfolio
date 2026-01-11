/**
 * Floating Action Button (FAB) - Message Icon
 * Appears after scrolling past hero section
 * Smooth scrolls to contact form when clicked
 */

document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('fab-message');
    const heroSection = document.querySelector('.hero');
    
    if (!fab) return;
    
    // Intersection Observer to detect when hero section is out of view
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
            threshold: 0.1, // Trigger when 10% of hero is visible
            rootMargin: '-100px 0px 0px 0px' // Add offset from top
        }
    );
    
    // Start observing the hero section if it exists
    if (heroSection) {
        observer.observe(heroSection);
    } else {
        // No hero section (non-home pages) - show FAB immediately after small delay
        setTimeout(() => fab.classList.add('fab-visible'), 500);
    }
    
    // Smooth scroll to contact form on click; fallback to contact page
    fab.addEventListener('click', (e) => {
        e.preventDefault();

        const contactSection = document.getElementById('contact');
        const contactForm = document.getElementById('contactForm');

        if (contactSection) {
            // Scroll to contact section if present on this page
            contactSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            setTimeout(() => {
                const firstInput = contactForm?.querySelector('input[name="name"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 800);
        } else {
            // If contact section isn't present, navigate to contact page
            window.location.href = 'contact.html';
        }
    });
    
    // Optional: Hide FAB when user is in contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        const contactObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fab.style.opacity = '0';
                        fab.style.pointerEvents = 'none';
                    } else if (fab.classList.contains('fab-visible')) {
                        fab.style.opacity = '1';
                        fab.style.pointerEvents = 'auto';
                    }
                });
            },
            {
                threshold: 0.3
            }
        );
        
        contactObserver.observe(contactSection);
    }
});
