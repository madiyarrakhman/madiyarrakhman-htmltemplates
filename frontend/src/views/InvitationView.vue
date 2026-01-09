<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Invitation } from '@/types/invitation'

const route = useRoute()
const { locale } = useI18n()

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
        invitation.value = {
            id: data.id,
            templateId: data.templateCode || data.templateId || data.template?.name || 'default',
            groomName: data.groomName || data.content?.groomName,
            brideName: data.brideName || data.content?.brideName,
            eventDate: data.eventDate || data.content?.eventDate,
            eventLocation: data.eventLocation || data.content?.eventLocation,
            story: data.story || data.content?.story,
            schedule: data.schedule || data.content?.schedule,
            content: data.content
        }
        
        // Set language from invitation data
        if (data.lang) {
            locale.value = data.lang
            document.documentElement.lang = data.lang
        }
    } catch (e: any) {
        error.value = e.message || 'An error occurred'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchInvitation()
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
</style>
