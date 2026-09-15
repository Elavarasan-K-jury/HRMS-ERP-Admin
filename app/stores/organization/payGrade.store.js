import { defineStore } from 'pinia'

const mapPayGrade = (p) => ({
    id: p?.id || '',
    organization_id: p?.organization_id || '',
    name: p?.name || '',
    description: p?.description || '',
    employee_count: p?.employee_count || 0,
    created_at: p?.created_at || '',
    updated_at: p?.updated_at || '',
})

export const usePayGradeStore = defineStore('payGrade', {
    state: () => ({
        loading: false,
        saving: false,
        organizationId: null,
        payGrades: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: '',

        pay_grade_id: null,
        name: null,
        description: null,
    }),

    getters: {
        payGradeSelect(state) {
            return (state.payGrades || [])
                .filter(p => p.name)
                .map(p => ({ value: p.id, label: p.name }))
        },
    },

    actions: {
        async fetchPayGrades(orgId, opts = {}) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                this.organizationId = orgId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.page,
                    limit: opts.limit ?? this.limit,
                    search: opts.search ?? this.search,
                }
                const { data } = await $api.get('/pay-grades', { params })
                this.payGrades = (data?.pay_grades || []).map(mapPayGrade)
                this.total = data?.total || 0
                this.page = data?.page || 1
                this.limit = data?.limit || this.limit
                this.totalPages = data?.total_pages || 0
                this.search = params.search
                return this.payGrades
            } catch (err) {
                console.error('[pay-grade] fetch pay grades error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        resetForm() {
            this.pay_grade_id = null
            this.name = null
            this.description = null
        },

        async createPayGrade() {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/pay-grades', {
                    organization_id: this.organizationId,
                    name: this.name,
                    description: this.description,
                })
                toast.success({ title: 'Success!', message: data.message || 'Pay grade created', timeout: 1500 })
                this.page = 1
                await this.fetchPayGrades(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 1500 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updatePayGrade() {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.put(`/pay-grades/${this.pay_grade_id}`, {
                    name: this.name,
                    description: this.description,
                })
                toast.success({ title: 'Success!', message: data.message || 'Pay grade updated', timeout: 1500 })
                await this.fetchPayGrades(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 1500 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deletePayGrade(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/pay-grades/${id}`, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Pay grade deleted', timeout: 1500 })
                await this.fetchPayGrades(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 1500 })
                throw err
            }
        },
    },
})

function extractError(err) {
    const msg = err?.response?.data?.error || err?.message || 'Something went wrong'
    return String(msg).replace(/^\d+ [A-Z_]+:\s*/, '')
}