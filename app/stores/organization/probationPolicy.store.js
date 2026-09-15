// stores/organization/probationPolicy.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

const newEvaluator = () => ({
    evaluator_type: 'EMPLOYEE',
    evaluator_ref_id: '',
    evaluator_name: '',
})

const newLevel = (level_order) => ({
    level_order,
    completion_rule: 'ALL',
    reminder_enabled: false,
    reminder_after_days: null,
    evaluators: [newEvaluator()],
})

const newMilestone = (order, isFinal = false) => ({
    name: isFinal ? 'Final Evaluation' : '',
    order,
    is_final_milestone: isFinal,
    automatic_trigger_enabled: false,
    trigger_after_days: null,
    feedback_form_enabled: false,
    levels: [newLevel(1)],
})

export const useProbationPolicyStore = defineStore('probationPolicy', {

    state: () => ({
        policies: [],
        loading: false,
        error: null,

        // wizard state
        wizard_step: 1,
        total_steps: 4,
        completed_steps: [],

        // form fields
        policy_id: null,
        name: '',
        description: '',
        duration_value: 3,
        duration_unit: 'MONTHS',
        max_duration_value: 0,
        max_duration_unit: 'MONTHS',
        end_date_after_completion: false,
        is_active: true,
        policy_type: 'PROBATION',
        employee_category_ids: [],
        employee_categories: [],

        // ---------- Step 2 — Evaluation ----------
        evaluation_required: false,
        evaluation_milestones: [newMilestone(1, true)],

        // Feedback form settings
        show_feedback_form_in_review: false,
        share_feedback_with_employee: false,
        employee_response_allowed: false,
        reviewer_response_allowed: false,
        reviewer_recommendations_allowed: false,

        // ---------- Step 3 — Confirmation ----------
        auto_confirm_probation: false,
        auto_generate_confirmation_letter: false,
    }),

    actions: {

        /* ----------------------------------------------
         🧭 Wizard helpers
        ---------------------------------------------- */
        setStep(step) {
            if (step >= 1 && step <= this.total_steps) this.wizard_step = step
        },
        completeStep(step) {
            if (!this.completed_steps.includes(step)) {
                this.completed_steps.push(step)
            }
        },
        nextStep() {
            if (this.wizard_step < this.total_steps) this.wizard_step += 1
        },
        prevStep() {
            if (this.wizard_step > 1) this.wizard_step -= 1
        },

        newMilestone(order = null, isFinal = false) {
            const o = order ?? (Math.max(0, ...this.evaluation_milestones.map(m => m.order ?? 0)) + 1)
            return newMilestone(o, isFinal)
        },
        addMilestone() {
            this.evaluation_milestones.push(this.newMilestone())
        },
        removeMilestone(index) {
            if (this.evaluation_milestones.length > 1) {
                this.evaluation_milestones.splice(index, 1)
            }
        },
        addLevel(milestone) {
            const nextOrder = Math.max(0, ...(milestone.levels || []).map(l => l.level_order ?? 0)) + 1
            milestone.levels.push(newLevel(nextOrder))
        },
        removeLevel(milestone, index) {
            if (milestone.levels.length > 1) milestone.levels.splice(index, 1)
        },
        addEvaluator(level) {
            level.evaluators.push(newEvaluator())
        },
        removeEvaluator(level, index) {
            if (level.evaluators.length > 1) level.evaluators.splice(index, 1)
        },

        /* ----------------------------------------------
         🔵 GET — List Probation Policies
        ---------------------------------------------- */
        async fetchPolicies(policy_type = '') {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.loading = true
            this.error = null

            try {
                const orgId = auth.organization
                if (!orgId) throw new Error("Organization ID not found")

                const { data } = await $api.get('/probation-policies', {
                    params: {
                        organization_id: orgId,
                        ...(policy_type ? { policy_type } : {}),
                    }
                })

                this.policies = data.policies || []
                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] fetchPolicies', err)
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------
         🔵 GET — Employees assigned to a probation policy
        ---------------------------------------------- */
        async fetchPolicyEmployees(policyId) {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            const orgId = auth.organization
            if (!orgId) throw new Error("Organization ID not found")

            const { data } = await $api.get('/employees/all', {
                params: {
                    organization_id: orgId,
                    probation_policy_id: policyId,
                    only_active: true,
                }
            })

            return data.employees || []
        },

        buildMilestonePayload(m) {
            return {
                name: m.name,
                order: Number(m.order) || 0,
                is_final_milestone: Boolean(m.is_final_milestone),
                automatic_trigger_enabled: Boolean(m.automatic_trigger_enabled),
                trigger_after_days: m.automatic_trigger_enabled ? Number(m.trigger_after_days) : null,
                feedback_form_enabled: Boolean(m.feedback_form_enabled),
                levels: (m.levels || []).map(l => ({
                    level_order: Number(l.level_order) || 0,
                    completion_rule: l.completion_rule || 'ALL',
                    reminder_enabled: Boolean(l.reminder_enabled),
                    reminder_after_days: l.reminder_enabled ? Number(l.reminder_after_days) : null,
                    evaluators: (l.evaluators || []).map(ev => ({
                        evaluator_type: ev.evaluator_type,
                        evaluator_ref_id: ev.evaluator_ref_id || '',
                        evaluator_name: ev.evaluator_name || '',
                    })),
                })),
            }
        },

        buildEvaluationPayload() {
            return {
                evaluation_required: this.evaluation_required,
                show_feedback_form_in_review: this.show_feedback_form_in_review,
                share_feedback_with_employee: this.share_feedback_with_employee,
                employee_response_allowed: this.employee_response_allowed,
                reviewer_response_allowed: this.reviewer_response_allowed,
                reviewer_recommendations_allowed: this.reviewer_recommendations_allowed,
                evaluation_milestones: this.evaluation_milestones.map(m => this.buildMilestonePayload(m)),
            }
        },

        /* ----------------------------------------------
         🟢 POST — Create Probation Policy
        ---------------------------------------------- */
        async createPolicy() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                const payload = {
                    organization_id: auth.organization,
                    name: this.name,
                    description: this.description || null,
                    duration_value: Number(this.duration_value),
                    duration_unit: this.duration_unit,
                    max_duration_value: Number(this.max_duration_value),
                    max_duration_unit: this.max_duration_unit,
                    end_date_after_completion: this.end_date_after_completion,
                    is_active: this.is_active,
                    policy_type: this.policy_type,
                    employee_category_ids: this.employee_category_ids,
                    ...this.buildEvaluationPayload(),
                    auto_confirm_probation: this.auto_confirm_probation,
                    auto_generate_confirmation_letter: this.auto_generate_confirmation_letter,
                }

                const { data } = await $api.post('/probation-policies', payload)

                this.fetchPolicies()
                this.resetForm()

                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] createPolicy', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🟠 PUT — Update Probation Policy
        ---------------------------------------------- */
        async updatePolicy() {
            const { $api } = useNuxtApp()

            try {
                const payload = {
                    name: this.name,
                    description: this.description ?? null,
                    duration_value: Number(this.duration_value),
                    duration_unit: this.duration_unit,
                    max_duration_value: Number(this.max_duration_value),
                    max_duration_unit: this.max_duration_unit,
                    end_date_after_completion: this.end_date_after_completion,
                    is_active: this.is_active,
                    policy_type: this.policy_type,
                    employee_category_ids: this.employee_category_ids,
                    evaluation_required: this.evaluation_required,
                    show_feedback_form_in_review: this.show_feedback_form_in_review,
                    share_feedback_with_employee: this.share_feedback_with_employee,
                    employee_response_allowed: this.employee_response_allowed,
                    reviewer_response_allowed: this.reviewer_response_allowed,
                    reviewer_recommendations_allowed: this.reviewer_recommendations_allowed,
                    auto_confirm_probation: this.auto_confirm_probation,
                    auto_generate_confirmation_letter: this.auto_generate_confirmation_letter,
                    evaluation_milestones: this.evaluation_milestones.map(m => this.buildMilestonePayload(m)),
                }

                const { data } = await $api.put(`/probation-policies/${this.policy_id}`, payload)

                this.fetchPolicies()
                this.resetForm()

                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] updatePolicy', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🔴 DELETE — Soft delete Probation Policy
        ---------------------------------------------- */
        async deletePolicy(id) {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                const { data } = await $api.delete(`/probation-policies/${id}`, {
                    params: { organization_id: auth.organization }
                })

                this.fetchPolicies()
                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] deletePolicy', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🟡 Toggle active status
        ---------------------------------------------- */
        async toggleActive(policy) {
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.put(`/probation-policies/${policy.id}`, {
                    is_active: !policy.is_active,
                })

                await this.fetchPolicies()
                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] toggleActive', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🟡 Set a policy as the organization default
        ---------------------------------------------- */
        async setDefault(policy) {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                const { data } = await $api.put(`/probation-policies/${policy.id}`, {
                    is_default: true,
                })

                await this.fetchPolicies()
                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] setDefault', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🟠 Clone a policy — duplicates it via the API
        ---------------------------------------------- */
        async clonePolicy(policy) {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                const payload = {
                    organization_id: auth.organization,
                    name: `${policy.name} (Copy)`,
                    description: policy.description || null,
                    duration_value: Number(policy.duration_value),
                    duration_unit: policy.duration_unit,
                    max_duration_value: Number(policy.max_duration_value ?? 0),
                    max_duration_unit: policy.max_duration_unit || 'MONTHS',
                    end_date_after_completion: policy.end_date_after_completion ?? false,
                    is_active: policy.is_active ?? true,
                    is_default: false,
                    policy_type: policy.policy_type || 'PROBATION',
                    employee_category_ids: policy.employee_category_ids || [],
                    evaluation_required: policy.evaluation_required ?? false,
                    show_feedback_form_in_review: policy.show_feedback_form_in_review ?? false,
                    share_feedback_with_employee: policy.share_feedback_with_employee ?? false,
                    employee_response_allowed: policy.employee_response_allowed ?? false,
                    reviewer_response_allowed: policy.reviewer_response_allowed ?? false,
                    reviewer_recommendations_allowed: policy.reviewer_recommendations_allowed ?? false,
                    auto_confirm_probation: policy.auto_confirm_probation ?? false,
                    auto_generate_confirmation_letter: policy.auto_generate_confirmation_letter ?? false,
                    evaluation_milestones: (policy.evaluation_milestones || []).map(m => this.buildMilestonePayload(m)),
                }

                const { data } = await $api.post('/probation-policies', payload)

                await this.fetchPolicies()
                return data
            } catch (err) {
                console.error('[ProbationPolicyStore] clonePolicy', err)
                this.error = err
            }
        },

        /* ----------------------------------------------
         🔄 Reset Form
        ---------------------------------------------- */
        resetForm() {
            this.policy_id = null
            this.wizard_step = 1
            this.completed_steps = []
            this.name = ''
            this.description = ''
            this.duration_value = 3
            this.duration_unit = 'MONTHS'
            this.max_duration_value = 0
            this.max_duration_unit = 'MONTHS'
            this.end_date_after_completion = false
            this.is_active = true
            this.policy_type = 'PROBATION'
            this.employee_category_ids = []
            this.employee_categories = []

            this.evaluation_required = false
            this.evaluation_milestones = [newMilestone(1, true)]

            this.show_feedback_form_in_review = false
            this.share_feedback_with_employee = false
            this.employee_response_allowed = false
            this.reviewer_response_allowed = false
            this.reviewer_recommendations_allowed = false

            this.auto_confirm_probation = false
            this.auto_generate_confirmation_letter = false
        },

        /* ----------------------------------------------
         ✏️ Load single policy into form (for editing)
        ---------------------------------------------- */
        loadPolicy(policy) {
            this.policy_id = policy.id
            this.wizard_step = 1
            this.completed_steps = [1, 2, 3, 4]
            this.name = policy.name
            this.description = policy.description || ''
            this.duration_value = policy.duration_value
            this.duration_unit = policy.duration_unit
            this.max_duration_value = policy.max_duration_value
            this.max_duration_unit = policy.max_duration_unit
            this.end_date_after_completion = policy.end_date_after_completion
            this.is_active = policy.is_active
            this.policy_type = policy.policy_type || 'PROBATION'
            this.employee_category_ids = policy.employee_category_ids || []
            this.employee_categories = policy.employee_categories || []

            this.evaluation_required = policy.evaluation_required ?? false
            this.evaluation_milestones = (policy.evaluation_milestones || []).map(m => ({
                name: m.name || '',
                order: m.order || 0,
                is_final_milestone: Boolean(m.is_final_milestone),
                automatic_trigger_enabled: Boolean(m.automatic_trigger_enabled),
                trigger_after_days: m.trigger_after_days ?? null,
                feedback_form_enabled: Boolean(m.feedback_form_enabled),
                levels: (m.levels || []).map(l => ({
                    level_order: l.level_order || 0,
                    completion_rule: l.completion_rule || 'ALL',
                    reminder_enabled: Boolean(l.reminder_enabled),
                    reminder_after_days: l.reminder_after_days ?? null,
                    evaluators: (l.evaluators || []).map(ev => ({
                        evaluator_type: ev.evaluator_type || 'EMPLOYEE',
                        evaluator_ref_id: ev.evaluator_ref_id || '',
                        evaluator_name: ev.evaluator_name || '',
                    })),
                })),
            }))
            if (!this.evaluation_milestones.length && this.evaluation_required) {
                this.evaluation_milestones = [newMilestone(1, true)]
            }

            this.show_feedback_form_in_review = policy.show_feedback_form_in_review ?? false
            this.share_feedback_with_employee = policy.share_feedback_with_employee ?? false
            this.employee_response_allowed = policy.employee_response_allowed ?? false
            this.reviewer_response_allowed = policy.reviewer_response_allowed ?? false
            this.reviewer_recommendations_allowed = policy.reviewer_recommendations_allowed ?? false

            this.auto_confirm_probation = policy.auto_confirm_probation ?? false
            this.auto_generate_confirmation_letter = policy.auto_generate_confirmation_letter ?? false
        }
    }
})