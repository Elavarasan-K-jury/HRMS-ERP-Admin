<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Employee Category<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openAddModal" color="#4aff7a" text="Add Employee Category"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchEmpCategory" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="empCategories" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @refresh="fetchEmpCategory" @view="view" @edit="editEmpCategory" @delete="deleteEmpCategory"
            @next="changePage('+')" @prev="changePage('-')" />
    </div>
    <UiSidebarModal width="980px" v-model="addUpdateModal" :title="formTitle">
        <CategoryForm :show="addUpdateModal" />
        <template #footer>
            <UiButton :disabled="loading" @click="closeAddUpdateModal" color="#fff" text="Cancel"
                prepend-icon="ion:close-circle" />
            <UiButton :disabled="loading" @click="saveOnboarding" color="#4aff7a"
                :text="!loading ? 'Save Employee Category' : 'Saving please wait...'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Employee Category" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useEmpCategoryStore } from '../../../../stores/organization/empCategory.store';
import { useAuthStore } from '../../../../stores/shared/auth.store';
import DataTable from '../../../../components/employee-category/dataTable.vue';
import CategoryForm from '../../../../components/employee-category/form.vue';
import { storeToRefs } from 'pinia';
definePageMeta({
    layout: 'organization',
});
const empCategoryStore = useEmpCategoryStore()
const authStore = useAuthStore()

const {
    organization_id
} = storeToRefs(empCategoryStore)

const empCategories = computed(() => empCategoryStore.categories)
const total = computed(() => empCategoryStore.total)

const {
    loading,
    error,
    page,
    limit,
    totalPages,
    search,
    empCategoryId,
    name,
    description,
    is_active,
} = storeToRefs(empCategoryStore)

const addUpdateModal = ref(false)
const formTitle = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)

const openAddModal = () => {
    empCategoryStore.employment_type = 'PROBATION'
    addUpdateModal.value = true
    formTitle.value = 'Add New Employee Category'
}

const closeAddUpdateModal = () => {
    name.value = null
    description.value = null
    is_active.value = true
    empCategoryStore.employment_type = 'PROBATION'
    empCategoryId.value = null
    formTitle.value = null
    addUpdateModal.value = false
}
const saveOnboarding = async () => {
    await empCategoryStore.saveEmpCategory()
    closeAddUpdateModal()
}

const view = (item) => {
    editEmpCategory(item)
}

const editEmpCategory = (item) => {
    empCategoryId.value = item.id
    name.value = item.name
    description.value = item.description
    is_active.value = item.is_active
    empCategoryStore.employment_type = item.employment_type || 'PROBATION'
    formTitle.value = 'Edit Employee Category'
    addUpdateModal.value = true
}

const changePage = (direction) => {
    if (direction === '+') {
        if (page.value < totalPages.value) page.value += 1
    } else {
        if (page.value > 1) page.value -= 1
    }
    fetchEmpCategory()
}

const deleteEmpCategory = (item) => {
    deleteData.value = item
    empCategoryId.value = item.id
    deleteModal.value = true
}

const cancelDelete = () => {
    deleteData.value = null
    empCategoryId.value = null
    deleteModal.value = false
}

const confirmDelete = async () => {
    await empCategoryStore.deleteEmployeeCategory()
    deleteData.value = null
    empCategoryId.value = null
    deleteModal.value = false
}

const timer = ref(null)
watch(search, () => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        page.value = 1
        fetchEmpCategory()
    }, 300)
})

const fetchEmpCategory = async () => {
    await empCategoryStore.fetchEmployeeCategories()
};

onMounted(async () => {
    organization_id.value = authStore.organization
    await fetchEmpCategory()
});
</script>