<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Salary Component<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openAddModal" color="#4aff7a" text="Add Salary Component"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchComponents" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <UiTabs v-model="activeTab" :tabs="tabs" color="#fff" :blur="16" />
        <SalaryComponentTable :items="components" :loading="loading" :total="total" :page="page"
            :total-pages="totalPages" @view="viewDetails" @edit="editComponent" @delete="deleteComponent"
            @prev="page-- && fetchComponents()" @next="page++ && fetchComponents()" />
    </div>
    <UiSidebarModal v-model="addUpdateModal" @close="closeAddUpdateModal"
        :title="componentId ? 'Update Salary Component' : 'Create Salary Component'">
        <template #default>
            <SalaryComponentForm />
        </template>

        <template #footer>
            <UiButton @click="closeAddUpdateModal" :loading="loading" color="#fff" text="Cancel"
                prepend-icon="ion:close-circle" />
            <UiButton @click="saveSalaryComponent" :loading="loading" color="#4aff7a" text="Save Salary Component"
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
import { computed, ref, watch } from 'vue';
import SalaryComponentForm from '../../../../components/component-definition/form.vue'
import SalaryComponentTable from '../../../../components/component-definition/dataTable.vue'
import { useComponentDefinitionStore } from '../../../../stores/componentDefinition.store';
import { storeToRefs } from 'pinia';

const componentDefinitionStore = useComponentDefinitionStore()
definePageMeta({
    layout: 'organization',
});

const {
    loading,
    components,
    page,
    limit,
    total,
    totalPages,
    search,
    componentId,
    form,
    activeTab
} = storeToRefs(componentDefinitionStore)

const deleteData = ref(null)
const deleteModal = ref(false)

const tabs = computed(() => componentDefinitionStore.tabs)

const deleteComponent = (component) => {
    componentId.value = component.id
    deleteData.value = component
    deleteModal.value = true
}

watch(activeTab, async () => {
    await fetchComponents()
})

const cancelDelete = () => {
    componentId.value = null
    deleteData.value = null
    deleteModal.value = false

}

const confirmDelete = async () => {
    const success = await componentDefinitionStore.deleteComponent()
    if (success) cancelDelete()
}

const searchTimer = ref(null)
watch(search, () => {
    clearTimeout(searchTimer.value)
    searchTimer.value = setTimeout(() => {
        page.value = 1
        fetchComponents()
    }, 300);
})

const addUpdateModal = ref(false);

const openAddModal = () => {
    if (!componentId.value) {
        componentDefinitionStore.resetForm()
        form.value.displayOrder = (total.value + 1).toString()
    }
    addUpdateModal.value = true
}

const editComponent = (component) => {
    componentDefinitionStore.loadComponent(component)
    openAddModal()
}

const saveSalaryComponent = async () => {
    try {
        const success = await componentDefinitionStore.saveComponent()
        if (success) closeAddUpdateModal()
    } catch (error) {
        console.log('components.vue @ Line 51:', error);
    }
}

const closeAddUpdateModal = () => {
    componentDefinitionStore.resetForm()
    addUpdateModal.value = false
}


const fetchComponents = async () => {
    await componentDefinitionStore.fetchComponents()
}

onMounted(async () => {
    await fetchComponents()
});
</script>