import { defineStore } from "pinia";
import { useAuthStore } from "./auth.store";

export const useComponentDefinitionStore = defineStore("componentDefinitionStore", {
    state: () => ({
        loading: false,
        error: null,

        // LISTING
        components: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        search: "",
        sort_by: "displayOrder",
        sort_order: "asc",
        tabs: [
            { label: 'recurring', badge: 0, icon: 'heroicons:arrow-path' },
            { label: 'adhoc', badge: 0, icon: 'heroicons:bolt' },
            { label: 'allowance', badge: 0, icon: 'heroicons:banknotes' },
            { label: 'custom', badge: 0, icon: 'heroicons:adjustments-horizontal' },
        ],
        activeTab: 0,

        // FORM STATE
        componentId: null,
        form: {

            key: "",
            name: "",
            type: { value: "earning", label: "Earning" },
            category: {
                value: 'standard',
                label: 'Standard'
            },

            defaultFormula: "",
            description: "",

            isTaxable: true,
            isVariable: false,
            isStatutory: false,
            includeInCTC: true,
            includeInGross: true,

            displayOrder: "1",
            isActive: true,
        },
    }),

    actions: {
        /* --------------------------------------------------
         * RESET FORM
         * -------------------------------------------------- */
        resetForm() {
            this.componentId = null;
            this.form = {
                key: "",
                name: "",
                type: { value: "earning", label: "Earning" },
                category: {
                    value: 'standard',
                    label: 'Standard'
                },

                defaultFormula: "",
                description: "",

                isTaxable: true,
                isVariable: false,
                isStatutory: false,
                includeInCTC: true,
                includeInGross: true,

                displayOrder: "1",
                isActive: true,
            };
        },

        /* --------------------------------------------------
         * LOAD COMPONENT INTO FORM (Edit mode)
         * -------------------------------------------------- */
        loadComponent(item) {
            this.componentId = item.id;

            const types = [
                { value: "earning", label: "Earning" },
                { value: "deduction", label: "Deduction" },
                { value: "reimbursement", label: "Reimbursement" },
                { value: "benefit", label: "Benefit" },
                { value: "tax", label: "Tax" }
            ]
            const categories = [
                {
                    value: 'standard',
                    label: 'Standard'
                },
                {
                    value: 'allowance',
                    label: 'Allowance'
                },
            ]


            this.form = {
                key: item.key,
                name: item.name,
                type: types.find(e => e.value == item.type),
                category: categories.find(e => e.value == item.category),

                defaultFormula: item.defaultFormula,
                description: item.description,

                isTaxable: item.isTaxable,
                isVariable: item.isVariable,
                isStatutory: item.isStatutory,
                includeInCTC: item.includeInCTC,
                includeInGross: item.includeInGross,

                displayOrder: item.displayOrder.toString(),
                isActive: item.isActive,
            };
        },

        /* --------------------------------------------------
         * FETCH COMPONENT DEFINITIONS
         * -------------------------------------------------- */
        async fetchComponents() {
            try {
                this.loading = true;
                const authStore = useAuthStore()
                const { $api } = useNuxtApp()
                const response = await $api.get("/salary/components", {
                    params: {
                        page: this.page,
                        limit: this.limit,
                        search: this.search,
                        category: this.tabs[this.activeTab].label,
                        sort_by: this.sort_by,
                        sort_order: this.sort_order,
                        organization_id: authStore.organization,
                    },
                });

                const res = response.data;

                this.components = res.data || [];
                this.total = res.total;
                this.totalPages = res.total_pages;
                this.tabs = this.tabs.map(e => ({
                    ...e,
                    badge: res.categories.find(el => el.category_name.toLowerCase() == e.label.toLowerCase())?.components_count
                }))

            } catch (err) {
                console.error("Fetch Components Error:", err);
                this.error = err.message;
            } finally {
                setTimeout(() => {
                    this.loading = false;
                }, 1000);
            }
        },

        /* --------------------------------------------------
         * SAVE COMPONENT (Create / Update)
         * -------------------------------------------------- */
        async saveComponent() {
            const toast = useToast()
            try {
                this.loading = true;
                const authStore = useAuthStore()

                const payload = {
                    ...this.form,
                    type: this.form.type.value,
                    category: this.form.category.value,
                    organization_id: authStore.organization,
                    displayOrder: Number(this.form.displayOrder)
                };
                const { $api } = useNuxtApp()
                let resp = null
                if (this.componentId) {
                    // UPDATE
                    resp = await $api.put(`/salary/components/${this.componentId}`, payload);
                } else {
                    // CREATE
                    resp = await $api.post("/salary/components", payload);
                }

                if (resp.data.success) {
                    toast.success({
                        title: 'Success!',
                        message: resp.data.message,
                        timeout: 1500
                    })
                    this.resetForm()
                    return true
                } else {
                    toast.error({
                        title: 'Error!',
                        message: resp.data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error("Save Component Error:", err);
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                throw err;
            } finally {
                await this.fetchComponents();
                this.loading = false;
            }
        },

        /* --------------------------------------------------
        * DELETE COMPONENT
        * -------------------------------------------------- */
        async deleteComponent() {
            const toast = useToast()
            try {
                this.loading = true;
                const { $api } = useNuxtApp()
                const resp = await $api.delete(`/salary/components/${this.componentId}`);
                if (resp.data.success) {
                    toast.success({
                        title: 'Success!',
                        message: resp.data.message,
                        timeout: 1500
                    })
                    return true
                } else {
                    toast.error({
                        title: 'Error!',
                        message: resp.data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error("Delete Component Error:", err);
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
                throw err;
            } finally {
                await this.fetchComponents();
                this.loading = false;
            }
        },
    },
});
