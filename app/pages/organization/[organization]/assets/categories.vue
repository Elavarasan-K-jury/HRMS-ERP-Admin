<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Asset Category<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openAddModal" color="#4aff7a" text="Add Asset Category"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchAssetCategories" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="assetCategories" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @refresh="fetchDepartments" @view="view" @edit="editEmpCategory" @delete="deleteEmpCategory" />
    </div>
    <UiSidebarModal width="600px" v-model="addUpdateModal" :title="formTitle">
        <CategoryForm />
        <template #footer>
            <UiButton :disabled="loading" @click="closeAddUpdateModal" color="#fff" text="Cancel"
                prepend-icon="ion:close-circle" />
            <UiButton :disabled="loading" @click="saveOnboarding" color="#4aff7a"
                :text="!loading ? 'Save Asset Category' : 'Saving please wait...'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Asset Category" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>
<script setup>
import { onMounted, computed, ref } from 'vue';
import { useAssetsCategoryStore } from '../../../../stores/assetsCategory.store';
import { useAuthStore } from '../../../../stores/auth.store';
import DataTable from '../../../../components/asset/categoryList.vue';
import CategoryForm from '../../../../components/asset/categoryForm.vue';
import { storeToRefs } from 'pinia';
definePageMeta({
    layout: 'organization',
});


const assetCategoryStore = useAssetsCategoryStore()
const authStore = useAuthStore()

const {
    organization_id,
    loading,
    page,
    limit,
    totalPages,
    search,
    name,
    code,
    description,
    is_active,
    assetCategoryId
} = storeToRefs(assetCategoryStore)
const addUpdateModal = ref(false)
const formTitle = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)
const assetCategories = computed(() => assetCategoryStore.categories)
const total = computed(() => assetCategoryStore.total)

const openAddModal = () => {
    addUpdateModal.value = true
    formTitle.value = 'Add New Asset Category'
}

const closeAddUpdateModal = () => {
    formTitle.value = null
    addUpdateModal.value = false
}

const saveOnboarding = async () => {
    await assetCategoryStore.saveAssetsCategory()
    await fetchAssetCategories()
    closeAddUpdateModal()
}

const editEmpCategory = (data) => {
    assetCategoryId.value = data.id
    name.value = data.name
    code.value = data.code
    description.value = data.description
    is_active.value = data.is_active
    formTitle.value = 'Edit Asset Category'
    addUpdateModal.value = true
}

const deleteEmpCategory = (data) => {
    assetCategoryId.value = data.id
    deleteData.value = data
    deleteModal.value = true
}

const confirmDelete = async () => {
    await assetCategoryStore.deleteAssetsCategory()
    await fetchAssetCategories()
    assetCategoryId.value = null
    deleteData.value = null
    deleteModal.value = false
}

const cancelDelete = () => {
    assetCategoryId.value = null
    deleteData.value = null
    deleteModal.value = false
}

const timer = ref(null)
watch(search, () => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        page.value = 1
        fetchAssetCategories()
    }, 300)
})

const fetchAssetCategories = async () => {
    await assetCategoryStore.fetchAssetsCategories()
};

onMounted(async () => {
    organization_id.value = authStore.organization
    await fetchAssetCategories()
});
</script>