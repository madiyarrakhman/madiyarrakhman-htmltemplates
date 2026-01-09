<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
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

// Date Formatting
const formattedDate = computed(() => {
  if (!props.invitation.eventDate) return ''
  const dateObj = new Date(props.invitation.eventDate)
  let dateLocale = ru
  if (locale.value === 'en') dateLocale = enUS
  
  return format(dateObj, 'd MMMM yyyy', { locale: dateLocale })
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
        alert('Error submitting RSVP')
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
    
    // Observe all fade-in-scroll elements
    document.querySelectorAll('.fade-in-scroll').forEach(el => {
        observer.observe(el)
    })
})
</script>

<template>
  <div class="silk-ivory-template">
    <!-- Hero Section -->
    <header class="hero">
        <div class="scroll-down">
            <div class="scroll-line"></div>
        </div>
        <div class="hero-content">
            <span class="hero-ornament">❦</span>
            <span class="hero-date">{{ formattedDate }}</span>
            <div class="names-wrapper">
                <h1 class="main-title gold-text">
                    <span class="groom-name">{{ invitation.groomName }}</span>
                    <span class="ampersand">&</span>
                    <span class="bride-name">{{ invitation.brideName }}</span>
                </h1>
            </div>
            <div class="hero-divider"></div>
            <p class="hero-invite-text">{{ t('invite_text_silk') }}</p>
        </div>
    </header>

    <!-- Our Story -->
    <section>
        <h2 class="section-title fade-in-scroll">{{ t('story_title') }}</h2>
        <div class="story-box glass-panel fade-in-scroll">
            <p class="story-text">
                «{{ storyText }}»
            </p>
        </div>
    </section>

    <!-- The Wedding Schedule -->
    <section id="schedule">
        <h2 class="section-title fade-in-scroll">{{ t('details_title_silk') }}</h2>
        <div class="schedule">
            <!-- If schedule provided by API, iterate, else use default static items from translations fallback logic or hardcoded if key exists -->
            <div v-if="invitation.schedule && invitation.schedule.length > 0">
                 <div v-for="(item, index) in invitation.schedule" :key="index" class="schedule-item glass-panel fade-in-scroll">
                    <span class="time">{{ item.time }}</span>
                    <!-- Assuming item.name is what we show as event name. If localization needed, might need mapping -->
                    <h3 class="event-name">{{ item.name }}</h3>
                    <p class="detail-subtext">{{ item.description }}</p>
                </div>
            </div>
             <div v-else class="schedule-fallback-container">
                 <!-- Static Fallback Items using translations -->
                 <div class="schedule-item glass-panel fade-in-scroll">
                    <span class="time">16:00</span>
                    <h3 class="event-name">Welcome</h3>
                    <p class="detail-subtext">{{ t('schedule.0.desc') }}</p>
                </div>
                <div class="schedule-item glass-panel fade-in-scroll">
                    <span class="time">17:00</span>
                    <h3 class="event-name">{{ t('schedule.1.name') }}</h3>
                    <p class="detail-subtext">{{ t('schedule.1.desc') }}</p>
                </div>
                 <div class="schedule-item glass-panel fade-in-scroll">
                    <span class="time">18:00</span>
                    <h3 class="event-name">{{ t('schedule.2.name') }}</h3>
                    <p class="detail-subtext">{{ t('schedule.2.desc') }}</p>
                </div>
             </div>
        </div>
    </section>

    <!-- Dynamic Gallery -->
    <section id="gallery" class="gallery-section fade-in-scroll">
        <h2 class="section-title">{{ t('gallery_title_silk') }}</h2>
        <div class="slider-container" id="gallery-slider">
            <div class="slide"><img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80" alt="Wedding 1"></div>
            <div class="slide"><img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" alt="Wedding 2"></div>
            <div class="slide"><img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80" alt="Wedding 3"></div>
             <div class="slide"><img src="https://images.unsplash.com/photo-1522673607200-164883eecd4c?auto=format&fit=crop&w=800&q=80" alt="Wedding 4"></div>
        </div>
    </section>

    <!-- Location -->
    <section id="location">
        <h2 class="section-title fade-in-scroll">{{ t('location_title_silk') }}</h2>
        <div class="location-card glass-panel fade-in-scroll">
            <h3 class="event-name location-name">{{ invitation.eventLocation }}</h3>
             <!-- Address Placeholder -->
            <p class="address location-address"></p>
            <a href="#" class="action-link">{{ t('map_link') }}</a>
        </div>
    </section>

     <!-- RSVP Section -->
    <section id="rsvp" class="rsvp-section glass-panel fade-in-scroll" style="padding: 4rem;">
        <h2 class="section-title">{{ t('rsvp_title_silk') }}</h2>
        <p style="text-align: center; margin-bottom: 2rem; color: var(--color-text-soft);">{{ t('rsvp_text_silk') }}</p>

        <form v-if="!isSuccess" class="form-silk" @submit.prevent="submitRsvp">
            <div class="input-group">
                <label>{{ t('name_label') }}</label>
                <input type="text" class="input-silk" v-model="guestName" :placeholder="t('name_placeholder_silk')" required>
            </div>

            <div class="input-group">
                <label>{{ t('attendance_label') }}</label>
                <div class="radio-options">
                    <label class="radio-option">
                        <input type="radio" value="yes" v-model="attendance">
                        <span>{{ t('attending_yes_silk') }}</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" value="no" v-model="attendance">
                        <span>{{ t('attending_no_silk') }}</span>
                    </label>
                </div>
            </div>

            <div class="input-group">
                <label>{{ t('guest_count_label') }}</label>
                <input type="number" class="input-silk" v-model="guestCount" min="1" max="5">
            </div>

            <button type="submit" class="submit-silk" :disabled="isSubmitting">{{ t('submit_btn') }}</button>
        </form>

        <div v-else id="successMessage" style="text-align:center; padding: 2rem; color: var(--color-gold);">
            <p style="font-size: 1.5rem; font-family: var(--font-display);">{{ t('success_title_silk') }}</p>
            <p>{{ t('success_text_silk') }}</p>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="footer-names gold-text">
            <span class="groom-name">{{ invitation.groomName }}</span> & <span class="bride-name">{{ invitation.brideName }}</span>
        </div>
        <p style="letter-spacing: 5px; font-size: 0.8rem; opacity: 0.5; margin-top: 1rem;">{{ t('footer_copyright') }}</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');

