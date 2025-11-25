<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Department<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openDepartmentModal" color="#4aff7a" text="Add Department"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchDepartments" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="departments" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @refresh="fetchDepartments" @view="view" @edit="editDept" @delete="deleteDept" />
    </div>
    <DetailedView v-model="viewModal" :department="viewData" />

    <UiSidebarModal v-model="addUpdateModal" :title="formTitle">
        <template #default>
            <DepartmentForm />
        </template>

        <template #footer>
            <UiButton @click="closeDepartmentModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="saveDepartment" color="#4aff7a" text="Save Organization"
                prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Department" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useAuthStore } from '../../../stores/auth.store';
import { useDepartmentStore } from '../../../stores/department.store';
import DataTable from '../../../components/department/dataTable.vue';
import DetailedView from '../../../components/department/detailedView.vue';
import DepartmentForm from '../../../components/department/form.vue';
import { storeToRefs } from 'pinia';
definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
});

const viewModal = ref(false)
const viewData = ref(null)

const addUpdateModal = ref(false)
const deleteModal = ref(false)
const deleteData = ref(null)
const formTitle = ref(null)
const authStore = useAuthStore()
const departmentStore = useDepartmentStore()
const {
    total,
    page,
    loading,
    organization_id,
    totalPages,
    search,
    department_id,
    department_head_id,
    department_head_start_date,
    description,
    name,
    code,
    note,
} = storeToRefs(departmentStore)
const departments = computed(() => departmentStore.departments)

const view = (dept) => {
    viewData.value = dept
    viewModal.value = true
}

const timer = ref(null)

watch(search, () => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        page.value = 1
        fetchDepartments()
    }, 300)
})

const closeDepartmentModal = () => {
    addUpdateModal.value = false
    formTitle.value = null
    department_id.value = null
    name.value = null
    code.value = null
    description.value = null
    note.value = null
    department_head_id.value = null
    department_head_start_date.value = null
}


const saveDepartment = async () => {
    await departmentStore.saveDepartment()
    closeDepartmentModal()
}

const editDept = (dept) => {
    department_id.value = dept.id
    name.value = dept.name
    code.value = dept.code
    description.value = dept.description
    note.value = dept.note
    department_head_start_date.value = new Date(dept.department_head_start_date)
    department_head_id.value = dept.department_head_id
    formTitle.value = 'Update Department'
    addUpdateModal.value = true
}

const deleteDept = (dept) => {
    department_id.value = dept.id
    deleteData.value = dept
    deleteModal.value = true
}

const cancelDelete = () => {
    department_id.value = null
    deleteData.value = null
    deleteModal.value = false
}
const confirmDelete = async () => {
    await departmentStore.deleteDepartment()
    cancelDelete()
}

const openDepartmentModal = () => {
    department_id.value = null
    name.value = null
    code.value = null
    description.value = null
    note.value = null
    department_head_start_date.value = new Date()
    department_head_id.value = null
    formTitle.value = 'Add New Department'
    addUpdateModal.value = true
}

const fetchDepartments = async () => {
    await departmentStore.fetchDepartments()
}

onMounted(async () => {
    if (authStore.organization) {
        organization_id.value = authStore.organization
    }
    await fetchDepartments()
});
</script>