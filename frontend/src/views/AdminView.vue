<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

// Data Models
interface Stats {
    totalInvitations: number
    totalRSVPs: number
    totalGuests: number
}

interface Template {
    code: string
    nameRu: string
    nameKk: string
    nameEn: string
}

interface InvitationItem {
    uuid: string
    phoneNumber: string
    templateName: string
    lang: string
    rsvpCount: number
    approvedGuests: number
    shortCode?: string
    isPaid: boolean
    expiresAt: string
}

const stats = ref<Stats>({ totalInvitations: 0, totalRSVPs: 0, totalGuests: 0 })
const templates = ref<Template[]>([])
const invitations = ref<InvitationItem[]>([])
const error = ref<string | null>(null)
const isLoading = ref(true)

// Modal State
const isModalOpen = ref(false)
const createForm = ref({
    phoneNumber: '+7',
    lang: 'ru',
    templateCode: '',
    groomName: '',
    brideName: '',
    eventDate: '',
    eventLocation: ''
})

// Dynamic template name based on selected lang in creation form
const availableTemplates = computed(() => {
    return templates.value.map(t => {
        let name = t.nameRu
        if (createForm.value.lang === 'kk') name = t.nameKk
        if (createForm.value.lang === 'en') name = t.nameEn
        return { code: t.code, name }
    })
})

const loadData = async () => {
    isLoading.value = true
    try {
        // Check stats (implicitly checks auth)
        const statsRes = await fetch('/api/admin/stats')
        if (statsRes.status === 401) {
             router.push('/admin/login')
             return
        }
        if (!statsRes.ok) throw new Error('Failed to load stats')
        stats.value = await statsRes.json()

        // Load Templates
        const templRes = await fetch('/api/admin/templates')
        templates.value = await templRes.json()
        if (templates.value.length > 0) {
            createForm.value.templateCode = templates.value[0]?.code || ''
        }

        // Load Invitations
        const invitesRes = await fetch('/api/admin/invitations')
        invitations.value = await invitesRes.json()

    } catch (e: any) {
        console.error(e)
        error.value = e.message
    } finally {
        isLoading.value = false
    }
}

const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
}

const showModal = () => { isModalOpen.value = true }
const hideModal = () => { isModalOpen.value = false }

const createInvitation = async () => {
    try {
        const payload = {
            phoneNumber: createForm.value.phoneNumber,
            lang: createForm.value.lang,
            templateCode: createForm.value.templateCode,
            groomName: createForm.value.groomName,
            brideName: createForm.value.brideName,
            eventDate: createForm.value.eventDate,
            eventLocation: createForm.value.eventLocation,
            content: {}
        }
        
        const res = await fetch('/api/admin/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            hideModal()
            // Reset form partly
            createForm.value.groomName = ''
            createForm.value.brideName = ''
            createForm.value.phoneNumber = '+7'
            loadData()
        } else {
            alert('Ошибка при создании')
        }
    } catch (e) {
        alert('Ошибка сети')
    }
}

const copyLink = (shortCode: string | undefined, uuid: string) => {
    const code = shortCode && shortCode !== 'null' ? 's/' + shortCode : 'i/' + uuid
    const url = window.location.origin + '/' + code
    navigator.clipboard.writeText(url)
    alert('Ссылка скопирована: ' + url)
}

const markAsPaid = async (uuid: string) => {
    if (!confirm('Пометить как оплаченное?')) return
    try {
        const res = await fetch(`/api/admin/invitations/${uuid}/pay`, { method: 'POST' })
        if (res.ok) {
            loadData()
        } else {
            alert('Ошибка при обновлении статуса')
        }
    } catch (e) {
        alert('Ошибка сети')
    }
}

