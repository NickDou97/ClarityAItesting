// Main JavaScript for ClarityAI - Monochromatic Theme
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log("DOM fully loaded, initializing scripts...");
        
        // Initialize components
        initNavigation();
        initAnimations();
        initFormHandling();
        initCounters();
        initFaqAccordions();
        
        // Initialize tabs if solution tabs exist
        if (document.querySelector('.tab-navigation')) {
            console.log("Tab navigation found, initializing tabs...");
            initTabs();
        } else {
            // Remove the warning message since it's expected in some pages
            // console.warn("Tab navigation not found in the document");
        }
        
        // Create and enable dark mode toggle
        createDarkModeToggle();
        
        // Initialize neural network animation
        createNeuralNetworkAnimation();
        
        // Initialize enhanced form tracking for Google Analytics
        trackFormSubmissions();
        
        // Force start assessment animations immediately
        setTimeout(() => {
            // Find all progress values and trigger their animations
            document.querySelectorAll('.assessment-box .progress-value').forEach(valueElement => {
                const currentValue = valueElement.textContent;
                
                // Reset and trigger animation
                valueElement.style.opacity = '0';
                valueElement.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    valueElement.style.opacity = '1';
                    valueElement.style.transform = 'translateY(0)';
                }, 200);
            });
        }, 500);
        
        // Initialize AI Analysis animation
        initAnalysisAnimation();
        
        console.log("All scripts initialized successfully");
    } catch (error) {
        console.error("Error during script initialization:", error);
    }
});

// Navigation functionality
function initNavigation() {
    const header = document.querySelector('.header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links-container');
    
    // Apply scrolled class on page load if already scrolled
    if (window.scrollY > 20) {
        header?.classList.add('scrolled');
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuBtn.setAttribute('aria-expanded', !expanded);
            navLinksContainer.classList.toggle('show');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer) {
                navLinksContainer.classList.remove('show');
            }
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
            document.body.classList.remove('menu-open');
        });
    });
    
    // Scroll handling for navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Trigger scroll event on page load to set correct state
        window.dispatchEvent(new Event('scroll'));
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                
                // Account for fixed header
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, this.getAttribute('href'));
            }
        });
    });
}

// Animation functionality
function initAnimations() {
    // Fade-in animations on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
        
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Hero terminal animation
    animateTerminal();
    
    // Assessment animation
    animateAssessment();
}

// Terminal animation in hero section
function animateTerminal() {
    const codeLines = document.querySelectorAll('.code-line');
    if (!codeLines.length) return;
    
    // Reset animations
    function resetAnimation() {
        codeLines.forEach(line => {
            line.style.opacity = '0';
            line.style.transform = 'translateX(-10px)';
            void line.offsetWidth; // Trigger reflow
            
            // Remove and reapply animation style
            line.style.animation = 'none';
            void line.offsetWidth; // Trigger reflow
            line.style.animation = '';
        });
    }
    
    // Update dynamic data
    function updateTerminalData() {
        const scoreElement = document.querySelector('.score-value');
        const leadsElement = document.querySelector('.leads-value');
        
        if (scoreElement) {
            const score = Math.floor(Math.random() * 20) + 80; // 80-99
            scoreElement.textContent = score;
            
            // Update status badge based on score
            const statusBadge = document.querySelector('.status-high');
            if (statusBadge) {
                if (score >= 90) {
                    statusBadge.textContent = 'Premium';
                } else if (score >= 85) {
                    statusBadge.textContent = 'High Value';
                } else {
                    statusBadge.textContent = 'Qualified';
                }
            }
        }
        
        if (leadsElement) {
            const leads = Math.floor(Math.random() * 15) + 20; // 20-34
            leadsElement.textContent = leads;
        }
    }
    
    // Initial update
    updateTerminalData();
    
    // Set interval for animation cycle
    const terminalInterval = setInterval(() => {
        resetAnimation();
        updateTerminalData();
    }, 8000); // Reset every 8 seconds
    
    // Cleanup on page change
    window.addEventListener('beforeunload', () => {
        clearInterval(terminalInterval);
    });
}

