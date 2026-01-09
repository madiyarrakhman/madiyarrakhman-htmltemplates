import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StarryNightTemplate from '@/components/templates/StarryNightTemplate.vue'

const mockInvitation = {
    id: 'test-uuid-starry',
    templateId: 'deep-starry-night',
    groomName: 'Alex',
    brideName: 'Elena',
    eventDate: '2026-07-15T18:00:00Z',
    eventLocation: 'Grand Hotel',
    story: 'Starry night story...',
    schedule: JSON.stringify([
        { time: '18:00', event: 'Ceremony' }
    ]),
    content: {}
}

describe('StarryNightTemplate.vue', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    it('renders invitation details correctly', () => {
        const wrapper = mount(StarryNightTemplate, {
            props: {
                invitation: mockInvitation
            }
        })

        expect(wrapper.text()).toContain('Alex')
        expect(wrapper.text()).toContain('Elena')
        expect(wrapper.text()).toContain('Starry night story...')
    })

    it('shows success message after successful RSVP submission', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        } as Response)

        const wrapper = mount(StarryNightTemplate, {
            props: {
                invitation: mockInvitation
            }
        })

        await wrapper.find('input[type="text"]').setValue('Guest Name')
        await wrapper.find('form').trigger('submit')

        await vi.waitFor(() => {
            // Use localized text from ru.json
            expect(wrapper.text()).toContain('Благодарим за ответ!')
        })
    })
})
