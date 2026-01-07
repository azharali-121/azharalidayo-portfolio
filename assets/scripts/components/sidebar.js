// Sidebar Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mainContent = document.querySelector('body');

    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        sidebarToggle.classList.toggle('active');
        
        // Optional: Disable scrolling when sidebar is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            mainContent.classList.add('sidebar-active');
        } else {
            document.body.style.overflow = '';
            mainContent.classList.remove('sidebar-active');
        }
    }

    // Close sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        sidebarToggle.classList.remove('active');
        document.body.style.overflow = '';
        mainContent.classList.remove('sidebar-active');
    }

    // Event listeners
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking on links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // Close sidebar when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    // Handle active state for sidebar links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveSection() {
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.sidebar-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveSection);
    
    // Initial highlight
    highlightActiveSection();
});