// Assessment animation
function animateAssessment() {
    const assessmentBoxes = document.querySelectorAll('.assessment-box');
    if (!assessmentBoxes.length) return;
    
    assessmentBoxes.forEach(box => {
        // Setup the initial animated state
        const progressValues = box.querySelectorAll('.progress-value');
        const progressSpinners = box.querySelectorAll('.progress-spinner i');
        
        // Randomly generate different percentage values for each assessment box
        progressValues.forEach(valueElement => {
            const randomBase = Math.floor(Math.random() * 10) + 75; // Random number between 75-84
            valueElement.textContent = randomBase + '%';
            
            // Add animation reset and restart capability
            setInterval(() => {
                // Make the percentage randomly vary slightly
                const newValue = randomBase + Math.floor(Math.random() * 5);
                
                // Animate the change
                valueElement.style.opacity = '0';
                valueElement.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    valueElement.textContent = newValue + '%';
                    valueElement.style.opacity = '1';
                    valueElement.style.transform = 'translateY(0)';
                }, 300);
                
            }, 5000 + Math.random() * 3000); // Random interval between 5-8 seconds
        });
        
        // Ensure spinners have proper animations
        progressSpinners.forEach(spinner => {
            // Ensure animation is applied
            spinner.style.animation = 'pulse 1.5s infinite';
        });
    });
}

