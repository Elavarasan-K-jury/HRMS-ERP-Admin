// stores/attendancePolicy.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useAttendancePolicyStore = defineStore('attendancePolicy', {

    state: () => ({
        policies: [],
        loading: false,
        error: null,

        // form fields
        policy_id: null,
        name: '',
        grace_minutes: 0,
        half_day_minutes: 360,
        full_day_minutes: 540,
        allow_geo_checkin: true,
        allow_outside_geo: true,
        auto_mark_absent: true,
        checkin_buffer_min: 0,
        checkout_buffer_min: 0,
        rounding_strategy: {
            value: 'basic',
            label: 'Basic'
        },
        overtime_allowed: true,
        min_overtime_minutes: 0,
    }),

    actions: {

        /* ----------------------------------------------
         🔵 GET — List Attendance Policies
        ---------------------------------------------- */
        async fetchPolicies() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.loading = true
            this.error = null

            try {
                const orgId = auth.organization
                if (!orgId) throw new Error("Organization ID not found")

                const { data } = await $api.get('/attendance-policies', {
                    params: { organization_id: orgId }
                })

                this.policies = data.policies || []
                return data
            } catch (err) {
                console.error('[AttendancePolicyStore] fetchPolicies', err)
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------
         🟢 POST — Create Attendance Policy
        ---------------------------------------------- */
        async createPolicy() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                const payload = {
                    organization_id: auth.organization,
                    name: this.name,
                    grace_minutes: Number(this.grace_minutes),
                    half_day_minutes: Number(this.half_day_minutes),
                    full_day_minutes: Number(this.full_day_minutes),
                    allow_geo_checkin: this.allow_geo_checkin,
                    allow_outside_geo: this.allow_outside_geo,
                    auto_mark_absent: this.auto_mark_absent,
                    checkin_buffer_min: Number(this.checkin_buffer_min),
                    checkout_buffer_min: Number(this.checkout_buffer_min),
                    rounding_strategy: this.rounding_strategy,
                    overtime_allowed: this.overtime_allowed,
                    min_overtime_minutes: Number(this.min_overtime_minutes),
                }

                const { data } = await $api.post('/attendance-policies', payload)

                this.fetchPolicies() // refresh list
                this.resetForm()

                return data
            } catch (err) {
                console.error('[AttendancePolicyStore] createPolicy', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🟠 PUT — Update Attendance Policy
        ---------------------------------------------- */
        async updatePolicy() {
            const { $api } = useNuxtApp()

            try {
                const payload = {
                    name: this.name,
                    grace_minutes: Number(this.grace_minutes),
                    half_day_minutes: Number(this.half_day_minutes),
                    full_day_minutes: Number(this.full_day_minutes),
                    allow_geo_checkin: this.allow_geo_checkin,
                    allow_outside_geo: this.allow_outside_geo,
                    auto_mark_absent: this.auto_mark_absent,
                    checkin_buffer_min: Number(this.checkin_buffer_min),
                    checkout_buffer_min: Number(this.checkout_buffer_min),
                    rounding_strategy: this.rounding_strategy,
                    overtime_allowed: this.overtime_allowed,
                    min_overtime_minutes: Number(this.min_overtime_minutes),
                }

                const { data } = await $api.put(`/attendance-policies/${this.policy_id}`, payload)

                this.fetchPolicies()
                this.resetForm()

                return data
            } catch (err) {
                console.error('[AttendancePolicyStore] updatePolicy', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🔄 Reset Form
        ---------------------------------------------- */
        resetForm() {
            this.policy_id = null
            this.name = ''
            this.grace_minutes = 0
            this.half_day_minutes = 360
            this.full_day_minutes = 540
            this.allow_geo_checkin = true
            this.allow_outside_geo = true
            this.auto_mark_absent = true
            this.checkin_buffer_min = 0
            this.checkout_buffer_min = 0
            this.rounding_strategy = 'basic'
            this.overtime_allowed = true
            this.min_overtime_minutes = 0
        },

        /* ----------------------------------------------
         ✏️ Load single policy into form (for editing)
        ---------------------------------------------- */
        loadPolicy(policy) {
            this.policy_id = policy.id
            this.name = policy.name
            this.grace_minutes = policy.grace_minutes
            this.half_day_minutes = policy.half_day_minutes
            this.full_day_minutes = policy.full_day_minutes
            this.allow_geo_checkin = policy.allow_geo_checkin
            this.allow_outside_geo = policy.allow_outside_geo
            this.auto_mark_absent = policy.auto_mark_absent
            this.checkin_buffer_min = policy.checkin_buffer_min
            this.checkout_buffer_min = policy.checkout_buffer_min
            this.rounding_strategy = policy.rounding_strategy
            this.overtime_allowed = policy.overtime_allowed
            this.min_overtime_minutes = policy.min_overtime_minutes
        }
    }
})
