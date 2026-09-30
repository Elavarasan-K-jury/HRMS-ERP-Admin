import { defineStore } from 'pinia'

export const useShiftStore = defineStore('shift', {
    state: () => ({
        shifts: [],
        loading: false,
        error: null,
        // shiftId -> { employees, total, page, limit, search, loading, error, loaded }
        assignedEmployeesByShift: {},
    }),

    actions: {
        async fetchShifts(organizationId, { assignmentFrom = '', assignmentTo = '' } = {}) {
            const toast = useToast()
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const params = { organization_id: organizationId }
                if (assignmentFrom) params.assignment_from = assignmentFrom
                if (assignmentTo) params.assignment_to = assignmentTo
                const { data } = await $api.get('/shifts', { params })
                this.shifts = (data?.shifts || []).map(this._fromApi)
                this.assignedEmployeesByShift = {}
                return this.shifts
            } catch (err) {
                console.error('[shift-store] fetchShifts:', err)
                this.shifts = []
                toast.error({ title: 'Error', message: 'Failed to load shifts' })
            } finally {
                this.loading = false
            }
        },

        async createShift(organizationId, shiftData) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const payload = this._toApi(shiftData, organizationId)
                const { data } = await $api.post('/shifts', payload)
                const shift = this._fromApi(data)
                this.shifts.unshift(shift)
                toast.success({ title: 'Created!', message: 'Shift created' })
                return shift
            } catch (err) {
                console.error('[shift-store] createShift:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to create shift' })
                throw err
            }
        },

        async updateShift(id, shiftData, organizationId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const payload = this._toApi(shiftData, organizationId)
                const { data } = await $api.put(`/shifts/${id}`, payload)
                const updated = this._fromApi(data)
                const idx = this.shifts.findIndex(s => s.id === id)
                if (idx !== -1) {
                    // Preserve live employee count from list (PUT response may omit it)
                    updated.employees = this.shifts[idx].employees ?? 0
                    this.shifts[idx] = updated
                }
                toast.success({ title: 'Updated!', message: 'Shift updated' })
                return updated
            } catch (err) {
                console.error('[shift-store] updateShift:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to update shift' })
                throw err
            }
        },

        async deleteShift(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                await $api.delete(`/shifts/${id}`)
                this.shifts = this.shifts.filter(s => s.id !== id)
                delete this.assignedEmployeesByShift[id]
                toast.success({ title: 'Deleted!', message: 'Shift deleted' })
            } catch (err) {
                console.error('[shift-store] deleteShift:', err)
                toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to delete shift' })
                throw err
            }
        },

        /**
         * Employees assigned to a shift overlapping the given assignment range
         * (no range → today's assignments; server-side filtered + unique).
         * Cached per shiftId + range; pass force=true after mutations to refresh.
         */
        async fetchShiftEmployees(shiftId, { page = 1, limit = 10, search = '', force = false, assignmentFrom = '', assignmentTo = '' } = {}) {
            if (!shiftId) return []
            const cached = this.assignedEmployeesByShift[shiftId]
            if (
                !force &&
                cached?.loaded &&
                !cached.loading &&
                cached.page === page &&
                cached.limit === limit &&
                (cached.search || '') === (search || '') &&
                (cached.assignmentFrom || '') === (assignmentFrom || '') &&
                (cached.assignmentTo || '') === (assignmentTo || '')
            ) {
                return cached.employees || []
            }
            this.assignedEmployeesByShift[shiftId] = {
                employees: force ? [] : cached?.employees || [],
                total: force ? 0 : cached?.total || 0,
                page,
                limit,
                search: search || '',
                assignmentFrom: assignmentFrom || '',
                assignmentTo: assignmentTo || '',
                loading: true,
                error: null,
                loaded: false,
            }
            try {
                const { $api } = useNuxtApp()
                const params = { page, limit, search: search || '' }
                if (assignmentFrom) params.assignment_from = assignmentFrom
                if (assignmentTo) params.assignment_to = assignmentTo
                const { data } = await $api.get(`/shifts/${shiftId}/assigned-employees`, { params })
                const employees = data?.employees || []
                const total = Number(data?.total_count ?? data?.totalCount ?? employees.length) || 0
                this.assignedEmployeesByShift[shiftId] = {
                    employees,
                    total,
                    page,
                    limit,
                    search: search || '',
                    assignmentFrom: assignmentFrom || '',
                    assignmentTo: assignmentTo || '',
                    loading: false,
                    error: null,
                    loaded: true,
                }
                return employees
            } catch (err) {
                console.error('[shift-store] fetchShiftEmployees:', err)
                this.assignedEmployeesByShift[shiftId] = {
                    employees: [],
                    total: 0,
                    page,
                    limit,
                    search: search || '',
                    assignmentFrom: assignmentFrom || '',
                    assignmentTo: assignmentTo || '',
                    loading: false,
                    error: err?.response?.data?.error || 'Failed to load assigned employees',
                    loaded: false,
                }
                return []
            }
        },

        resetShiftEmployees(shiftId) {
            if (shiftId) delete this.assignedEmployeesByShift[shiftId]
            else this.assignedEmployeesByShift = {}
        },

        _toApi(data, organizationId) {
            // Canonical wire format: HH:mm (24-hour). Form stores 24-hour HH:mm.
            const toHm = (time) => {
                if (!time || typeof time !== 'string') return ''
                const m = time.trim().match(/^(\d{1,2}):(\d{2})$/)
                if (!m) return ''
                const h = Number(m[1])
                const min = Number(m[2])
                if (h > 23 || min > 59) return ''
                return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
            }

            const isFlexible = data.shiftType === 'flexible'
            const shiftType = isFlexible ? 'FLEXIBLE' : 'FIXED'

            const daysToMap = (days) => {
                const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                const map = {}
                allDays.forEach(d => { map[d] = days?.map(x => x.toLowerCase()).includes(d) || false })
                return map
            }

            const dayMap = {
                'Monday': 'monday', 'Tuesday': 'tuesday', 'Wednesday': 'wednesday',
                'Thursday': 'thursday', 'Friday': 'friday', 'Saturday': 'saturday', 'Sunday': 'sunday',
            }

            // weekly_off = days NOT selected as working days (complement)
            const allDayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            const workingSet = new Set((data.workingDays || []).map(d => d))
            const weeklyOff = allDayLabels
                .filter(label => !workingSet.has(label))
                .map(label => dayMap[label])

            const requireGrossHours = !!data.requireGrossHours
            const grossHours = requireGrossHours ? Number(data.grossHours) || 0 : 0
            const maxDuration = isFlexible ? Number(data.maxDuration) || 0 : 0
            const breakMinutes = Number(data.breakMinutes) || 0
            // Never trust client effective_hours — server derives it. Omit from payload.
            void data.effectiveHours

            const result = {
                name: data.name,
                code: data.code || '',
                description: data.description || '',
                shift_type: shiftType,
                // Flexible shifts have no fixed window — conventional full-day placeholder
                start_time: isFlexible ? '00:00' : toHm(data.startTime),
                end_time: isFlexible ? '23:59' : toHm(data.endTime),
                break_minutes: breakMinutes,
                applicable_days: daysToMap(data.workingDays),
                weekly_off: weeklyOff,
                require_gross_hours: requireGrossHours,
                gross_hours: grossHours,
                max_shift_duration_hours: maxDuration,
            }
            // Only send organization_id when present — never ""
            if (organizationId && typeof organizationId === 'string' && organizationId.length > 0) {
                result.organization_id = organizationId
            }
            return result
        },

        _fromApi(api) {
            // Canonical wire format: HH:mm (24-hour). Legacy ISO rows fall back to local Date parse.
            const parseHm = (val) => {
                if (!val) return { hm: '', period: 'AM' }
                const s = String(val)
                const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
                if (m) {
                    const h = Number(m[1])
                    if (h > 23) return { hm: '', period: 'AM' }
                    const hm = `${String(h).padStart(2, '0')}:${m[2]}`
                    return { hm, period: h >= 12 ? 'PM' : 'AM' }
                }
                // Legacy epoch time-of-day 1970-01-01T04:00:00.000Z → UTC HH:mm only (never local Date)
                const epoch = s.match(/^1970-\d{2}-\d{2}T(\d{2}):(\d{2})/)
                if (epoch) {
                    const h = Number(epoch[1])
                    if (h > 23) return { hm: '', period: 'AM' }
                    const hm = `${String(h).padStart(2, '0')}:${epoch[2]}`
                    return { hm, period: h >= 12 ? 'PM' : 'AM' }
                }
                // Other ISO datetimes (real events): local fields only
                const d = new Date(s)
                if (!isNaN(d.getTime())) {
                    const h = d.getHours()
                    const mm = d.getMinutes()
                    const hm = `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
                    return { hm, period: h >= 12 ? 'PM' : 'AM' }
                }
                return { hm: '', period: 'AM' }
            }

            const display12 = (hm) => {
                if (!hm) return ''
                const [hs, ms] = hm.split(':')
                const h = Number(hs)
                const period = h >= 12 ? 'PM' : 'AM'
                const h12 = h % 12 === 0 ? 12 : h % 12
                return `${String(h12).padStart(2, '0')}:${ms} ${period}`
            }

            const mapToDays = (applicableDays) => {
                if (!applicableDays || typeof applicableDays !== 'object') return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                return Object.entries(applicableDays)
                    .filter(([_, v]) => v)
                    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
            }

            const start = parseHm(api.start_time)
            const end = parseHm(api.end_time)
            const explicitType = String(api.shift_type || '').toUpperCase()
            // Prefer explicit shift_type; keep 00:00–23:59 sentinel only as legacy fallback
            // for pre-migration rows that never stored shift_type (Prisma default FIXED).
            const isFlexible =
                explicitType === 'FLEXIBLE' ||
                (start.hm === '00:00' && end.hm === '23:59')
            const grossHours = Number(api.gross_hours) || 0
            const maxDuration = Number(api.max_shift_duration_hours) || 0
            const breakMinutes = api.break_minutes || 0
            // Prefer server-derived effective_hours; fall back to local derivation
            const effectiveHours =
                api.effective_hours !== undefined && api.effective_hours !== null
                    ? Number(api.effective_hours)
                    : grossHours > 0
                        ? Math.round((grossHours - breakMinutes / 60) * 100) / 100
                        : null

            return {
                id: api.id,
                name: api.name,
                code: api.code || '',
                description: api.description || '',
                startTime: start.hm,
                startPeriod: start.period,
                endTime: end.hm,
                endPeriod: end.period,
                breakMinutes,
                workingDays: mapToDays(api.applicable_days),
                weeklyOff: api.weekly_off || [],
                timings: start.hm ? `${display12(start.hm)} - ${display12(end.hm)}` : 'Flexible',
                shiftType: isFlexible ? 'flexible' : 'fixed',
                requireGrossHours: api.require_gross_hours === true || grossHours > 0,
                grossHours: grossHours || undefined,
                effectiveHours,
                maxDuration: maxDuration || undefined,
                employees: Number(api.employee_count ?? 0) || 0,
            }
        },
    },
})