// Form handling functionality
function initFormHandling() {
    const contactForm = document.getElementById('contact-form');
    const newsletterForm = document.querySelector('.signup-form');
    
    if (contactForm) {
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const companyField = document.getElementById('company');
        const submitButton = contactForm.querySelector('.submit-button');
        
        // Add input validation events
        nameField.addEventListener('input', () => validateField(nameField, 'Please enter your name', 2));
        emailField.addEventListener('input', () => validateField(emailField, 'Please enter a valid email address', 5, isValidEmail));
        companyField.addEventListener('input', () => validateField(companyField, 'Please enter your company name', 2));
        
        // Add blur events for validation
        nameField.addEventListener('blur', () => validateField(nameField, 'Please enter your name', 2));
        emailField.addEventListener('blur', () => validateField(emailField, 'Please enter a valid email address', 5, isValidEmail));
        companyField.addEventListener('blur', () => validateField(companyField, 'Please enter your company name', 2));
        
        // Form submission handling
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields before submission
            const nameValid = validateField(nameField, 'Please enter your name', 2);
            const emailValid = validateField(emailField, 'Please enter a valid email address', 5, isValidEmail);
            const companyValid = validateField(companyField, 'Please enter your company name', 2);
            
            if (nameValid && emailValid && companyValid) {
                // Show loading state
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitButton.disabled = true;
                
                // Prepare form data
                const formData = new FormData(contactForm);
                const data = {};
                formData.forEach((value, key) => data[key] = value);
                
                // Track form submission event if GA available
                if (typeof gtag === 'function') {
                    gtag('event', 'form_submission', {
                        'event_category': 'contact',
                        'event_label': 'strategy_call'
                    });
                }
                
                // Send to Netlify
                fetch(contactForm.getAttribute('action'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                })
                .then(response => {
                    if (response.ok) {
                        // Show success message
                        showFormSuccess(contactForm);
                        
                        // Reset form
                        contactForm.reset();
                        
                        // Scroll to success message
                        setTimeout(() => {
                            const successMessage = document.querySelector('.form-success');
                            if (successMessage) {
                                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            
                            // Trigger confetti effect
                            triggerConfetti({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6 }
                            });
                        }, 200);
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .catch(error => {
                    console.error('Submission error:', error);
                    
                    // Show error message
                    const errorElement = document.createElement('div');
                    errorElement.className = 'form-error';
                    errorElement.textContent = 'There was a problem submitting your form. Please try again.';
                    
                    // Add error message to form
                    contactForm.prepend(errorElement);
                    
                    // Reset button state
                    submitButton.innerHTML = 'Book My Free Strategy Session Now!';
                    submitButton.disabled = false;
                })
                .finally(() => {
                    // Reset button after 3 seconds if something went wrong
                    setTimeout(() => {
                        if (submitButton.disabled) {
                            submitButton.innerHTML = 'Book My Free Strategy Session Now!';
                            submitButton.disabled = false;
                        }
                    }, 3000);
                });
            }
        });
    }
    
    if (newsletterForm) {
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        
        // Add input validation events
        emailInput.addEventListener('input', () => validateField(emailInput, 'Please enter a valid email address', 5, isValidEmail));
        emailInput.addEventListener('blur', () => validateField(emailInput, 'Please enter a valid email address', 5, isValidEmail));
        
        // Form submission handling
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate email before submission
            const emailValid = validateField(emailInput, 'Please enter a valid email address', 5, isValidEmail);
            
            if (emailValid) {
                // Show loading state
                const originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                submitButton.disabled = true;
                
                // Prepare form data
                const formData = new FormData(newsletterForm);
                
                // Track newsletter signup if GA available
                if (typeof gtag === 'function') {
                    gtag('event', 'newsletter_signup', {
                        'event_category': 'engagement',
                        'event_label': 'newsletter'
                    });
                }
                
                // Send to Netlify
                fetch(newsletterForm.getAttribute('action'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                })
                .then(response => {
                    if (response.ok) {
                        // Show simple thank you message (replace the form)
                        const thankYouMessage = document.createElement('div');
                        thankYouMessage.className = 'newsletter-success';
                        thankYouMessage.innerHTML = `
                            <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                            <h4>You're subscribed!</h4>
                            <p>Thank you for joining our newsletter. Check your inbox for a confirmation email.</p>
                        `;
                        
                        // Replace form with thank you message
                        newsletterForm.parentNode.replaceChild(thankYouMessage, newsletterForm);
                        
                        // Trigger mini confetti
                        triggerConfetti({
                            particleCount: 50,
                            spread: 30,
                            origin: { y: 0.8 }
                        });
                    } else {
                        throw new Error('Newsletter submission failed');
                    }
                })
                .catch(error => {
                    console.error('Submission error:', error);
                    
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                    
                    // Show inline error
                    const errorElement = document.createElement('div');
                    errorElement.className = 'newsletter-error';
                    errorElement.textContent = 'There was a problem. Please try again.';
                    
                    // Add error above the form
                    newsletterForm.prepend(errorElement);
                });
            }
        });
    }
    
    function validateField(field, errorMessage, minLength, customValidator) {
        const value = field.value.trim();
        const errorEl = field.nextElementSibling?.classList.contains('error-message') 
            ? field.nextElementSibling 
            : document.createElement('div');
        
        // Skip validation if empty and not required on blur
        if (event && event.type === 'blur' && !field.required && value === '') {
            return true;
        }
        
        let isValid = true;
        
        // Check if empty
        if (field.required && value === '') {
            isValid = false;
        }
        
        // Check minimum length if provided and not empty
        if (isValid && minLength && value.length < minLength && value !== '') {
            isValid = false;
        }
        
        // Run custom validator if provided and value not empty
        if (isValid && customValidator && value !== '' && !customValidator(value)) {
            isValid = false;
        }
        
        // Add or remove error message
        if (!isValid) {
            // Create and add error message if it doesn't exist
            if (!field.nextElementSibling?.classList.contains('error-message')) {
                errorEl.className = 'error-message';
                errorEl.textContent = errorMessage;
                errorEl.setAttribute('aria-live', 'polite');
                field.parentNode.insertBefore(errorEl, field.nextSibling);
            }
            
            // Add error class to input
            field.classList.add('error');
        } else {
            // Remove error message if it exists
            if (field.nextElementSibling?.classList.contains('error-message')) {
                field.nextElementSibling.textContent = '';
            }
            
            // Remove error class from input
            field.classList.remove('error');
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showFormSuccess(form) {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.innerHTML = `
            <div class="success-icon"><i class="fas fa-check-circle"></i></div>
            <h3>Thanks for reaching out!</h3>
            <p>We'll contact you within 12 hours to schedule your free strategy session.</p>
        `;
        
        // Hide the form
        form.style.display = 'none';
        
        // Insert success message before the form
        form.parentNode.insertBefore(successMessage, form);
    }
}

// Counter animation
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const stepTime = 20; // update every 20ms
        const steps = duration / stepTime;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
                return;
            }
            
            counter.textContent = Math.round(current);
        }, stepTime);
    }
}

