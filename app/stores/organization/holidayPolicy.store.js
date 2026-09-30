import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useHolidayPolicyStore = defineStore('holidayPolicy', {
    state: () => ({
        policies: [],
        total_count: 0,
        selected_policy_id: null,

        // form fields
        name: null,
        is_active: true,

        loading: false,
        error: null,
    }),

    actions: {
        async fetchPolicies() {
            const toast = useToast()
            this.loading = true
            this.error = null

            try {
                const { $api } = useNuxtApp()
                const auth = useAuthStore()

                const params = {
                    organization_id: auth.organization,
                }

                const { data } = await $api.get('/holiday-policies', { params })

                this.policies = data.policies || []
                this.total_count = data.total_count || 0

                if (this.policies.length && !this.selected_policy_id) {
                    this.selected_policy_id = this.policies[0].id
                }


                return data
            } catch (err) {
                console.error('[holidayPolicy-store] fetchPolicies error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },

        async createPolicy() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const auth = useAuthStore()

                const payload = {
                    organization_id: auth.organization,
                    name: this.name,
                }

                const { data } = await $api.post('/holiday-policies', payload)

                toast.success({ title: 'Success!', message: data.message || 'Policy created', timeout: 1500 })

                this.resetForm()
                await this.fetchPolicies()

                if (data.policy) {
                    this.selected_policy_id = data.policy.id
                }

                return data
            } catch (err) {
                console.error('[holidayPolicy-store] createPolicy error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        async updatePolicy(policyId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                const payload = {
                    name: this.name || undefined,
                    is_active: typeof this.is_active === 'boolean' ? this.is_active : undefined,
                }

                const { data } = await $api.put(`/holiday-policies/${policyId}`, payload)

                toast.success({ title: 'Updated!', message: data.message || 'Policy updated', timeout: 1500 })

                this.resetForm()
                await this.fetchPolicies()

                return data
            } catch (err) {
                console.error('[holidayPolicy-store] updatePolicy error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        async deletePolicy(policyId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                const { data } = await $api.delete(`/holiday-policies/${policyId}`)

                toast.success({ title: 'Deleted!', message: data.message || 'Policy deleted', timeout: 1500 })

                if (this.selected_policy_id === policyId) {
                    this.selected_policy_id = null
                }

                await this.fetchPolicies()

                return data
            } catch (err) {
                console.error('[holidayPolicy-store] deletePolicy error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        selectPolicy(policyId) {
            this.selected_policy_id = policyId
        },

        resetForm() {
            this.name = null
            this.is_active = true
        },
    },
})
