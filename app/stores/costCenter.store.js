import { defineStore } from 'pinia'

const mapCostCenter = (c) => ({
    id: c?.id || '',
    organization_id: c?.organization_id || '',
    name: c?.name || '',
    code: c?.code || '',
    description: c?.description || '',
    is_active: !!c?.is_active,
    employee_count: c?.employee_count || 0,
    created_at: c?.created_at || '',
    updated_at: c?.updated_at || '',
})

const mapEmployee = (e) => ({
    id: e?.id || '',
    organization_id: e?.organization_id || '',
    employee_code: e?.employee_code || '',
    full_name: e?.full_name || '',
    email: e?.email || '',
    designation_name: e?.designation_name || '',
    department_name: e?.department_name || '',
    reporting_manager_name: e?.reporting_manager_name || '',
    reporting_manager_id: e?.reporting_manager_id || '',
    profile_image_file_id: e?.profile_image_file_id || '',
    profile_image: e?.profile_image || '',
})

export const useCostCenterStore = defineStore('costCenter', {
    state: () => ({
        loading: false,
        organizationId: null,
        costCenters: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        search: '',
        selectedId: null,

        employeesLoading: false,
        employees: [],
        employeesTotal: 0,
        employeesPage: 1,
        employeesLimit: 50,
        employeesTotalPages: 0,
        employeesSearch: '',
    }),

    getters: {
        selectedCostCenter(state) {
            return state.costCenters.find(c => String(c.id) === String(state.selectedId))
                || state.costCenters[0]
                || null
        },
    },

    actions: {
        async fetchCostCenters(orgId, opts = {}) {
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
                const { data } = await $api.get('/cost-centers', { params })
                this.costCenters = (data?.cost_centers || []).map(mapCostCenter)
                this.total = data?.total || 0
                this.page = data?.page || 1
                this.limit = data?.limit || this.limit
                this.totalPages = data?.total_pages || 0
                this.search = params.search

                if (!this.selectedId || !this.costCenters.find(c => String(c.id) === String(this.selectedId))) {
                    this.selectedId = this.costCenters[0]?.id || null
                }
                return this.costCenters
            } catch (err) {
                console.error('[cost-center] fetch cost centers error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        selectCostCenter(id) {
            this.selectedId = id
        },

        async createCostCenter(payload) {
            const { $api } = useNuxtApp()
            const { data } = await $api.post('/cost-centers', {
                organization_id: this.organizationId,
                ...payload,
            })
            const created = mapCostCenter(data?.cost_center)
            if (created.id) {
                this.costCenters.push(created)
                this.total += 1
                this.selectedId = created.id
            }
            return created
        },

        async updateCostCenter(id, payload) {
            const { $api } = useNuxtApp()
            const { data } = await $api.put(`/cost-centers/${id}`, payload)
            const updated = mapCostCenter(data?.cost_center)
            const idx = this.costCenters.findIndex(c => String(c.id) === String(id))
            if (idx >= 0) {
                this.costCenters[idx] = { ...this.costCenters[idx], ...updated }
            }
            return updated
        },

        async deleteCostCenter(id) {
            const { $api } = useNuxtApp()
            const { data } = await $api.delete(`/cost-centers/${id}`)
            this.costCenters = this.costCenters.filter(c => String(c.id) !== String(id))
            if (String(this.selectedId) === String(id)) {
                this.selectedId = this.costCenters[0]?.id || null
            }
            return data
        },

        async fetchEmployees(costCenterId, opts = {}) {
            this.employeesLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: this.organizationId,
                    page: opts.page ?? this.employeesPage,
                    limit: opts.limit ?? this.employeesLimit,
                    search: opts.search ?? this.employeesSearch,
                }
                const { data } = await $api.get(`/cost-centers/${costCenterId}/employees`, { params })
                this.employees = (data?.employees || []).map(mapEmployee)
                this.employeesTotal = data?.total || 0
                this.employeesPage = data?.page || 1
                this.employeesTotalPages = data?.total_pages || 0
                return this.employees
            } catch (err) {
                console.error('[cost-center] fetch employees error:', err)
                throw err
            } finally {
                this.employeesLoading = false
            }
        },

        async assignEmployees(costCenterId, employeeIds) {
            const { $api } = useNuxtApp()
            const { data } = await $api.post(`/cost-centers/${costCenterId}/assign-employees`, {
                organization_id: this.organizationId,
                employee_ids: employeeIds,
            })
            return data
        },

        async removeEmployee(costCenterId, employeeId) {
            const { $api } = useNuxtApp()
            const { data } = await $api.post(`/cost-centers/${costCenterId}/remove-employee`, {
                organization_id: this.organizationId,
                employee_id: employeeId,
            })
            this.employees = this.employees.filter(e => String(e.id) !== String(employeeId))
            this.employeesTotal -= 1
            const cc = this.costCenters.find(c => String(c.id) === String(costCenterId))
            if (cc) cc.employee_count = Math.max(0, (cc.employee_count || 0) - 1)
            return data
        },

        async refreshCounts() {
            if (!this.organizationId) return
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/cost-centers', {
                    params: { organization_id: this.organizationId, limit: this.limit },
                })
                const fresh = (data?.cost_centers || []).map(mapCostCenter)
                fresh.forEach(f => {
                    const idx = this.costCenters.findIndex(c => String(c.id) === String(f.id))
                    if (idx >= 0) this.costCenters[idx].employee_count = f.employee_count
                })
            } catch (err) {
                console.error('[cost-center] refresh counts error:', err)
            }
        },
    },
})