// FAQ accordions
function initFaqAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            // Set initial state - hide answers
            answer.style.display = 'none';
            
            // Add click handler
            question.addEventListener('click', () => {
                // Toggle this answer
                const isOpen = answer.style.display === 'block';
                
                // Toggle icon
                const icon = question.querySelector('i');
                if (icon) {
                    icon.className = isOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
                }
                
                // Toggle answer with smooth animation
                if (isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    setTimeout(() => {
                        answer.style.maxHeight = '0';
                        setTimeout(() => {
                            answer.style.display = 'none';
                        }, 300);
                    }, 10);
                } else {
                    answer.style.display = 'block';
                    answer.style.maxHeight = '0';
                    setTimeout(() => {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }, 10);
                }
            });
        }
    });
}

// Tabs functionality
function initTabs() {
    console.log("Initializing tabs...");
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Set initial state - ensure first tab active
    if (tabButtons.length && tabContents.length) {
        // Remove active class from all tabs first
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Set first tab as active
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
        
        // Add click handlers
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get tab ID
                const tabId = button.getAttribute('data-tab');
                console.log("Tab clicked:", tabId);
                
                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab
                button.classList.add('active');
                
                // Show corresponding tab content
                const activeContent = document.getElementById(`${tabId}-tab`);
                if (activeContent) {
                    activeContent.classList.add('active');
                    // Reset animation if needed
                    activeContent.style.animation = 'none';
                    activeContent.offsetHeight; // Trigger reflow
                    activeContent.style.animation = '';
                }
            });
        });
    }
}

// Dark mode toggle
function createDarkModeToggle() {
    // Only create if it doesn't exist already
    if (!document.querySelector('.theme-toggle')) {
        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
        
        // Check user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        // Apply theme based on preference or saved value
        if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
            document.body.classList.add('dark-mode');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Add click handler
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                toggle.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                toggle.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'light');
            }
        });
        
        // Add to document
        document.body.appendChild(toggle);
    }
}

