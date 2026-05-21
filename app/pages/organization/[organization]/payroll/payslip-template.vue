<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-hidden">

        <!-- LOADING OVERLAY -->
        <div v-if="initialLoading" class="h-full flex flex-col items-center justify-center">
            <UiLoader />
            <p class="text-white/60 text-sm mt-4 animate-pulse tracking-wider uppercase font-medium">Initializing
                Designer...</p>
        </div>

        <div v-else class="h-full flex flex-col space-y-2">

            <!-- HEADER (Surgical) -->
            <div class="flex items-center justify-between px-2 py-1 shrink-0">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Icon name="heroicons:document-text-solid" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-white tracking-tight">Payslip Designer</h1>
                        <p class="text-white/40 text-[10px] uppercase tracking-widest font-bold">Organization / Payroll
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <UiButton @click="saveTemplateOnly" :disabled="payslip.saving" color="#6366f1" size="sm"
                        rounded="lg" class="!px-6">
                        <div class="flex items-center gap-2">
                            <Icon v-if="payslip.saving" name="svg-spinners:ring-resize" class="w-4 h-4" />
                            <Icon v-else name="heroicons:cloud-arrow-up-solid" class="w-4 h-4" />
                            <span>Save Template</span>
                        </div>
                    </UiButton>

                    <UiButton @click="renderPayslip" :disabled="payslip.saving" color="#4aff7a" size="sm" rounded="lg"
                        class="!px-6">
                        <div class="flex items-center gap-2">
                            <Icon v-if="payslip.saving" name="svg-spinners:ring-resize" class="w-4 h-4" />
                            <Icon v-else name="heroicons:play-solid" class="w-4 h-4" />
                            <span>{{ payslip.saving ? "Rendering..." : "Render Preview" }}</span>
                        </div>
                    </UiButton>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2 flex-1 overflow-hidden">

                <!-- LEFT: INPUT PANEL (4 Columns) -->
                <div
                    class="col-span-4 h-full flex flex-col space-y-4 rounded-xl bg-white/5 border border-white/10 p-4 overflow-hidden">

                    <div class="shrink-0">
                        <h2 class="text-base font-semibold text-white">Template Configuration</h2>
                        <p class="text-xs text-white/40 mt-1">Select a design and customize its dynamic variables</p>
                    </div>

                    <!-- TEMPLATE SELECTION -->
                    <div class="space-y-2 shrink-0">
                        <label class="text-xs font-bold text-white/60 uppercase tracking-wider">1. Select
                            Template</label>
                        <div class="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            <div v-for="template in payslip.templates" :key="template.path"
                                @click="handleTemplateSelect(template)"
                                class="group cursor-pointer rounded-lg border px-3 py-2.5 transition-all duration-300 relative"
                                :class="selectedTemplatePath === template.path
                                    ? 'bg-indigo-500/20 border-indigo-500/50'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <Icon name="heroicons:document-solid" class="w-4 h-4"
                                            :class="selectedTemplatePath === template.path ? 'text-indigo-400' : 'text-white/30'" />
                                        <span class="text-xs font-medium text-white/80 truncate">{{ template.name
                                            }}</span>
                                    </div>
                                    <Icon v-if="selectedTemplatePath === template.path"
                                        name="heroicons:check-circle-solid" class="w-4 h-4 text-indigo-400 shrink-0" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- VARIABLES EDITOR -->
                    <div class="flex-1 flex flex-col min-h-0 space-y-2">
                        <label class="text-xs font-bold text-white/60 uppercase tracking-wider shrink-0">2. Configure
                            Variables</label>

                        <div v-if="!editableVariables.length"
                            class="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl">
                            <Icon name="heroicons:adjustments-horizontal" class="w-8 h-8 text-white/10 mb-2" />
                            <p class="text-white/30 text-[10px] uppercase font-bold">Select template to edit</p>
                        </div>

                        <div v-else class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            <div v-for="variable in editableVariables" :key="variable.key"
                                class="rounded-lg bg-black/20 border border-white/5 p-3 space-y-2 hover:border-white/10 transition-all">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="flex flex-col">
                                        <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">{{
                                            variable.name }}</label>
                                        <span class="text-[9px] font-mono text-white/20 uppercase">{{ variable.key
                                            }}</span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="flex flex-col items-end gap-0.5">
                                            <span
                                                class="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Dynamic</span>
                                            <UiSwitch v-model="variable.is_dynamic" size="sm" color="#6366f1" />
                                        </div>
                                        <span
                                            class="text-[9px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded uppercase">{{
                                                variable.type }}</span>
                                    </div>
                                </div>

                                <!-- ARRAY REPEATER -->
                                <div v-if="variable.type === 'array'" class="space-y-3 pt-1">
                                    <div v-for="(item, idx) in variable.value" :key="idx"
                                        class="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3 relative">

                                        <div class="flex items-center justify-between border-b border-white/5 pb-2">
                                            <span class="text-[9px] font-bold text-white/20 uppercase">Item #{{ idx + 1
                                                }}</span>
                                            <button @click="removeArrayItem(variable, idx)"
                                                class="text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1">
                                                <Icon name="heroicons:trash-solid" class="w-3.5 h-3.5" />
                                                <span class="text-[9px] font-bold uppercase">Delete</span>
                                            </button>
                                        </div>

                                        <div v-for="key in getObjectKeys(item)" :key="key" class="space-y-1">
                                            <label
                                                class="text-[9px] font-bold text-white/20 uppercase tracking-tight">{{
                                                    key }}</label>
                                            <input v-model="item[key]"
                                                class="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-[11px] text-white outline-none focus:border-indigo-500/40 transition-all" />
                                        </div>
                                    </div>

                                    <button @click="addArrayItem(variable)"
                                        class="w-full py-2 border border-dashed border-white/10 rounded-lg text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Icon name="heroicons:plus-small" class="w-4 h-4" />
                                        Add Item
                                    </button>
                                </div>

                                <!-- LONG STRING / TEXTAREA -->
                                <textarea v-else-if="isLongValue(variable.value)" v-model="variable.value" rows="3"
                                    class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all resize-none font-mono"></textarea>

                                <input v-else v-model="variable.value"
                                    class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all"
                                    :placeholder="variable.key" />

                                <p class="text-[9px] font-mono text-white/10 truncate">{{ variable.key }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- HINT -->
                    <div
                        class="shrink-0 rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3 text-[10px] text-indigo-300/60 leading-relaxed italic">
                        💡 Changes to variables are applied when you click 'Render Preview'. You can also toggle EJS
                        source view.
                    </div>
                </div>

                <!-- RIGHT: PREVIEW (8 Columns) -->
                <div
                    class="col-span-8 h-full rounded-xl bg-white/5 border border-white/10 p-2 flex flex-col overflow-hidden relative">

                    <!-- EMPTY STATE -->
                    <div v-if="!payslip.renderedHtml && !payslip.saving"
                        class="h-full flex flex-col items-center justify-center text-center">
                        <div class="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                            <Icon name="heroicons:eye-slash" class="w-10 h-10 text-white/10" />
                        </div>
                        <p class="text-white/60 font-semibold">Preview Payslip</p>
                        <p class="text-white/30 text-xs mt-1">Configure your template and click render to see details
                        </p>
                    </div>

                    <!-- PREVIEW FRAME -->
                    <div v-else class="h-full relative bg-white rounded-lg overflow-hidden shadow-2xl">
                        <iframe v-show="!payslip.saving" :srcdoc="payslip.renderedHtml"
                            class="w-full h-full border-0"></iframe>

                        <!-- LOADING OVERLAY -->
                        <div v-if="payslip.saving"
                            class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                            <div class="flex flex-col items-center">
                                <Icon name="svg-spinners:ring-resize" class="w-10 h-10 text-white" />
                                <p
                                    class="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em] mt-4 animate-pulse">
                                    Re-rendering Frame</p>
                            </div>
                        </div>

                        <!-- FULL VIEW BUTTON -->
                        <button v-if="payslip.renderedHtml" @click="openPrintDialog"
                            class="absolute top-4 right-[55px] p-2 rounded-lg bg-black/20 hover:bg-black/40 text-black/40 hover:text-black transition-all z-20 backdrop-blur-md border border-black/5">
                            <Icon name="heroicons:printer" class="w-4 h-4" />
                        </button>
                        <button v-if="payslip.renderedHtml" @click="openInNewTab"
                            class="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/40 text-black/40 hover:text-black transition-all z-20 backdrop-blur-md border border-black/5">
                            <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { usePayslipTemplateStore } from "@/stores/payslipTemplate.store";

definePageMeta({
    layout: "organization",
});

const payslip = usePayslipTemplateStore();
const selectedTemplatePath = ref("");
const editableVariables = ref([]);
const initialLoading = ref(true);

const syncVariables = (vars) => {
    if (!vars) return;
    editableVariables.value = vars.map((v) => {
        if (v.type === "array") {
            try {
                const val = typeof v.value === "string" ? JSON.parse(v.value || "[]") : (v.value || []);
                return { ...v, value: val };
            } catch (e) {
                console.warn(`Failed to parse array for ${v.key}`, e);
                return { ...v, value: [] };
            }
        }
        return { ...v };
    });
};

const handleTemplateSelect = async (template) => {
    if (!template) return;

    selectedTemplatePath.value = template.path;
    await payslip.fetchTemplateByPath(template.path);

    await saveTemplateOnly();

    // Sync variables immediately after fetch
    syncVariables(payslip.variables);

    // Auto-render on selection
    await renderPayslip();
};

const addArrayItem = (variable) => {
    if (!Array.isArray(variable.value)) variable.value = [];

    const newItem = {};
    if (variable.value.length > 0) {
        Object.keys(variable.value[0]).forEach((key) => {
            newItem[key] = typeof variable.value[0][key] === "number" ? 0 : "";
        });
    } else {
        newItem.label = "New Item";
        newItem.amount = "0";
    }

    variable.value.push(newItem);
};

const removeArrayItem = (variable, index) => {
    variable.value.splice(index, 1);
};

const getObjectKeys = (obj) => {
    return Object.keys(obj || {});
};

const isLongValue = (value) => {
    if (typeof value === "object") return false;
    return String(value || "").length > 60;
};

const buildPayload = () => {
    // Current template object
    const currentTemplate = payslip.templates.find(t => t.path === selectedTemplatePath.value);

    // Stringify array values back to JSON for the variables array
    const variablesForApi = editableVariables.value.map(v => {
        if (v.type === 'array') {
            return {
                ...v,
                value: JSON.stringify(v.value)
            };
        }
        return v;
    });

    return {
        organization_id: useAuthStore().organization,
        name: currentTemplate ? currentTemplate.name : 'Unknown Template',
        template_path: selectedTemplatePath.value,
        ejs_content: payslip.ejsContent,
        variables: variablesForApi
    };
};

const saveTemplateOnly = async () => {
    if (!selectedTemplatePath.value) return;
    const payload = buildPayload();
    await payslip.saveTemplate(payload);
    // Sync any server-side changes (like calculated totals)
    syncVariables(payslip.variables);
    await renderPayslip();
};

const renderPayslip = async () => {
    if (!selectedTemplatePath.value) return;

    const payload = buildPayload();

    // The render API and save API now use the same structure
    await payslip.renderTemplate(payload);
    // Sync any server-side changes (like calculated totals)
    syncVariables(payslip.variables);
};

const openInNewTab = () => {
    if (!payslip.renderedHtml) return;
    const newWindow = window.open();
    newWindow.document.write(payslip.renderedHtml);
    newWindow.document.close();
};

const openPrintDialog = () => {
    if (!payslip.renderedHtml) return;
    const printWindow = window.open();
    printWindow.document.write(payslip.renderedHtml);

    // scale down for print preview
    const style = printWindow.document.createElement('style');
    style.innerHTML = `
        @media print {
            body {
                transform: scale(0.85);
                transform-origin: top center;
            }
        }
    `;
    printWindow.document.head.appendChild(style);
    // wait for the page load to complete before printing
    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    }
    printWindow.document.close();
};

onMounted(async () => {
    initialLoading.value = true;
    try {
        await payslip.fetchTemplates();
        if (payslip.templates.length == 1) {
            await handleTemplateSelect(payslip.templates[0]);
        } else if (payslip.templates.length > 1) {
            await payslip.renderTemplate();
            syncVariables(payslip.variables);
            await handleTemplateSelect(payslip.templates.find(e => e.name == payslip.renderedTemplateName));
        }
    } catch (err) {
        console.error("Initial load error:", err);
    } finally {
        setTimeout(() => {
            initialLoading.value = false;
        }, 800);
    }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.1);
}
</style>