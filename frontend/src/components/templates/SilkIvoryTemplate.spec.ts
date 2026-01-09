import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SilkIvoryTemplate from '@/components/templates/SilkIvoryTemplate.vue'

const mockInvitation: any = {
    id: 'test-uuid',
    templateId: 'silk-ivory',
    groomName: 'Ivan',
    brideName: 'Maria',
    eventDate: '2026-06-01T15:00:00Z',
    eventLocation: 'Test Location',
    story: 'Once upon a time...',
    schedule: [
        { time: '15:00', name: 'Ceremony', description: 'At the central park' },
        { time: '17:00', name: 'Dinner', description: 'At the restaurant' }
    ],
    content: {}
}

describe('SilkIvoryTemplate.vue', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    it('renders invitation details correctly', () => {
        const wrapper = mount(SilkIvoryTemplate, {
            props: {
                invitation: mockInvitation
            }
        })

        expect(wrapper.text()).toContain('Ivan')
        expect(wrapper.text()).toContain('Maria')
        expect(wrapper.text()).toContain('Once upon a time...')
    })

    it('shows success message after successful RSVP submission', async () => {
        // Mock successful fetch
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        } as Response)

        const wrapper = mount(SilkIvoryTemplate, {
            props: {
                invitation: mockInvitation
            }
        })

        // Fill the form
        await wrapper.find('input[type="text"]').setValue('Guest Name')
        await wrapper.find('form').trigger('submit')

        // Wait for async actions
        await vi.waitFor(() => {
            // The text is actually translated because we loaded ruMessages in setup
            expect(wrapper.text()).toContain('Благодарим за ответ!')
        })
    })

    it('handles RSVP submission error', async () => {
        // Mock failed fetch
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

        // Spy on console.error to avoid cluttering test output and verify error handling
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
        vi.stubGlobal('alert', vi.fn())

        const wrapper = mount(SilkIvoryTemplate, {
            props: {
                invitation: mockInvitation
            }
        })

        await wrapper.find('input[type="text"]').setValue('Guest Name')
        await wrapper.find('form').trigger('submit')

        await vi.waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Error submitting RSVP')
        })

        consoleSpy.mockRestore()
    })
})
