<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale' // You might need to add 'kk' locale if available or standout
import type { Invitation } from '@/types/invitation'

const props = defineProps<{
  invitation: Invitation
}>()

const { t, locale } = useI18n()

// Form Data
const guestName = ref('')
const attendance = ref('yes')
const guestCount = ref(1)
const isSubmitting = ref(false)
const isSuccess = ref(false)

// Formatting Date
const formattedDate = computed(() => {
  if (!props.invitation.eventDate) return ''
  const dateObj = new Date(props.invitation.eventDate)
  // Simple mapping for date-fns locales. 
  // Note: date-fns might not have 'kk' natively in older versions or specific imports. 
  // Falling back to 'ru' for 'kk' or custom formatting might be needed.
  let dateLocale = ru
  if (locale.value === 'en') dateLocale = enUS
  if (locale.value === 'kk') dateLocale = kk
  
  return format(dateObj, 'd MMMM yyyy', { locale: dateLocale })
})

const formattedTime = computed(() => {
    if (!props.invitation.eventDate) return ''
    const dateObj = new Date(props.invitation.eventDate)
    return format(dateObj, 'HH:mm')
})

const storyText = computed(() => {
    return props.invitation.story || t('default_story')
})

// Submit RSVP
const submitRsvp = async () => {
    if(!guestName.value) return
    
    isSubmitting.value = true
    try {
        const payload = {
            guestName: guestName.value,
            attendance: attendance.value, // Send 'yes' or 'no' directly
            guestCount: guestCount.value
        }
        
        await fetch(`/api/rsvp/${props.invitation.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        
        isSuccess.value = true
    } catch (e) {
        console.error('RSVP Error', e)
        alert(t('rsvp_error'))
    } finally {
        isSubmitting.value = false
    }
}

// Scroll animations
onMounted(() => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
            }
        })
    }, observerOptions)
    
    // Observe all slide-up elements
    document.querySelectorAll('.slide-up').forEach(el => {
        observer.observe(el)
    })
})
</script>

<template>
  <div class="starry-night-template">
    <div class="stars"></div>
    <div class="container">
        <!-- Hero Section -->
        <section class="hero" id="hero">
            <div class="hero-content fade-in">
                <div class="ornament-top">❦</div>
                <h1 class="main-title">
                    <span class="name groom-name">{{ invitation.groomName }}</span>
                    <span class="ampersand">&</span>
                    <span class="name bride-name">{{ invitation.brideName }}</span>
                </h1>
                <p class="subtitle">{{ t('invite_text') }}</p>
                <div class="date-container">
                    <div class="date-line"></div>
                    <p class="wedding-date">{{ formattedDate }}</p>
                    <div class="date-line"></div>
                </div>
                <div class="ornament-bottom">❦</div>
            </div>
            <div class="scroll-indicator">
                <span>{{ t('scroll_down') }}</span>
                <div class="scroll-arrow">↓</div>
            </div>
        </section>

        <!-- Story Section -->
        <section class="story-section" id="story">
            <div class="section-content slide-up">
                <h2 class="section-title">{{ t('story_title') }}</h2>
                <div class="story-text">
                    <p>{{ storyText }}</p>
                </div>
                <div class="hearts">
                    <span class="heart">♥</span>
                    <span class="heart">♥</span>
                    <span class="heart">♥</span>
                </div>
            </div>
        </section>

         <!-- Gallery Section (Static placeholders for now as per template) -->
         <section class="gallery-section" id="gallery">
            <div class="section-content slide-up">
                <h2 class="section-title">{{ t('gallery_title') }}</h2>
                <div class="gallery-slider">
                    <div class="gallery-slide"><img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80" alt="Moment 1"></div>
                    <div class="gallery-slide"><img src="https://images.unsplash.com/photo-1510076857177-7441008b44dec?auto=format&fit=crop&w=800&q=80" alt="Moment 2"></div>
                    <div class="gallery-slide"><img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80" alt="Moment 3"></div>
                </div>
            </div>
        </section>

        <!-- Event Details -->
        <section class="details-section" id="details">
            <div class="section-content slide-up">
                <h2 class="section-title">{{ t('details_title') }}</h2>

                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">🕐</div>
                        <h3>{{ t('date_label') }}</h3>
                        <p class="detail-info wedding-date">{{ formattedDate }}</p>
                        <p class="detail-subtext">{{ formattedTime }}</p>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">📍</div>
                        <h3>{{ t('location_label') }}</h3>
                        <p class="detail-info location-name">{{ invitation.eventLocation }}</p>
                         <!-- Dynamic address if available, else static placeholder or hidden -->
                        <p class="detail-subtext location-address"></p> 
                        <a href="#" class="detail-link">{{ t('map_link') }}</a>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">👔</div>
                        <h3>{{ t('dress_code_title') }}</h3>
                        <p class="detail-info">{{ t('dress_code_text') }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- RSVP Section -->
        <section class="rsvp-section" id="rsvp">
            <div class="section-content slide-up">
                <h2 class="section-title">{{ t('rsvp_title') }}</h2>
                <p class="rsvp-text">{{ t('rsvp_text') }}</p>

                <form v-if="!isSuccess" class="rsvp-form" @submit.prevent="submitRsvp">
                    <div class="form-group">
                        <label for="guestName">{{ t('name_label') }}</label>
                        <input type="text" id="guestName" v-model="guestName" :placeholder="t('name_placeholder')" required>
                    </div>

                    <div class="form-group radio-group">
                        <label class="radio-label">
                            <input type="radio" value="yes" v-model="attendance">
                            <span>{{ t('attending_yes') }}</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" value="no" v-model="attendance">
                            <span>{{ t('attending_no') }}</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="guestCount" style="margin-bottom: 5px; display: block; color: var(--color-text-secondary);">{{ t('guest_count_label') }}</label>
                        <input type="number" id="guestCount" v-model="guestCount" min="1" max="5">
                    </div>

                    <button type="submit" class="submit-btn" :disabled="isSubmitting">
                        <span>{{ t('submit_btn') }}</span>
                    </button>
                </form>

                <div v-else class="success-message show">
                    <div class="success-icon">✓</div>
                    <h3>{{ t('success_title') }}</h3>
                    <p>{{ t('success_text') }}</p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <p class="footer-quote">"{{ t('footer_quote') }}"</p>
                <div class="footer-ornament">❦</div>
                <p class="footer-names">
                    <span class="groom-name">{{ invitation.groomName }}</span> & <span class="bride-name">{{ invitation.brideName }}</span>
                </p>
                <p class="footer-date wedding-date">{{ formattedDate }}</p>
                <p class="footer-copyright">{{ t('footer_copyright') }}</p>
            </div>
        </footer>
    </div>
  </div>
</template>

<style scoped>
/* ==================== */
/* Hero Section */
/* ==================== */

.starry-night-template {
    position: relative;
    min-height: 100vh;
    /* Match original body background */
    background: 
        linear-gradient(rgba(10, 10, 20, 0.7), rgba(10, 10, 20, 0.7)),
        url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: var(--color-text-primary);
}

.hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: var(--spacing-md);
    position: relative;
}

.hero-content {
    max-width: 800px;
}

.ornament-top,
.ornament-bottom {
    font-size: 3rem;
    color: var(--color-primary);
    margin: var(--spacing-md) 0;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.main-title {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 300;
    margin: var(--spacing-md) 0;
    line-height: 1.2;
}

.name {
    display: block;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
}

.ampersand {
    display: block;
    font-size: 0.6em;
    margin: var(--spacing-sm) 0;
    color: var(--color-accent);
    font-style: italic;
}

.subtitle {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: var(--color-text-secondary);
    margin: var(--spacing-md) 0;
    font-weight: 300;
}

.date-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin: var(--spacing-lg) 0;
}

.date-line {
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}

.wedding-date {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 600;
    color: var(--color-accent);
    text-shadow: var(--shadow-glow);
}

.scroll-indicator {
    position: absolute;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.9rem;
}

.scroll-arrow {
    font-size: 1.5rem;
    animation: bounce 2s infinite;
    margin-top: var(--spacing-xs);
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
}

/* ==================== */
/* Sections */
/* ==================== */

section {
    padding: var(--spacing-xl) var(--spacing-md);
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-content {
    max-width: 900px;
    width: 100%;
}

.section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3.5rem);
    text-align: center;
    margin-bottom: var(--spacing-lg);
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
}

/* ==================== */
/* Story Section */
/* ==================== */

.story-text {
    text-align: center;
    max-width: 700px;
    margin: 0 auto var(--spacing-lg);
}

.story-text p {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: 1.8;
}

.hearts {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    font-size: 2rem;
}

.heart {
    color: var(--color-primary);
    animation: heartbeat 1.5s ease-in-out infinite;
}

.heart:nth-child(2) {
    animation-delay: 0.3s;
}

.heart:nth-child(3) {
    animation-delay: 0.6s;
}

@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1); }
}

/* ==================== */
/* Gallery Section */
/* ==================== */

.gallery-slider {
    width: 100%;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 1.5rem;
    padding: var(--spacing-md);
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.gallery-slider::-webkit-scrollbar {
    display: none;
}

.gallery-slide {
    flex: 0 0 300px;
    height: 450px;
    scroll-snap-align: center;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 182, 193, 0.2);
    box-shadow: var(--shadow-soft);
}

.gallery-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
}

.gallery-slide:hover img {
    transform: scale(1.1);
}

/* ==================== */
/* Details Section */
/* ==================== */

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
}

.detail-card {
    background: linear-gradient(135deg, var(--color-bg-light) 0%, var(--color-bg-medium) 100%);
    padding: var(--spacing-lg);
    border-radius: 20px;
    text-align: center;
    box-shadow: var(--shadow-soft);
    border: 1px solid rgba(255, 182, 193, 0.1);
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
}

.detail-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    opacity: 0;
    transition: var(--transition-smooth);
    z-index: 0;
}

.detail-card:hover::before {
    opacity: 0.1;
}

.detail-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(255, 105, 180, 0.3);
}

.detail-card > * {
    position: relative;
    z-index: 1;
}

.detail-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

.detail-card h3 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
    color: var(--color-primary-light);
}

.detail-info {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-primary);
}

.detail-subtext {
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

/* ==================== */
/* RSVP Section */
/* ==================== */

.rsvp-text {
    text-align: center;
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
}

.rsvp-form {
    max-width: 500px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: var(--spacing-md);
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-bg-light);
    border: 2px solid rgba(255, 182, 193, 0.2);
    border-radius: 12px;
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 1rem;
    transition: var(--transition-smooth);
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 20px rgba(255, 105, 180, 0.2);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: var(--color-text-muted);
}

.radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.radio-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-bg-light);
    border: 2px solid rgba(255, 182, 193, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: var(--transition-smooth);
}

.radio-label:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-medium);
}

.radio-label input[type="radio"] {
    width: auto;
    accent-color: var(--color-primary);
}

.submit-btn {
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: var(--font-body);
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
}

.submit-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.submit-btn:hover::before {
    width: 300px;
    height: 300px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 105, 180, 0.4);
}

.submit-btn span {
    position: relative;
    z-index: 1;
}

.success-message {
    display: none;
    text-align: center;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(139, 195, 74, 0.2) 100%);
    border: 2px solid rgba(76, 175, 80, 0.5);
    border-radius: 12px;
    margin-top: var(--spacing-md);
}

.success-message.show {
    display: block;
    animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.success-icon {
    font-size: 3rem;
    color: #4CAF50;
    margin-bottom: var(--spacing-sm);
}

/* ==================== */
/* Footer */
/* ==================== */

.footer {
    padding: var(--spacing-xl) var(--spacing-md);
    text-align: center;
    background: linear-gradient(180deg, transparent 0%, var(--color-bg-dark) 100%);
}

.footer-content {
    max-width: 600px;
    margin: 0 auto;
}

.footer-quote {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-style: italic;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-md);
}

.footer-ornament {
    font-size: 2rem;
    color: var(--color-primary);
    margin: var(--spacing-md) 0;
}

.footer-names {
    font-family: var(--font-display);
    font-size: 2rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: var(--spacing-sm);
}

.footer-date {
    color: var(--color-text-muted);
    font-size: 1.1rem;
}

/* ==================== */
/* Animations */
/* ==================== */

.fade-in {
    animation: fadeIn 1.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.slide-up {
    opacity: 0;
    transform: translateY(50px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.slide-up.visible {
    opacity: 1;
    transform: translateY(0);
}

/* ==================== */
/* Responsive Design */
/* ==================== */

@media (max-width: 768px) {
    .details-grid {
        grid-template-columns: 1fr;
    }
    
    .date-line {
        width: 40px;
    }
}

@media (max-width: 480px) {
    :root {
        --spacing-lg: 3rem;
        --spacing-xl: 4rem;
    }
    
    .hero {
        min-height: 90vh;
    }
    
    section {
        padding: var(--spacing-lg) var(--spacing-sm);
    }
}
</style>
