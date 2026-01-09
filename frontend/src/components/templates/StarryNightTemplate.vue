<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale' // You might need to add 'kk' locale if available or standout
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
            invitationId: props.invitation.id,
            guestName: guestName.value,
            attending: attendance.value === 'yes',
            guestCount: guestCount.value
        }
        
        await fetch('/api/rsvp', {
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
                <p class="footer-quote">"Любовь — это когда счастье другого человека важнее собственного"</p>
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
/* Specific overrides for Starry Night template if needed */
/* Most styles are in assets/main.css */

.starry-night-template {
    position: relative;
    /* Ensure background from body doesn't conflict, or enforce it here */
}

/* Re-apply the background image specifically for this component wrapper if needed, 
   or rely on the global body style. 
   HomeView had a white bg. We need to ensure we set the dark bg for this template.
*/
</style>