// Neural Network Animation 
function createNeuralNetworkAnimation() {
    const container = document.getElementById('neural-network');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for low-power devices - simplified heuristic
    const isLowPoweredDevice = () => {
        // Check if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check if device has a low-end CPU (best guess based on available info)
        const cpuCores = navigator.hardwareConcurrency || 1;
        const isLowCPU = cpuCores <= 4;
        
        // Check if device might be battery powered
        const isBatteryPowered = 'getBattery' in navigator || isMobile;
        
        return (isMobile && isLowCPU) || (isBatteryPowered && isLowCPU);
    };
    
    // Adjust animation based on device capabilities
    let animationQuality = 'high';
    if (prefersReducedMotion) {
        animationQuality = 'minimal';
    } else if (isLowPoweredDevice()) {
        animationQuality = 'low';
    }
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Calculate node count based on screen size and quality setting
    let nodeCount = 30;
    let connectionDistance = Math.min(200, width * 0.2);
    
    switch(animationQuality) {
        case 'minimal':
            nodeCount = 5;
            connectionDistance = width * 0.15;
            break;
        case 'low':
            nodeCount = 12;
            connectionDistance = width * 0.18;
            break;
        case 'high':
        default:
            nodeCount = Math.min(30, Math.floor(width * height / 15000));
            connectionDistance = Math.min(200, width * 0.2);
    }
    
    const nodes = [];
    const connections = [];
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'neural-node';
        
        // Random position
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        // Random size between 3 and 6px
        const size = Math.random() * 3 + 3;
        
        // Movement speed (slower for smoother animation)
        const speedX = (Math.random() - 0.5) * 0.2;
        const speedY = (Math.random() - 0.5) * 0.2;
        
        // Set node style
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.style.width = size + 'px';
        node.style.height = size + 'px';
        
        // Set opacity based on size for depth effect
        node.style.opacity = (size - 3) / 3 * 0.5 + 0.3;
        
        // Apply pulsing animation to some nodes
        if (Math.random() > 0.7) {
            node.style.animation = `pulse ${2 + Math.random() * 2}s infinite`;
            node.style.animationDelay = `${Math.random() * 2}s`;
        }
        
        // Add to document and store data
        container.appendChild(node);
        nodes.push({
            element: node,
            x, y, size, speedX, speedY
        });
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            // Calculate distance between nodes
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only create connections between close nodes
            if (distance < connectionDistance) {
                const connection = document.createElement('div');
                connection.className = 'neural-connection';
                
                // Set initial position and opacity based on distance
                const opacity = 1 - (distance / connectionDistance);
                connection.style.opacity = opacity * 0.3;
                
                container.appendChild(connection);
                
                connections.push({
                    element: connection,
                    from: nodes[i],
                    to: nodes[j],
                    opacity
                });
            }
        }
    }
    
    // Animation function
    let animationFrameId;
    let lastAnimationTime = 0;
    const targetFPS = animationQuality === 'high' ? 60 : 30;
    const frameDelay = 1000 / targetFPS;
    
    function animate(timestamp) {
        // Request next frame
        animationFrameId = requestAnimationFrame(animate);
        
        // Throttle animation on low-power devices
        if (timestamp - lastAnimationTime < frameDelay && animationQuality !== 'high') {
            return;
        }
        
        lastAnimationTime = timestamp;
        
        // Update nodes positions more efficiently
        nodes.forEach(node => {
            // Only update position every other frame on low power devices
            if (animationQuality === 'low' && Math.random() > 0.5) {
                return;
            }
            
            node.x += node.speedX;
            node.y += node.speedY;
            
            // Bounce off edges
            if (node.x <= 0 || node.x >= width) node.speedX *= -1;
            if (node.y <= 0 || node.y >= height) node.speedY *= -1;
            
            // Update position
            node.element.style.left = node.x + 'px';
            node.element.style.top = node.y + 'px';
        });
        
        // Update connections with better performance
        if (animationQuality !== 'minimal') {
            connections.forEach(conn => {
                // Skip connection updates sometimes on low power devices
                if (animationQuality === 'low' && Math.random() > 0.7) {
                    return;
                }
                
                const dx = conn.to.x - conn.from.x;
                const dy = conn.to.y - conn.from.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Update connection only if nodes are close enough
                if (distance < connectionDistance) {
                    // Calculate connection opacity based on distance
                    const opacity = (1 - (distance / connectionDistance)) * (animationQuality === 'high' ? 0.3 : 0.2);
                    conn.element.style.opacity = opacity;
                    
                    // Calculate width (length of connection)
                    conn.element.style.width = distance + 'px';
                    
                    // Position at first node
                    conn.element.style.left = conn.from.x + 'px';
                    conn.element.style.top = conn.from.y + 'px';
                    
                    // Calculate angle for rotation
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    conn.element.style.transform = `rotate(${angle}deg)`;
                    
                    // Show connection
                    conn.element.style.display = 'block';
                } else {
                    // Hide connection if nodes too far apart
                    conn.element.style.display = 'none';
                }
            });
        }
    }
    
    // Start animation
    animate();
    
    // Handle page visibility changes to improve performance
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animate();
        }
    });
    
    // Setup animation toggle
    setupAnimationToggle();
}

