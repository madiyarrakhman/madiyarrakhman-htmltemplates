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

// UI Translations Dictionary
const UI_TRANSLATIONS = {
    ru: {
        invite_text: "Приглашают вас разделить с ними радость",
        invite_text_silk: "Приглашают вас на торжество",
        story_title: "Наша история",
        gallery_title: "Мгновения счастья",
        gallery_title_silk: "Галерея чувств",
        details_title: "Детали торжества",
        details_title_silk: "Программа праздника",
        location_title_silk: "Место встречи",
        date_label: "Дата и Время",
        location_label: "Место проведения",
        dress_code_label: "Дресс-код",
        dress_code_text: "Вечерний стиль",
        rsvp_title: "Подтверждение присутствия",
        rsvp_text: "Будем рады видеть вас на нашем празднике!",
        rsvp_title_silk: "Подтверждение",
        rsvp_text_silk: "Пожалуйста, подтвердите ваше участие",
        name_label: "Ваше Имя",
        name_placeholder: "Ваше Имя и Фамилия",
        name_placeholder_silk: "Игорь и Карина",
        attending_yes: "С радостью приду!",
        attending_yes_silk: "Приду с удовольствием",
        attending_no: "К сожалению, не смогу",
        attending_no_silk: "Не смогу присутствовать",
        guest_count_label: "Количество гостей",
        submit_btn: "Отправить ответ",
        success_title: "Спасибо!",
        success_text: "Ваш ответ получен.",
        success_title_silk: "Благодарим за ответ!",
        success_text_silk: "Мы будем очень рады вас видеть.",
        scroll_down: "Листайте вниз",
        map_link: "Посмотреть на карте",
        default_story: "Наша история любви началась с простого взгляда, но переросла в нечто большее. Мы прошли долгий путь вместе и теперь готовы создать нашу семью.",
        schedule: [
            { time: "16:00", name: "Welcome", desc: "Сбор гостей и легкий фуршет в саду" },
            { time: "17:00", name: "Церемония", desc: "Торжественная регистрация брака" },
            { time: "18:00", name: "Ужин", desc: "Праздничный банкет и танцы" }
        ]
    },
    kk: {
        invite_text: "Сіздерді қуанышымызбен бөлісуге шақырамыз",
        invite_text_silk: "Сіздерді салтанатымызға шақырамыз",
        story_title: "Біздің тарихымыз",
        gallery_title: "Бақытты сәттер",
        gallery_title_silk: "Сезімдер галереясы",
        details_title: "Той егжей-тегжейі",
        details_title_silk: "Той бағдарламасы",
        location_title_silk: "Кездесу орны",
        date_label: "Күні мен уақыты",
        location_label: "Өтетін орны",
        dress_code_label: "Дресс-код",
        dress_code_text: "Кешкі стиль",
        rsvp_title: "Қатысуды растау",
        rsvp_text: "Сіздерді тойымызда көруге қуаныштымыз!",
        rsvp_title_silk: "Қатысуды растау",
        rsvp_text_silk: "Тойға келетініңізді растауыңызды сұраймыз",
        name_label: "Сіздің атыңыз",
        name_placeholder: "Аты-жөніңіз",
        name_placeholder_silk: "Қайрат пен Айнұр",
        attending_yes: "Қуана келемін!",
        attending_yes_silk: "Келемін, қуаныштымын",
        attending_no: "Өкінішке орай, келе алмаймын",
        attending_no_silk: "Өкінішке орай, келе алмаймын",
        guest_count_label: "Қонақтар саны",
        submit_btn: "Жауапты жіберу",
        success_title: "Рахмет!",
        success_text: "Жауабыңыз қабылданды.",
        success_title_silk: "Жауабыңызға рахмет!",
        success_text_silk: "Сізді көруге өте қуанышты боламыз.",
        scroll_down: "Төмен жылжытыңыз",
        map_link: "Картадан көру",
        default_story: "Біздің махаббат хикаямыз қарапайым көзқарастан басталды, бірақ үлкен сезімге ұласты. Біз бірге ұзақ жолдан өттік және енді өз отбасымызды құруға дайынбыз.",
        schedule: [
            { time: "16:00", name: "Welcome", desc: "Қонақтардың жиналуы және бақшадағы жеңіл фуршет" },
            { time: "17:00", name: "Рәсім", desc: "Неке қию салтанаты" },
            { time: "18:00", name: "Кешкі ас", desc: "Мерекелік банкет және би" }
        ]
    },
    en: {
        invite_text: "Invite you to share their joy",
        invite_text_silk: "Invite you to the celebration",
        story_title: "Our Story",
        gallery_title: "Happy Moments",
        gallery_title_silk: "Gallery of Feelings",
        details_title: "Wedding Details",
        details_title_silk: "Wedding Schedule",
        location_title_silk: "Location",
        date_label: "Date & Time",
        location_label: "Venue",
        dress_code_label: "Dress Code",
        dress_code_text: "Evening Attire",
        rsvp_title: "RSVP",
        rsvp_text: "We would be delighted to see you at our celebration!",
        rsvp_title_silk: "Confirmation",
        rsvp_text_silk: "Please confirm your attendance",
        name_label: "Your Name",
        name_placeholder: "Your Full Name",
        name_placeholder_silk: "John and Sarah",
        attending_yes: "Joyfully accept!",
        attending_yes_silk: "Will definitely attend",
        attending_no: "Regretfully decline",
        attending_no_silk: "Unable to attend",
        guest_count_label: "Number of guests",
        submit_btn: "Send RSVP",
        success_title: "Thank you!",
        success_text: "Your response has been received.",
        success_title_silk: "Thank you for the answer!",
        success_text_silk: "We would be very happy to see you.",
        scroll_down: "Scroll down",
        map_link: "View on map",
        default_story: "Our love story began with a simple glance, but grew into something more. We have come a long way together and are now ready to create our family.",
        schedule: [
            { time: "16:00", name: "Welcome", desc: "Guest arrival and light reception in the garden" },
            { time: "17:00", name: "Ceremony", desc: "Solemn marriage registration" },
            { time: "18:00", name: "Dinner", desc: "Festive banquet and dancing" }
        ]
    }
};

