<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Invitation } from '@/types/invitation'

const route = useRoute()
const { t, locale } = useI18n()

// Async components to load localized templates on demand
const StarryNightTemplate = defineAsyncComponent(() => import('@/components/templates/StarryNightTemplate.vue'))
const SilkIvoryTemplate = defineAsyncComponent(() => import('@/components/templates/SilkIvoryTemplate.vue'))

const invitation = ref<Invitation | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const templateComponent = computed(() => {
    if (!invitation.value) return null
    // Normalize template ID check. 
    // The API might return 'deep_starry_night' or just based on ID
    // We can also check invitation.template?.name if needed.
    // For now assuming templateId fits.
    const id = invitation.value.templateId?.toLowerCase() || ''
    
    if (id.includes('silk') || id.includes('ivory')) {
        return SilkIvoryTemplate
    }
    // Default to Starry Night
    return StarryNightTemplate
})

const fetchInvitation = async () => {
    const uuid = route.params.uuid as string
    if (!uuid) {
        error.value = 'Invalid invitation link'
        isLoading.value = false
        return
    }

    try {
        const res = await fetch(`/api/invitations/${uuid}`)
        if (!res.ok) {
            if (res.status === 404) throw new Error('Invitation not found')
            throw new Error('Failed to load invitation')
        }
        const data = await res.json()
        
        // Map API response to our Interface
        // The API returns camelCase properties directly now based on previous context
        invitation.value = {
            id: data.id,
            templateId: data.templateId || data.template?.name || 'default', // Fallback
            groomName: data.groomName || data.content?.groomName,
            brideName: data.brideName || data.content?.brideName,
            eventDate: data.eventDate || data.content?.eventDate,
            eventLocation: data.eventLocation || data.content?.eventLocation,
            story: data.story || data.content?.story,
            schedule: data.schedule || data.content?.schedule,
            content: data.content
        }
    } catch (e: any) {
        error.value = e.message || 'An error occurred'
    } finally {
        isLoading.value = false
    }
}

const setLanguage = (lang: string) => {
    locale.value = lang
    localStorage.setItem('preferred_lang', lang)
    document.documentElement.lang = lang
}

onMounted(() => {
    fetchInvitation()
    const savedLang = localStorage.getItem('preferred_lang') || 'ru'
    setLanguage(savedLang)
})
</script>

<template>
    <div class="invitation-view">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
        </div>

        <div v-else-if="error" class="error-state">
            <h1>😕</h1>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="invitation">
            <!-- Floating Language Switcher -->
             <div class="lang-floater">
                <button :class="{ active: locale === 'ru' }" @click="setLanguage('ru')">RU</button>
                <button :class="{ active: locale === 'kk' }" @click="setLanguage('kk')">KK</button>
                <button :class="{ active: locale === 'en' }" @click="setLanguage('en')">EN</button>
            </div>

            <!-- Dynamic Template Component -->
            <component :is="templateComponent" :invitation="invitation" />
        </div>
    </div>
</template>

<style scoped>
.loading-state, .error-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: #1a1a1a;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.lang-floater {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    padding: 5px;
    border-radius: 20px;
    display: flex;
    gap: 5px;
}

.lang-floater button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    padding: 5px 10px;
    border-radius: 15px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.3s;
}

.lang-floater button.active {
    background: #fff;
    color: #000;
}

.lang-floater button:hover:not(.active) {
    color: #fff;
}
</style>
