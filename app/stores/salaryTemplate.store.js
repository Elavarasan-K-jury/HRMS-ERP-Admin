import { defineStore } from "pinia";
import { useAuthStore } from "./auth.store";
import { useDepartmentStore } from './department.store'
import { useDesignationStore } from './designation.store'

export const useSalaryTemplateStore = defineStore("salaryTemplateStore", {
    state: () => ({
        loading: false,
        error: null,

        // LIST
        templatesSelect: [],
        templates: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        search: "",
        sort_by: "createdAt",
        sort_order: "desc",

        // BUILDER DATA
        viewModal: false,
        builder: {
            components: [],
            template: null
        },

        // FORM STATE
        templateId: null,
        form: {
            name: "",
            description: "",
            departments: [],
            designations: [],
            isDefault: false,
            isActive: true,

            components: [] // List of TemplateComponent rows
        },
    }),

    actions: {
        /* --------------------------------------------------
         * RESET FORM
         * -------------------------------------------------- */
        resetForm() {
            this.templateId = null;
            this.form = {
                name: "",
                description: "",
                departments: [],
                designations: [],
                isDefault: false,
                isActive: true,

                components: []
            };
        },

        /* --------------------------------------------------
         * LOAD TEMPLATE INTO FORM (Edit Mode)
         * -------------------------------------------------- */
        async loadTemplate(template) {
            const departmentStore = useDepartmentStore()
            const designationStore = useDesignationStore()
            this.templateId = template.id;

            await departmentStore.fetchAllDepartments()
            await designationStore.fetchDesignationList()
            const departments = departmentStore.department_select.filter(e => template.departments.find(el => e.label.includes(el)))
            const designations = designationStore.designation_list.filter(e => template.designations.find(el => e.label.includes(el)))

            this.form = {
                name: template.name,
                description: template.description,
                departments: departments || [],
                designations: designations || [],
                isDefault: template.isDefault,
                isActive: template.isActive,
            };
        },

        /* --------------------------------------------------
         * FETCH TEMPLATES (Select)
         * -------------------------------------------------- */
        async fetchTemplatesForSelect() {
            try {
                this.loading = true;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.get("/salary/templates", {
                    params: {
                        page: this.page,
                        search: this.search,
                        sort_by: this.sort_by,
                        sort_order: this.sort_order,
                        organization_id: auth.organization
                    }
                });

                const r = resp.data;

                this.templatesSelect = r.data.map(e => ({
                    label: e.name,
                    value: e.id
                })) || [];

            } catch (err) {
                console.error("Fetch Templates Error:", err);
                this.error = err.message;
            } finally {
                setTimeout(() => (this.loading = false), 700);
            }
        },

        /* --------------------------------------------------
         * FETCH TEMPLATES (Listing)
         * -------------------------------------------------- */
        async fetchTemplates() {
            try {
                this.loading = true;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.get("/salary/templates", {
                    params: {
                        page: this.page,
                        limit: this.limit,
                        search: this.search,
                        sort_by: this.sort_by,
                        sort_order: this.sort_order,
                        organization_id: auth.organization
                    }
                });

                const r = resp.data;

                this.templates = r.data || [];
                this.total = r.total;
                this.totalPages = r.total_pages;

            } catch (err) {
                console.error("Fetch Templates Error:", err);
                this.error = err.message;
            } finally {
                setTimeout(() => (this.loading = false), 700);
            }
        },

        /* --------------------------------------------------
         * FETCH BUILDER DATA (components + existing template)
         * -------------------------------------------------- */
        async fetchBuilderData(template = null, details = false) {
            try {
                this.loading = true;

                this.loadTemplate(
                    template
                );

                this.builder.template = template
                if (details) this.viewModal = true

            } catch (err) {
                console.error("Builder Data Error:", err);
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * SAVE TEMPLATE (Create or Update)
         * -------------------------------------------------- */
        async saveTemplate() {
            const toast = useToast();
            try {
                this.loading = true;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const payload = {
                    template_id: this.templateId || "",

                    organization_id: auth.organization,
                    name: this.form.name,
                    description: this.form.description,

                    departments: this.form.departments.map(e => e.value),
                    designations: this.form.designations.map(e => e.value),

                    isDefault: this.form.isDefault,
                    isActive: this.form.isActive,

                    // components: this.form.components.map(c => ({
                    //     id: c.id,
                    //     componentId: c.componentId.value,
                    //     formula: c.formula || null,
                    //     value: c.value || null,
                    //     priority: Number(c.priority) || 0,
                    //     minValue: c.minValue ? Number(c.minValue) : null,
                    //     maxValue: c.maxValue ? Number(c.maxValue) : null,
                    //     condition: c.condition || null
                    // }))
                };

                const resp = await $api.post("/salary/templates", payload);

                if (resp.data.success) {
                    toast.success({
                        title: "Success!",
                        message: resp.data.message,
                        timeout: 1500
                    });

                    this.resetForm();
                    return true;
                } else {
                    toast.error({
                        title: "Error!",
                        message: resp.data.message,
                        timeout: 1500
                    });
                }

            } catch (err) {
                console.error("Save Template Error:", err);
                toast.error({
                    title: "Error!",
                    message: err.message,
                    timeout: 1500
                });
                throw err;
            } finally {
                await this.fetchTemplates();
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * DELETE TEMPLATE
         * -------------------------------------------------- */
        async deleteTemplate(templateId) {
            const toast = useToast();
            try {
                this.loading = true;

                const { $api } = useNuxtApp();

                const resp = await $api.delete(`/salary/templates/${templateId}`);

                if (resp.data.success) {
                    toast.success({
                        title: "Success!",
                        message: resp.data.message,
                        timeout: 1500
                    });
                    return true;
                } else {
                    toast.error({
                        title: "Error!",
                        message: resp.data.message,
                        timeout: 1500
                    });
                }

            } catch (err) {
                console.error("Delete Template Error:", err);
                toast.error({
                    title: "Error!",
                    message: err.message,
                    timeout: 1500
                });
                throw err;
            } finally {
                await this.fetchTemplates();
                this.loading = false;
            }
        },
    },
});
