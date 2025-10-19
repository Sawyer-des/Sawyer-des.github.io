/**
 * Photography Portfolio - Main JavaScript
 * Handles image slideshows, transitions, and interactive features
 */

// Image catalog
const imageCounts = {
    '2018': 143,
    '2019': 48,
    '2020': 50,
    '2021': 69
};

const excludedImages = {
    '2019': [37],
    '2021': [1, 54, 55, 60, 64, 65, 68, 74]
};

function getRandomImage(year) {
    const count = imageCounts[year];
    if (!count || count === 0) return null;
    
    const excluded = excludedImages[year] || [];
    let randomNum;
    let attempts = 0;
    
    do {
        randomNum = Math.floor(Math.random() * count) + 1;
        attempts++;
    } while (excluded.includes(randomNum) && attempts < 100);
    
    return `900w_${year}/900w_${year}_(${randomNum}).webp`;
}

const _inflight = new WeakMap();

function crossFadeImage(img, newSrc, newAlt, newDataFull = null) {
    if (!img || !newSrc) return;
    if (_inflight.get(img)) return;
    const current = img.getAttribute('src');
    if (current && current === newSrc) return;
    _inflight.set(img, true);

    const preloadImg = new window.Image();
    preloadImg.src = newSrc;
    preloadImg.alt = newAlt;
    if (newDataFull) preloadImg.setAttribute('data-full', newDataFull);
    
    preloadImg.onload = function () {
        const fadeImg = document.createElement('img');
        fadeImg.src = newSrc;
        fadeImg.alt = newAlt;
        if (newDataFull) fadeImg.setAttribute('data-full', newDataFull);
        
        const isPortrait = preloadImg.naturalHeight > preloadImg.naturalWidth;
        fadeImg.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            object-fit: ${isPortrait ? 'contain' : 'cover'};
            background-color: #212529;
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
            z-index: 2;
            pointer-events: none;
        `;
        
        const parent = img.parentNode;
        if (!parent) { 
            _inflight.delete(img); 
            return; 
        }
        
        const prevPos = window.getComputedStyle(parent).position;
        if (prevPos === 'static') parent.style.position = 'relative';
        parent.appendChild(fadeImg);
        
        fadeImg.offsetHeight;
        requestAnimationFrame(() => {
            fadeImg.style.opacity = '1';
        });

        setTimeout(() => {
            img.src = fadeImg.src;
            img.alt = fadeImg.alt;
            if (newDataFull) img.setAttribute('data-full', fadeImg.getAttribute('data-full'));
            
            setPortraitClass(img, preloadImg.naturalWidth, preloadImg.naturalHeight);
            
            if (img.complete) {
                markPortrait(img);
            } else {
                img.addEventListener('load', () => markPortrait(img), { once: true });
            }
            
            fadeImg.remove();
            _inflight.delete(img);
        }, 1500);
    };
    
    preloadImg.onerror = function() {
        _inflight.delete(img);
    };
}


// Home page featured work slideshow
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;

    const featuredItems = document.querySelectorAll('.featured-item');
    featuredItems.forEach((item, idx) => {
        const img = item.querySelector('img');
        const yearMatch = img && img.src.match(/images\/(\d{4})\//);
        const year = yearMatch ? yearMatch[1] : null;
        if (!img || !year) return;
        
        const initialImgName = getRandomImage(year);
        if (initialImgName) {
            const initialSrc = `images/${year}/${initialImgName}`;
            const initialFull = initialSrc.replace('/900w_', '/1600w_');
            img.src = initialSrc;
            img.setAttribute('data-full', initialFull);
            if (img.complete) {
                markPortrait(img);
            } else {
                img.addEventListener('load', () => markPortrait(img), { once: true });
            }
        }
        
        setInterval(() => {
            const newImgName = getRandomImage(year);
            if (newImgName) {
                const nextSrc = `images/${year}/${newImgName}`;
                if (img.getAttribute('src') !== nextSrc && !_inflight.get(img)) {
                    crossFadeImage(img, nextSrc, img.alt);
                }
            }
        }, 7000 + idx * 400);
    });
});

// Image performance and orientation detection
document.addEventListener('DOMContentLoaded', function () {
    const selector = '.gallery-grid img, .year-card-image img, .highlight-img, .featured-item img, .year-preview-img';
    const candidates = document.querySelectorAll(selector);
    candidates.forEach(img => {
        if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
        if (!img.getAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
        if (img.complete) {
            markPortrait(img);
        } else {
            img.addEventListener('load', () => markPortrait(img));
        }
    });
    window.addEventListener('load', function () {
        document.querySelectorAll(selector).forEach(img => markPortrait(img));
    });
    setTimeout(function() {
        document.querySelectorAll(selector).forEach(img => markPortrait(img));
    }, 2000);
});

function markPortrait(imgEl) {
    try {
        const { naturalWidth: w, naturalHeight: h } = imgEl;
        if (!w || !h) return;
        
        let item = imgEl.closest('.gallery-item');
        if (item) {
            if (w && h && h > w) {
                item.classList.add('portrait');
            } else {
                item.classList.remove('portrait');
            }
        }
        item = imgEl.closest('.year-card-image');
        if (item) {
            if (w && h && h > w) {
                item.classList.add('portrait');
            } else {
                item.classList.remove('portrait');
            }
        }
        item = imgEl.closest('.featured-item');
        if (item) {
            if (w && h && h > w) {
                item.classList.add('portrait');
            } else {
                item.classList.remove('portrait');
            }
        }
    } catch (_) {}
}

function setPortraitClass(imgEl, w, h) {
    try {
        let item = imgEl.closest('.gallery-item');
        if (item) {
            if (w && h && h > w) item.classList.add('portrait'); else item.classList.remove('portrait');
        }
        item = imgEl.closest('.year-card-image');
        if (item) {
            if (w && h && h > w) item.classList.add('portrait'); else item.classList.remove('portrait');
        }
        item = imgEl.closest('.featured-item');
        if (item) {
            if (w && h && h > w) item.classList.add('portrait'); else item.classList.remove('portrait');
        }
    } catch (_) {}
}

// Gallery page year selector and highlights
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('gallery.html')) return;

    function getRandomImages(count) {
        const result = [];
        const used = new Set();
        const years = ['2018', '2019', '2020', '2021'];
        const excluded = excludedImages || {};
        
        let attempts = 0;
        const maxAttempts = count * 50;
        
        while (result.length < count && attempts < maxAttempts) {
            attempts++;
            const year = years[Math.floor(Math.random() * years.length)];
            const imageCount = imageCounts[year];
            const randomNum = Math.floor(Math.random() * imageCount) + 1;
            
            if (excluded[year] && excluded[year].includes(randomNum)) {
                continue;
            }
            
            const imageKey = `${year}_${randomNum}`;
            
            if (used.has(imageKey)) {
                continue;
            }
            
            used.add(imageKey);
            const imgPath = {
                year: year,
                path: `900w_${year}/900w_${year}_(${randomNum}).webp`,
                fullPath: `1600w_${year}/1600w_${year}_(${randomNum}).webp`
            };
            result.push(imgPath);
        }
        return result;
    }

    const yearGrid = document.getElementById('year-grid');
    if (yearGrid) {
        yearGrid.innerHTML = '';
        ['2021','2020','2019','2018'].forEach(year => {
            const imgName = getRandomImage(year);
            const card = document.createElement('a');
            card.href = `gallery-${year}.html`;
            card.className = 'year-card';
            card.innerHTML = `
                <div class="year-card-image">
                    <img src="images/${year}/${imgName}" alt="${year} Gallery Preview" loading="lazy" decoding="async" fetchpriority="low">
                </div>
                <div class="year-card-content">
                    <h3>${year}</h3>
                    <p>${imageCounts[year]} Photos</p>
                    ${year === '2021' ? '<span class="year-badge">Latest</span>' : ''}
                </div>
            `;
            yearGrid.appendChild(card);
            const imgEl = card.querySelector('.year-card-image img');
            if (imgEl) {
                if (imgEl.complete) {
                    markPortrait(imgEl);
                } else {
                    imgEl.addEventListener('load', () => markPortrait(imgEl), { once: true });
                }
            }
        });

        setInterval(() => {
            const yearCards = document.querySelectorAll('.year-card');
            yearCards.forEach((card, idx) => {
                setTimeout(() => {
                    const year = card.href.match(/gallery-(\d{4})\.html/)[1];
                    const img = card.querySelector('.year-card-image img');
                    const newImgName = getRandomImage(year);
                    if (img && newImgName) {
                        const nextSrc = `images/${year}/${newImgName}`;
                        if (img.getAttribute('src') !== nextSrc && !_inflight.get(img)) {
                            crossFadeImage(img, nextSrc, `${year} Gallery Preview`);
                        }
                    }
                }, idx * 900);
            });
    }, 7000);
    }

    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        galleryGrid.innerHTML = '';
        const highlightImages = getRandomImages(9);
        highlightImages.forEach(imgData => {
            const item = document.createElement('article');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="images/${imgData.year}/${imgData.path}" alt="${imgData.year} Highlight" loading="lazy" decoding="async" fetchpriority="low" data-full="images/${imgData.year}/${imgData.fullPath}">
            `;
            galleryGrid.appendChild(item);
            const imgEl = item.querySelector('img');
            if (imgEl) {
                if (imgEl.complete) {
                    markPortrait(imgEl);
                } else {
                    imgEl.addEventListener('load', () => markPortrait(imgEl), { once: true });
                }
            }
        });

        setInterval(() => {
            const galleryItems = document.querySelectorAll('#gallery-grid .gallery-item img');
            galleryItems.forEach((img, idx) => {
                setTimeout(() => {
                    const newImages = getRandomImages(1)[0];
                    const nextSrc = `images/${newImages.year}/${newImages.path}`;
                    if (img.getAttribute('src') !== nextSrc && !_inflight.get(img)) {
                        crossFadeImage(img, nextSrc, `${newImages.year} Highlight`, `images/${newImages.year}/${newImages.fullPath}`);
                    }
                }, idx * 600);
            });
    }, 7000);
    }
});

