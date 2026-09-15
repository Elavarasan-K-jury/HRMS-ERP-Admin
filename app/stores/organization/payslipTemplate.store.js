import { defineStore } from "pinia";
import { useAuthStore } from "../shared/auth.store";

export const usePayslipTemplateStore = defineStore("payslipTemplateStore", {
    state: () => ({
        loading: false,
        saving: false,
        error: null,

        templates: [],
        variables: [],
        selectedTemplate: null,
        ejsContent: "",

        renderedHtml: "",
        renderedTemplatePath: "",
        renderedTemplateName: "",
    }),

    actions: {
        /* --------------------------------------------------
         * RESET STORE
         * -------------------------------------------------- */
        reset() {
            this.loading = false;
            this.saving = false;
            this.error = null;

            this.templates = [];
            this.variables = [];
            this.selectedTemplate = null;
            this.ejsContent = "";

            this.renderedHtml = "";
            this.renderedTemplatePath = "";
            this.renderedTemplateName = "";
        },

        /* --------------------------------------------------
         * FETCH TEMPLATE LIST
         * GET /payslip-templates
         * -------------------------------------------------- */
        async fetchTemplates() {
            try {
                this.loading = true;
                this.error = null;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.get("/payslip-templates", {
                    params: {
                        organization_id: auth.organization
                    }
                });


                if (resp.data?.success) {
                    this.templates = resp.data.templates || [];
                    // this.variables = resp.data.variables || [];
                    // this.selectedTemplate = resp.data.template || null;
                    // this.ejsContent = resp.data.ejs_content || "";
                }

                return resp.data;
            } catch (err) {
                console.error("Fetch Payslip Templates Error:", err);
                this.error = err.response?.data?.message || err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * FETCH SINGLE TEMPLATE DETAILS
         * GET /payslip-templates?template_path=...
         * -------------------------------------------------- */
        async fetchTemplateByPath(templatePath) {
            try {
                this.loading = true;
                this.error = null;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.get("/payslip-templates", {
                    params: {
                        template_path: templatePath,
                        organization_id: auth.organization
                    },
                });

                if (resp.data?.success) {
                    // this.templates = resp.data.templates || [];
                    this.variables = resp.data.variables || [];
                    this.selectedTemplate = resp.data.template || null;
                    this.ejsContent = resp.data.ejs_content || "";
                }

                return resp.data;
            } catch (err) {
                console.error("Fetch Payslip Template By Path Error:", err);
                this.error = err.response?.data?.message || err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /* --------------------------------------------------
         * SAVE PAYSLIP TEMPLATE
         * POST /payslip-templates/save
         * -------------------------------------------------- */
        async saveTemplate(payload = {}) {
            try {
                this.saving = true;
                this.error = null;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.post("/payslip-templates/save", {
                    organization_id: payload.organization_id || auth.organization,
                    name: payload.name,
                    template_path: payload.template_path,
                    ejs_content: payload.ejs_content,
                    variables: payload.variables,
                });

                return resp.data;
            } catch (err) {
                console.error("Save Payslip Template Error:", err);
                this.error = err.response?.data?.message || err.message;
                throw err;
            } finally {
                this.saving = false;
            }
        },

        /* --------------------------------------------------
         * RENDER PAYSLIP TEMPLATE
         * POST /payslip-templates/render
         * -------------------------------------------------- */
        async renderTemplate(payload = {}) {
            try {
                this.saving = true;
                this.error = null;

                const auth = useAuthStore();
                const { $api } = useNuxtApp();

                const resp = await $api.post("/payslip-templates/render", {
                    organization_id: payload.organization_id || auth.organization,
                    ...payload,
                });

                if (resp.data?.success) {
                    this.renderedHtml = resp.data.html_content || "";
                    this.renderedTemplatePath = resp.data.template_path || "";
                    this.renderedTemplateName = resp.data.template_name || "";
                    // Update variables with the calculated/synced ones from server
                    if (resp.data.variables) {
                        this.variables = resp.data.variables;
                    }
                }

                return resp.data;
            } catch (err) {
                console.error("Render Payslip Template Error:", err);
                this.error = err.response?.data?.message || err.message;
                throw err;
            } finally {
                this.saving = false;
            }
        },
    },
});