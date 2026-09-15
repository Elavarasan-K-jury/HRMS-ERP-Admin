import { defineStore } from 'pinia'

const mapPolicy = (p) => ({
    id: p?.id || '',
    organization_id: p?.organization_id || '',
    name: p?.name || '',
    description: p?.description || '',
    base_currency: p?.base_currency || '',
    payout_mode: p?.payout_mode || '',
    allow_future_date_claims: !!p?.allow_future_date_claims,
    approval_required: !!p?.approval_required,
    approval_mode: p?.approval_mode || '',
    is_active: p?.is_active ?? true,
    created_at: p?.created_at || '',
    updated_at: p?.updated_at || '',
    approval_levels: p?.approval_levels || [],
    category_count: p?.category_count || 0,
    employee_count: p?.employee_count || 0,
})

export const useExpensePolicyStore = defineStore('expensePolicy', {
    state: () => ({
        loading: false,
        saving: false,
        organizationId: null,
        policies: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
        selectedId: null,

        // Policy categories
        policyCategories: [],
        policyCategoriesLoading: false,
        policyCategoriesTotal: 0,
        policyCategoriesPage: 1,
        policyCategoriesLimit: 10,
        policyCategoriesTotalPages: 0,
        policyCategoriesSearch: '',

        // Policy employees
        policyEmployees: [],
        policyEmployeesLoading: false,
        policyEmployeesTotal: 0,
        policyEmployeesPage: 1,
        policyEmployeesLimit: 10,
        policyEmployeesTotalPages: 0,
        policyEmployeesSearch: '',
    }),

    getters: {
        selectedPolicy(state) {
            return state.policies.find(p => String(p.id) === String(state.selectedId)) || state.policies[0] || null
        },
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
                const { data } = await $api.get('/expense-policies', { params })
                this.policies = (data?.expense_policies || []).map(mapPolicy)
                this.total = data?.total || 0
                this.page = data?.page || 1
                this.limit = data?.limit || this.limit
                this.totalPages = data?.total_pages || 0
                this.search = params.search
                if (!this.selectedId || !this.policies.find(p => String(p.id) === String(this.selectedId))) {
                    this.selectedId = this.policies[0]?.id || null
                }
                return this.policies
            } catch (err) {
                console.error('[expensePolicy] fetch error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        selectPolicy(id) { this.selectedId = id },

        async createPolicy(payload) {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/expense-policies', {
                    organization_id: this.organizationId,
                    name: payload.name?.trim(),
                    description: payload.description?.trim() || null,
                    base_currency: payload.base_currency,
                    payout_mode: payload.payout_mode || null,
                    allow_future_date_claims: !!payload.allow_future_date_claims,
                    approval_required: !!payload.approval_required,
                    approval_mode: payload.approval_mode || null,
                    is_active: payload.is_active ?? true,
                    approval_levels: payload.approval_levels || [],
                })
                toast.success({ title: 'Success!', message: data.message || 'Policy created', timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                const created = mapPolicy(data?.expense_policy)
                if (created.id) this.selectedId = created.id
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to create'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updatePolicy(id, payload) {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const body = {
                    name: payload.name?.trim(),
                    description: payload.description?.trim() || null,
                    base_currency: payload.base_currency,
                    payout_mode: payload.payout_mode || null,
                    allow_future_date_claims: payload.allow_future_date_claims,
                    approval_required: payload.approval_required,
                    approval_mode: payload.approval_mode || null,
                    is_active: payload.is_active,
                }
                // Only include approval_levels if explicitly provided (prevents clearing on mode switch)
                if (payload.approval_levels !== undefined) {
                    body.approval_levels = payload.approval_levels
                }
                const { data } = await $api.put(`/expense-policies/${id}`, body)
                toast.success({ title: 'Success!', message: data.message || 'Policy updated', timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to update'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deletePolicy(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/expense-policies/${id}`, { params: { organization_id: this.organizationId } })
                toast.success({ title: 'Success!', message: data.message || 'Deleted', timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to delete'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async updateStatus(id, isActive) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.patch(`/expense-policies/${id}/status`, { is_active: isActive, organization_id: this.organizationId })
                toast.success({ title: 'Success!', message: data.message || (isActive ? 'Activated' : 'Deactivated'), timeout: 1500 })
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchPolicyCategories(policyId, opts = {}) {
            this.policyCategoriesLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: this.organizationId,
                    page: opts.page ?? this.policyCategoriesPage,
                    limit: opts.limit ?? this.policyCategoriesLimit,
                    search: opts.search ?? this.policyCategoriesSearch,
                }
                const { data } = await $api.get(`/expense-policies/${policyId}/categories`, { params })
                this.policyCategories = data?.policy_categories || []
                this.policyCategoriesTotal = data?.total || 0
                this.policyCategoriesPage = data?.page || 1
                this.policyCategoriesTotalPages = data?.total_pages || 0
                return this.policyCategories
            } catch (err) {
                console.error('[expensePolicy] fetchPolicyCategories error:', err)
                throw err
            } finally {
                this.policyCategoriesLoading = false
            }
        },

        async addPolicyCategories(policyId, categoryIds) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/expense-policies/${policyId}/categories`, {
                    organization_id: this.organizationId,
                    expense_category_ids: categoryIds,
                })
                toast.success({ title: 'Success!', message: data.message || 'Categories added', timeout: 1500 })
                await this.fetchPolicyCategories(policyId)
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to add categories'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async removePolicyCategory(policyId, categoryId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/expense-policies/${policyId}/categories/${categoryId}`, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Category removed', timeout: 1500 })
                await this.fetchPolicyCategories(policyId)
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to remove'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchCategoryRules(policyId, categoryId) {
            try {
                const { $api } = useNuxtApp()
                console.log('[fetchCategoryRules] Request:', { policyId, categoryId, organizationId: this.organizationId })
                const { data } = await $api.get(`/expense-policies/${policyId}/categories/${categoryId}/rules`, {
                    params: { organization_id: this.organizationId },
                })
                console.log('[fetchCategoryRules] Response data:', data)
                const rule = data?.rule || null
                console.log('[fetchCategoryRules] Returning rule:', rule)
                return rule
            } catch (err) {
                console.error('[expensePolicy] fetchCategoryRules error:', err)
                throw err
            }
        },

        async saveCategoryRules(policyId, categoryId, payload) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const body = { organization_id: this.organizationId, ...payload }
                console.log('[saveCategoryRules] Request:', { policyId, categoryId, body })
                const { data } = await $api.put(`/expense-policies/${policyId}/categories/${categoryId}/rules`, body)
                console.log('[saveCategoryRules] Response:', data)
                toast.success({ title: 'Success!', message: data.message || 'Rules updated successfully', timeout: 1500 })
                return data
            } catch (err) {
                console.error('[expensePolicy] saveCategoryRules error:', err)
                const msg = err?.response?.data?.error || err.message || 'Failed to save rules'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchCategoryApproval(policyId, categoryId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/expense-policies/${policyId}/categories/${categoryId}/approval`, {
                    params: { organization_id: this.organizationId },
                })
                return data?.levels || []
            } catch (err) {
                console.error('[expensePolicy] fetchCategoryApproval error:', err)
                throw err
            }
        },

        async saveCategoryApproval(policyId, categoryId, levels) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.put(`/expense-policies/${policyId}/categories/${categoryId}/approval`, {
                    organization_id: this.organizationId,
                    levels,
                })
                toast.success({ title: 'Success!', message: data.message || 'Approval chain updated', timeout: 1500 })
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to save approval chain'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchPolicyEmployees(policyId, opts = {}) {
            this.policyEmployeesLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: this.organizationId,
                    page: opts.page ?? this.policyEmployeesPage,
                    limit: opts.limit ?? this.policyEmployeesLimit,
                    search: opts.search ?? this.policyEmployeesSearch,
                }
                const { data } = await $api.get(`/expense-policies/${policyId}/employees`, { params })
                this.policyEmployees = data?.employees || []
                this.policyEmployeesTotal = data?.total || 0
                this.policyEmployeesPage = data?.page || 1
                this.policyEmployeesTotalPages = data?.total_pages || 0
                return this.policyEmployees
            } catch (err) {
                console.error('[expensePolicy] fetchPolicyEmployees error:', err)
                throw err
            } finally {
                this.policyEmployeesLoading = false
            }
        },

        async assignEmployees(policyId, employeeIds) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/expense-policies/${policyId}/employees`, {
                    organization_id: this.organizationId,
                    employee_ids: employeeIds,
                })
                const msg = data.message || `${data.added_count} employee(s) assigned`
                toast.success({ title: 'Success!', message: msg, timeout: 1500 })
                await this.fetchPolicyEmployees(policyId)
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to assign employees'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async removePolicyEmployee(policyId, employeeId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/expense-policies/${policyId}/employees/${employeeId}`, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Employee removed', timeout: 1500 })
                await this.fetchPolicyEmployees(policyId)
                await this.fetchPolicies(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to remove employee'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },
    },
})
