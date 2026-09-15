import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useAssetAssignmentStore = defineStore('AssetAssignment', {
    state: () => ({
        /* ================= LIST STATE ================= */
        total: 0,
        assignments: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        employeeFilter: null,
        statusFilter: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        loading: false,
        error: null,

        /* ================= ASSIGN MODAL ================= */
        assignModal: false,
        selectedEmployee: null,
        selectedAsset: null,
        assignDate: new Date().toISOString().split('T')[0],
        assignCondition: 'GOOD',
        assignNotes: '',

        /* ================= EMPLOYEE DRAWER ================= */
        drawerOpen: false,
        drawerEmployee: null,
        drawerAssignments: [],
        drawerLoading: false,
    }),

    actions: {
        /* ----------------------------------------------------
         * FETCH ASSIGNMENTS (LIST)
        ---------------------------------------------------- */
        async fetchAssignments() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const params = {
                    organization_id: auth.organization,
                    page: Number(this.page),
                    limit: Number(this.limit),
                    sort_by: this.sortBy,
                    sort_order: this.sortOrder,
                }

                if (this.search) params.search = this.search
                if (this.employeeFilter) params.employee_id = this.employeeFilter
                if (this.statusFilter) params.status = this.statusFilter

                const res = await $api.get('/asset-assignments', { params })

                if (res.data?.success) {
                    this.assignments = res.data.assignments
                    this.total = res.data.total
                    this.totalPages = res.data.total_pages
                }
            } catch (err) {
                console.error('[AssetAssignment] Fetch error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Failed to fetch assignments',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------------
         * CREATE ASSIGNMENT
        ---------------------------------------------------- */
        async createAssignment() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true

                if (!this.selectedEmployee?.value) {
                    toast.error({ title: 'Error!', message: 'Employee is required.', timeout: 1500 })
                    return
                }
                if (!this.selectedAsset?.value) {
                    toast.error({ title: 'Error!', message: 'Asset is required.', timeout: 1500 })
                    return
                }

                const payload = {
                    organization_id: auth.organization,
                    asset_id: this.selectedAsset.value,
                    employee_id: this.selectedEmployee.value,
                    assigned_date: this.assignDate || new Date().toISOString(),
                    condition_assign: this.assignCondition,
                    status: 'ASSIGNED',
                    notes: this.assignNotes,
                }

                const { data } = await $api.post('/asset-assignments', payload)

                if (data?.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message || 'Asset assigned successfully',
                        timeout: 1500,
                    })
                    this.assignModal = false
                    this.resetAssignForm()
                    await this.fetchAssignments()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data?.message || 'Failed to assign asset',
                        timeout: 1500,
                    })
                }
            } catch (err) {
                console.error('[AssetAssignment] Create error:', err)
                const msg = err?.data?.message || err?.message || 'Failed to assign asset'
                toast.error({ title: 'Error!', message: msg, timeout: 2000 })
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------------
         * OPEN EMPLOYEE DRAWER
        ---------------------------------------------------- */
        async openEmployeeDrawer(employee) {
            this.drawerEmployee = employee
            this.drawerAssignments = []
            this.drawerOpen = true
            this.drawerLoading = true

            try {
                const { $api } = useNuxtApp()
                const auth = useAuthStore()

                const res = await $api.get('/asset-assignments', {
                    params: {
                        organization_id: auth.organization,
                        employee_id: employee.employee_id || employee.id,
                        limit: 100,
                    }
                })

                if (res.data?.success) {
                    this.drawerAssignments = res.data.assignments.filter(a => !a.deleted_at)
                }
            } catch (err) {
                console.error('[AssetAssignment] Drawer fetch error:', err)
            } finally {
                this.drawerLoading = false
            }
        },

        closeDrawer() {
            this.drawerOpen = false
            this.drawerEmployee = null
            this.drawerAssignments = []
        },

        /* ----------------------------------------------------
         * RESET
        ---------------------------------------------------- */
        resetAssignForm() {
            this.selectedEmployee = null
            this.selectedAsset = null
            this.assignDate = new Date().toISOString().split('T')[0]
            this.assignCondition = 'GOOD'
            this.assignNotes = ''
        },
    },
})