// 3. Render Content
function renderInvitation(data) {
    if (!data) return;

    // Apply translations first
    translateUI(currentLang);

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

    const t = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS.ru;
    const finalStory = story || t.default_story;
    if (finalStory) setMultiText('.story-text', finalStory);

    // Hiding Sections
    if (data.content?.showRSVP === false) {
        const rsvpSec = document.querySelector('.rsvp-section');
        if (rsvpSec) rsvpSec.style.display = 'none';
    }
}

function translateUI(lang) {
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ru;

    // Core Invitation
    setMultiText('.subtitle', t.invite_text);
    setMultiText('.hero-invite-text', t.invite_text_silk);
    setMultiText('.story-section .section-title', t.story_title);
    setMultiText('.gallery-section .section-title', t.gallery_title);

    // Titles & Sections
    const titles = document.querySelectorAll('.section-title');
    if (titles.length >= 4) {
        // Many templates use index-based titles
        if (titles[0]) titles[0].innerText = t.story_title;
        if (titles[1]) titles[1].innerText = t.gallery_title_silk || t.gallery_title;
        if (titles[2]) titles[2].innerText = t.details_title_silk || t.details_title;
        if (titles[3]) titles[3].innerText = (titles.length > 4) ? t.location_title_silk : t.rsvp_title;
        if (titles[4]) titles[4].innerText = t.rsvp_title;
    }

    // RSVP Form
    setMultiText('.rsvp-section .section-title', t.rsvp_title);
    setMultiText('.rsvp-text', t.rsvp_text);
    const rsvpSubtext = document.querySelector('.rsvp-section p');
    if (rsvpSubtext && rsvpSubtext.innerText.includes('подтвердите')) {
        rsvpSubtext.innerText = t.rsvp_text_silk;
    }

    const nameInput = document.getElementById('guestName');
    if (nameInput) {
        nameInput.placeholder = nameInput.classList.contains('input-silk') ? t.name_placeholder_silk : t.name_placeholder;
        const nameLabel = nameInput.previousElementSibling;
        if (nameLabel && nameLabel.tagName === 'LABEL') nameLabel.innerText = t.name_label;
    }

    // Attendance Radios
    const radios = document.querySelectorAll('input[name="attendance"]');
    radios.forEach(r => {
        const span = r.nextElementSibling;
        if (span && span.tagName === 'SPAN') {
            if (r.value === 'yes') {
                span.innerText = span.parentElement.classList.contains('radio-option') ? t.attending_yes_silk : t.attending_yes;
            } else {
                span.innerText = span.parentElement.classList.contains('radio-option') ? t.attending_no_silk : t.attending_no;
            }
        }
    });

    setMultiText('label[for="guestCount"]', t.guest_count_label);
    const countLabel_silk = document.querySelector('.input-group label:last-of-type');
    if (countLabel_silk && countLabel_silk.innerText.includes('Количество')) {
        countLabel_silk.innerText = t.guest_count_label;
    }

    setMultiText('.submit-btn span, .submit-silk', t.submit_btn);

    // Success Message
    const successTitle = document.querySelector('#successMessage p:first-child');
    if (successTitle) successTitle.innerText = t.success_title_silk || t.success_title;
    const successText = document.querySelector('#successMessage p:last-child');
    if (successText) successText.innerText = t.success_text_silk || t.success_text;

    // Misc
    setMultiText('.scroll-indicator span', t.scroll_down);
    setMultiText('.action-link', t.map_link);

    // Schedule (Silk & Ivory)
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