// Setup animation toggle
function setupAnimationToggle() {
    const toggleBtn = document.getElementById('toggle-animation');
    const neuralNetwork = document.getElementById('neural-network');
    
    if (toggleBtn && neuralNetwork) {
        // Check for saved preference
        const animationDisabled = localStorage.getItem('animation-disabled') === 'true';
        
        // Apply saved preference
        if (animationDisabled) {
            neuralNetwork.style.display = 'none';
            toggleBtn.classList.add('disabled');
            toggleBtn.title = 'Enable Background Animation';
        }
        
        // Add click handler
        toggleBtn.addEventListener('click', function() {
            if (neuralNetwork.style.display === 'none') {
                // Enable animation
                neuralNetwork.style.display = 'block';
                toggleBtn.classList.remove('disabled');
                toggleBtn.title = 'Disable Background Animation';
                localStorage.setItem('animation-disabled', 'false');
                
                // Restart animation
                createNeuralNetworkAnimation();
            } else {
                // Disable animation
                neuralNetwork.style.display = 'none';
                toggleBtn.classList.add('disabled');
                toggleBtn.title = 'Enable Background Animation';
                localStorage.setItem('animation-disabled', 'true');
                
                // Clear all animation nodes
                neuralNetwork.innerHTML = '';
            }
        });
    }
}

// Confetti Animation for Form Success
function triggerConfetti(options = {}) {
    // Skip animation if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    // Create canvas for animation
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get context
    const ctx = canvas.getContext('2d');
    
    // Default options
    const settings = {
        particleCount: options.particleCount || 100,
        startVelocity: options.startVelocity || 30,
        spread: options.spread || 70,
        origin: options.origin || { x: 0.5, y: 0.5 },
        gravity: options.gravity || 1,
        ticks: options.ticks || 200,
        colors: options.colors || ['#5E5CDE', '#8684FF', '#7B79E8', '#4946D1', '#E8E8FF']
    };
    
    // Particles array
    const particles = [];
    
    // Create particles
    for (let i = 0; i < settings.particleCount; i++) {
        particles.push({
            x: settings.origin.x,
            y: settings.origin.y,
            color: settings.colors[Math.floor(Math.random() * settings.colors.length)],
            size: Math.random() * 10 + 5,
            velocity: {
                x: (Math.random() - 0.5) * settings.spread,
                y: (Math.random() * -settings.startVelocity) - 10
            },
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'circle' : 'rect'
        });
    }
    
    // Remaining ticks
    let tick = 0;
    
    // Animation function
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update particles
        particles.forEach(p => {
            // Update position
            p.x += p.velocity.x * 0.01;
            p.y += p.velocity.y * 0.01;
            
            // Apply gravity
            p.velocity.y += settings.gravity * 0.1;
            
            // Update rotation
            p.rotation += p.rotationSpeed;
            
            // Reduce opacity based on position
            p.opacity = Math.max(0, p.opacity - 0.005);
            
            // Draw particle
            ctx.save();
            ctx.translate(p.x * canvas.width, p.y * canvas.height);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            
            ctx.restore();
        });
        
        // Increment tick
        tick++;
        
        // Continue animation if ticks remaining and at least one visible particle
        if (tick < settings.ticks && particles.some(p => p.opacity > 0)) {
            requestAnimationFrame(animate);
        } else {
            // Remove canvas when done
            canvas.remove();
        }
    }
    
    // Start animation
    requestAnimationFrame(animate);
}

// Make confetti function globally available
window.triggerConfetti = triggerConfetti;

