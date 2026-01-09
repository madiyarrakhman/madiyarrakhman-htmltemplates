// ==================== //
// Wedding Invitation Platform Script
// ==================== //

// Global State
let invitationData = null;
let currentLang = 'ru';

// DOM Elements to fill
const el = {
    groom: document.querySelectorAll('.groom-name'),
    bride: document.querySelectorAll('.bride-name'),
    date: document.querySelectorAll('.wedding-date'),
    location: document.querySelectorAll('.location-name'),
    address: document.querySelectorAll('.location-address'),
    story: document.getElementById('story-text'),
    message: document.getElementById('guestMessage'), // Optional field
    rsvpSection: document.querySelector('.rsvp-section'),
    form: document.getElementById('rsvpForm')
};

// 1. Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on an invitation page: /i/:uuid
    const pathParts = window.location.pathname.split('/');
    const uuidIndex = pathParts.indexOf('i') + 1;
    const uuid = (uuidIndex > 0 && uuidIndex < pathParts.length) ? pathParts[uuidIndex] : null;

    if (uuid) {
        console.log('🔍 Loading invitation:', uuid);
        await loadInvitation(uuid);
    } else {
        console.log('ℹ️ Demo Mode (No UUID)');
        // Optional: Load demo data or leave hardcoded HTML
    }

    // Start animations
    initAnimations();
});

// 2. Fetch Data
async function loadInvitation(uuid) {
    try {
        const response = await fetch(`/api/invitations/${uuid}`);
        if (!response.ok) throw new Error('Invitation not found');

        const data = await response.json();
        invitationData = data;
        currentLang = data.lang || 'ru';

        renderInvitation(data);

    } catch (error) {
        console.error('Error loading invitation:', error);
        alert('Ошибка загрузки приглашения. Возможно, ссылка неверная.');
    }
}

// 3. Render Content
function renderInvitation(data) {
    if (!data) return;

    // Favor top-level declared fields, fallback to content for backward compat
    const groomName = data.groom_name || data.content?.groomName;
    const brideName = data.bride_name || data.content?.brideName;
    const eventDate = data.event_date || data.content?.date;
    const location = data.event_location || data.content?.location;
    const address = data.event_location || data.content?.address;
    const story = data.content?.story;

    // Names
    if (groomName) setMultiText('.groom-name', groomName);
    if (brideName) setMultiText('.bride-name', brideName);

    // Date
    if (eventDate) {
        // Check if it's a valid date string for localizing, or just plain text
        let dateStr = eventDate;
        const dateObj = new Date(eventDate);

        if (!isNaN(dateObj.getTime())) {
            dateStr = dateObj.toLocaleDateString(currentLang, {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            // Update countdown target if it's a valid date
            updateCountdown(eventDate);
        } else {
            // If it's just a text like "15 июня", just set it
            setMultiText('.wedding-date', eventDate);
        }
        setMultiText('.wedding-date', dateStr);
    }

    // Location
    const locName = data.event_location || data.content?.location;
    const locAddress = data.content?.address || ''; // Address remains in flexible content or shared

    if (locName) setMultiText('.location-name', locName);
    if (locAddress) {
        setMultiText('.location-address', locAddress);
    } else if (locName && !data.content?.address) {
        // If we only have event_location, maybe clear the address placeholder or use it if needed
        setMultiText('.location-address', '');
    }

    if (story) setMultiText('.story-text', story);

    // Map Coordinates (if provided)
    if (data.content?.coordinates) {
        // Update map link or iframe if you have one
    }

    // Hiding Sections
    if (data.content?.showRSVP === false) {
        const rsvpSec = document.querySelector('.rsvp-section');
        if (rsvpSec) rsvpSec.style.display = 'none';
    }
}

// Helper to set text for multiple elements with same class
function setMultiText(selector, text) {
    document.querySelectorAll(selector).forEach(e => e.innerText = text);
}

// 4. RSVP Handling
if (el.form) {
    el.form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!invitationData) {
            alert('Demo mode: RSVP checking disabled');
            return;
        }

        const submitBtn = el.form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Отправка...</span>';

        const formData = {
            guestName: document.getElementById('guestName').value,
            attendance: document.querySelector('input[name="attendance"]:checked').value,
            guestCount: parseInt(document.getElementById('guestCount').value)
        };

        try {
            const response = await fetch(`/api/rsvp/${invitationData.uuid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                el.form.style.display = 'none';
                document.getElementById('successMessage').classList.add('show');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('RSVP Error:', error);
            alert('Ошибка отправки: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить / Send';
        }
    });
}


// --- Animations & Visuals (Preserved from original) ---

function initAnimations() {
    // Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.slide-up').forEach(el => observer.observe(el));

    // Hearts
    createFloatingHearts();

    // Parallax
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const hero = document.querySelector('.hero-content');
        if (hero && scrollY < window.innerHeight) {
            hero.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
    });
}

function createFloatingHearts() {
    setInterval(() => {
        const heart = document.createElement('div');
        heart.innerHTML = '♥';
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.bottom = '-50px';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        heart.style.color = `hsla(${Math.random() * 60 + 320}, 80%, 60%, 0.6)`;
        heart.style.pointerEvents = 'none';
        heart.style.transition = 'all 6s linear';
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.style.bottom = '110vh';
            heart.style.transform = `translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg)`;
            heart.style.opacity = '0';
        }, 100);
        setTimeout(() => heart.remove(), 6000);
    }, 2000);
}

function updateCountdown(targetDateStr) {
    if (!targetDateStr) return;
    const target = new Date(targetDateStr).getTime();

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const dist = target - now;

        if (dist < 0) {
            clearInterval(timer);
            return;
        }
        // Logic to update timer UI elements if they exist
    }, 1000);
}

// Guest count logic
document.querySelectorAll('input[name="attendance"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const countInput = document.getElementById('guestCount');
        if (e.target.value === 'no') {
            countInput.value = 0;
            countInput.disabled = true;
        } else {
            countInput.disabled = false;
            countInput.value = 1;
        }
    });
});
