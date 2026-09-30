import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    flows: [],
    currentFlow: null,
    pendingApprovals: [],
    totalPending: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    loading: false,
    error: null,

    // form state
    form: {
      name: '',
      entity_type: 'LEAVE',
      levels: [],
    },
    flow_id: null,
  }),

  getters: {
    organization_id() {
      const auth = useAuthStore()
      return auth.admin?.organization_id || auth.organization || ''
    },
    pendingCount: (state) => state.totalPending,
  },

  actions: {
    resetForm() {
      this.form = { name: '', entity_type: 'LEAVE', levels: [] }
      this.flow_id = null
    },

    loadFlow(flow) {
      this.flow_id = flow.id
      this.form = {
        name: flow.name || '',
        entity_type: flow.entity_type,
        levels: (flow.levels || []).map((lvl) => ({
          level: lvl.level,
          auto_approve_days: lvl.auto_approve_days ?? 3,
          escalation_role: lvl.escalation_role || '',
          is_active: lvl.is_active ?? true,
          approvers: (lvl.approvers || []).map((a) => ({
            user_id: a.user_id || '',
            role: a.role || '',
          })),
        })),
      }
    },

    /* ---------- FLOW ACTIONS ---------- */
    async fetchFlows(entityType = null) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const params = { organization_id: this.organization_id }
        if (entityType) params.entity_type = entityType
        const { data } = await $api.get('/approval/flows', { params })
        this.flows = data.flows || []
        return this.flows
      } catch (err) {
        this.error = err.message
        return []
      } finally {
        this.loading = false
      }
    },

    async createFlow() {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const payload = {
          organization_id: this.organization_id,
          name: this.form.name,
          entity_type: this.form.entity_type,
          levels: this.form.levels,
        }
        const { data } = await $api.post('/approval/flows', payload)
        if (data.success) {
          this.flows.unshift(data.flow)
        }
        return data
      } catch (err) {
        this.error = err.message
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    },

    async updateFlow(id) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const payload = { levels: this.form.levels }
        const { data } = await $api.put(`/approval/flows/${id}`, payload)
        if (data.success) {
          const idx = this.flows.findIndex((f) => f.id === id)
          if (idx !== -1) this.flows[idx] = data.flow
        }
        return data
      } catch (err) {
        this.error = err.message
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    },

    async deleteFlow(id) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const { data } = await $api.delete(`/approval/flows/${id}`)
        if (data.success) {
          this.flows = this.flows.filter((f) => f.id !== id)
        }
        return data
      } catch (err) {
        this.error = err.message
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    },

    /* ---------- INSTANCE ACTIONS ---------- */
    async fetchPending(page = 1, limit = 10, approverId = null) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const params = {
          organization_id: this.organization_id,
          page: String(page),
          limit: String(limit),
        }
        if (approverId) params.approver_id = approverId
        const { data } = await $api.get('/approval/instances/pending', { params })
        this.pendingApprovals = data.approvals || []
        this.totalPending = data.total || 0
        this.totalPages = data.total_pages || 0
        this.currentPage = data.page || page
        return this.pendingApprovals
      } catch (err) {
        this.error = err.message
        return []
      } finally {
        this.loading = false
      }
    },

    async approve(id, approverId, remarks = '') {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const { data } = await $api.post(`/approval/instances/${id}/approve`, {
          approver_id: approverId,
          remarks,
        })
        if (data.success) {
          this.pendingApprovals = this.pendingApprovals.filter((a) => a.id !== id)
          this.totalPending = Math.max(0, this.totalPending - 1)
        }
        return data
      } catch (err) {
        this.error = err.message
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    },

    async reject(id, approverId, remarks = '') {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const { data } = await $api.post(`/approval/instances/${id}/reject`, {
          approver_id: approverId,
          remarks,
        })
        if (data.success) {
          this.pendingApprovals = this.pendingApprovals.filter((a) => a.id !== id)
          this.totalPending = Math.max(0, this.totalPending - 1)
        }
        return data
      } catch (err) {
        this.error = err.message
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    },

    async bulkAction(ids, action, approverId, remarks = '') {
      const { $api } = useNuxtApp()
      this.loading = true
      this.error = null
      try {
        const { data } = await $api.post('/approval/instances/bulk-action', {
          approval_ids: ids,
          action,
          approver_id: approverId,
          remarks,
        })
        if (data.success) {
          this.pendingApprovals = this.pendingApprovals.filter(
            (a) => !ids.includes(a.id)
          )
          this.totalPending = Math.max(0, this.totalPending - ids.length)
        }
        return data
      } catch (err) {
        this.error = err.message
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    },
  },
})