/* Reset and variables specifically for this template scope */
.silk-ivory-template {
    --color-silk: #f9f7f2;
    --color-ivory: #ffffff;
    --color-gold: #c5a059;
    --color-gold-light: #e0ca9e;
    --color-text-dark: #2c2c2c;
    --color-text-soft: #666666;
    --font-display: 'Playfair Display', serif;
    --font-accent: 'Cinzel', serif;
    --font-body: 'Montserrat', sans-serif;
    --container-max: 1100px;
    --transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    
    background-color: var(--color-silk);
    color: var(--color-text-dark);
    font-family: var(--font-body);
    line-height: 1.7;
    overflow-x: hidden;
     /* Ensure full height coverage */
    min-height: 100vh;
}

/* Scoped Styles from original HTML */

.glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
}

.gold-text {
    color: var(--color-gold);
    background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 50%, var(--color-gold) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* --- Hero Section --- */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    background:
        linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(249, 247, 242, 0.6)),
        url('/images/silk_ivory_bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    overflow: hidden;
    padding: 2rem;
}

.hero::after {
    content: '';
    position: absolute;
    inset: 30px;
    border: 1px solid rgba(197, 160, 89, 0.2);
    pointer-events: none;
    z-index: 1;
}

.hero-content {
    z-index: 2;
    padding: 2rem;
    animation: fadeInScale 2.2s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 1000px;
}

.hero-ornament {
    font-size: 2.5rem;
    color: var(--color-gold);
    margin-bottom: 2rem;
    opacity: 0.7;
    display: block;
}

.hero-date {
    font-family: var(--font-accent);
    text-transform: uppercase;
    letter-spacing: 0.6rem;
    font-size: 1rem;
    margin-bottom: 3rem;
    color: var(--color-text-soft);
    display: block;
}

.main-title {
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 12vw, 8rem);
    font-weight: 400;
    line-height: 1.1;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.names-wrapper {
    margin-bottom: 2rem;
}

.ampersand {
    font-family: var(--font-display);
    font-size: 0.4em;
    font-style: italic;
    margin: 0.5rem 0;
    opacity: 0.5;
    color: var(--color-text-dark);
    -webkit-text-fill-color: var(--color-text-dark);
}

.hero-invite-text {
    margin-top: 3.5rem;
    font-family: var(--font-accent);
    letter-spacing: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-gold);
    text-transform: uppercase;
    font-weight: 500;
}

.hero-divider {
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
    margin: 2.5rem auto;
}

/* Rich Gold Text Effect */
.gold-text {
    background: linear-gradient(135deg,
            #a67c52 0%,
            #c5a059 25%,
            #f1e4c1 50%,
            #c5a059 75%,
            #a67c52 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine 6s linear infinite;
    text-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

@keyframes shine {
    to {
        background-position: 200% center;
    }
}

/* Scroll Indicator */
.scroll-down {
    position: absolute;
    bottom: 4rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--color-gold);
    opacity: 0.6;
    text-decoration: none;
}

.scroll-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, var(--color-gold), transparent);
    position: relative;
    overflow: hidden;
}

