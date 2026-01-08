// ==================== //
// Intersection Observer for Scroll Animations
// ==================== //

const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with slide-up class
document.addEventListener('DOMContentLoaded', () => {
    const slideUpElements = document.querySelectorAll('.slide-up');
    slideUpElements.forEach(el => observer.observe(el));
});

// ==================== //
// RSVP Form Handling
// ==================== //

const rsvpForm = document.getElementById('rsvpForm');
const successMessage = document.getElementById('successMessage');

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('guestName').value,
        email: document.getElementById('guestEmail').value,
        phone: document.getElementById('guestPhone').value,
        attendance: document.querySelector('input[name="attendance"]:checked').value,
        guestCount: document.getElementById('guestCount').value,
        message: document.getElementById('guestMessage').value
    };
    
    // Log form data (in production, you would send this to a server)
    console.log('RSVP Submission:', formData);
    
    // Show success message
    rsvpForm.style.display = 'none';
    successMessage.classList.add('show');
    
    // Optional: Send data to server
    // fetch('/api/rsvp', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ==================== //
// Smooth Scroll Enhancement
// ==================== //

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

// ==================== //
// Parallax Effect for Hero
// ==================== //

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const hero = document.querySelector('.hero-content');
    
    if (hero && scrollY < window.innerHeight) {
        const opacity = 1 - (scrollY / window.innerHeight);
        const translateY = scrollY * 0.5;
        
        hero.style.opacity = opacity;
        hero.style.transform = `translateY(${translateY}px)`;
    }
    
    lastScrollY = scrollY;
});

// ==================== //
// Guest Count Validation
// ==================== //

const guestCountInput = document.getElementById('guestCount');
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'no') {
            guestCountInput.value = 0;
            guestCountInput.disabled = true;
        } else {
            guestCountInput.disabled = false;
            guestCountInput.value = 1;
        }
    });
});

// ==================== //
// Dynamic Star Background
// ==================== //

function createFloatingHearts() {
    const container = document.querySelector('.container');
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.innerHTML = '♥';
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.bottom = '-50px';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        heart.style.color = `hsl(${Math.random() * 60 + 320}, 82%, ${Math.random() * 30 + 50}%)`;
        heart.style.opacity = '0.6';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '0';
        heart.style.transition = 'all 6s linear';
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.style.bottom = '110vh';
            heart.style.opacity = '0';
            heart.style.transform = `translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 360}deg)`;
        }, 100);
        
        setTimeout(() => {
            heart.remove();
        }, 6100);
    }, 3000);
}

// Start floating hearts animation
createFloatingHearts();

// ==================== //
// Countdown Timer (Optional)
// ==================== //

function updateCountdown() {
    const weddingDate = new Date('2026-06-15T15:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;
    
    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // You can display this countdown somewhere if needed
        console.log(`${days}д ${hours}ч ${minutes}м ${seconds}с до свадьбы`);
    }
}

// Update countdown every second
setInterval(updateCountdown, 1000);

// ==================== //
// Add Sparkle Effect on Mouse Move
// ==================== //

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.95) { // Only create sparkles occasionally
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = 'var(--color-accent)';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.style.boxShadow = '0 0 10px var(--color-accent)';
        sparkle.style.animation = 'sparkle 1s ease-out forwards';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }
});

// Add sparkle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(style);

// ==================== //
// Preload Images (if any are added later)
// ==================== //

window.addEventListener('load', () => {
    console.log('Wedding invitation loaded successfully! 💍');
});
