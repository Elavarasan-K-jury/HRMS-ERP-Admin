// app/stores/head.store.js
import { defineStore } from 'pinia'

export const useOnboardingStore = defineStore('Onboarding', {
    state: () => ({
        onBoardingFlows: [],
        loading: false,
        error: null,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        total: 0,
        organization_id: null,
        name: null,
        description: null,
        estimated_days: 5,
        flow_id: null,
        process_steps: [
            {
                id: null,
                name: null,
                features: [
                    {
                        id: null,
                        name: null,
                        type: null,
                        hasOptions: false,
                        optionText: null,
                        options: []
                    },
                ]
            },
        ]
    }),
    actions: {
        async fetchOnboardingFlows() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                this.loading = true
                const res = await $api.get('/employee-onboarding-flows', {
                    params: {
                        organization_id: this.organization_id,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder
                    },
                })
                console.log('onBoarding.store.js @ Line 159:', res);
                if (res.data.success) {
                    this.onBoardingFlows = res.data.flows
                    this.total = res.data.total
                    this.totalPages = res.data.totalPages
                }
            } catch (err) {
                console.error('[Onboarding] Fetch onboarding flows error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },
        async saveOnboarding() {
            const toast = useToast()
            this.loading = true
            let error = false
            try {
                const { $api } = useNuxtApp()
                // Create onboarding process 
                const flow_payload = {
                    organization_id: this.organization_id,
                    name: this.name,
                    description: this.description,
                    steps: this.process_steps.length,
                    estimated_days: this.estimated_days
                }
                try {
                    const res = this.flow_id ? await $api.put(`/employee-onboarding-flows/${this.flow_id}`, flow_payload) : await $api.post('/employee-onboarding-flows', flow_payload)
                    if (res.data.success) {
                        for (const step of this.process_steps) {
                            const steps_payload = {
                                onboarding_id: res.data.flow.id,
                                name: step.name,
                                is_active: true,
                            }
                            try {
                                const res_step = step.id ? await $api.put(`/employee-onboarding-steps/${step.id}`, steps_payload) : await $api.post('/employee-onboarding-steps', steps_payload)
                                if (res_step.data.success) {
                                    for (const feature of step.features) {
                                        const features_payload = {
                                            step_id: res_step.data.step.id,
                                            feature_name: feature.name,
                                            feature_type: feature.type.value,
                                            has_options: feature.hasOptions,
                                            options: JSON.stringify(feature.options),
                                        }
                                        try {
                                            const res_feature = feature.id ? await $api.put(`/employee-onboarding-features/${feature.id}`, features_payload) : await $api.post('/employee-onboarding-features', features_payload)
                                            if (res_feature.data.success) {
                                            }
                                        } catch (error) {
                                            error = true
                                            console.error('[onboarding-store] Save onboarding error:', error)
                                            toast.error({ title: 'Error!', message: error.message, timeout: 1500 })
                                        }
                                    }
                                }
                            } catch (error) {
                                error = true
                                console.error('[onboarding-store] Save onboarding error:', error)
                                toast.error({ title: 'Error!', message: error.message, timeout: 1500 })
                            }
                        }
                    }
                    if (!error) {
                        toast.success({
                            title: 'Success!',
                            message: res.data.message,
                            timeout: 1500
                        })
                        this.process_steps = [
                            {
                                id: null,
                                name: null,
                                features: [
                                    {
                                        id: null,
                                        name: null,
                                        type: null,
                                        hasOptions: false,
                                        optionText: null,
                                        options: []
                                    },
                                ]
                            },
                        ]
                        this.flow_id = null
                        this.name = null
                        this.description = null
                        this.estimated_days = 5
                    }
                } catch (error) {
                    error = true
                    console.error('[onboarding-store] Save onboarding error:', error)
                    toast.error({ title: 'Error!', message: error.message, timeout: 1500 })
                }
            } catch (err) {
                console.error('[onboarding-store] Save onboarding error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.fetchOnboardingFlows()
                this.loading = false
            }
        },
        async deleteOnboardingFlow() {
            const toast = useToast()
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-onboarding-flows/${this.flow_id}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[onboarding-store] Delete onboarding flow error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.fetchOnboardingFlows()
                this.loading = false
            }
        },
        addProcessStep(index) {
            this.process_steps.splice(index + 1, 0, {
                name: null,
                features: [
                    {
                        name: null,
                        type: null,
                        hasOptions: false,
                        options: []
                    }
                ]
            })
        },
        async deleteProcessStep(id) {
            try {
                const toast = useToast()
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-onboarding-steps/${id}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[onboarding-store] Delete process step error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async deleteStepFeature(id) {
            try {
                const toast = useToast()
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-onboarding-features/${id}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[onboarding-store] Delete step feature error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        removeProcessStep(index) {
            if (this.process_steps[index].id) {
                this.deleteProcessStep(this.process_steps[index].id)
            }
            this.process_steps.splice(index, 1)
        },
        addFeature(step_index, feature_index) {
            this.process_steps[step_index].features.splice(feature_index + 1, 0, {
                name: null,
                type: null,
                hasOptions: false,
                options: []
            })
        },
        removeFeature(step_index, feature_index) {
            if (this.process_steps[step_index].features[feature_index].id) {
                this.deleteStepFeature(this.process_steps[step_index].features[feature_index].id)
            }
            this.process_steps[step_index].features.splice(feature_index, 1)
        },
    }
})
