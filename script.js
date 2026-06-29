document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
            }
        });
    });

    /* ==========================================================================
       Scroll Header & Active Navigation Links
       ========================================================================== */
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky Header Styling
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.background = 'rgba(8, 8, 12, 0.9)';
            header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.padding = '15px 0';
            header.style.background = 'rgba(8, 8, 12, 0.7)';
            header.style.boxShadow = 'none';
        }

        // Active Link Highlight
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       Scroll Reveal Animations
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');

    // Add hidden class to elements immediately on load if JS is active
    revealElements.forEach(element => {
        element.classList.add('reveal-hidden');
    });

    const revealOnScroll = () => {
        const triggerBottom = (window.innerHeight / 10) * 8.5;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                element.classList.remove('reveal-hidden');
                element.classList.add('reveal-visible');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once on load to reveal above-the-fold elements

    /* ==========================================================================
       Interactive Budget/Service Calculator
       ========================================================================== */
    const checkboxes = document.querySelectorAll('.service-checkbox');
    const summaryFixedPrice = document.getElementById('summary-fixed-price');
    const summaryAdsPrice = document.getElementById('summary-ads-price');
    const summaryTotalPrice = document.getElementById('summary-total-price');
    
    // Ads elements
    const adsServiceCheckbox = document.getElementById('ads-service-checkbox');
    const adsBudgetContainer = document.getElementById('adsBudgetContainer');
    const adsBudgetInput = document.getElementById('adsBudgetInput');
    const adsFeeLabel = document.getElementById('adsFeeLabel');

    // Format currency helper
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'đ');
    };

    const calculateBudget = () => {
        let fixedTotal = 0;
        let adsFee = 0;
        let hasAds = adsServiceCheckbox ? adsServiceCheckbox.checked : false;

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const type = cb.dataset.type;
                const price = parseFloat(cb.dataset.price);

                if (type !== 'percent') {
                    fixedTotal += price;
                }
            }
        });

        // If ads is checked, calculate real 15% fee
        if (hasAds && adsBudgetContainer && adsBudgetInput && adsFeeLabel) {
            adsBudgetContainer.style.display = 'block';
            let budget = parseFloat(adsBudgetInput.value) || 0;
            
            // Limit budget to at least 0
            if (budget < 0) {
                budget = 0;
                adsBudgetInput.value = 0;
            }
            
            adsFee = Math.round(budget * 0.15);
            adsFeeLabel.textContent = formatCurrency(adsFee);
            
            summaryAdsPrice.textContent = formatCurrency(adsFee);
            summaryAdsPrice.style.color = 'var(--primary-magenta)';
        } else {
            if (adsBudgetContainer) {
                adsBudgetContainer.style.display = 'none';
            }
            summaryAdsPrice.textContent = 'Chưa chọn';
            summaryAdsPrice.style.color = 'var(--text-muted)';
        }

        // Update fixed price display
        summaryFixedPrice.textContent = formatCurrency(fixedTotal);

        // Total display (Fixed + Ads Fee)
        let total = fixedTotal + adsFee;
        summaryTotalPrice.textContent = formatCurrency(total);
    };

    // Add card click toggle logic
    const calcCards = document.querySelectorAll('.calc-option');
    calcCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const checkbox = card.querySelector('.service-checkbox');
            
            // If clicking inputs or the ads budget container, do nothing
            if (e.target.tagName === 'INPUT' || (e.target.closest && e.target.closest('#adsBudgetContainer'))) {
                return;
            }
            
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });
    });

    // Add change listeners to inputs
    checkboxes.forEach(cb => {
        cb.addEventListener('change', calculateBudget);
    });

    if (adsBudgetInput) {
        // Recalculate as the user types their budget
        adsBudgetInput.addEventListener('input', calculateBudget);
        adsBudgetInput.addEventListener('change', calculateBudget);
    }

    // Run calculation once to initialize
    calculateBudget();

    /* ==========================================================================
       Form Submissions (Demonstration)
       ========================================================================== */
    const quoteForm = document.getElementById('quoteForm');
    const formSuccess = document.getElementById('formSuccess');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('calcName').value;
            const phone = document.getElementById('calcPhone').value;
            
            // Get selected services
            const selectedServices = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    selectedServices.push(cb.value);
                }
            });

            console.log('--- ĐƠN YÊU CẦU BÁO GIÁ (CALCULATOR) ---');
            console.log('Tên liên hệ:', name);
            console.log('Số điện thoại:', phone);
            console.log('Dịch vụ chọn:', selectedServices);
            console.log('Tổng giá hiển thị:', summaryTotalPrice.textContent);

            // Hide form and show success message
            quoteForm.style.display = 'none';
            formSuccess.style.display = 'flex';

            // Reset form after a while (for demo)
            setTimeout(() => {
                quoteForm.reset();
                quoteForm.style.display = 'block';
                formSuccess.style.display = 'none';
                calculateBudget();
            }, 6000);
        });
    }

    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactFormSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const brandName = document.getElementById('brandName').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            console.log('--- ĐĂNG KÝ TƯ VẤN (CONTACT FORM) ---');
            console.log('Họ & Tên:', fullName);
            console.log('Tên quán:', brandName);
            console.log('Điện thoại:', phone);
            console.log('Email:', email);
            console.log('Yêu cầu:', message);

            // Hide form inputs and show success message
            contactForm.style.display = 'none';
            contactSuccess.style.display = 'flex';

            // Reset form after a while (for demo)
            setTimeout(() => {
                contactForm.reset();
                contactForm.style.display = 'block';
                contactSuccess.style.display = 'none';
            }, 6000);
        });
    }

    /* ==========================================================================
       Rive Animation Initialization (Base64 Inlined to Bypass Local CORS)
       ========================================================================== */
    const RIVE_BASE64 = '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Dyar4zL/JxWJTz8AEwUPJqvjMgAnHqolPwATBQ8mq+MyACettXY/AAMFBQ0AAIC3AAQFFBQAnxFDFQCfEUMAEgVBJf////8ALwVBcm8Sgzp1AQASBUIl/////wAvBUJybxKDOnTNzEw9dQEAEgVDJf////8ALwVDcm8Sgzp0zczMPXUBABIFRCX/////AC8FRHJvEoM6dJqZGT51AQASBUUl/////wAvBUVybxKDOnTNzEw+dQEAEgVGJf////8ALwVGcm8Sgzp0AACAPnUBABIFRyX/////AC8FR3JvEoM6dJqZmT51AQASBUgl/////wAvBUhybxKDOnQzM7M+dQEAEgVJJf////8ALwVJcm8Sgzp0zczMPnUBABIFSiX/////AC8FSnJvEoM6dGZm5j51AQASBUsl/////wAvBUkybxKDOnQAAAA/dQEAEgVMJf////8ALwVMcm8Sgzp0zcwMP3UBABIFTSX/////AC8FTXJvEoM6dJqZGT91AQASBU4l/////wAvBU5ybxKDOnRmZiY/dQEAEgVPJf////8ALwVPcm8Sgzp0MzMzP3UBABIFUCX/////AC8FUHJvEoM6dAAAQD91AQASBVEl/////wAvBVFybxKDOnTNzEw/dQEAEgVSJf////8ALwVScm8Sgzp0mplZP3UBABIFUyX/////AC8FU3JvEoM6dGZmZj91AQASBVQl/////wAvBVRybxKDOnQzM3M/dQEAFAUAKQAAFAUGABQFDQAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAYBRQvAACAQDABMQEyAAAcP45p7z5AYGBgO0FnyTM/QgkJfj8AHD8GOf0+QL69vbpBaG4IP0Lc238/ABwAHD/8EH4+QCcntz4AHEG0ZEI/Qvp5ID8AHzcEbG9vcDnwATsBABkzEgAaNSYAJUQBWKvjMgAAJUM8RAFY45cyAAAlQ3hEAVjYMuMAACVDtAFEAVjjlzIAACVD8AFEAVir4zIAABo1JwAeRAFGHqolPwAeQ3hEAUavIiY/AB5D8AFEAUYeqiU/ABkzBAAaNRAAHkQCRVVGAACAPwAeQ3hEAkVWRgAAwD8AHkPwAUQCRVdGAACAPwAaNREAHkQCRVVGAACAPwAeQ3hEAkVWRgAAwD8AHkPwAUQCRVdGAACAPwAZMwUAGjUSAB5EAUbNzEw+AB5DWUQBRgAAgD8AHkOYAUQBRgAAgD8AHkPwAUQBRs3MTD4AGjUPAB5EAQAeQ/ABRAEAGTMRABo1JgAlRAFYq+My/wAlQzxEAVj7ZTv/ACVDeEQBWNM7+/8AJUO0AUQBWPtlO/8AJUPwAUQBWKvjMv8AGjUnAB5EAUYViU8/AB5D8AFEAUYViU8/ABkzEwAaNSYAJUQBWKvjMgAAJUM8RAFY44MyAAAlQ3hEAViuMuMAACVDtAFEAVjjgzIAACVD8AFEAVir4zIAABo1JwAeRAFGrbV2PwAeQ/ABRAFGrbV2PwAZMxAAGjUmACVEAVir4zIAACVDPEQBWOMyfAAAJUN4RAFYczLjAAAlQ7QBRAFY4zJ8AAAlQ/ABRAFYq+MyAAAaNScAHkQBAB5D8AFEAQAZMwMAGjURAB5EAkVXRgAAgD4AHkN4RAJFV0ZmZiY/AB5D8AFEAkVXRgAAgD4AGjUOAB5EAkVYRkgYn8EAHkM8RAJFV0aTCjTCAB5DtAFEAkVZRiFqBsEAHkPwAUQBRrgen8EANTcPU3RhdGUgTWFjaGluZSAxADmKAQdMYXllciAxAD2VAQAAPwBBlwEAAEAAPgABBAVmaW5hbAf3pktECEaFVUQJACDPRAoAAMLC7AEAAAIEBFJvb3QFAA3wTc9DDkaF1UMAXAQEY29tcAUBEAAAwD8RAADAPw3nkhDEDgAAFsTFAQAAYAUCxgEAABIFBSUAAAD/ABQFAAAfNwRmYXN0OwEAGTMDABo1yQEAVLUBAQAaNccBAB5EAUYAAIBAAB83BHNsb3c54AM7AQAZMwMAGjXJAQBUtQEBABo1xwEAHkQBRgAAAD8ANTcPU3RhdGUgTWFjaGluZSAxADiKAQVzcGVlZAA5igEFcmVzZXQAQAA+AD8AQZcBAwA9lQEBADmKAQdMYXllciAxAEynAQAAS6UBAQBLpQEApgEAAMhCAD4APwBBlwEAAEAA';

    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const riveCanvas = document.getElementById('riveCanvas');
    if (riveCanvas && typeof rive !== 'undefined') {
        try {
            const r = new rive.Rive({
                buffer: base64ToArrayBuffer(RIVE_BASE64),
                canvas: riveCanvas,
                autoplay: true,
                onLoad: () => {
                    r.resizeDrawingBuffer();
                    r.resizeToCanvas();
                }
            });
            
            // Handle window resizing
            window.addEventListener('resize', () => {
                if (r) {
                    r.resizeDrawingBuffer();
                    r.resizeToCanvas();
                }
            });
        } catch (err) {
            console.error('Lỗi khi tải hoạt ảnh Rive:', err);
        }
    }
});
