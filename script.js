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

// UI Translations (Loaded dynamically)
let UI_TRANSLATIONS = {};

async function loadTranslations(lang) {
    if (UI_TRANSLATIONS[lang]) return UI_TRANSLATIONS[lang];
    try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) throw new Error(`Could not load translations for ${lang}`);
        const data = await response.json();
        UI_TRANSLATIONS[lang] = data[lang]; // structure is { "ru": { ... } }
        return UI_TRANSLATIONS[lang];
    } catch (e) {
        console.error('Translation load error:', e);
        // Fallback to minimal if fetch fails
        return null;
    }
}

// 3. Render Content
async function renderInvitation(data) {
    if (!data) return;

    // Load and Apply translations
    const t = await loadTranslations(currentLang) || await loadTranslations('ru');
    if (t) translateUI(t);

    // Favor top-level declared fields (camelCase from repository)
    const groomName = data.groomName || data.groom_name || data.content?.groomName;
    const brideName = data.brideName || data.bride_name || data.content?.brideName;
    const eventDate = data.eventDate || data.event_date || data.content?.date;
    const location = data.eventLocation || data.event_location || data.content?.location;
    const address = data.content?.address || '';
    const story = data.content?.story;

    // Names
    if (groomName) setMultiText('.groom-name', groomName);
    if (brideName) setMultiText('.bride-name', brideName);

    // Date
    if (eventDate) {
        let dateStr = eventDate;
        const dateObj = new Date(eventDate);

        if (!isNaN(dateObj.getTime())) {
            dateStr = dateObj.toLocaleDateString(currentLang, {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            updateCountdown(eventDate);
        }
        setMultiText('.wedding-date', dateStr);
        // Also for silk-ivory specific ID
        const heroDate = document.getElementById('hero-date');
        if (heroDate) heroDate.innerText = dateStr;
    }

    // Location
    if (location) setMultiText('.location-name', location);
    if (address) {
        setMultiText('.location-address', address);
    } else if (location && !data.content?.address) {
        setMultiText('.location-address', '');
    }

    // Story
    const finalStory = story || (t ? t.default_story : '');
    if (finalStory) setMultiText('.story-text', finalStory);

    // Hiding Sections
    if (data.content?.showRSVP === false) {
        const rsvpSec = document.querySelector('.rsvp-section');
        if (rsvpSec) rsvpSec.style.display = 'none';
    }
}

// 4. Translate UI
function translateUI(t) {
    if (!t) return;

    // --- Common Elements ---
    setMultiText('.subtitle', t.invite_text);
    setMultiText('.hero-invite-text', t.invite_text_silk); // Specific to silk
    setMultiText('.scroll-down', t.scroll_down); // Text might be hidden in CSS but good to have
    setMultiText('.action-link', t.map_link);

    // --- Sections Titles ---
    // We try to find specific section headers by ID first, then fall back to class
    // For Story section in Silk template (it has no ID, but it's the first section after header)
    const storyTitle = document.querySelector('.story-section .section-title') ||
        document.querySelector('header + section .section-title');
    if (storyTitle) storyTitle.innerText = t.story_title;

    const galleryTitle = document.querySelector('#gallery .section-title');
    if (galleryTitle) galleryTitle.innerText = t.gallery_title_silk || t.gallery_title;

    const detailsTitle = document.querySelector('#schedule .section-title'); // Silk uses #schedule for details/program
    if (detailsTitle) detailsTitle.innerText = t.details_title_silk;

    const locationTitle = document.querySelector('#location .section-title');
    if (locationTitle) locationTitle.innerText = t.location_title_silk;

    const rsvpTitle = document.querySelector('#rsvp .section-title');
    if (rsvpTitle) rsvpTitle.innerText = t.rsvp_title_silk || t.rsvp_title;

    // --- Schedule Items (Silk Specific) ---
    const scheduleItems = document.querySelectorAll('.schedule-item');
    if (scheduleItems.length > 0 && t.schedule) {
        scheduleItems.forEach((item, index) => {
            if (t.schedule[index]) {
                const timeEl = item.querySelector('.time');
                const nameEl = item.querySelector('.event-name');
                const descEl = item.querySelector('.detail-subtext');
                if (timeEl) timeEl.innerText = t.schedule[index].time;
                if (nameEl) nameEl.innerText = t.schedule[index].name;
                if (descEl) descEl.innerText = t.schedule[index].desc;
            }
        });
    }

    // --- RSVP Form ---
    setMultiText('.rsvp-text', t.rsvp_text);
    const rsvpSubtext = document.querySelector('#rsvp p'); // Subtext under title
    if (rsvpSubtext) rsvpSubtext.innerText = t.rsvp_text_silk;

    // Inputs & Labels
    const inputs = document.querySelectorAll('#rsvpForm input');
    inputs.forEach(input => {
        const label = input.previousElementSibling || input.parentElement.previousElementSibling;

        if (input.id === 'guestName') {
            if (label && label.tagName === 'LABEL') label.innerText = t.name_label;
            input.placeholder = t.name_placeholder_silk;
        }
        if (input.id === 'guestCount') {
            const group = input.closest('.input-group');
            if (group) {
                const l = group.querySelector('label');
                if (l) l.innerText = t.guest_count_label;
            }
        }
    });

    // Attendance Radio Labels (Silk structure is different)
    const radioLabels = document.querySelectorAll('.radio-option span');
    if (radioLabels.length >= 2) {
        radioLabels[0].innerText = t.attending_yes_silk;
        radioLabels[1].innerText = t.attending_no_silk;
    }

    // Attendance Label Group
    const attendanceGroup = document.querySelector('.radio-options');
    if (attendanceGroup) {
        const parent = attendanceGroup.closest('.input-group');
        if (parent) {
            const l = parent.querySelector('label');
            if (l) l.innerText = t.attendance_label || "Ваше присутствие";
        }
    }

    // Buttons & Messages
    setMultiText('.submit-btn span', t.submit_btn); // Standard
    setMultiText('.submit-silk', t.submit_btn); // Silk

    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        const title = successDiv.querySelector('p:first-child');
        const text = successDiv.querySelector('p:last-child');
        if (title) title.innerText = t.success_title_silk || t.success_title;
        if (text) text.innerText = t.success_text_silk || t.success_text;
    }

    // Footer
    const footerText = document.querySelector('footer p');
    if (footerText) footerText.innerText = t.footer_copyright || "2026 — FOREVER";
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

    // Gallery Auto-slide
    const gallery = document.querySelector('.gallery-slider');
    if (gallery) {
        const step = 1;
        const delay = 30;
        let slideInterval;

        function startAutoPlay() {
            slideInterval = setInterval(() => {
                gallery.scrollLeft += step;
                if (gallery.scrollLeft >= (gallery.scrollWidth - gallery.clientWidth - 1)) {
                    gallery.scrollLeft = 0;
                }
            }, delay);
        }

        startAutoPlay();
        gallery.addEventListener('mouseenter', () => clearInterval(slideInterval));
        gallery.addEventListener('mouseleave', startAutoPlay);
        gallery.addEventListener('touchstart', () => clearInterval(slideInterval));
    }
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
