import { defineStore } from "pinia";
import { useAuthStore } from "../shared/auth.store";
import { useComponentDefinitionStore } from "./componentDefinition.store"

export const useSalaryRangeStore = defineStore("salaryRangeStore", {
    state: () => ({
        loading: false,
        error: null,

        // ===============================
        // RANGE STATE
        // ===============================
        ranges: [],
        activeRangeId: null,

        // Components mapped to active range
        rangeComponents: [],

        // UI helpers
        saving: false,
    }),

    getters: {
        activeRange(state) {
            return state.ranges.find(r => r.id === state.activeRangeId) || null;
        },
    },

    actions: {
        /* --------------------------------------------------
         * RESET STORE
         * -------------------------------------------------- */
        reset() {
            this.ranges = [];
            this.activeRangeId = null;
            this.rangeComponents = [];
            this.error = null;
        },

        /* --------------------------------------------------
         * FETCH RANGES FOR TEMPLATE
         * -------------------------------------------------- */
        async fetchRanges(templateId) {
            try {
                this.loading = true;
                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.get(
                    `/salary/templates/${templateId}/ranges`,
                    {
                        params: {
                            organization_id: auth.organization,
                        },
                    }
                );

                if (resp.data?.success) {
                    this.ranges = resp.data.ranges.map(r => ({
                        id: r.id,
                        low: r.gross_low,
                        high: r.has_gross_high ? r.gross_high : null,
                        label: r.label || "",
                        saved: true,
                        components: [], // filled on demand
                    }));

                    // auto-select first range
                    this.activeRangeId = this.ranges[0]?.id ?? null;
                }
            } catch (err) {
                console.error("Fetch Ranges Error:", err);
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * CREATE RANGE
         * -------------------------------------------------- */
        async createRange(templateId, range) {
            try {
                this.saving = true;
                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.post(
                    `/salary/templates/${templateId}/ranges`,
                    {
                        organization_id: auth.organization,
                        gross_low: Number(range.low),
                        gross_high: Number(range.high ?? 0),
                        has_gross_high: range.high !== null,
                        label: range.label || "",
                    }
                );

                if (resp.data?.success) {
                    const r = resp.data.range;

                    this.ranges.push({
                        id: r.id,
                        low: r.gross_low,
                        high: r.has_gross_high ? r.gross_high : null,
                        label: r.label || "",
                        saved: true,
                        components: [],
                    });

                    this.activeRangeId = r.id;
                }

                return resp.data;
            } catch (err) {
                console.error("Create Range Error:", err);
                throw err;
            } finally {
                this.fetchRanges(templateId)
                this.saving = false;
            }
        },

        /* --------------------------------------------------
        * UPDATE RANGE
        * -------------------------------------------------- */
        async updateRange(range, templateId) {
            try {
                this.saving = true;
                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.put(
                    `/salary/ranges/${range.id}`,
                    {
                        organization_id: auth.organization,
                        gross_low: Number(range.low),
                        gross_high: Number(range.high ?? 0),
                        has_gross_high: range.high !== null,
                        label: range.label || "",
                    }
                );

                return resp.data;
            } catch (err) {
                console.error("Update Range Error:", err);
                throw err;
            } finally {
                if (templateId) {
                    await this.fetchRanges(templateId)
                }
                this.saving = false;
            }
        },

        /* --------------------------------------------------
         * DELETE RANGE
         * -------------------------------------------------- */
        async deleteRange(rangeId) {
            try {
                this.loading = true;
                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.delete(`/salary/ranges/${rangeId}`, {
                    params: {
                        organization_id: auth.organization,
                    },
                });

                if (resp.data?.success) {
                    this.ranges = this.ranges.filter(r => r.id !== rangeId);

                    if (this.activeRangeId === rangeId) {
                        this.activeRangeId = this.ranges[0]?.id ?? null;
                        this.rangeComponents = [];
                    }
                }

                return resp.data;
            } catch (err) {
                console.error("Delete Range Error:", err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * FETCH COMPONENTS FOR RANGE
         * -------------------------------------------------- */
        async fetchRangeComponents(rangeId) {
            try {
                this.loading = true;
                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.get(
                    `/salary/ranges/${rangeId}/components`,
                    {
                        params: {
                            organization_id: auth.organization,
                        },
                    }
                );

                const componentDefinition = useComponentDefinitionStore()
                await componentDefinition.fetchAllComponents()

                if (resp.data?.success) {
                    this.rangeComponents = resp.data.components.map(c => {
                        const compDef = componentDefinition.components.find(e => e.id == c.component_id)

                        return {
                            id: c.id,
                            componentId: c.component_id ? {
                                value: compDef?.id,
                                label: compDef?.name
                            } : null,
                            kind: c.kind,
                            formula: c.formula,
                            value: Number(c.value),
                            priority: c.priority,
                            minValue: Number(c.min_value) ?? 0,
                            maxValue: Number(c.max_value) ?? 0,
                            condition: c.condition ?? "",
                            // Mark as default if component definition has these flags
                            isDefault: compDef?.isDefault === true && compDef?.isDeletable === false,
                            isDeletable: compDef?.isDeletable !== false,
                        }
                    });

                    const range = this.ranges.find(r => r.id === rangeId);
                    if (range) {
                        range.components = this.rangeComponents;
                    }
                }
            } catch (err) {
                console.error("Fetch Range Components Error:", err);
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * SAVE RANGE COMPONENTS (FULL REPLACE)
         * -------------------------------------------------- */
        async saveRangeComponents(templateId, rangeId, components) {
            try {
                this.saving = true;
                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const payload = {
                    organization_id: auth.organization,
                    template_id: templateId,
                    components: components.map((c, idx) => ({
                        component_id: c.componentId?.value ?? c.componentId,
                        kind: c.kind || "",
                        formula: c.formula || "",
                        value: c.value ? Number(c.value) : null,
                        priority: c.priority ?? idx,
                        min_value: c.minValue !== null ? Number(c.minValue) : null,
                        max_value: c.maxValue !== null ? Number(c.maxValue) : null,
                        condition: c.condition || "",
                    })),
                };

                const resp = await $api.post(
                    `/salary/ranges/${rangeId}/components`,
                    payload
                );

                return resp.data;
            } catch (err) {
                console.error("Save Range Components Error:", err);
                throw err;
            } finally {
                this.saving = false;
            }
        },

        /* --------------------------------------------------
         * SET ACTIVE RANGE
         * -------------------------------------------------- */
        async setActiveRange(rangeId) {
            this.activeRangeId = rangeId;
            await this.fetchRangeComponents(rangeId);
        },
    },
});