import { defineStore } from 'pinia'

const mapPolicy = (p) => ({
    id: p?.id || '',
    organization_id: p?.organization_id || '',
    title: p?.title || p?.name || '',
    name: p?.title || p?.name || '',
    description: p?.description || '',
    duration_value: p?.duration_value ?? p?.durationValue ?? 0,
    duration_unit: p?.duration_unit ?? p?.durationUnit ?? 'DAYS',
    duration: p?.duration_value ?? p?.durationValue ?? 0,
    unit: p?.duration_unit ?? p?.durationUnit ?? 'DAYS',
    is_default: p?.is_default ?? p?.isDefault ?? false,
    isDefault: p?.is_default ?? p?.isDefault ?? false,
    employee_count: p?.employee_count ?? p?.employeeCount ?? 0,
    status: p?.status || 'ACTIVE',
    created_at: p?.created_at || p?.createdAt || '',
    updated_at: p?.updated_at || p?.updatedAt || '',
})

export const useNoticePeriodStore = defineStore('noticePeriod', {
    state: () => ({
        loading: false,
        saving: false,
        organizationId: null,
        policies: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc',

        // form fields
        policy_id: null,
        title: '',
        description: '',
        duration_value: 30,
        duration_unit: 'DAYS',
        is_default: false,

        // employee assignment
        assignedEmployees: [],
        assignLoading: false,
        employeeSearch: '',
        availableEmployees: [],
        selectedEmployeeIds: [],
    }),

    getters: {
        hasPolicies: (state) => (state.policies || []).length > 0,
    },

    actions: {
        async fetchPolicies(orgId, opts = {}) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                this.organizationId = orgId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.page,
                    limit: opts.limit ?? this.limit,
                    search: opts.search ?? this.search,
                    sort_by: opts.sortBy ?? this.sortBy,
                    sort_order: opts.sortOrder ?? this.sortOrder,
                }
                const { data } = await $api.get('/notice-period-policies', { params })
                this.policies = (data?.policies || []).map(mapPolicy)
                this.total = data?.total || 0
                this.page = data?.page || 1
                this.limit = data?.limit || this.limit
                this.totalPages = data?.total_pages || 1
                this.search = params.search
                return this.policies
            } catch (err) {
                console.error('[noticePeriod] fetchPolicies error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        resetForm() {
            this.policy_id = null
            this.title = ''
            this.description = ''
            this.duration_value = 30
            this.duration_unit = 'DAYS'
            this.is_default = false
        },

        validateForm() {
            const errors = []
            const t = (this.title || '').trim()
            if (!t) errors.push('Title is required')
            if (t.length > 100) errors.push('Title must be at most 100 characters')
            if (this.description && this.description.trim().length > 500) errors.push('Description must be at most 500 characters')
            const dv = Number(this.duration_value)
            if (!this.duration_value || isNaN(dv) || dv <= 0) errors.push('Duration must be a positive number')
            if (!['DAYS', 'MONTHS'].includes(this.duration_unit)) errors.push('Duration unit must be DAYS or MONTHS')
            return errors
        },

        async createPolicy() {
            const toast = useToast()
            const v = this.validateForm()
            if (v.length) {
                toast.error({ title: 'Validation Error', message: v.join(', '), timeout: 2000 })
                throw new Error(v.join(', '))
            }
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/notice-period-policies', {
                    organization_id: this.organizationId,
                    title: this.title.trim(),
                    description: this.description?.trim() || null,
                    duration_value: Number(this.duration_value),
                    duration_unit: this.duration_unit,
                    is_default: !!this.is_default,
                })
                toast.success({ title: 'Success!', message: data.message || 'Policy created', timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 2000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updatePolicy() {
            const toast = useToast()
            const v = this.validateForm()
            if (v.length) {
                toast.error({ title: 'Validation Error', message: v.join(', '), timeout: 2000 })
                throw new Error(v.join(', '))
            }
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.put(`/notice-period-policies/${this.policy_id}`, {
                    title: this.title.trim(),
                    description: this.description?.trim() || null,
                    duration_value: Number(this.duration_value),
                    duration_unit: this.duration_unit,
                    is_default: !!this.is_default,
                })
                toast.success({ title: 'Success!', message: data.message || 'Policy updated', timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 2000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deletePolicy(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/notice-period-policies/${id}`, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Policy deleted', timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 2000 })
                throw err
            }
        },

        async setDefaultPolicy(id, isDefault) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.patch(`/notice-period-policies/${id}/default`, {
                    is_default: isDefault,
                }, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || (isDefault ? 'Set as default' : 'Removed default'), timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 2000 })
                throw err
            }
        },

        async fetchPolicyEmployees(policyId, opts = {}) {
            this.assignLoading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/notice-period-policies/${policyId}/employees`, {
                    params: {
                        organization_id: this.organizationId,
                        page: opts.page || 1,
                        limit: opts.limit || 50,
                        search: opts.search || '',
                    },
                })
                this.assignedEmployees = data?.employees || []
                return this.assignedEmployees
            } catch (err) {
                console.error('[noticePeriod] fetchPolicyEmployees error:', err)
                throw err
            } finally {
                this.assignLoading = false
            }
        },

        async fetchAvailableEmployees(search = '') {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/employees', {
                    params: {
                        organization_id: this.organizationId,
                        page: 1,
                        limit: 20,
                        search,
                    },
                })
                // normalize employee list – API returns employees or data
                const list = data?.employees || data?.data || []
                this.availableEmployees = list.map(e => ({
                    id: e.id || e._id,
                    full_name: e.fullName || e.full_name || `${e.firstName || ''} ${e.lastName || ''}`.trim(),
                    employee_code: e.employeeCode || e.employee_code || '',
                    email: e.email || '',
                    designation_name: e.designation?.name || e.designation_name || '',
                }))
                return this.availableEmployees
            } catch (err) {
                console.error('[noticePeriod] fetchAvailableEmployees error:', err)
                throw err
            }
        },

        async assignEmployees(policyId, employeeIds) {
            const toast = useToast()
            if (!employeeIds || !employeeIds.length) {
                toast.error({ title: 'Error', message: 'Select at least one employee', timeout: 1500 })
                throw new Error('Select at least one employee')
            }
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/notice-period-policies/${policyId}/employees`, {
                    employee_ids: employeeIds,
                }, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Employees assigned', timeout: 1500 })
                await this.fetchPolicyEmployees(policyId)
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 2000 })
                throw err
            }
        },

        async removeEmployee(policyId, employeeId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/notice-period-policies/${policyId}/employees/${employeeId}`, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Employee removed', timeout: 1500 })
                await this.fetchPolicyEmployees(policyId)
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 2000 })
                throw err
            }
        },
    },
})

function extractError(err) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.response?.data?.details?.[0]?.message || err?.message || 'Something went wrong'
    if (Array.isArray(err?.response?.data?.details)) {
        return err.response.data.details.map(d => d.message).join(', ')
    }
    return String(msg).replace(/^\d+ [A-Z_]+:\s*/, '')
}
