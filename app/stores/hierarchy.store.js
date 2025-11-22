import { defineStore } from 'pinia'

export const useHierarchyStore = defineStore('hierarchy', {
    state: () => ({
        // 🌐 Org-wide designation hierarchy
        orgHierarchy: null,      // { organization_id, levels: [...] }
        orgLoading: false,
        orgError: null,

        // 🏢 Department reporting hierarchy (tree)
        deptHierarchy: null,     // { organization_id, department_id, hierarchy: {...} }
        deptLoading: false,
        deptError: null,

        // Current selection
        currentOrgId: null,
        currentDeptId: null,
    }),

    getters: {
        hasOrgHierarchy: (s) => !!s.orgHierarchy && Array.isArray(s.orgHierarchy.levels) && s.orgHierarchy.levels.length > 0,
        hasDeptHierarchy: (s) => !!s.deptHierarchy && !!s.deptHierarchy.hierarchy,

        orgLevels: (s) => s.orgHierarchy?.levels || [],
        deptTree: (s) => s.deptHierarchy?.hierarchy || null,
    },

    actions: {
        /* ----------------------------------------------------
         🟢 Fetch organization-wide designation hierarchy
         GET /organizations/{organization_id}/hierarchy
        ---------------------------------------------------- */
        async fetchOrganizationHierarchy(organizationId) {
            if (!organizationId) {
                throw new Error('organizationId is required')
            }

            const { $api } = useNuxtApp()
            this.orgLoading = true
            this.orgError = null
            this.currentOrgId = organizationId

            try {
                const { data } = await $api.get(
                    `/organizations/${encodeURIComponent(organizationId)}/hierarchy`
                )

                // data shape (from proto):
                // { organization_id, levels: [ { level, label, designation_count, employee_count, designations, employees } ] }
                this.orgHierarchy = data
                return data
            } catch (err) {
                console.error('❌ Failed to fetch organization hierarchy:', err)
                this.orgError =
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to load organization hierarchy'
                throw err
            } finally {
                // keep UI smooth like your org store
                setTimeout(() => {
                    this.orgLoading = false
                }, 500)
            }
        },

        /* ----------------------------------------------------
         🟣 Fetch department reporting hierarchy
         GET /organizations/{organization_id}/departments/{department_id}/hierarchy
        ---------------------------------------------------- */
        async fetchDepartmentHierarchy(organizationId, departmentId) {
            if (!organizationId) {
                throw new Error('organizationId is required')
            }
            if (!departmentId) {
                throw new Error('departmentId is required')
            }

            const { $api } = useNuxtApp()
            this.deptLoading = true
            this.deptError = null
            this.currentOrgId = organizationId
            this.currentDeptId = departmentId

            try {
                const { data } = await $api.get(
                    `/organizations/${encodeURIComponent(
                        organizationId
                    )}/departments/${encodeURIComponent(
                        departmentId.value
                    )}/hierarchy`
                )

                // data shape (from proto):
                // { organization_id, department_id, hierarchy: { id, full_name, ..., reportees: [...] } }
                this.deptHierarchy = data.hierarchy ? data : null
                return data
            } catch (err) {
                console.error('❌ Failed to fetch department hierarchy:', err)
                this.deptError =
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to load department hierarchy'
                throw err
            } finally {
                setTimeout(() => {
                    this.deptLoading = false
                }, 500)
            }
        },

        /* ----------------------------------------------------
         🔄 Helpers
        ---------------------------------------------------- */
        resetOrgHierarchy() {
            this.orgHierarchy = null
            this.orgError = null
            this.orgLoading = false
        },

        resetDeptHierarchy() {
            this.deptHierarchy = null
            this.deptError = null
            this.deptLoading = false
        },

        resetAll() {
            this.resetOrgHierarchy()
            this.resetDeptHierarchy()
            this.currentOrgId = null
            this.currentDeptId = null
        },
    },
})
