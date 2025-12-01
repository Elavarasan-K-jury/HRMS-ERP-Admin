<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">

            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Asset Model<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" />

                <UiButton @click="openAddModal" color="#4aff7a" text="Add Asset Model" prepend-icon="ion:add-circle" />

                <UiButton @click="fetchModels" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- TABLE -->
        <DataTable :items="assetModels" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @view="viewModel" @edit="editModel" @delete="deleteModel" @prev="prevPage" @next="nextPage" />

    </div>

    <!-- ADD/EDIT MODEL -->
    <UiSidebarModal width="600px" v-model="addUpdateModal" :title="formTitle">
        <AssetModelForm />

        <template #footer>
            <UiButton @click="close" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton :disabled="loading" @click="save" color="#4aff7a"
                :text="loading ? 'Saving, please wait...' : 'Save Asset Model'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- DELETE MODAL -->
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete <b>{{ deleteData?.model_name }}</b>?</span>
        </template>

        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Model" prepend-icon="ion:trash" />
        </template>
    </UiModal>

    <!-- VIEW DETAILS -->
    <UiSidebarModal width="600px" v-model="viewModal" :title="'Asset Model Details'">
        <AssetModelView :model="selectedModel" />
    </UiSidebarModal>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetsModelStore } from '../../../../stores/assetModel.store';
import { useAuthStore } from '../../../../stores/auth.store';

import DataTable from '../../../../components/asset/AssetModelsTable.vue';
import AssetModelForm from '../../../../components/asset/AssetModelForm.vue';
import AssetModelView from '../../../../components/asset/AssetModelView.vue';

definePageMeta({ layout: 'organization' });

/* STORES */
const store = useAssetsModelStore();
const auth = useAuthStore();

const {
    loading,
    page,
    limit,
    totalPages,
    search,
    assetModelId
} = storeToRefs(store);

const assetModels = computed(() => store.models);
const total = computed(() => store.total);

/* MODALS */
const addUpdateModal = ref(false);
const deleteModal = ref(false);
const viewModal = ref(false);

/* SELECTED ITEMS */
const selectedModel = ref(null);
const deleteData = ref(null);

/* TITLE */
const formTitle = ref("Add Asset Model");

/* OPEN MODAL */
const openAddModal = () => {
    formTitle.value = "Add Asset Model";
    store.resetForm();
    addUpdateModal.value = true;
};

/* CLOSE MODAL */
const close = () => {
    store.resetForm();
    addUpdateModal.value = false;
};

/* SAVE */
const save = async () => {
    await store.saveAssetModel();
    await fetchModels();
    close();
};

/* VIEW DETAILS */
const viewModel = (row) => {
    selectedModel.value = row;
    viewModal.value = true;
};

/* EDIT MODEL */
const editModel = (row) => {
    formTitle.value = "Edit Asset Model";
    assetModelId.value = row.id;

    store.category_id = store.category_list.find(c => c.value === row.category_id);
    store.brand = row.brand;
    store.model_name = row.model_name;
    store.code = row.code;
    store.description = row.description;
    store.specs = row.specs;
    store.is_active = row.is_active;

    addUpdateModal.value = true;
};

/* DELETE */
const deleteModel = (row) => {
    deleteData.value = row;
    assetModelId.value = row.id;
    deleteModal.value = true;
};

const confirmDelete = async () => {
    await store.deleteAssetModel();
    await fetchModels();
    deleteModal.value = false;
};

const cancelDelete = () => {
    deleteModal.value = false;
};

/* PAGINATION */
const prevPage = () => {
    if (page.value > 1) page.value--;
    fetchModels();
};
const nextPage = () => {
    if (page.value < totalPages.value) page.value++;
    fetchModels();
};

/* SEARCH */
watch(search, () => {
    page.value = 1;
    fetchModels();
});

/* LOAD MODELS */
const fetchModels = async () => {
    await store.fetchAssetModels();
};

/* ON MOUNT */
onMounted(async () => {
    store.organization_id = auth.organization;
    await store.fetchAllCategories();
    await fetchModels();
});
</script>