.scroll-line::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    animation: scrollLineAnim 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes scrollLineAnim {
    0% {
        transform: translateY(-100%);
    }

    100% {
        transform: translateY(100%);
    }
}

/* --- Section Styling --- */
section {
    padding: 100px 20px;
    max-width: var(--container-max);
    margin: 0 auto;
    text-align: center;
}

.section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 3rem;
    position: relative;
    padding-bottom: 1.5rem;
}

.section-title::after {
    content: '❦';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-gold);
    font-size: 1.5rem;
}

/* --- Story Board --- */
.story-box {
    max-width: 800px;
    margin: 0 auto;
    padding: 4rem;
    border-radius: 4px;
    position: relative;
}

.story-box::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    border: 1px solid var(--color-gold-light);
    pointer-events: none;
}

.story-text {
    font-size: 1.2rem;
    color: var(--color-text-soft);
    font-style: italic;
    font-family: var(--font-display);
}

/* --- Schedule --- */
.schedule {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.schedule-fallback-container {
    display: contents; /* Allows children to participate in parent grid */
}

.schedule-item {
    padding: 3rem 2rem;
    transition: var(--transition);
    border-bottom: 2px solid transparent;
}

.schedule-item:hover {
    border-color: var(--color-gold);
    transform: translateY(-5px);
}

.time {
    font-family: var(--font-accent);
    font-size: 1.5rem;
    color: var(--color-gold);
    display: block;
    margin-bottom: 1rem;
}

.event-name {
    font-family: var(--font-display);
    font-size: 1.8rem;
    margin-bottom: 1rem;
}

.detail-subtext {
    font-size: 1rem;
    color: var(--color-text-soft);
    line-height: 1.6;
}

/* --- Details Info --- */
.location-card {
    margin-top: 4rem;
    padding: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.address {
    margin: 1.5rem 0;
    font-size: 1.1rem;
    color: var(--color-text-soft);
}

.action-link {
    text-decoration: none;
    color: var(--color-gold);
    font-family: var(--font-accent);
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 2px;
    border-bottom: 1px solid var(--color-gold);
    padding-bottom: 4px;
    transition: var(--transition);
}

.action-link:hover {
    color: var(--color-text-dark);
    border-color: var(--color-text-dark);
}

/* --- RSVP Form --- */
.rsvp-section {
    background-color: #ffffff;
    margin-bottom: 100px;
    border-radius: 8px;
    max-width: 700px;
}

.form-silk {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: left;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-gold);
    font-weight: 600;
}

.input-silk {
    padding: 1rem;
    border: none;
    border-bottom: 1px solid #ddd;
    font-family: var(--font-body);
    font-size: 1rem;
    transition: var(--transition);
    background: rgba(0, 0, 0, 0.01);
}

.input-silk:focus {
    outline: none;
    border-color: var(--color-gold);
    background: #fff;
}

.radio-options {
    display: flex;
    gap: 2rem;
    margin: 1rem 0;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.radio-option input {
    accent-color: var(--color-gold);
}

.submit-silk {
    background: var(--color-gold);
    color: white;
    border: none;
    padding: 1.2rem;
    font-family: var(--font-accent);
    text-transform: uppercase;
    letter-spacing: 3px;
    cursor: pointer;
    transition: var(--transition);
    margin-top: 1rem;
}

.submit-silk:hover {
    background: var(--color-text-dark);
    letter-spacing: 5px;
}

/* --- Footer --- */
footer {
    padding: 100px 20px;
    text-align: center;
    background-color: #f3f0e9;
}

.footer-names {
    font-family: var(--font-display);
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

/* --- Animations --- */
@keyframes fadeInScale {
    0% {
        opacity: 0;
        transform: scale(0.98);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.fade-in-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease-out, transform 1s ease-out;
}

.fade-in-scroll.visible {
    opacity: 1;
    transform: translateY(0);
}

/* --- Responsive --- */
@media (max-width: 768px) {
    .hero-content {
        padding: 1rem;
    }

    .story-box {
        padding: 2rem;
    }

    .schedule {
        grid-template-columns: 1fr;
    }

    .location-card {
        padding: 2rem;
    }
    
     .slide {
        flex: 0 0 85%;
    }
}

/* --- Gallery Slider --- */
.gallery-section {
    padding: 80px 0;
    background: #fff;
    position: relative;
}

.slider-container {
    width: 100%;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    gap: 20px;
    padding: 20px;
}

.slider-container::-webkit-scrollbar {
    display: none;
}

.slide {
    flex: 0 0 85%;
    aspect-ratio: 4/5;
    scroll-snap-align: center;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
}

.slide:hover img {
    transform: scale(1.05);
}

@media (min-width: 768px) {
    .slide {
        flex: 0 0 400px;
    }
}
</style>
