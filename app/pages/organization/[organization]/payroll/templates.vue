<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- 🔍 HEADER BAR -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Salary Template<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading"
                    @search="fetchTemplates" />

                <UiButton @click="openAddModal" color="#4aff7a" text="Add Salary Template"
                    prepend-icon="ion:add-circle" />

                <UiButton @click="fetchTemplates" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- 📄 TEMPLATE TABLE -->
        <SalaryTemplateTable :items="templates" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @view="viewTemplate" @edit="editTemplate" @delete="askDelete" @prev="page-- && fetchTemplates()"
            @next="page++ && fetchTemplates()" />
    </div>


    <DetailedView v-model="viewModal" />

    <!-- 🧩 ADD / UPDATE MODAL -->
    <UiSidebarModal fullscreen v-model="addUpdateModal" @close="closeAddUpdateModal"
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

import { useSalaryTemplateStore } from "../../../../stores/salaryTemplate.store";

import SalaryTemplateForm from "../../../../components/salary-templates/form.vue";
import SalaryTemplateTable from "../../../../components/salary-templates/dataTable.vue";
import DetailedView from "../../../../components/salary-templates/detailedView.vue";

definePageMeta({
    layout: "organization",
});

// -------------------------------
// Store
// -------------------------------
const templateStore = useSalaryTemplateStore();

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

const openAddModal = () => {
    templateStore.resetForm();
    addUpdateModal.value = true;
};

const editTemplate = async (template) => {
    await templateStore.fetchBuilderData(template.id);
    addUpdateModal.value = true;
};

const viewTemplate = async (template) => {
    await templateStore.fetchBuilderData(template.id, true);
};


const saveTemplate = async () => {
    try {
        const success = await templateStore.saveTemplate();
        if (success) closeAddUpdateModal();
    } catch (err) {
        console.error("Template Save Error:", err);
    }
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
    await fetchTemplates();
});
</script>

<style scoped></style>
