/**
 * Coming Soon Modal Component
 * Professional feedback for unavailable features
 */

class ComingSoonModal {
    constructor() {
        this.modal = null;
        this.init();
    }
    
    init() {
        // Create modal HTML
        this.createModal();
        
        // Attach event listeners to all disabled links
        this.attachListeners();
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('modal-active')) {
                this.close();
            }
        });
    }
    
    createModal() {
        const modalHTML = `
            <div class="coming-soon-modal" id="comingSoonModal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                    <div class="modal-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3 class="modal-title">Coming Soon!</h3>
                    <p class="modal-description">
                        <strong id="modalFeatureName"></strong> is currently under development.
                    </p>
                    <p class="modal-details">
                        This feature will be available soon. Stay tuned for updates!
                    </p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-primary" id="modalNotify">
                            <i class="fas fa-bell"></i> Notify Me
                        </button>
                        <button class="modal-btn modal-btn-secondary" id="modalClose">
                            Got It
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('comingSoonModal');
        
        // Close button handlers
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
        document.getElementById('modalClose').addEventListener('click', () => this.close());
        document.getElementById('modalNotify').addEventListener('click', () => this.handleNotify());
    }
    
    attachListeners() {
        // Project demo links
        document.querySelectorAll('a.disabled-link[href="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const projectCard = link.closest('.project-card');
                const projectName = projectCard ? 
                    projectCard.querySelector('h3').textContent : 
                    'This feature';
                
                this.show(projectName);
            });
        });
        
        // Footer service links
        document.querySelectorAll('.footer__services a[href="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const serviceName = link.textContent.trim().replace(/^.*?\s+/, '');
                this.show(serviceName);
            });
        });
    }
    
    show(featureName) {
        document.getElementById('modalFeatureName').textContent = featureName;
        this.modal.classList.add('modal-active');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        this.modal.querySelector('.modal-close').focus();
    }
    
    close() {
        this.modal.classList.remove('modal-active');
        document.body.style.overflow = '';
    }
    
    handleNotify() {
        alert('✅ Great! We\'ll notify you when this feature is ready.');
        this.close();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ComingSoonModal();
});
