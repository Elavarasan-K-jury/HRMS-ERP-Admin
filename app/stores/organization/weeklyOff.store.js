import { defineStore } from 'pinia'

export const useWeeklyOffStore = defineStore('weeklyOff', {
    state: () => ({
        policies: [],
        assignments: [],
        assignedEmployees: [],
        assignedEmployeesLoading: false,
        assignedEmployeesError: null,
        loading: false,
        error: null,
    }),

    actions: {
        // ==================== POLICY CRUD ====================

        async fetchPolicies(organizationId) {
            const toast = useToast()
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/weekly-off/policies')
                this.policies = (data?.policies || []).map(this._policyFromApi)
                return this.policies
            } catch (err) {
                console.error('[weeklyOff-store] fetchPolicies:', err)
                this.policies = []
                toast.error({ title: 'Error', message: 'Failed to load weekly off policies' })
            } finally {
                this.loading = false
            }
        },

        async createPolicy(policyData) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const payload = this._policyToApi(policyData)
                const { data } = await $api.post('/weekly-off/policies', payload)
                const policy = this._policyFromApi(data)
                policy.employee_count = 0
                this.policies.unshift(policy)
                toast.success({ title: 'Created!', message: 'Weekly off policy created' })
                return policy
            } catch (err) {
                console.error('[weeklyOff-store] createPolicy:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to create policy' })
                throw err
            }
        },

        async updatePolicy(id, policyData) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const payload = this._policyToApi(policyData)
                const { data } = await $api.put(`/weekly-off/policies/${id}`, payload)
                const updated = this._policyFromApi(data)
                const idx = this.policies.findIndex(p => p.id === id)
                if (idx !== -1) {
                    updated.employee_count = this.policies[idx].employee_count ?? 0
                    this.policies[idx] = updated
                }
                toast.success({ title: 'Updated!', message: 'Policy updated' })
                return updated
            } catch (err) {
                console.error('[weeklyOff-store] updatePolicy:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to update policy' })
                throw err
            }
        },

        async deletePolicy(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                await $api.delete(`/weekly-off/policies/${id}`)
                this.policies = this.policies.filter(p => p.id !== id)
                toast.success({ title: 'Deleted!', message: 'Policy deleted' })
            } catch (err) {
                console.error('[weeklyOff-store] deletePolicy:', err)
                toast.error({ title: 'Error', message: 'Failed to delete policy' })
                throw err
            }
        },

        // ==================== ASSIGNMENT CRUD ====================

        async fetchAssignments(params = {}) {
            const toast = useToast()
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const query = {}
                if (params.employee_id) query.employee_id = params.employee_id
                if (params.active_only) query.active_only = 'true'
                if (params.weekly_off_policy_id) query.weekly_off_policy_id = params.weekly_off_policy_id
                const { data } = await $api.get('/weekly-off/assignments', { params: query })
                this.assignments = (data?.assignments || []).map(this._assignmentFromApi)
                return this.assignments
            } catch (err) {
                console.error('[weeklyOff-store] fetchAssignments:', err)
                this.assignments = []
                toast.error({ title: 'Error', message: 'Failed to load assignments' })
            } finally {
                this.loading = false
            }
        },

        async createAssignment(assignmentData) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const payload = this._assignmentToApi(assignmentData)
                const { data } = await $api.post('/weekly-off/assignments', payload)
                const assignment = this._assignmentFromApi(data)
                this.assignments.unshift(assignment)
                toast.success({ title: 'Assigned!', message: 'Weekly off assigned' })
                return assignment
            } catch (err) {
                console.error('[weeklyOff-store] createAssignment:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to assign' })
                throw err
            }
        },

        async updateAssignment(id, assignmentData) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const payload = this._assignmentToApi(assignmentData)
                const { data } = await $api.put(`/weekly-off/assignments/${id}`, payload)
                const updated = this._assignmentFromApi(data)
                const idx = this.assignments.findIndex(a => a.id === id)
                if (idx !== -1) this.assignments[idx] = updated
                toast.success({ title: 'Updated!', message: 'Assignment updated' })
                return updated
            } catch (err) {
                console.error('[weeklyOff-store] updateAssignment:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to update' })
                throw err
            }
        },

        async deleteAssignment(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                await $api.delete(`/weekly-off/assignments/${id}`)
                this.assignments = this.assignments.filter(a => a.id !== id)
                toast.success({ title: 'Removed!', message: 'Assignment removed' })
            } catch (err) {
                console.error('[weeklyOff-store] deleteAssignment:', err)
                toast.error({ title: 'Error', message: 'Failed to remove assignment' })
                throw err
            }
        },

        async bulkAssign(policyId, employeeIds, effectiveFrom, effectiveTo) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/weekly-off/assignments/bulk', {
                    weekly_off_policy_id: policyId,
                    employee_ids: employeeIds,
                    effective_from: effectiveFrom,
                    effective_to: effectiveTo || '',
                })
                toast.success({ title: 'Bulk assigned!', message: `${data.processed} employee(s) assigned` })
                return data
            } catch (err) {
                console.error('[weeklyOff-store] bulkAssign:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Bulk assign failed' })
                throw err
            }
        },

        /**
         * Employees currently assigned to a policy (current-assignment + soft-delete filtered server-side).
         * Resets list immediately so switching policies never shows a stale tab.
         */
        async fetchAssignedEmployees(policyId) {
            this.assignedEmployees = []
            this.assignedEmployeesError = null
            if (!policyId) return []
            this.assignedEmployeesLoading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/weekly-off/policies/${policyId}/assigned-employees`)
                this.assignedEmployees = (data?.assignments || []).map(this._assignmentFromApi)
                // Keep Summary + left-list count in sync with the Employees tab
                // (same fetch = same source of truth; §14 count must always match).
                const policy = this.policies.find(p => p.id === policyId)
                if (policy) policy.employee_count = this.assignedEmployees.length
                return this.assignedEmployees
            } catch (err) {
                console.error('[weeklyOff-store] fetchAssignedEmployees:', err)
                this.assignedEmployees = []
                this.assignedEmployeesError =
                    err?.response?.data?.error || 'Failed to load assigned employees'
                return []
            } finally {
                this.assignedEmployeesLoading = false
            }
        },

        resetAssignedEmployees() {
            this.assignedEmployees = []
            this.assignedEmployeesError = null
            this.assignedEmployeesLoading = false
        },

        // ==================== HELPERS ====================

        _dayToKey: (day) => {
            const map = {
                MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
                THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
            };
            return map[day] || (day?.charAt(0) + day?.slice(1).toLowerCase());
        },

        _keyToDay: (key) => {
            const map = {
                Monday: 'MONDAY', Tuesday: 'TUESDAY', Wednesday: 'WEDNESDAY',
                Thursday: 'THURSDAY', Friday: 'FRIDAY', Saturday: 'SATURDAY', Sunday: 'SUNDAY',
            };
            return map[key] || String(key || '').toUpperCase();
        },

        _occurrenceToFrequency: (occ) => {
            const map = { ALL: 'ALL', '1': 'FIRST', '2': 'SECOND', '3': 'THIRD', '4': 'FOURTH', '5': 'FIFTH', LAST: 'LAST' };
            return map[occ] || 'ALL';
        },

        _frequencyToOccurrence: (freq) => {
            const map = { ALL: 'ALL', FIRST: '1', SECOND: '2', THIRD: '3', FOURTH: '4', FIFTH: '5', LAST: 'LAST' };
            return map[freq] || 'ALL';
        },

        /**
         * Form state → API payload.
         * Preserves description + full week_offs (day_of_week → day_offs[{frequency, day_type}]).
         * Does NOT send legacy `off_days` or auto-generated `code`.
         */
        _policyToApi(data) {
            const weekOffs = []
            const days = data.days || Object.keys(data.dayConfigs || {})
            days.forEach(dayKey => {
                const rows = data.dayConfigs?.[dayKey] || []
                const dayOffs = []
                const seenFreq = new Set()
                rows.forEach(row => {
                    ;(row.occurrences || []).forEach(occ => {
                        const frequency = this._occurrenceToFrequency(occ)
                        if (seenFreq.has(frequency)) return
                        seenFreq.add(frequency)
                        dayOffs.push({ frequency, day_type: row.type || 'FULL_DAY' })
                    })
                })
                if (dayOffs.length === 0) {
                    dayOffs.push({ frequency: 'ALL', day_type: 'FULL_DAY' })
                }
                weekOffs.push({ day_of_week: this._keyToDay(dayKey), day_offs: dayOffs })
            })
            return {
                name: data.name,
                description: data.description || '',
                effective_from: data.effective_from || undefined,
                // code intentionally omitted — backend auto-generates when missing
                week_offs: weekOffs,
            }
        },

        /**
         * API → form/list model.
         * Reconstructs `days` + `dayConfigs` so edit/detail preserve occurrence + day_type.
         * One form row per day_off so multi-row configs reopen with the same rows.
         */
        _policyFromApi(api) {
            const weekOffs = api.week_offs || []
            const days = []
            const dayConfigs = {}
            weekOffs.forEach(entry => {
                const dayKey = this._dayToKey(entry.day_of_week)
                days.push(dayKey)
                dayConfigs[dayKey] = (entry.day_offs || []).map(off => ({
                    occurrences: [this._frequencyToOccurrence(off.frequency)],
                    type: off.day_type || 'FULL_DAY',
                }))
                if (dayConfigs[dayKey].length === 0) {
                    dayConfigs[dayKey] = [{ occurrences: ['ALL'], type: 'FULL_DAY' }]
                }
            })
            return {
                id: api.id,
                name: api.name,
                code: api.code,
                description: api.description || '',
                effective_from: api.effective_from || '',
                days,
                dayConfigs,
                weekOffs,
                offDays: api.off_days || [],
                employee_count: Number(api.employee_count ?? 0),
            }
        },

        _assignmentToApi(data) {
            return {
                employee_id: data.employee_id,
                weekly_off_policy_id: data.weekly_off_policy_id,
                effective_from: data.effective_from,
                effective_to: data.effective_to || '',
            }
        },

        _assignmentFromApi(api) {
            return {
                id: api.id,
                employee_id: api.employee_id,
                weekly_off_policy_id: api.weekly_off_policy_id,
                effective_from: api.effective_from ? String(api.effective_from).slice(0, 10) : '',
                effective_to: api.effective_to ? String(api.effective_to).slice(0, 10) : '',
                policy_name: api.policy_name,
                employee_name: api.employee_name,
                employee_code: api.employee_code || '',
                job_title: api.job_title || '',
                reporting_to: api.reporting_to || '',
                department: api.department || '',
                location: api.location || '',
                week_offs: Array.isArray(api.week_offs) ? api.week_offs : [],
            }
        },
    },
})
