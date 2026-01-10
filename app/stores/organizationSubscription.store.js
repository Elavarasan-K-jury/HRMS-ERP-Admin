import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useOrganizationSubscriptionStore = defineStore('organization-subscription', {
    state: () => ({
        organizationSubscriptions: null,
        loading: true,
        invoiceLoading: true,
        invoices: [],
        page: 1,
        limit: 16,
        search: null,
        total: 0,
        total_pages: 0,
    }),

    actions: {
        /* ----------------------------------------------------
         🟢 Fetch organization-wide designation hierarchy
         GET /organizations/{organization_id}/hierarchy
        ---------------------------------------------------- */
        async fetchOrganizationSubscription(organizationId) {
            this.loading = true
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.get(
                    `/organizations/${organizationId}/subscription`
                )

                this.organizationSubscriptions = data.data
                return data.data
            } catch (err) {
                console.error('❌ Failed to fetch organization subscription:', err)
                return null
            } finally {
                // keep UI smooth like your org store
                setTimeout(() => {
                    this.loading = false
                }, 500)
                return null
            }
        },
        async fetchOrganizationSubscriptionByOrganization() {
            this.loading = true
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            try {
                const { data } = await $api.get(
                    `/organizations/${auth.organization}/subscription`
                )

                this.organizationSubscriptions = data.data
                return data.data
            } catch (err) {
                console.error('❌ Failed to fetch organization subscription:', err)
                throw err
            } finally {
                // keep UI smooth like your org store
                setTimeout(() => {
                    this.loading = false
                }, 500)
            }
        },
        async fetchInvoices() {
            this.invoiceLoading = true
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            try {
                const { data } = await $api.get(`/invoices`, {
                    params: auth.organization ? {
                        organization_id: auth.organization,
                        page: this.page,
                        limit: this.limit,
                        search: this.search,
                    } : {
                        page: this.page,
                        limit: this.limit,
                        search: this.search,
                    }
                })

                this.invoices = data.data
                this.total = data.meta.total
                this.total_pages = data.meta.total_pages
                return data.data
            } catch (err) {
                console.error('❌ Failed to fetch invoices:', err)
                throw err
            } finally {
                // keep UI smooth like your org store
                setTimeout(() => {
                    this.invoiceLoading = false
                }, 500)
            }
        },
        async reGeneratePaymentLink(invoiceId) {
            this.invoiceLoading = true
            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                const { data } = await $api.post(`/invoices/${invoiceId}/regenerate-payment-link`)
                console.log('organizationSubscription.store.js @ Line 103:', data);
                if (data.success) {
                    toast.success({ title: 'Success!', message: data.message || 'Payment link generated successfully.', timeout: 1500 })
                }
                return data.data
            } catch (err) {
                console.error('❌ Failed to fetch invoices:', err)
                throw err
            } finally {
                // keep UI smooth like your org store
                setTimeout(async () => {
                    await this.fetchInvoices()
                    this.invoiceLoading = false
                }, 500)
            }
        },
    },
})
