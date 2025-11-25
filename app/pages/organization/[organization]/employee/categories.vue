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
            @refresh="fetchDepartments" @view="view" @edit="editEmpCategory" @delete="deleteEmpCategory" />
    </div>
    <UiSidebarModal width="980px" v-model="addUpdateModal" :title="formTitle">
        <CategoryForm />
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
import { useEmpCategoryStore } from '../../../../stores/empCategory.store';
import { useAuthStore } from '../../../../stores/auth.store';
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
    code,
    description,
    id_prefix,
    is_permanent,
    benefits_applicable,
    is_active,
    training_required,
    training_months,
    probation_required,
    probation_months,
    notice_required,
    notice_months,
} = storeToRefs(empCategoryStore)

const addUpdateModal = ref(false)
const formTitle = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)

const openAddModal = () => {
    addUpdateModal.value = true
    formTitle.value = 'Add New Employee Category'
}

const closeAddUpdateModal = () => {
    name.value = null
    code.value = null
    description.value = null
    id_prefix.value = null
    is_permanent.value = false
    benefits_applicable.value = false
    is_active.value = false
    training_required.value = false
    training_months.value = null
    probation_required.value = false
    probation_months.value = null
    notice_required.value = false
    notice_months.value = null
    empCategoryId.value = null
    formTitle.value = null
    addUpdateModal.value = false
}
const saveOnboarding = async () => {
    await empCategoryStore.saveEmpCategory()
    closeAddUpdateModal()
}

const editEmpCategory = (item) => {
    empCategoryId.value = item.id
    name.value = item.name
    code.value = item.code
    description.value = item.description
    id_prefix.value = item.id_prefix
    is_permanent.value = item.is_permanent
    benefits_applicable.value = item.benefits_applicable
    is_active.value = item.is_active
    training_required.value = item.training_required
    training_months.value = item.training_months
    probation_required.value = item.probation_required
    probation_months.value = item.probation_months
    notice_required.value = item.notice_required
    notice_months.value = item.notice_months
    formTitle.value = 'Edit Employee Category'
    addUpdateModal.value = true
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