import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useFinanceStore = defineStore('Finance', {
    state: () => ({
        loading: false,
        error: null,

        // finance enabled cache
        financeEnabledMap: {},

        // full finance configuration
        financeDetails: null,

        lastCheckedOrganizationId: null,

        pf_enabled: null,
        pf_formula: null,
        pf_registration_number: null,
        pf_registered_organization_name: null,


        esi_enabled: null,
        esi_formula: null,
        esi_registration_number: null,
        esi_registered_organization_name: null,


        ptax_enabled: null,
        ptax_formula: null,
        ptax_registration_number: null,
        ptax_registered_organization_name: null,
    }),

    getters: {
        isFinanceEnabled: (state) => {
            const auth = useAuthStore()
            const organizationId = auth.organization
            return () => {
                return state.financeEnabledMap[organizationId] ?? false
            }
        },
    },

    actions: {
        /* =====================================================
           🔹 CHECK FINANCE ENABLED
        ===================================================== */
        async checkFinanceEnabled() {
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            if (this.financeEnabledMap[organizationId] !== undefined) {
                return this.financeEnabledMap[organizationId]
            }

            const { $api } = useNuxtApp()

            try {
                this.loading = true
                this.error = null
                this.lastCheckedOrganizationId = organizationId

                const { data } = await $api.get(`/finance/enabled/${organizationId}`)

                this.financeEnabledMap[organizationId] = data?.enabledFinance ?? false
                return this.financeEnabledMap[organizationId]
            } catch (err) {
                console.error('[Finance] checkFinanceEnabled error:', err)
                this.error = err?.message || 'Finance check failed'
                this.financeEnabledMap[organizationId] = false
                return false
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        /* =====================================================
           🔹 FETCH FINANCE DETAILS
        ===================================================== */
        async fetchFinanceDetails() {
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return null

            const { $api } = useNuxtApp()

            try {
                this.loading = true
                this.error = null

                const { data } = await $api.get(`/finance/details/${organizationId}`)

                if (data?.success && data.finance && data.financeEnabled) {
                    this.financeDetails = {
                        pf_enabled: data.finance.enable_pf,
                        pf_formula: data.finance.pf_formula,
                        pf_registration_number: data.finance.pf_registration_number,
                        pf_registered_organization_name: data.finance.pf_registered_organization_name,
                        esi_enabled: data.finance.enable_esi,
                        esi_formula: data.finance.esi_formula,
                        esi_registration_number: data.finance.esi_registration_number,
                        esi_registered_organization_name: data.finance.esi_registered_organization_name,
                        ptax_enabled: data.finance.enable_ptax,
                        ptax_formula: data.finance.ptax_formula,
                        ptax_registration_number: data.finance.ptax_registration_number,
                        ptax_registered_organization_name: data.finance.ptax_registered_organization_name,
                    }
                    this.pf_enabled = data.finance.enable_pf
                    this.pf_formula = data.finance.pf_formula
                    this.pf_registration_number = data.finance.pf_registration_number
                    this.pf_registered_organization_name = data.finance.pf_registered_organization_name
                    this.esi_enabled = data.finance.enable_esi
                    this.esi_formula = data.finance.esi_formula
                    this.esi_registration_number = data.finance.esi_registration_number
                    this.esi_registered_organization_name = data.finance.esi_registered_organization_name
                    this.ptax_enabled = data.finance.enable_ptax
                    this.ptax_formula = data.finance.ptax_formula
                    this.ptax_registration_number = data.finance.ptax_registration_number
                    this.ptax_registered_organization_name = data.finance.ptax_registered_organization_name
                    this.financeEnabledMap[organizationId] = data.financeEnabled
                    return data.finance
                }

                this.financeDetails = null
                return null
            } catch (err) {
                console.error('[Finance] fetchFinanceDetails error:', err)
                this.error = err?.message || 'Failed to fetch finance details'
                return null
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        /* =====================================================
           🔹 ENABLE & SAVE PF
        ===================================================== */
        async enablePf() {
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            const { $api } = useNuxtApp()

            try {
                this.loading = true
                this.error = null

                const { data } = await $api.post('/finance/pf', {
                    organization_id: organizationId,
                    pf_formula: this.pf_formula,
                    pf_registration_number: this.pf_registration_number,
                    pf_registered_organization_name: this.pf_registered_organization_name,
                })

                if (data?.success) {
                    await this.fetchFinanceDetails()
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    return true
                }

                this.error = data?.message
                toast.error({
                    title: 'Error!',
                    message: data.message,
                    timeout: 1500
                })
                return false
            } catch (err) {
                console.error('[Finance] enablePf error:', err)
                this.error = err?.message || 'PF setup failed'
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                return false
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async enableDisablePf() {
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            const { $api } = useNuxtApp()

            try {
                // this.loading = true
                this.error = null

                const { data } = await $api.put('/finance/pf/activity', {
                    organization_id: organizationId,
                    activity: this.pf_enabled
                })

                if (data?.success) {
                    await this.fetchFinanceDetails()
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    return true
                }
                toast.error({
                    title: 'Error!',
                    message: data.message,
                    timeout: 1500
                })
                this.error = data?.message
                return false
            } catch (err) {
                console.error('[Finance] enablePf error:', err)
                this.error = err?.message || 'PF setup failed'
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                return false
            }
        },

        /* =====================================================
           🔹 ENABLE & SAVE ESI
        ===================================================== */
        async enableEsi() {
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            const { $api } = useNuxtApp()

            try {
                this.loading = true
                this.error = null

                const { data } = await $api.post('/finance/esi', {
                    organization_id: organizationId,
                    esi_formula: this.esi_formula,
                    esi_registration_number: this.esi_registration_number,
                    esi_registered_organization_name: this.esi_registered_organization_name,
                })

                if (data?.success) {
                    await this.fetchFinanceDetails()
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    return true
                }
                toast.error({
                    title: 'Error!',
                    message: data.message,
                    timeout: 1500
                })
                this.error = data?.message
                return false
            } catch (err) {
                console.error('[Finance] enableEsi error:', err)
                this.error = err?.message || 'ESI setup failed'
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                return false
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async enableDisableEsi() {
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            const { $api } = useNuxtApp()

            try {
                // this.loading = true
                this.error = null

                const { data } = await $api.put('/finance/esi/activity', {
                    organization_id: organizationId,
                    activity: this.esi_enabled
                })

                if (data?.success) {
                    await this.fetchFinanceDetails()
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    return true
                }
                toast.error({
                    title: 'Error!',
                    message: data.message,
                    timeout: 1500
                })
                this.error = data?.message
                return false
            } catch (err) {
                console.error('[Finance] enableEsi error:', err)
                this.error = err?.message || 'ESI setup failed'
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                return false
            }
        },

        /* =====================================================
           🔹 ENABLE & SAVE PTAX
        ===================================================== */
        async enablePtax() {
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            const { $api } = useNuxtApp()

            try {
                this.loading = true
                this.error = null

                const { data } = await $api.post('/finance/ptax', {
                    organization_id: organizationId,
                    ptax_formula: this.ptax_formula,
                    ptax_registration_number: this.ptax_registration_number,
                    ptax_registered_organization_name: this.ptax_registered_organization_name,
                })

                if (data?.success) {
                    await this.fetchFinanceDetails()
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    return true
                }
                toast.error({
                    title: 'Error!',
                    message: data.message,
                    timeout: 1500
                })
                this.error = data?.message
                return false
            } catch (err) {
                console.error('[Finance] enablePtax error:', err)
                this.error = err?.message || 'PTAX setup failed'
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                return false
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async enableDisablePtax() {
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId) return false

            const { $api } = useNuxtApp()

            try {
                // this.loading = true
                this.error = null

                const { data } = await $api.put('/finance/ptax/activity', {
                    organization_id: organizationId,
                    activity: this.ptax_enabled
                })

                if (data?.success) {
                    await this.fetchFinanceDetails()
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    return true
                }
                toast.error({
                    title: 'Error!',
                    message: data.message,
                    timeout: 1500
                })
                this.error = data?.message
                return false
            } catch (err) {
                console.error('[Finance] enablePtax error:', err)
                this.error = err?.message || 'PTAX setup failed'
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                return false
            }
        },

        /* =====================================================
           🔹 RESET STORE
        ===================================================== */
        reset() {
            this.loading = false
            this.error = null
            this.financeEnabledMap = {}
            this.financeDetails = null
            this.lastCheckedOrganizationId = null
        },
    },
})
