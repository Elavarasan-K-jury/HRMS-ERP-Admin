import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useAttendanceRegularisationStore = defineStore('attendanceRegularisation', {
  state: () => ({
    regularisations: [],
    currentRegularisation: null,
    loading: false,
    error: null,

    form: {
      attendance_id: '',
      date: '',
      type: 'ADJUST_LOGS',
      requested_in_time: '',
      requested_out_time: '',
      note: '',
    },

    bulkForm: {
      confirmation_flag: '',
      items: [],
    },
  }),

  getters: {
    organization_id() {
      const auth = useAuthStore()
      return auth.admin?.organization_id || auth.organization || ''
    },
  },

  actions: {
    resetForm() {
      this.form = {
        attendance_id: '',
        date: '',
        type: 'ADJUST_LOGS',
        requested_in_time: '',
        requested_out_time: '',
        note: '',
      }
    },

    resetBulkForm() {
      this.bulkForm = {
        confirmation_flag: '',
        items: [],
      }
    },

    async submitRegularisation() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.post('/attendance/regularise', this.form)
        this.regularisations.unshift(data?.regularisation)
        this.resetForm()
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async fetchRegularisations(params = {}) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get('/attendance/regularise', { params })
        this.regularisations = data?.regularisations || []
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchRegularisation(id) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get(`/attendance/regularise/${id}`)
        this.currentRegularisation = data?.regularisation
        return data?.regularisation
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async submitBulkRegularise(items) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.post('/attendance/regularise/bulk', {
          items,
          confirmation_flag: 'CONFIRMED',
        })
        this.resetBulkForm()
        return { success: true, processed: data?.processed, results: data?.results }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },
  },
})
