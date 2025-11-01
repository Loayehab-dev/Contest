
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        let lastScroll = 0;
        const header = document.getElementById('header');
        
       
        const choosePlanButtons = document.querySelectorAll('.choose-plan-button');
        
        choosePlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planCard = this.closest('.plan-card');
                const planName = planCard.querySelector('.plan-name').textContent;
                const planPrice = planCard.querySelector('.plan-price').textContent;
                
                alert(`You selected ${planName} plan at ${planPrice}`);
                
                
            });
        });

        const editButton = document.querySelector('.edit-button');
        
        editButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Edit trip details');
        });

        const coverageSelects = document.querySelectorAll('.coverage-select');
        
        coverageSelects.forEach(select => {
            select.addEventListener('change', function() {
                const value = this.value;
                const row = this.closest('.coverage-row');
                const label = row.querySelector('.coverage-label').textContent.trim();
                
                console.log(`Coverage updated: ${label} = ${value}`);
                
                this.style.borderColor = 'var(--blue-primary)';
                setTimeout(() => {
                    this.style.borderColor = 'var(--border-color)';
                }, 500);
            });
        });

        const showBenefitsLinks = document.querySelectorAll('.show-benefits-link');
        
        showBenefitsLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const planCard = this.closest('.plan-card');
                const planName = planCard.querySelector('.plan-name').textContent;
                
                alert(`Show all benefits for ${planName} plan`);
            });
        });

        const infoIcons = document.querySelectorAll('.info-icon');
        
        infoIcons.forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.2)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.lazy-load').forEach(el => {
            observer.observe(el);
        });

        // Accessibility: Keyboard navigation for custom elements
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('plan-card')) {
                    const button = focusedElement.querySelector('.choose-plan-button');
                    if (button) button.click();
                }
            }
        });

       
        function validateSelection() {
            const selectedOptions = document.querySelectorAll('.coverage-select');
            let isValid = true;
            
            selectedOptions.forEach(select => {
                if (select.value === '') {
                    isValid = false;
                    select.style.borderColor = '#dc3545';
                }
            });
            
            return isValid;
        }

        
        function animatePriceChange(element, newPrice) {
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                element.textContent = newPrice;
                element.style.transform = 'scale(1)';
            }, 150);
        }

        // Performance: Debounce function for scroll events
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

       

        choosePlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const planName = this.closest('.plan-card').querySelector('.plan-name').textContent;
                trackEvent('Plan Selection', 'Click', planName);
            });
        });

        const navToggler = document.querySelector('.navbar-toggler');
        if (navToggler) {
            navToggler.addEventListener('click', function() {
                trackEvent('Navigation', 'Toggle Menu', 'Mobile');
            });
        }

      
        window.addEventListener('load', function() {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page Load Time: ${pageLoadTime}ms`);
            

            if ('PerformanceObserver' in window) {
                
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                
               
                const fidObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            }
        });

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
            });
        });

       
 