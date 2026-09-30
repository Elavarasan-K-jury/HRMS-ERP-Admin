import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useLeaveTypeStore = defineStore('leaveType', {
  state: () => ({
    leaveTypes: [],
    currentLeaveType: null,
    loading: false,
    error: null,

    form: {
      name: '',
      code: '',
      description: '',
      paid: true,
      max_per_year: 0,
      allow_half_day: true,
      requires_document: false,
      document_after_days: 0,
      carry_forward: false,
      max_carry_forward: 0,
      encashment_allowed: false,
      max_encash_per_year: 0,
      gender_restriction: 'NONE',
      probation_allowed: false,
      min_service_months: 0,
      max_consecutive_days: 0,
      sandwich_rule: false,
      default_annual_allocation: null,
      accrual_enabled: false,
      accrual_frequency: 'monthly',
      accrue_after_days: 0,
      monthly_accrual_rate: 0,
    },
    leave_type_id: null,
    showForm: false,
    deleteConfirmId: null,
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
        name: '',
        code: '',
        description: '',
        paid: true,
        max_per_year: 0,
        allow_half_day: true,
        requires_document: false,
        document_after_days: 0,
        carry_forward: false,
        max_carry_forward: 0,
        encashment_allowed: false,
        max_encash_per_year: 0,
        gender_restriction: 'NONE',
        probation_allowed: false,
        min_service_months: 0,
        max_consecutive_days: 0,
        sandwich_rule: false,
        default_annual_allocation: null,
        accrual_enabled: false,
        accrual_frequency: 'monthly',
        accrue_after_days: 0,
        monthly_accrual_rate: 0,
      }
      this.leave_type_id = null
    },

    loadLeaveType(lt) {
      this.leave_type_id = lt.id
      this.form = {
        name: lt.name || '',
        code: lt.code || '',
        description: lt.description || '',
        paid: lt.paid ?? true,
        max_per_year: lt.max_per_year ?? 0,
        allow_half_day: lt.allow_half_day ?? true,
        requires_document: lt.requires_document ?? false,
        document_after_days: lt.document_after_days ?? 0,
        carry_forward: lt.carry_forward ?? false,
        max_carry_forward: lt.max_carry_forward ?? 0,
        encashment_allowed: lt.encashment_allowed ?? false,
        max_encash_per_year: lt.max_encash_per_year ?? 0,
        gender_restriction: lt.gender_restriction || 'NONE',
        probation_allowed: lt.probation_allowed ?? false,
        min_service_months: lt.min_service_months ?? 0,
        max_consecutive_days: lt.max_consecutive_days ?? 0,
        sandwich_rule: lt.sandwich_rule ?? false,
        default_annual_allocation: lt.default_annual_allocation ?? null,
        accrual_enabled: lt.accrual_enabled ?? false,
        accrual_frequency: lt.accrual_frequency || 'monthly',
        accrue_after_days: lt.accrue_after_days ?? 0,
        monthly_accrual_rate: lt.monthly_accrual_rate ?? 0,
      }
    },

    async fetchLeaveTypes() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get('/leave-types', {
          params: { organization_id: this.organization_id },
        })
        this.leaveTypes = data?.leave_types || []
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    sanitizeForm() {
      // v-model.number produces NaN for blank inputs — convert to null
      const f = this.form
      if (Number.isNaN(f.default_annual_allocation)) f.default_annual_allocation = null
      if (Number.isNaN(f.max_per_year)) f.max_per_year = 0
      if (Number.isNaN(f.max_carry_forward)) f.max_carry_forward = 0
      if (Number.isNaN(f.max_encash_per_year)) f.max_encash_per_year = 0
      if (Number.isNaN(f.document_after_days)) f.document_after_days = 0
      if (Number.isNaN(f.min_service_months)) f.min_service_months = 0
      if (Number.isNaN(f.max_consecutive_days)) f.max_consecutive_days = 0
      if (Number.isNaN(f.accrue_after_days)) f.accrue_after_days = 0
      if (Number.isNaN(f.monthly_accrual_rate)) f.monthly_accrual_rate = 0
    },

    async createLeaveType() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        this.sanitizeForm()
        const payload = { ...this.form, organization_id: this.organization_id }
        const { data } = await $api.post('/leave-types', payload)
        this.leaveTypes.push(data?.leave_type)
        this.showForm = false
        this.resetForm()
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async updateLeaveType() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        this.sanitizeForm()
        const { data } = await $api.put(`/leave-types/${this.leave_type_id}`, this.form)
        const idx = this.leaveTypes.findIndex((lt) => lt.id === this.leave_type_id)
        if (idx !== -1) this.leaveTypes[idx] = data?.leave_type
        this.showForm = false
        this.resetForm()
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async deleteLeaveType(id) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        await $api.delete(`/leave-types/${id}`)
        this.leaveTypes = this.leaveTypes.filter((lt) => lt.id !== id)
        this.deleteConfirmId = null
        return { success: true }
      } catch (e) {
        this.error = e.message
        return { success: false, error: e.message }
      } finally {
        this.loading = false
      }
    },

    async submit() {
      if (this.leave_type_id) {
        return this.updateLeaveType()
      }
      return this.createLeaveType()
    },
  },
})
