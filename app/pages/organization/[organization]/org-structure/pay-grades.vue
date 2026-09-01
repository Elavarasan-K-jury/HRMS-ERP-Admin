<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- Header -->
        <div
            class="rounded-lg p-5 bg-white/10 border min-h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">Pay Grades</h2>
                <p class="text-xs text-white/55 max-w-xl mt-1 leading-relaxed">
                    Pay Grades are typically used to indicate salary grades. Many smaller organizations may not
                    need to define pay grades. As organization grows and need for compensation planning arises,
                    pay grades become useful.
                </p>
            </div>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading" width="280px"
                    placeholder="Search pay grades…" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="openCreate" color="#4aff7a" text="Add Pay Grade" prepend-icon="ion:add-circle"
                    :disabled="saving" />
                <UiButton @click="fetchPayGrades" color="#fff" text="Reload" prepend-icon="ion:refresh"
                    :disabled="loading" />
            </div>
        </div>

        <!-- Table -->
        <PayGradeTable :items="payGrades" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            :limit="limit" :searched="searched" @create="openCreate" @edit="openEdit" @delete="openDelete"
            @prev="changePage('-')" @next="changePage('+')" />

        <!-- Add/Edit modal -->
        <UiSidebarModal v-model="formModal" :title="formTitle">
            <template #default>
                <PayGradeForm ref="formRef" :initial="editingItem" :saving="saving" @submit="saveForm" />
            </template>
            <template #footer>
                <UiButton @click="closeFormModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle"
                    :disabled="saving" />
                <UiButton @click="submitForm" color="#4aff7a" :text="saving ? 'Saving...' : (isEditing ? 'Update' : 'Add')"
                    prepend-icon="ion:save-outline" :disabled="saving" />
            </template>
        </UiSidebarModal>

        <!-- Delete confirmation -->
        <UiModal v-model="deleteModal" title="Delete Pay Grade?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm leading-relaxed">
                    Are you sure you want to delete the pay grade
                    <span class="font-semibold text-white">“{{ deleteData?.name }}”</span>?
                </p>
                <p v-if="deleteData?.employee_count > 0" class="mt-3 text-amber-300/90 text-xs leading-relaxed">
                    This pay grade is currently assigned to {{ deleteData.employee_count }} employee(s). Please
                    reassign those employees before deleting this pay grade.
                </p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle"
                    :disabled="deleting" />
                <UiButton @click="confirmDelete" color="#750d0d" text="Delete Pay Grade" prepend-icon="ion:trash"
                    :disabled="deleting || deleteData?.employee_count > 0" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePayGradeStore } from '~/stores/payGrade.store'
import { useAuthStore } from '~/stores/auth.store'
import { storeToRefs } from 'pinia'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const orgId = route.params.organization

const payGradeStore = usePayGradeStore()
const authStore = useAuthStore()

const {
    payGrades,
    loading,
    saving,
    total,
    page,
    limit,
    totalPages,
    search,
} = storeToRefs(payGradeStore)

const formModal = ref(false)
const formRef = ref(null)
const formTitle = ref('Add Pay Grade')
const editingItem = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)
const deleting = ref(false)

const isEditing = computed(() => !!editingItem.value)
const searched = computed(() => !!search.value?.trim())

let debounceTimer = null

const fetchPayGrades = async () => {
    payGradeStore.organizationId = orgId
    await payGradeStore.fetchPayGrades(orgId)
}

const onSearch = (term) => {
    search.value = term
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        page.value = 1
        fetchPayGrades()
    }, 300)
}

const changePage = (symbol) => {
    if (symbol === '+') page.value = page.value < totalPages.value ? page.value + 1 : page.value
    else page.value = page.value > 1 ? page.value - 1 : page.value
}

const openCreate = () => {
    editingItem.value = null
    formTitle.value = 'Add Pay Grade'
    formModal.value = true
}

const openEdit = (pg) => {
    editingItem.value = pg
    formTitle.value = 'Edit Pay Grade'
    formModal.value = true
}

const closeFormModal = () => {
    if (saving.value) return
    formModal.value = false
    editingItem.value = null
    payGradeStore.resetForm()
}

const submitForm = () => {
    formRef.value?.submit()
}

const saveForm = async (payload) => {
    payGradeStore.organizationId = orgId
    payGradeStore.name = payload.name
    payGradeStore.description = payload.description
    if (isEditing.value) {
        payGradeStore.pay_grade_id = editingItem.value.id
        await payGradeStore.updatePayGrade()
    } else {
        payGradeStore.pay_grade_id = null
        await payGradeStore.createPayGrade()
    }
    closeFormModal()
}

const openDelete = (pg) => {
    deleteData.value = pg
    deleteModal.value = true
}

const confirmDelete = async () => {
    if (!deleteData.value) return
    deleting.value = true
    try {
        await payGradeStore.deletePayGrade(deleteData.value.id)
        deleteModal.value = false
        deleteData.value = null
    } finally {
        deleting.value = false
    }
}

onMounted(async () => {
    if (authStore.organization) {
        payGradeStore.organizationId = authStore.organization
    }
    await fetchPayGrades()
})
</script>