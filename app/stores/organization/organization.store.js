import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'
import { useOrganizationSubscriptionStore } from '../shared/organizationSubscription.store'

export const useOrganizationStore = defineStore('organization', {
    state: () => ({
        organizations_select: [],
        organizations: [],
        loading: false,
        error: null,

        organization: null,

        meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            search: null,
            sortBy: 'created_at',
            sortOrder: 'desc',
        },

        editId: null,
        editData: null,

        deleteId: null,
        deleteData: null,

        create: {
            name: null,
            domain: null,
            gst_number: null,
            email: null,
            contact_person_name: null,
            contact_person_number: null,
            industry: null,
            size: null,
            plan: null,
            plan_duration: null,
            admin_email: null,
            admin_phone: null,
            address: {
                streetName: null,
                streetNumber: null,
                landmark: null,
                area: null,
                locality: null,
                city: null,
                state: null,
                country: null,
                postalCode: null,
            },
            limits: {
                maxEmployees: null,
                storageGb: null,
                apiRatePerMinute: null,
                payrollRunsPerMonth: null,
                maxLeavePolicies: null,
                maxAdmins: null,
            },
        },
    }),

    getters: {
        hasData: (s) => s.organizations.length > 0,
        getById: (s) => (id) => s.organizations.find(o => o.id === id),
        hasNext: (s) => s.meta.page < s.meta.totalPages,
        hasPrev: (s) => s.meta.page > 1,
    },

    actions: {
        /* ===============================
           HELPERS
        =============================== */
        _parseAddress(addr) {
            if (!addr) return null
            if (typeof addr === 'object') return addr
            try {
                return JSON.parse(addr)
            } catch {
                return addr
            }
        },

        _normalize(org = {}) {
            return {
                ...org,
                address: this._parseAddress(org.address),
            }
        },

        _cleanPayload(obj) {
            const out = {}
            for (const [k, v] of Object.entries(obj || {})) {
                if (v === null || v === undefined || v === '') continue
                if (Array.isArray(v)) {
                    out[k] = v
                } else if (typeof v === 'object') {
                    const cleaned = this._cleanPayload(v)
                    if (Object.keys(cleaned).length) out[k] = cleaned
                } else {
                    out[k] = v
                }
            }
            return out
        },

        /* ===============================
           FETCH ORGANIZATIONS
        =============================== */
        async fetchOrganizations() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/organizations', {
                    params: {
                        page: this.meta.page,
                        limit: this.meta.limit,
                        search: this.meta.search || null,
                        sort_by: this.meta.sortBy,
                        sort_order: this.meta.sortOrder,
                    },
                })

                const list = Array.isArray(data?.organizations)
                    ? data.organizations
                    : []

                this.organizations = list.map(this._normalize)
                this.meta.total = Number(data?.total ?? 0)
                this.meta.page = Number(data?.page ?? 1)
                this.meta.limit = Number(data?.limit ?? 10)
                this.meta.totalPages = Number(data?.total_pages ?? 1)

            } catch (err) {
                console.error('❌ fetchOrganizations:', err)
                this.error = err
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000)
            }
        },

        async fetchOrganizationsForSelect() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.get('/organizations', {
                    params: {
                        sort_by: this.meta.sortBy,
                        sort_order: this.meta.sortOrder,
                    },
                })

                const list = Array.isArray(data?.organizations)
                    ? data.organizations
                    : []

                this.organizations_select = list.map(o => ({
                    value: o.id,
                    label: o.name,
                }))
            } catch (err) {
                console.error('❌ fetchOrganizationsForSelect:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            }
        },

        /* ===============================
           CREATE ORGANIZATION
        =============================== */
        async createOrganization() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const form = JSON.parse(JSON.stringify(this.create))
                const { limits, plan, plan_duration, planDuration, ...orgFields } = form

                const { data } = await $api.post('/organizations', this._cleanPayload({
                    ...orgFields,
                    address: orgFields.address,
                    max_employees: limits?.maxEmployees ?? null,
                    max_storage_in_gb: limits?.storageGb ?? null,
                    max_api_rate_per_minute: limits?.apiRatePerMinute ?? null,
                    max_payroll_runs_per_month: limits?.payrollRunsPerMonth ?? null,
                    max_leave_policies: limits?.maxLeavePolicies ?? null,
                    max_admin_accounts: limits?.maxAdmins ?? null,
                }))

                if (data.id) {
                    toast.success({
                        title: 'Success!',
                        message: data.message || 'Organization created',
                        timeout: 1500,
                    })
                    if (plan) {
                        const { data: subData } = await $api.post(`/organizations/${data.id}/subscription`, {
                            plan_id: plan,
                            billing_interval: planDuration ? planDuration.toUpperCase() : 'MONTHLY'
                        })
                        if (subData.success) {
                            toast.success({
                                title: 'Success!',
                                message: subData.message || 'Organization created',
                                timeout: 1500,
                            })
                        } else {
                            toast.error({
                                title: 'Error!',
                                message: subData.message,
                                timeout: 1500
                            })
                        }
                    }
                    this.meta.page = 1
                    await this.fetchOrganizations()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500
                    })
                }
                return data
            } catch (err) {
                console.error('❌ createOrganization:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
                throw err
            }
        },

        /* ===============================
           UPDATE ORGANIZATION
        =============================== */
        async updateOrganization() {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const organizationSubscriptionStore = useOrganizationSubscriptionStore()

            try {
                const form = JSON.parse(JSON.stringify(this.create))
                const { limits, plan, plan_duration, planDuration, ...orgFields } = form

                const { data } = await $api.put(
                    `/organizations/${this.editId}`,
                    this._cleanPayload({
                        ...orgFields,
                        address: orgFields.address,
                        max_employees: limits?.maxEmployees ?? null,
                        max_storage_in_gb: limits?.storageGb ?? null,
                        max_api_rate_per_minute: limits?.apiRatePerMinute ?? null,
                        max_payroll_runs_per_month: limits?.payrollRunsPerMonth ?? null,
                        max_leave_policies: limits?.maxLeavePolicies ?? null,
                        max_admin_accounts: limits?.maxAdmins ?? null,
                    })
                )
                if (data.id) {
                    toast.success({
                        title: 'Success!',
                        message: data.message || 'Organization updated',
                        timeout: 1500,
                    })
                    if (plan) {
                        const currentSub = await organizationSubscriptionStore.fetchOrganizationSubscription(this.editId)
                        if (currentSub) {
                            if (currentSub.plan_id !== plan) {
                                const { data: changeData } = await $api.post(`/organizations/${this.editId}/subscription/change-plan`, {
                                    new_plan_id: plan,
                                    effective_immediately: true,
                                })
                                if (changeData.success) {
                                    toast.success({
                                        title: 'Success!',
                                        message: changeData.message || 'Subscription plan updated successfully.',
                                        timeout: 1500,
                                    })
                                }
                            }
                        } else {
                            const { data: subData } = await $api.post(`/organizations/${this.editId}/subscription`, {
                                plan_id: plan,
                                billing_interval: planDuration ? planDuration.toUpperCase() : 'MONTHLY'
                            })
                            if (subData.success) {
                                toast.success({
                                    title: 'Success!',
                                    message: subData.message || 'Subscription data added successfully.',
                                    timeout: 1500,
                                })
                            } else {
                                toast.error({
                                    title: 'Error!',
                                    message: subData.message,
                                    timeout: 1500
                                })
                            }
                        }
                    }
                    this.meta.page = 1
                    await this.fetchOrganizations()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message || 'Organization updation error',
                        timeout: 1500
                    })
                }
                return data
            } catch (err) {
                console.error('❌ updateOrganization:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
                throw err
            }
        },

        async saveOrganization(organizationId) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            this.loading = true

            try {
                const { data } = await $api.get(
                    `/organizations/${organizationId}`
                )


                if (data.success) {
                    this.organization = data.organization
                    auth.organization = organizationId
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data?.message || 'Error fetching organization details!',
                        timeout: 1500,
                    })
                }

            } catch (err) {
                console.error('❌ deleteOrganization:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
                throw err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 500);
            }
        },

        /* ===============================
           DELETE ORGANIZATION
        =============================== */
        async deleteOrganization() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.delete(
                    `/organizations/${this.deleteId}`
                )
                toast.success({
                    title: 'Success!',
                    message: data.message || 'Organization deleted',
                    timeout: 1500,
                })

                this.meta.page = 1
                await this.fetchOrganizations()
                return data
            } catch (err) {
                console.error('❌ deleteOrganization:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
                throw err
            }
        },

        /* ===============================
           PAGINATION & HELPERS
        =============================== */
        async refresh() {
            return this.fetchOrganizations()
        },

        async nextPage() {
            if (this.hasNext) {
                this.meta.page++
                return this.fetchOrganizations()
            }
        },

        async prevPage() {
            if (this.hasPrev) {
                this.meta.page--
                return this.fetchOrganizations()
            }
        },

        async setSort({ sortBy, sortOrder }) {
            this.meta.sortBy = sortBy
            this.meta.sortOrder = sortOrder
            this.meta.page = 1
            return this.fetchOrganizations()
        },

        /* ===============================
           RESET
        =============================== */
        clear() {
            this.organizations = []
            this.organizations_select = []
            this.error = null
            this.meta = {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                search: null,
                sortBy: 'created_at',
                sortOrder: 'desc',
            }
        },
    },
})
