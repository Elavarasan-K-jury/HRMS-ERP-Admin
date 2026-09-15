import { defineStore } from 'pinia'

export const useSubscriptionPlanStore = defineStore('subscription-plan', {
    state: () => ({
        /* ===============================
           PLANS
        =============================== */
        plan_list: [],
        plans: [],
        loading: false,
        error: null,

        meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            search: '',
            sortBy: 'created_at',
            sortOrder: 'desc',
        },

        /* ===============================
           FEATURES
        =============================== */
        features: [],
        featuresLoading: false,

        /* ===============================
           UI STATE
        =============================== */
        editId: null,
        editData: null,

        deleteId: null,
        deleteData: null,

        create: {
            name: null,
            description: null,
            monthly_price: null,
            yearly_price: null,
            trial_days: null,
            gst: null,
            is_active: true,
        },
    }),

    getters: {
        hasData: (s) => s.plans.length > 0,
        getById: (s) => (id) => s.plans.find(p => p.id === id),
        hasNext: (s) => s.meta.page < s.meta.totalPages,
        hasPrev: (s) => s.meta.page > 1,
    },

    actions: {
        /* ===============================
           HELPERS
        =============================== */
        _normalize(plan = {}) {
            return {
                ...plan,
                monthly_price: Number(plan.monthly_price ?? 0),
                yearly_price: Number(plan.yearly_price ?? 0),
                trial_days: Number(plan.trial_days ?? 0),
                gst: Number(plan.gst ?? 0),
                is_active: Boolean(plan.is_active),
            }
        },

        /* ===============================
           FETCH PLANS
        =============================== */
        async fetchPlans() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/subscription-plans', {
                    params: {
                        page: this.meta.page,
                        limit: this.meta.limit,
                        search: this.meta.search,
                        sort_by: this.meta.sortBy,
                        sort_order: this.meta.sortOrder,
                    },
                })

                this.plans = (data?.data ?? []).map(this._normalize)
                this.meta.total = Number(data?.total ?? 0)
                this.meta.page = Number(data?.page ?? 1)
                this.meta.limit = Number(data?.limit ?? 10)
                this.meta.totalPages = Number(data?.total_pages ?? 1)
            } catch (err) {
                console.error('❌ Failed to fetch subscription plans:', err)
                this.error = err?.message
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            } finally {
                this.loading = false
            }
        },

        async fetchPlansForSelect() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/subscription-plans', {
                    params: {
                        sort_by: this.meta.sortBy,
                        sort_order: this.meta.sortOrder,
                    },
                })

                this.plan_list = (data?.data ?? []).map(this._normalize)
            } catch (err) {
                console.error('❌ Failed to fetch plans for select:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            } finally {
                this.loading = false
            }
        },

        /* ===============================
           CREATE PLAN
        =============================== */
        async createPlan() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.post('/subscription-plans', {
                    name: this.create.name,
                    description: this.create.description,
                    monthly_price: this.create.monthly_price,
                    yearly_price: this.create.yearly_price,
                    trial_days: this.create.trial_days,
                    gst: this.create.gst,
                })

                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500,
                    })
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500,
                    })
                }

                this.meta.page = 1
                await this.fetchPlans()
                return data
            } catch (err) {
                console.error('❌ Create plan failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            }
        },

        /* ===============================
           UPDATE PLAN
        =============================== */
        async updatePlan() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.put(
                    `/subscription-plans/${this.editId}`,
                    {
                        name: this.create.name,
                        description: this.create.description,
                        monthly_price: this.create.monthly_price,
                        yearly_price: this.create.yearly_price,
                        trial_days: this.create.trial_days,
                        gst: this.create.gst,
                        is_active: this.create.is_active,
                    }
                )

                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500,
                    })
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500,
                    })
                }

                await this.fetchPlans()
                return data
            } catch (err) {
                console.error('❌ Update plan failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            }
        },

        /* ===============================
           DELETE PLAN
        =============================== */
        async deletePlan() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.delete(
                    `/subscription-plans/${this.deleteId}`
                )

                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500,
                    })
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500,
                    })
                }

                await this.fetchPlans()
                return data
            } catch (err) {
                console.error('❌ Delete plan failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            }
        },

        /* ===============================
           FEATURES
        =============================== */
        async fetchFeatures(planId) {
            const toast = useToast()
            const { $api } = useNuxtApp()

            this.featuresLoading = true

            try {
                const { data } = await $api.get(
                    `/subscription-plans/${planId}/features`
                )
                this.features = data?.data ?? []
            } catch (err) {
                console.error('❌ Failed to fetch features:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            } finally {
                this.featuresLoading = false
            }
        },

        async updateFeature(featureId, payload) {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.put(
                    `/subscription-plan-features/${featureId}`,
                    {
                        value: payload.is_unlimited ? null : payload.value,
                        unit: payload.unit,
                        is_unlimited: payload.is_unlimited,
                    }
                )

                toast.success({
                    title: 'Success!',
                    message: data.message || 'Feature updated',
                    timeout: 1500,
                })

                return data
            } catch (err) {
                console.error('❌ Update feature failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || err.message,
                    timeout: 1500,
                })
            }
        },

        /* ===============================
           PAGINATION
        =============================== */
        async nextPage() {
            if (this.hasNext) {
                this.meta.page++
                return this.fetchPlans()
            }
        },

        async prevPage() {
            if (this.hasPrev) {
                this.meta.page--
                return this.fetchPlans()
            }
        },

        async refresh() {
            return this.fetchPlans()
        },

        /* ===============================
           RESET
        =============================== */
        clear() {
            this.plans = []
            this.features = []
            this.error = null
            this.meta = {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                search: '',
                sortBy: 'created_at',
                sortOrder: 'desc',
            }
        },
    },
})
