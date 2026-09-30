import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useLeaveRequestStore = defineStore('leaveRequest', {
  state: () => ({
    myRequests: [],
    balances: [],
    calendar: [],
    currentRequest: null,
    totalRequests: 0,
    loading: false,
    error: null,

    form: {
      leave_type_id: '',
      start_date: '',
      end_date: '',
      is_half_day: false,
      half_day_type: 'FIRST_HALF',
      start_half_day: null,
      end_half_day: null,
      reason: '',
      notify_employee_ids: [],
    },
    request_id: null,
    showForm: false,
  }),

  getters: {
    organization_id() {
      const auth = useAuthStore()
      return auth.admin?.organization_id || auth.organization || ''
    },
    employee_id() {
      const auth = useAuthStore()
      return auth.admin?.id || auth.employee || ''
    },
    totalAvailable() {
      return this.balances.reduce((sum, b) => sum + (b.available || 0), 0)
    },
  },

  actions: {
    resetForm() {
      this.form = {
        leave_type_id: '',
        start_date: '',
        end_date: '',
        is_half_day: false,
        half_day_type: 'FIRST_HALF',
        start_half_day: null,
        end_half_day: null,
        reason: '',
        notify_employee_ids: [],
      }
      this.request_id = null
    },

    /* ---------- APPLY ---------- */
    async apply() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const payload = {
          employee_id: this.employee_id,
          organization_id: this.organization_id,
          leave_type_id: this.form.leave_type_id,
          start_date: this.form.start_date,
          end_date: this.form.end_date || this.form.start_date,
          is_half_day: this.form.is_half_day,
          half_day_type: this.form.is_half_day ? this.form.half_day_type : '',
          reason: this.form.reason,
        }
        const { data } = await $api.post('/leave/apply', payload)
        this.showForm = false
        this.resetForm()
        await this.fetchMyRequests()
        await this.fetchBalances()
        return { success: true, data }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    /* ---------- LIST MINE ---------- */
    async fetchMyRequests() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get('/leave', {
          params: {
            employee_id: this.employee_id,
            organization_id: this.organization_id,
          },
        })
        this.myRequests = data?.leave_requests || []
        this.totalRequests = this.myRequests.length
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    /* ---------- DETAIL ---------- */
    async fetchDetail(id) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get(`/leave/${id}`)
        this.currentRequest = data?.leave_request || null
        return this.currentRequest
      } catch (e) {
        this.error = e.message
        return null
      } finally {
        this.loading = false
      }
    },

    /* ---------- EDIT (pending + future only) ---------- */
    async edit(id, updates) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.patch(`/leave/requests/${id}`, updates)
        const idx = this.myRequests.findIndex((r) => r.id === id)
        if (idx !== -1) this.myRequests[idx] = data?.leave_request
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    /* ---------- CANCEL ---------- */
    async cancel(id, reason = '') {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.post('/leave/cancel', {
          request_id: id,
          employee_id: this.employee_id,
          reason,
        })
        const idx = this.myRequests.findIndex((r) => r.id === id)
        if (idx !== -1) this.myRequests[idx] = data?.leave_request
        await this.fetchBalances()
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    /* ---------- BALANCE ---------- */
    async fetchBalances() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get('/leave/balance', {
          params: {
            employee_id: this.employee_id,
            organization_id: this.organization_id,
          },
        })
        this.balances = data?.balances || []
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    /* ---------- CALENDAR ---------- */
    async fetchCalendar(month) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get('/leave/calendar', {
          params: {
            employee_id: this.employee_id,
            organization_id: this.organization_id,
            month,
          },
        })
        this.calendar = data?.calendar || []
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    /* ---------- APPROVE/REJECT (manager shortcut, superseded by §1) ---------- */
    async approve(id, approverId) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.post('/leave/approve', {
          request_id: id,
          approver_id: approverId,
        })
        return { success: true, data }
      } catch (e) {
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async reject(id, approverId, reason) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.post('/leave/reject', {
          request_id: id,
          approver_id: approverId,
          reason,
        })
        return { success: true, data }
      } catch (e) {
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },
  },
})
