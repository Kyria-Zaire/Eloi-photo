// Main JavaScript for click.storm51 Portfolio

// Global Variables
let currentImageIndex = 0;
let portfolioImages = [];
let theme = localStorage.getItem('theme') || 'dark';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeTheme();
    initializeLoading();
    initializeCursor();
    initializeHeader();
    initializeNavigation();
    initializePortfolio();
    initializeTestimonials();
    initializeFAQ();
    initializeContact();
    initializeAnimations();
    initializeCookies();
    initializePerformance();
}

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Apply saved theme
    body.setAttribute('data-theme', theme);
    updateThemeIcon();

    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    theme = newTheme;
    updateThemeIcon();

    // Smooth transition
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        body.style.transition = '';
    }, 300);
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = `Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`;
}

// Loading Screen
function initializeLoading() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 1000);
            }
        }, 3200);
    });
}

// Custom Cursor
function initializeCursor() {
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');

    if (!cursor || !cursorFollower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursorFollower.style.left = (followerX - 20) + 'px';
        cursorFollower.style.top = (followerY - 20) + 'px';

        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .portfolio-item, .service-card, .testimonial-card, .faq-question');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('expand');
            cursorFollower.classList.add('expand');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('expand');
            cursorFollower.classList.remove('expand');
        });
    });
}

// Header Scroll Effect
function initializeHeader() {
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Navigation
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Mobile navigation toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            const header = document.getElementById('header');
            const headerHeight = header.offsetHeight;

            if (target) {
                window.scrollTo({
                    top: target.offsetTop - headerHeight,
                    behavior: 'smooth'
                });

                // Update active nav link
                updateActiveNavLink(this);

                // Close mobile menu
                navMenu.classList.remove('active');
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavOnScroll);
}