// Navigation and user interface
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
        
        const navLinks = document.querySelectorAll('.nav-menu a:not(.dropdown > a)');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    // Mobile touch support for dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownLink && dropdownMenu) {
            // Handle click/touch on mobile to toggle dropdown instead of navigate
            dropdownLink.addEventListener('click', function(e) {
                // Check if mobile menu is active (viewport < 768px)
                const isMobile = window.innerWidth < 768;
                
                if (isMobile) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event from bubbling
                    dropdownMenu.classList.toggle('show');
                }
            });
            
            // Close dropdown when clicking a year link
            const yearLinks = dropdownMenu.querySelectorAll('a');
            yearLinks.forEach(yearLink => {
                yearLink.addEventListener('click', function() {
                    dropdownMenu.classList.remove('show');
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
            
            // Keyboard navigation for dropdowns
            dropdownLink.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdownMenu.classList.toggle('show');
                    const firstLink = dropdownMenu.querySelector('a');
                    if (firstLink && dropdownMenu.classList.contains('show')) {
                        firstLink.focus();
                    }
                } else if (e.key === 'Escape') {
                    dropdownMenu.classList.remove('show');
                }
            });
            
            const menuLinks = dropdownMenu.querySelectorAll('a');
            menuLinks.forEach((link, index) => {
                link.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        dropdownMenu.classList.remove('show');
                        dropdownLink.focus();
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextLink = menuLinks[index + 1];
                        if (nextLink) nextLink.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevLink = menuLinks[index - 1];
                        if (prevLink) {
                            prevLink.focus();
                        } else {
                            dropdownLink.focus();
                        }
                    }
                });
            });
        }
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Gallery filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hidden');
                    item.style.animation = 'none';
                    setTimeout(() => {
                        item.style.animation = 'fadeIn 0.6s ease';
                    }, 10);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
    
    // Image modal
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalTitle');
    const modalClose = document.querySelector('.modal-close');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const title = this.querySelector('.gallery-overlay h3')?.textContent || '';
            const description = this.querySelector('.gallery-overlay p')?.textContent || '';
            
            modal.classList.add('active');
            modalImage.src = img.dataset.full || img.src;
            modalImage.alt = img.alt;
            modalCaption.textContent = title + (description ? ' - ' + description : '');
            
            document.body.style.overflow = 'hidden';
            modalClose.focus();
        });
        
        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const statusEl = document.getElementById('contact-status');
            const btn = contactForm.querySelector('button[type="submit"]');

            statusEl.textContent = 'Sending…';
            statusEl.style.color = 'var(--color-dark)';
            btn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const res = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    statusEl.textContent = 'Thanks! Your message has been sent.';
                    statusEl.style.color = 'green';
                    contactForm.reset();
                } else {
                    const data = await res.json();
                    statusEl.textContent = data.error || 'Oops! There was a problem submitting your form.';
                    statusEl.style.color = '#b00020';
                }
            } catch (err) {
                statusEl.textContent = 'Network error. Please check your connection and try again.';
                statusEl.style.color = '#b00020';
            } finally {
                btn.disabled = false;
            }
        });
    }
    
    // Active navigation on scroll
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    let ticking = false;
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const section = document.querySelector(href);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Lazy loading fallback
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.src;
        });
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
    
    // Performance optimization
    if (navigator.connection && navigator.connection.saveData) {
        document.body.classList.add('save-data');
    }
    
    // Modal keyboard navigation
    let focusableElements;
    let firstFocusableElement;
    let lastFocusableElement;
    
    modal.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;
        
        focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
    
});