// Google Analytics form tracking
function trackFormSubmissions() {
    // Helper function to check if Google Analytics is loaded
    function isGaReady() {
        const isAvailable = typeof window.gtag !== 'undefined';
        if (!isAvailable) {
            console.warn('⚠️ Google Analytics not available - script may not be loaded');
        }
        return isAvailable;
    }

    // Helper function to log tracking events
    function logEvent(eventName, params) {
        console.log(`✅ Google Analytics: Tracked event "${eventName}"`, params);
    }

    // Helper function to handle errors
    function handleTrackingError(eventName, error) {
        console.error(`❌ Google Analytics: Failed to track "${eventName}"`, error);
    }

    // Enhanced event tracking function with error handling
    function safeTrackEvent(eventName, params = {}) {
        if (!isGaReady()) {
            // If GA isn't loaded yet, retry after a short delay
            console.log(`⏱️ Google Analytics: Retrying event "${eventName}" in 1 second...`);
            setTimeout(() => {
                safeTrackEvent(eventName, params);
            }, 1000);
            return;
        }

        try {
            // Check network status
            if (!navigator.onLine) {
                console.warn("⚠️ Browser is offline. Tracking may fail.");
            }
            
            // Track the event
            gtag('event', eventName, params);
            logEvent(eventName, params);
        } catch (error) {
            handleTrackingError(eventName, error);
        }
    }

    // Contact form tracking
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        console.log("📝 Google Analytics: Contact form detected, adding tracking");
        
        contactForm.addEventListener('submit', function(e) {
            console.log("🔔 Google Analytics: Contact form submitted");
            
            try {
                // Get form data
                const formData = {
                    name: document.getElementById('name')?.value || 'Unknown',
                    email: document.getElementById('email')?.value || 'unknown@example.com',
                    company: document.getElementById('company')?.value || 'Unknown',
                    role: document.getElementById('role')?.value || 'Unknown',
                    challenge: document.getElementById('challenge')?.value || 'Unknown'
                };
                
                // Track lead form submission
                safeTrackEvent('generate_lead', {
                    form_name: 'strategy_call',
                    company: formData.company,
                    role: formData.role
                });
            } catch (error) {
                console.error("❌ Google Analytics: Error processing contact form submission", error);
            }
        });
    } else {
        console.log("ℹ️ Google Analytics: Contact form not found on this page");
    }
    
    // Newsletter form tracking
    const newsletterForms = document.querySelectorAll('.signup-form');
    if (newsletterForms.length) {
        console.log(`📝 Google Analytics: ${newsletterForms.length} newsletter form(s) detected, adding tracking`);
        
        newsletterForms.forEach((form, index) => {
            form.addEventListener('submit', function(e) {
                console.log(`🔔 Google Analytics: Newsletter form #${index+1} submitted`);
                
                try {
                    // Track newsletter signup
                    safeTrackEvent('sign_up', {
                        method: 'newsletter',
                        content_type: 'newsletter',
                        item_id: 'ai_insights_newsletter'
                    });
                } catch (error) {
                    console.error("❌ Google Analytics: Error processing newsletter form submission", error);
                }
            });
        });
    } else {
        console.log("ℹ️ Google Analytics: Newsletter form not found on this page");
    }
    
    // Assessment quiz tracking
    const quizSelectors = document.querySelectorAll('.range-slider');
    if (quizSelectors.length) {
        console.log(`📝 Google Analytics: Assessment quiz detected with ${quizSelectors.length} sliders`);
        
        // Track when someone completes the assessment
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                console.log("🔔 Google Analytics: Assessment export button clicked");
                
                try {
                    // Get assessment data
                    const dimensions = Array.from(quizSelectors).map((slider, index) => {
                        const value = parseInt(slider.value);
                        return value;
                    });
                    
                    // Calculate average score
                    const avgScore = dimensions.reduce((a, b) => a + b, 0) / dimensions.length;
                    
                    // Track assessment completion
                    safeTrackEvent('complete_assessment', {
                        assessment_type: 'ai_maturity',
                        score: avgScore.toFixed(1)
                    });
                } catch (error) {
                    console.error("❌ Google Analytics: Error processing assessment completion", error);
                }
            });
        } else {
            console.log("⚠️ Google Analytics: Export button for assessment not found");
        }
    } else {
        console.log("ℹ️ Google Analytics: Assessment quiz not found on this page");
    }
    
    // Verify Google Analytics is loaded on page
    setTimeout(() => {
        if (isGaReady()) {
            console.log("✅ Google Analytics: Script is loaded and ready");
            
            // Track page view explicitly (redundant but good for testing)
            try {
                gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });
                console.log("✅ Google Analytics: Test page_view event tracked successfully");
            } catch (error) {
                console.error("❌ Google Analytics: Test event failed", error);
            }
        } else {
            console.error("❌ Google Analytics: Script failed to load after 3 seconds");
        }
    }, 3000);
}

