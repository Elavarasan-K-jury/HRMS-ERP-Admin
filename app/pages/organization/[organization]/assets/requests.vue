<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">

            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Asset Request<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" />

                <UiButton @click="fetchAssetRequests" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- TABLE -->
        <DataTable :items="requests" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @approve="approveRequest" @reject="rejectRequest" @prev="prevPage" @next="nextPage" />

    </div>
    <UiModal v-model="approveModal" title="Approve the asset request?" size="sm">
        <template #default>
            <span>Are you sure you want to approve?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelApproval" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmApproval" color="#4aff7a" text="Approve Request"
                prepend-icon="ion:checkmark-circle-outline" />
        </template>
    </UiModal>
    <UiModal v-model="rejectionModal" title="Reject the asset request?" size="sm">
        <template #default>
            <span>Are you sure you want to reject this?</span>
            <div class="flex flex-col gap-2">
                <label class="text-white/70 text-sm font-medium">Rejection Reason</label>
                <FormInputArea v-model="reason" color="#fff" />
            </div>
        </template>
        <template #footer>
            <UiButton @click="cancelRejection" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmRejection" color="#ff0000" text="Reject Request"
                prepend-icon="ion:checkmark-circle-outline" />
        </template>
    </UiModal>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAssetRequestsStore } from "../../../../stores/assetRequest.store"
import DataTable from "../../../../components/asset/assetRequest.vue"
import { storeToRefs } from 'pinia';

const assetRequestsStore = useAssetRequestsStore()
definePageMeta({
    layout: 'organization',
});

const {
    total,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    sortOrder,
    loading,
    error,
    approveModal,
    rejectionModal,
    selectedRequest,
    reason
} = storeToRefs(assetRequestsStore)

const cancelApproval = () => {
    selectedRequest.value = null
    approveModal.value = false
}
const cancelRejection = () => {
    selectedRequest.value = null
    reason.value = null
    rejectionModal.value = false
}

const approveRequest = (data) => {
    selectedRequest.value = data
    approveModal.value = true
}

const rejectRequest = (data) => {
    selectedRequest.value = data
    rejectionModal.value = true
}

const confirmApproval = async () => {
    await assetRequestsStore.approveAssetRequest()
}
const confirmRejection = async () => {
    await assetRequestsStore.rejectAssetRequest()
}

const requests = computed(() => assetRequestsStore.asset_requests)

const fetchAssetRequests = async () => {
    await assetRequestsStore.fetchAssetRequests()
}

onMounted(async () => {
    await fetchAssetRequests()
});
</script>