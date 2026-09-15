<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <template v-if="financeEnabled">
            <!-- 🔍 HEADER BAR -->
            <div
                class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
                <h2 class="text-lg font-semibold uppercase text-white/90">
                    {{ total }} Salary Group<span>(s)</span>
                </h2>

                <div class="flex items-center gap-2">
                    <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading"
                        @search="fetchTemplates" />

                    <UiButton @click="openAddModal" color="#4aff7a" text="Add Salary Group"
                        prepend-icon="ion:add-circle" />

                    <UiButton @click="fetchTemplates" color="#fff" text="Reload" prepend-icon="ion:refresh" />
                </div>
            </div>

            <!-- 📄 TEMPLATE TABLE -->
            <SalaryTemplateTable :items="templates" :loading="loading" :total="total" :page="page"
                :total-pages="totalPages" @view="viewTemplate" @edit="editTemplate" @delete="askDelete"
                @prev="page-- && fetchTemplates()" @update-component="openAddComponentModal"
                @next="page++ && fetchTemplates()" />
        </template>
        <div v-else
            class="rounded-lg p-5 bg-white/10 border h-full border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-center">
            <div class="max-w-lg w-full p-8 text-center">
                <!-- Icon / Illustration -->
                <div class="w-20 h-20 mx-auto mb-4 rounded-full
                 bg-gradient-to-br from-amber-400 to-orange-500
                 flex items-center justify-center text-4xl">
                    <Icon name="heroicons:currency-rupee" class="text-[50px]" />
                </div>

                <!-- Title -->
                <h2 class="text-2xl font-semibold text-white mb-2">
                    Finance Module Not Enabled
                </h2>

                <!-- Description -->
                <p class="text-white/70 text-sm mb-6">
                    To manage payroll, salaries, invoices and financial reports,
                    you need to set up the finance module for your organization.
                </p>

                <!-- CTA -->
                <NuxtLink :to="`/organization/${authStore.organization}/payroll/settings`" class="px-6 py-3 rounded-lg
                 bg-gradient-to-r from-indigo-500 to-purple-600
                 text-white font-medium shadow-lg
                 hover:scale-[1.02] active:scale-[0.98]
                 transition-all">
                    Setup Finance
                </NuxtLink>

                <!-- Secondary Hint -->
                <p class="text-xs text-white/50 mt-4">
                    Only administrators can configure finance settings
                </p>
            </div>
        </div>
    </div>


    <DetailedView v-model="viewModal" />

    <!-- 🧩 ADD / UPDATE MODAL -->
    <UiSidebarModal :showFooter="false" fullscreen v-model="addUpdateComponentModal"
        @close="closeAddUpdateComponentModal" title="Update Salary component">

        <template #default>
            <SalaryComponentForm :templateId="selectedTemplateId" />
        </template>

        <template #footer>
            <div></div>
            <!-- <UiButton @click="closeAddUpdateComponentModal" color="#fff" text="Cancel"
                prepend-icon="ion:close-circle" />

            <UiButton @click="saveTemplate" :loading="loading" color="#4aff7a" text="Save Template"
                prepend-icon="ion:save-outline" /> -->
        </template>
    </UiSidebarModal>

    <UiSidebarModal v-model="addUpdateModal" @close="closeAddUpdateModal"
        :title="templateId ? 'Update Salary Template' : 'Create Salary Template'">

        <template #default>
            <SalaryTemplateForm />
        </template>

        <template #footer>
            <UiButton @click="closeAddUpdateModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />

            <UiButton @click="saveTemplate" :loading="loading" color="#4aff7a" text="Save Template"
                prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- ❌ DELETE CONFIRM MODAL -->
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete <b>{{ deleteData?.name }}</b>?</span>
        </template>

        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Template" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>


<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useSalaryTemplateStore } from "../../../../stores/organization/salaryTemplate.store";

import SalaryTemplateForm from "../../../../components/salary-templates/form.vue";
import SalaryComponentForm from "../../../../components/salary-templates/componentForm.vue";
import SalaryTemplateTable from "../../../../components/salary-templates/dataTable.vue";
import DetailedView from "../../../../components/salary-templates/detailedView.vue";
import { useFinanceStore } from '../../../../stores/super-admin/finance.store';
import { useAuthStore } from '../../../../stores/shared/auth.store';
definePageMeta({
    layout: "organization",
});

// -------------------------------
// Store
// -------------------------------
const templateStore = useSalaryTemplateStore();
const authStore = useAuthStore()
const financeStore = useFinanceStore()
const {
    templates,
    loading,
    page,
    limit,
    total,
    totalPages,
    search,
    templateId,
    form,
    viewModal
} = storeToRefs(templateStore);

// -------------------------------
// DELETE STATE
// -------------------------------
const deleteModal = ref(false);
const deleteData = ref(null);

const financeEnabled = computed(() => financeStore.isFinanceEnabled())
const askDelete = (template) => {
    deleteData.value = template;
    deleteModal.value = true;
};

const cancelDelete = () => {
    deleteData.value = null;
    deleteModal.value = false;
};

const confirmDelete = async () => {
    if (!deleteData.value) return;

    const success = await templateStore.deleteTemplate(deleteData.value.id);
    if (success) cancelDelete();
};

// -------------------------------
// SEARCH HANDLER (Debounced)
// -------------------------------
const searchTimer = ref(null);

watch(search, () => {
    clearTimeout(searchTimer.value);
    searchTimer.value = setTimeout(() => {
        page.value = 1;
        fetchTemplates();
    }, 300);
});

// -------------------------------
// ADD / EDIT MODAL
// -------------------------------
const addUpdateModal = ref(false);
const addUpdateComponentModal = ref(false);
const selectedTemplateId = ref(null)

const openAddModal = () => {
    templateStore.resetForm();
    addUpdateModal.value = true;
};
const openAddComponentModal = async (template) => {
    templateStore.resetForm();
    selectedTemplateId.value = template.id
    await templateStore.fetchBuilderData(template);
    addUpdateComponentModal.value = true;
};

const editTemplate = async (template) => {
    await templateStore.fetchBuilderData(template);
    addUpdateModal.value = true;
};

const viewTemplate = async (template) => {
    await templateStore.fetchBuilderData(template, true);
};


const saveTemplate = async () => {
    try {
        const success = await templateStore.saveTemplate();
        if (success) closeAddUpdateModal();
    } catch (err) {
        console.error("Template Save Error:", err);
    }
};

const closeAddUpdateComponentModal = async () => {
    await fetchTemplates()
    addUpdateComponentModal.value = false;
};
const closeAddUpdateModal = () => {
    templateStore.resetForm();
    addUpdateModal.value = false;
};

// -------------------------------
// FETCH LIST
// -------------------------------
const fetchTemplates = async () => {
    await templateStore.fetchTemplates();
};

// -------------------------------
onMounted(async () => {
    await financeStore.checkFinanceEnabled()
    if (financeEnabled.value) {
        await fetchTemplates();
    }
});
</script>

<style scoped></style>