// Debug function to check script loading
function checkGaStatus() {
    console.log("🔍 Checking Google Analytics status...");
    
    // Check if gtag is defined
    if (typeof window.gtag !== 'undefined') {
        console.log("✅ Google Analytics global function available");
    } else {
        console.error("❌ Google Analytics global function NOT available");
    }
    
    // Check if the script element exists
    const scriptElement = document.querySelector('script[src*="googletagmanager"]');
    if (scriptElement) {
        console.log("✅ Google Analytics script tag found in DOM");
    } else {
        console.error("❌ Google Analytics script tag NOT found in DOM");
    }
    
    // Check browser console for errors
    console.log("👉 Check browser console for any script loading errors");
}

// Call this from the browser console to diagnose issues
window.debugGa = function() {
    checkGaStatus();
    
    console.log("📋 Debugging instructions:");
    console.log("1. Submit a form to see if tracking triggers");
    console.log("2. Check Network tab for requests to google-analytics.com");
    console.log("3. Check for any JavaScript errors in the Console tab");
}

// Initialize tabs
document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and tab contents
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Ensure the first tab is active on page load
    if (tabButtons.length > 0 && tabContents.length > 0) {
        // Remove active class from all tabs and contents
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Set the first tab as active
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target tab ID
            const targetId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and content
                this.classList.add('active');
                targetContent.classList.add('active');
                
                // Reset animation (if any) to trigger it again
                targetContent.style.animation = 'none';
                setTimeout(() => {
                    targetContent.style.animation = '';
                }, 10);
            }
        });
    });
    
    // Mobile Navigation
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileMenuToggle && navMenu) {
        // Create overlay if it doesn't exist
        if (!mobileMenuOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
        }
        
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            document.querySelector('.mobile-menu-overlay').classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Toggle icon between menu and close
            const menuIcon = this.querySelector('i');
            if (menuIcon) {
                if (menuIcon.classList.contains('fa-bars')) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-times');
                } else {
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking on overlay
        document.querySelector('.mobile-menu-overlay')?.addEventListener('click', function() {
            navMenu.classList.remove('active');
            this.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Reset icon
            const menuIcon = mobileMenuToggle.querySelector('i');
            if (menuIcon) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a nav link (for single page sites)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    document.querySelector('.mobile-menu-overlay')?.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    
                    // Reset icon
                    const menuIcon = mobileMenuToggle.querySelector('i');
                    if (menuIcon) {
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                }
            });
        });
    }
});

// AI Analysis Animation
function initAnalysisAnimation() {
    const analysisContainer = document.querySelector('.analysis-container');
    if (!analysisContainer) return;
    
    const stages = document.querySelectorAll('.analysis-stage');
    const progressBars = document.querySelectorAll('.progress-bar');
    
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAnimation();
                observer.disconnect(); // Only animate once
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(analysisContainer);
    
    function startAnimation() {
        // Animate scanning line
        const scanningLine = document.querySelector('.scanning-line');
        if (scanningLine) {
            scanningLine.style.opacity = '0.6';
        }
        
        // Sequentially show stages
        stages.forEach((stage, index) => {
            setTimeout(() => {
                stage.classList.add('active');
                
                // Animate progress bar
                if (progressBars[index]) {
                    const targetPercentage = progressBars[index].dataset.percentage || '100';
                    setTimeout(() => {
                        progressBars[index].style.width = targetPercentage;
                        
                        // Update counter text
                        const counter = progressBars[index].querySelector('.progress-percentage');
                        if (counter) {
                            animateCounter(counter, parseInt(targetPercentage));
                        }
                    }, 300);
                }
            }, 800 * index);
        });
    }
    
    function animateCounter(element, target) {
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const value = Math.floor(progress * target);
            
            element.textContent = `${value}%`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = `${target}%`;
                element.classList.add('progress-complete');
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
}