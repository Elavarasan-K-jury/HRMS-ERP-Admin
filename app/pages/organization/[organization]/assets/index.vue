<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">

            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Asset<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">

                <FormSelect color="#fff" v-model="category_id" :options="categories" placeholder="Select category"
                    class="transition-transform hover:scale-[1.01]" />
                <FormSelect color="#fff" v-model="model_id" :options="models" placeholder="Select model"
                    class="transition-transform hover:scale-[1.01]" />

                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" />

                <UiButton @click="openAddModal" color="#4aff7a" text="Add Asset" prepend-icon="ion:add-circle" />

                <UiButton @click="fetchAssets" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- TABLE -->
        <DataTable :items="assets" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @view="viewModel" @edit="editModel" @assign="assignAsset" @delete="deleteAsset" @prev="prevPage"
            @next="nextPage" />

    </div>
    <!-- ADD/EDIT MODEL -->
    <UiSidebarModal width="600px" v-model="addModal" :title="formTitle">
        <AssetForm ref="assetFormRef" />

        <template #footer>
            <UiButton @click="close" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton :disabled="loading" @click="save" color="#4aff7a"
                :text="loading ? 'Saving, please wait...' : 'Save Asset'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.serial_number || deleteData.asset_tag || 'this asset' }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Asset" prepend-icon="ion:trash" />
        </template>
    </UiModal>
    <UiModal v-model="assignModal" title="Asset assignment">
        <template #default>
            <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Employee <span
                            class="uppercase font-bold text-red-500">(Required)</span></label>
                    <FormSelect rounded="lg" color="#fff" v-model="employeeId" :options="employees"
                        placeholder="Select employee" class="transition-transform hover:scale-[1.01]" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Asset Condition <span
                            class="uppercase font-bold text-red-500">(Required)</span></label>
                    <FormSelect rounded="lg" color="#fff" v-model="condition_assign" :options="assetConditionOptions"
                        placeholder="Select Asset Condition" class="transition-transform hover:scale-[1.01]" />
                </div>
                <div class="flex col-span-2 flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Status</label>
                    <FormSelect disabled rounded="lg" color="#fff" v-model="assignStatus" :options="assetStatusOptions"
                        placeholder="Select Status" class="transition-transform hover:scale-[1.01]" />
                </div>
                <div class="flex col-span-2 flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Notes</label>
                    <FormTextArea v-model="notes" placeholder="Write a note" color="#fff" rounded="lg" :rows="3"
                        :autoresize="true" clearable />
                </div>
            </div>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="assignAssetToEmployee" color="#4aff7a" text="Assign Asset"
                prepend-icon="heroicons:check-circle" />
        </template>
    </UiModal>
</template>
<script setup>
import { computed, onMounted, watch } from 'vue';
import { useAssetsStore } from '../../../../stores/organization/assets.store';
import { useAssetsModelStore } from '../../../../stores/organization/assetModel.store';
import { useAssetIdSeriesStore } from '../../../../stores/organization/assetIdSeries.store';
import { useEmployeesStore } from '../../../../stores/organization/employee.store';
import DataTable from '../../../../components/asset/assetList.vue'
import AssetForm from '../../../../components/asset/assetForm.vue';
import { storeToRefs } from 'pinia';
definePageMeta({
    layout: 'organization',
});

const assetStore = useAssetsStore()
const employeeStore = useEmployeesStore()
const assetModel = useAssetsModelStore()
const seriesStore = useAssetIdSeriesStore()
const assets = computed(() => assetStore.assets)
const {
    loading,
    total,
    search,
    page,
    totalPages,
    addModal,
    selectedAsset,
    category_id,
    model_id,
    serial_number,
    asset_tag,
    user_name,
    password,
    purchase_date,
    warranty_expire,
    status,
    location,

    assignModal,
    condition_assign,
    notes,
    employeeId,
    assignStatus,
} = storeToRefs(assetStore)

const assetStatusOptions = [
    // Phase 02: Authoritative Asset Lifecycle
    { value: "AVAILABLE", label: "Available" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "IN_REPAIR", label: "In Repair" },
    { value: "DAMAGED", label: "Damaged" },
    { value: "LOST", label: "Lost" },
    { value: "RETIRED", label: "Retired" },
    { value: "DISPOSED", label: "Disposed" },
];


const assetConditionOptions = [
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "NEEDS_REPAIR", label: "Needs Repair" },
    { value: "DAMAGED", label: "Damaged" },
    { value: "OBSOLETE", label: "Obsolete" },
    { value: "END_OF_LIFE", label: "End of Life" },
    { value: "SCRAPPED", label: "Scrapped" },
];
watch([category_id, model_id], async () => {
    await fetchAssets()
})
const searchTimer = ref(null)
watch(search, async () => {
    clearTimeout(searchTimer.value)
    searchTimer.value = setTimeout(async () => {
        await fetchAssets()
    }, 300);
})

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

const formTitle = ref()

const models = computed(() => assetModel.models_select)
const categories = computed(() => assetModel.category_list)
const employees = computed(() => employeeStore.all_employees.map(e => ({
    value: e.id,
    label: e.full_name
})))
const deleteModal = ref(false)
const deleteData = ref(null)
const assetFormRef = ref(null)

const fetchAssets = async () => {
    await assetStore.fetchAssets()
}

const assignAssetToEmployee = async () => {
    await assetStore.assignAssetToEmployee()
}

const deleteAsset = (data) => {
    selectedAsset.value = data
    deleteData.value = data
    deleteModal.value = true
}

const assignAsset = async (data) => {
    selectedAsset.value = data
    assignStatus.value = { value: "REQUESTED", label: "Requested" }
    await employeeStore.fetchAllEmployees()
    assignModal.value = true
}

const editModel = (data) => {
    formTitle.value = "Update asset"
    selectedAsset.value = data
    category_id.value = categories.value.find(e => e.value == data.category?.id)
    model_id.value = models.value.find(e => e.value == data.model?.id)
    serial_number.value = data.serial_number
    asset_tag.value = data.asset_tag
    user_name.value = data.credentials?.user_name
    password.value = ''
    purchase_date.value = formatDate(data.purchase_date)
    warranty_expire.value = formatDate(data.warranty_expire)
    status.value = assetStatusOptions.find(e => e.value == data.status)
    location.value = data.location
    addModal.value = true
}
const confirmDelete = async () => {
    await assetStore.deleteAssets()
    await fetchAssets()
    deleteData.value = null
    deleteModal.value = false
}

const openAddModal = async () => {
    formTitle.value = "Add new asset"
    await assetModel.fetchAllAssetModels()
    await assetModel.fetchAllCategories()
    await seriesStore.fetchSeries()
    addModal.value = true
}

const save = async () => {
    if (selectedAsset.value) {
        await assetStore.updateAsset()
    } else {
        const form = assetFormRef.value
        if (form) {
            const tagValue = form.getAssetTagValue()
            if (tagValue) {
                assetStore.generated_asset_id = tagValue
            }
            const customVals = form.getCustomAttributeValues()
            if (Object.keys(customVals).length > 0) {
                assetStore.custom_attribute_values = JSON.stringify(customVals)
            }
            if (form.idSource === 'series' && form.selectedSeriesId) {
                await form.confirmGenerateId()
            }
        }
        await assetStore.createAsset()
    }
}

onMounted(async () => {
    await assetModel.fetchAllAssetModels()
    await assetModel.fetchAllCategories()
    await fetchAssets()
});
</script>