function updateActiveNavLink(clickedLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Portfolio Functionality
async function initializePortfolio() {
    // Load portfolio from API
    await loadPortfolioFromAPI();

    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    // Collect portfolio images for lightbox
    portfolioImages = Array.from(portfolioItems).map((item, index) => ({
        src: item.querySelector('img').src,
        alt: item.querySelector('img').alt,
        title: item.querySelector('.portfolio-info h3').textContent,
        description: item.querySelector('.portfolio-info p').textContent,
        category: item.getAttribute('data-category'),
        index: index
    }));

    // Portfolio filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Update filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter portfolio items
            portfolioItems.forEach((item, index) => {
                const category = item.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;

                if (shouldShow) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Portfolio lightbox
    portfolioItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

// Load portfolio from API
async function loadPortfolioFromAPI() {
    try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();

        if (data.success && data.portfolio.length > 0) {
            const grid = document.getElementById('portfolioGrid');
            if (grid) {
                renderPortfolioGrid(data.portfolio);
            }
        }
    } catch (error) {
        console.error('Erreur chargement portfolio:', error);
        // Keep default portfolio if API fails
    }
}

// Render portfolio grid dynamically
function renderPortfolioGrid(items) {
    const grid = document.getElementById('portfolioGrid');
    
    const serviceNames = {
        wedding: 'Mariage',
        portrait: 'Portrait',
        event: 'Événement',
        corporate: 'Corporate'
    };

    const existingHTML = grid.innerHTML;
    
    grid.innerHTML = items.map(item => `
        <div class="portfolio-item" data-category="${item.category}">
            <div class="portfolio-tag">${serviceNames[item.category]}</div>
            <img loading="lazy" src="${item.image}" alt="${item.title}">
            <div class="portfolio-overlay">
                <div class="portfolio-info">
                    <h3>${item.title}</h3>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // If no items from API, restore default
    if (items.length === 0) {
        grid.innerHTML = existingHTML;
    }
}

// Lightbox Functionality
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');

    const image = portfolioImages[index];

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = image.title;
    lightboxDescription.textContent = image.description;

    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Preload adjacent images
    preloadAdjacentImages(index);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % portfolioImages.length;
    updateLightboxImage();
}

function previousImage() {
    currentImageIndex = (currentImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');

    const image = portfolioImages[currentImageIndex];

    lightboxImage.style.opacity = '0';
    setTimeout(() => {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxTitle.textContent = image.title;
        lightboxDescription.textContent = image.description;
        lightboxImage.style.opacity = '1';
    }, 150);

    preloadAdjacentImages(currentImageIndex);
}

function preloadAdjacentImages(index) {
    const prevIndex = (index - 1 + portfolioImages.length) % portfolioImages.length;
    const nextIndex = (index + 1) % portfolioImages.length;

    [prevIndex, nextIndex].forEach(idx => {
        const img = new Image();
        img.src = portfolioImages[idx].src;
    });
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('show')) {
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                previousImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    }
});

// Close lightbox on background click
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeLightbox();
    }
});

// Testimonials Animation and Loading
async function initializeTestimonials() {
    // Load approved reviews from API
    await loadApprovedReviews();

    const testimonialCards = document.querySelectorAll('.testimonial-card');

    testimonialCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Load approved reviews from API
async function loadApprovedReviews() {
    try {
        const response = await fetch('/api/reviews');
        const data = await response.json();

        if (data.success && data.reviews.length > 0) {
            displayReviews(data.reviews);
        } else {
            // Si pas d'avis, afficher les avis par défaut
            displayDefaultReviews();
        }
    } catch (error) {
        console.error('Erreur chargement avis:', error);
        displayDefaultReviews();
    }
}

// Display reviews dynamically
function displayReviews(reviews) {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    const serviceNames = {
        wedding: 'Mariage',
        portrait: 'Portrait',
        event: 'Événement',
        corporate: 'Corporate',
        commercial: 'Commercial',
        artistic: 'Artistique'
    };

    const monthNames = {
        '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
        '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
        '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };

    grid.innerHTML = reviews.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        let dateText = '';
        
        if (review.date) {
            const [year, month] = review.date.split('-');
            dateText = `${monthNames[month]} ${year}`;
        } else if (review.createdAt) {
            const date = new Date(review.createdAt);
            dateText = `${monthNames[String(date.getMonth() + 1).padStart(2, '0')]} ${date.getFullYear()}`;
        }

        return `
            <div class="testimonial-card" style="opacity: 0; transform: translateY(50px);">
                <div class="testimonial-rating">
                    ${stars.split('').map(s => `<span class="star">${s}</span>`).join('')}
                </div>
                <blockquote>${review.comment}</blockquote>
                <div class="testimonial-author">
                    <img loading="lazy" src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=ff6b35&color=fff&size=60" alt="${review.name}" width="60" height="60" style="border-radius: 50%;">
                    <div>
                        <strong>${review.name}</strong>
                        <span>${serviceNames[review.service] || review.service}${dateText ? ' • ' + dateText : ''}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display default reviews if no reviews in database
function displayDefaultReviews() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="testimonial-card" style="opacity: 0; transform: translateY(50px);">
            <div class="testimonial-rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </div>
            <blockquote>
                "Eloi a immortalisé notre mariage avec une sensibilité extraordinaire. Chaque photo raconte notre histoire d'amour. Un professionnel passionné !"
            </blockquote>
            <div class="testimonial-author">
                <img loading="lazy" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=60&q=80" alt="Marie & Thomas" width="60" height="60">
                <div>
                    <strong>Marie & Thomas</strong>
                    <span>Mariage • Juin 2024</span>
                </div>
            </div>
        </div>

        <div class="testimonial-card" style="opacity: 0; transform: translateY(50px);">
            <div class="testimonial-rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </div>
            <blockquote>
                "Session portrait exceptionnelle ! Eloi a su me mettre à l'aise et révéler ma personnalité. Les photos sont magnifiques."
            </blockquote>
            <div class="testimonial-author">
                <img loading="lazy" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=60&q=80" alt="Sophie Laurent" width="60" height="60">
                <div>
                    <strong>Sophie Laurent</strong>
                    <span>Portrait Corporate • Mars 2024</span>
                </div>
            </div>
        </div>

        <div class="testimonial-card" style="opacity: 0; transform: translateY(50px);">
            <div class="testimonial-rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
            </div>
            <blockquote>
                "Un œil artistique unique ! Les photos de notre événement d'entreprise ont dépassé toutes nos attentes. Merci Eloi !"
            </blockquote>
            <div class="testimonial-author">
                <img loading="lazy" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=60&q=80" alt="David Martin" width="60" height="60">
                <div>
                    <strong>David Martin</strong>
                    <span>Événement Corporate • Janvier 2024</span>
                </div>
            </div>
        </div>
    `;
}

// FAQ Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// Contact Form
function initializeContact() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', handleFormSubmission);

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

async function handleFormSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const formData = new FormData(form);

    // Validate form
    if (!validateForm(form)) {
        showNotification('Veuillez corriger les erreurs dans le formulaire.', 'error');
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Envoi en cours...</span><span>⏳</span>';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification(result.message, 'success');
            form.reset();
            clearAllErrors();
        } else {
            if (result.errors) {
                displayFormErrors(result.errors);
            }
            showNotification(result.message || 'Erreur lors de l\'envoi du message.', 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'Ce champ est requis.';
        isValid = false;
    }
    // Email validation
    else if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Veuillez entrer une adresse email valide.';
            isValid = false;
        }
    }
    // Phone validation
    else if (fieldName === 'phone' && value) {
        const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            errorMessage = 'Veuillez entrer un numéro de téléphone français valide.';
            isValid = false;
        }
    }
    // Name validation
    else if (fieldName === 'name' && value) {
        if (value.length < 2) {
            errorMessage = 'Le nom doit contenir au moins 2 caractères.';
            isValid = false;
        }
    }
    // Message validation
    else if (fieldName === 'message' && value) {
        if (value.length < 10) {
            errorMessage = 'Le message doit contenir au moins 10 caractères.';
            isValid = false;
        }
    }

    displayFieldError(field, errorMessage);
    return isValid;
}

function displayFieldError(field, message) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        if (message) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            field.style.borderColor = 'var(--error)';
        } else {
            errorElement.classList.remove('show');
            field.style.borderColor = '';
        }
    }
}

function clearFieldError(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.classList.remove('show');
        field.style.borderColor = '';
    }
}

function displayFormErrors(errors) {
    errors.forEach(error => {
        const field = document.querySelector(`[name="${error.param}"]`);
        if (field) {
            displayFieldError(field, error.msg);
        }
    });
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputs = document.querySelectorAll('input, textarea, select');

    errorElements.forEach(error => error.classList.remove('show'));
    inputs.forEach(input => input.style.borderColor = '');
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 15px;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.4s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        max-width: 400px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 5000);
}

// Stats Counter Animation
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20);
}

// Intersection Observer for Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stats animation
                if (entry.target.classList.contains('stats-grid')) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-target'));
                        animateCounter(stat, target);
                    });
                }

                // General fade-in animation
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.portfolio-item, .service-card, .contact-card, .stats-grid, .testimonial-card, .faq-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.8s ease';
        observer.observe(el);
    });
}

// GDPR Cookie Management
function initializeCookies() {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    console.log('🍪 Initialisation des cookies...');
    console.log('Status actuel:', cookiesAccepted);

    if (!cookiesAccepted && cookieBanner) {
        console.log('Affichage de la bannière dans 2 secondes...');
        setTimeout(() => {
            cookieBanner.classList.add('show');
            console.log('✅ Bannière affichée');
            
            // Ajouter des event listeners aux boutons comme backup
            const acceptBtn = cookieBanner.querySelector('.btn-primary');
            const settingsBtn = cookieBanner.querySelector('.btn-secondary');
            
            if (acceptBtn && !acceptBtn.hasAttribute('data-listener-added')) {
                acceptBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ Clic détecté sur le bouton Accepter (event listener)');
                    acceptCookies();
                });
                acceptBtn.setAttribute('data-listener-added', 'true');
                console.log('✅ Event listener ajouté au bouton Accepter');
            }
            
            if (settingsBtn && !settingsBtn.hasAttribute('data-listener-added')) {
                settingsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ Clic détecté sur le bouton Paramètres (event listener)');
                    showCookieSettings();
                });
                settingsBtn.setAttribute('data-listener-added', 'true');
                console.log('✅ Event listener ajouté au bouton Paramètres');
            }
        }, 2000);
    } else {
        console.log('❌ Bannière non affichée (cookies déjà acceptés ou bannière introuvable)');
    }
}

function acceptCookies() {
    console.log('✅ acceptCookies() appelée');
    
    try {
        // Sauvegarder le consentement
        localStorage.setItem('cookiesAccepted', 'true');
        console.log('✅ Cookie sauvegardé dans localStorage');
        
        // Récupérer la bannière
        const cookieBanner = document.getElementById('cookieBanner');
        console.log('🍪 Bannière trouvée:', cookieBanner);
        
        if (cookieBanner) {
            // Retirer la classe show
            cookieBanner.classList.remove('show');
            console.log('✅ Classe "show" retirée');
            
            // Masquer après la transition
            setTimeout(() => {
                cookieBanner.style.display = 'none';
                console.log('✅ Bannière masquée');
            }, 400);
            
            // Afficher une notification
            showNotification('🍪 Cookies acceptés ! Merci.', 'success');
        }

        // Initialize analytics if cookies accepted
        initializeAnalytics();
    } catch (error) {
        console.error('❌ Erreur dans acceptCookies():', error);
        showNotification('Erreur lors de l\'acceptation des cookies', 'error');
    }
}

function showCookieSettings() {
    // For now, just accept cookies. In a real implementation,
    // you would show a detailed cookie settings modal
    acceptCookies();
}

function initializeAnalytics() {
    // Initialize Google Analytics or other tracking
    // This would be implemented based on your analytics needs
    console.log('Analytics initialized');
}

// Performance Optimizations
function initializePerformance() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger loading
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    // Preload critical resources
    preloadCriticalResources();
}

function preloadCriticalResources() {
    // Preload hero image
    const heroImage = new Image();
    heroImage.src = 'https://images.unsplash.com/photo-1542038784456-1ea8e732d2b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

    // Preload first portfolio images
    const portfolioItems = document.querySelectorAll('.portfolio-item img');
    Array.from(portfolioItems).slice(0, 4).forEach(img => {
        const preloadImg = new Image();
        preloadImg.src = img.src;
    });
}

// Enhanced Scroll Effects
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Parallax effect on hero background
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transform = `translateY(${rate}px)`;
    }

    // Update scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.style.opacity = scrolled > 100 ? '0' : '1';
    }
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Cookie testing functions
function testCookies() {
    const confirmed = confirm('Voulez-vous réinitialiser les cookies pour tester la bannière ?');
    if (confirmed) {
        localStorage.removeItem('cookiesAccepted');
        showNotification('Cookies supprimés ! Rechargez la page pour voir la bannière.', 'success');

        // Show test button temporarily
        const testBtn = document.getElementById('testCookiesBtn');
        if (testBtn) {
            testBtn.style.display = 'block';
            setTimeout(() => {
                testBtn.style.display = 'none';
            }, 3000);
        }
    }
}

function showTestButton() {
    // Show test button if we're in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const testBtn = document.getElementById('testCookiesBtn');
        if (testBtn) {
            testBtn.style.display = 'block';
        }
    }
}

// Enhanced debug mode
function enableCookieDebug() {
    console.log('🍪 Cookie Debug Mode activé');
    console.log('Status actuel:', localStorage.getItem('cookiesAccepted'));

    // Show banner immediately for testing
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        cookieBanner.classList.add('show');
        showTestButton();
    }

    // Add debug info to page
    const debugInfo = document.createElement('div');
    debugInfo.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #333;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10001;
        font-family: monospace;
    `;
    debugInfo.innerHTML = `
        🍪 Cookie Status: ${localStorage.getItem('cookiesAccepted') || 'Non défini'}<br>
        🌐 Host: ${window.location.hostname}<br>
        📱 UserAgent: ${navigator.userAgent.substring(0, 30)}...
    `;
    document.body.appendChild(debugInfo);

    setTimeout(() => {
        document.body.removeChild(debugInfo);
    }, 5000);
}

// Expose global functions for HTML onclick handlers
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.previousImage = previousImage;
window.acceptCookies = acceptCookies;
window.showCookieSettings = showCookieSettings;
window.testCookies = testCookies;
window.enableCookieDebug = enableCookieDebug;

// Vérifier que les fonctions sont bien disponibles
console.log('🔧 Fonctions globales exposées:', {
    closeLightbox: typeof window.closeLightbox,
    acceptCookies: typeof window.acceptCookies,
    showCookieSettings: typeof window.showCookieSettings,
    testCookies: typeof window.testCookies
});