const formatExp = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getStatus = (item: InvitationItem) => {
    if (item.isPaid) return { text: 'Оплачено', class: 'paid' }
    if (new Date(item.expiresAt) < new Date()) return { text: 'Истекло', class: 'expired' }
    return { text: 'Активно', class: 'active' }
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="admin-dashboard">
        <nav>
            <h2 class="nav-title">INVITE ADMIN</h2>
            <button class="btn" @click="logout">{{ t('admin_logout_btn') }}</button>
        </nav>

        <div class="container">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>{{ t('admin_invites_stat') }}</h3>
                    <p>{{ stats.totalInvitations }}</p>
                </div>
                <div class="stat-card">
                    <h3>{{ t('admin_rsvp_stat') }}</h3>
                    <p>{{ stats.totalRSVPs }}</p>
                </div>
                <div class="stat-card">
                    <h3>{{ t('admin_guests_stat') }}</h3>
                    <p>{{ stats.totalGuests }}</p>
                </div>
            </div>

            <div class="main-section">
                <div class="section-header">
                    <h3>{{ t('admin_all_links') }}</h3>
                    <button class="btn btn-primary" @click="showModal">{{ t('admin_create_btn') }}</button>
                </div>

                <div v-if="error" class="error-banner">
                    {{ error }}
                </div>

                <div v-if="isLoading" style="text-align: center; padding: 2rem;">{{ t('admin_loading') }}</div>
                
                <table v-else-if="invitations.length > 0">
                    <thead>
                        <tr>
                            <th>{{ t('admin_col_phone') }}</th>
                            <th>{{ t('admin_col_template') }}</th>
                            <th>{{ t('admin_col_lang') }}</th>
                            <th>{{ t('admin_col_rsvp') }}</th>
                            <th>{{ t('admin_col_guests') }}</th>
                            <th>Статус / Срок</th>
                            <th>{{ t('admin_col_link') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="invite in invitations" :key="invite.uuid">
                            <td>{{ invite.phoneNumber }}</td>
                            <td><span class="badge template-badge">{{ invite.templateName }}</span></td>
                            <td><span class="badge">{{ invite.lang }}</span></td>
                            <td>{{ invite.rsvpCount }}</td>
                            <td>{{ invite.approvedGuests }}</td>
                            <td>
                                <div class="status-cell">
                                    <span class="badge" :class="getStatus(invite).class">{{ getStatus(invite).text }}</span>
                                    <small v-if="!invite.isPaid" class="exp-date">{{ formatExp(invite.expiresAt) }}</small>
                                </div>
                            </td>
                            <td>
                                <div class="actions-cell">
                                    <router-link :to="'/i/' + invite.uuid" target="_blank" class="open-link">{{ t('admin_open_link') }}</router-link>
                                    <span class="copy-link" @click="copyLink(invite.shortCode, invite.uuid)">{{ t('admin_copy_link') }}</span>
                                    <button v-if="!invite.isPaid" class="btn-pay" @click="markAsPaid(invite.uuid)">💸 Оплатить</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else style="text-align: center; padding: 2rem; color: #666;">
                    {{ t('admin_empty_list') }}
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="isModalOpen" class="modal-overlay">
            <div class="modal-content">
                <h3>{{ t('admin_modal_title') }}</h3>
                <form @submit.prevent="createInvitation">
                    <div class="form-group">
                        <label>{{ t('admin_field_phone') }}</label>
                        <input type="text" v-model="createForm.phoneNumber" required>
                    </div>
                    <div class="form-group">
                        <label>{{ t('admin_field_lang') }}</label>
                        <select v-model="createForm.lang">
                            <option value="ru">{{ t('lang_ru') }}</option>
                            <option value="kk">{{ t('lang_kk') }}</option>
                            <option value="en">{{ t('lang_en') }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>{{ t('admin_field_template') }}</label>
                        <select v-model="createForm.templateCode">
                            <option v-for="t in availableTemplates" :key="t.code" :value="t.code">
                                {{ t.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>{{ t('admin_field_groom') }}</label>
                        <input type="text" v-model="createForm.groomName" required>
                    </div>
                    <div class="form-group">
                        <label>{{ t('admin_field_bride') }}</label>
                        <input type="text" v-model="createForm.brideName" required>
                    </div>
                    <div class="form-group">
                        <label>{{ t('admin_field_date') }}</label>
                        <input type="datetime-local" v-model="createForm.eventDate" required>
                    </div>
                    <div class="form-group">
                        <label>{{ t('admin_field_location') }}</label>
                        <input type="text" v-model="createForm.eventLocation" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary flex-1">{{ t('admin_create_confirm') }}</button>
                        <button type="button" class="btn flex-1" @click="hideModal">{{ t('admin_cancel') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap');

.admin-dashboard {
    font-family: 'Montserrat', sans-serif;
    background: #f8f9fa;
    color: #1a1a1a;
    min-height: 100vh;
}

nav {
    background: white;
    padding: 1rem 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-title {
    font-weight: 300; 
    letter-spacing: 2px;
    margin: 0;
}

.container {
    padding: 2rem 5%;
    max-width: 1200px;
    margin: 0 auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    text-align: center;
}

.stat-card h3 {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

.stat-card p {
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
}

.main-section {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    margin-bottom: 2rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

th {
    text-align: left;
    padding: 1rem;
    border-bottom: 2px solid #f0f0f0;
    color: #666;
    font-size: 0.8rem;
    text-transform: uppercase;
}

td {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
}

.badge {
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    background: #eee;
}

.template-badge {
    background: #e3f2fd;
    color: #1976d2;
}

.btn {
    padding: 0.8rem 1.5rem;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    background: #e0e0e0;
}

.btn-primary {
    background: #1a1a1a;
    color: white;
}

.btn-primary:hover {
    background: #d4af37;
}

.open-link {
    margin-right: 1rem;
    color: #d4af37;
    text-decoration: none;
    font-weight: 600;
}

.copy-link {
    color: #d4af37;
    cursor: pointer;
    text-decoration: underline;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
}

input, select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    font-family: inherit;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.flex-1 {
    flex: 1;
}

.status-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.exp-date {
    font-size: 0.7rem;
    color: #999;
}

.badge.paid {
    background: #e8f5e9;
    color: #2e7d32;
}

.badge.expired {
    background: #ffebee;
    color: #c62828;
}

.badge.active {
    background: #fff3e0;
    color: #ef6c00;
}

.actions-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-pay {
    background: #1a1a1a;
    color: #ffd700;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-pay:hover {
    background: #000;
    transform: scale(1.05);
}

.error-banner {
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    text-align: center;
    font-weight: 600;
}
</style>
