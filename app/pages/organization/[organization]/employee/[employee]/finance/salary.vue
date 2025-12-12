<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- LOADING STATE -->
        <div v-if="loading"
            class="rounded-lg p-5 bg-white/10 border h-full w-full border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-center">
            <UiLoader />
        </div>

        <!-- MAIN CONTENT -->
        <template v-else>
            <div
                class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
                <h2 class="text-lg font-semibold uppercase text-white/90">
                    {{ revisions.length }} Salary Revision<span>(s)</span>
                </h2>
                <div class="flex items-center gap-2">
                    <UiButton @click="openSalaryModal" color="#4aff7a" text="Update Salary"
                        prepend-icon="ion:plus-circled" />
                    <UiButton @click="fetchAllRevisions" color="#fff" text="Reload" prepend-icon="ion:refresh" />
                </div>
            </div>

            <!-- EXPANDABLE PANELS -->
            <div class="flex flex-col gap-2">
                <div v-for="item in revisions" :key="item.id"
                    class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-md">

                    <!-- COLLAPSED HEADER -->
                    <div @click="toggle(item.id)"
                        class="cursor-pointer p-4 flex items-center justify-between hover:bg-white/5 transition">

                        <div class="flex flex-col">
                            <span class="text-white/90 font-semibold text-md flex gap-5 items-center">
                                {{ item.revisionType.replaceAll("_", " ") }}
                                <UiButton :color="structureStatusColors(item.structure.status)" size="xs">{{
                                    item.structure.status }}
                                </UiButton>
                            </span>
                            <span class="text-white/60 text-sm">
                                {{ formatDate(item.revisionDate) }}
                            </span>
                        </div>

                        <div class="flex items-center gap-4">
                            <div class="text-right">
                                <span class="text-white/80 font-semibold">{{ formatCurrency(item.newGross) }}</span>
                                <p class="text-white/60 text-xs">New Gross</p>
                            </div>

                            <div>
                                <Icon :name="isExpanded(item.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                                    class="text-white" size="24" />
                            </div>
                        </div>
                    </div>

                    <!-- EXPANDED PANEL BODY -->
                    <transition name="fade">
                        <div v-if="expandedId === item.id" class="p-4 border-t border-white/10">

                            <div v-if="panelLoading" class="w-full flex items-center justify-center py-6">
                                <UiLoader />
                            </div>

                            <!-- PANEL CONTENT -->
                            <div v-else class="grid grid-cols-12 gap-2 text-white/80 text-sm">

                                <PanelRow label="Revision Type" :value="formatText(item.revisionType)" />
                                <PanelRow label="Revision Date" :value="formatDate(item.revisionDate)" />
                                <PanelRow label="Effective Date" :value="formatDate(item.effectiveDate)" />

                                <PanelRow label="Previous Gross" :value="formatCurrency(item.previousGross)" />
                                <PanelRow label="New Gross" :value="formatCurrency(item.newGross)" />
                                <PanelRow label="Change Amount" :value="formatCurrency(item.changeAmount)" />

                                <PanelRow label="Change Percent" :value="(item.changePercent || 0) + '%'" />

                                <PanelRow label="Reason" :value="item.reason || '---'" />

                                <PanelRow label="Approved By" :value="item.approvedBy || '---'" />
                                <PanelRow label="Approval Date"
                                    :value="item.approvalDate ? formatDate(item.approvalDate) : '---'" />

                                <!-- STRUCTURE DETAILS -->
                                <div class="col-span-12 mt-2">
                                    <h3 class="text-white/90 font-semibold">Structure Details</h3>
                                    <div class="grid grid-cols-12 gap-2">
                                        <PanelRow label="Structure ID" :value="item.structure.id" />
                                        <PanelRow label="Gross Annual"
                                            :value="formatCurrency(item.structure.grossAnnual)" />
                                        <PanelRow label="Status" :value="item.structure.status" />
                                        <PanelRow label="Effective From"
                                            :value="formatDate(item.structure.effectiveFrom)" />
                                        <PanelRow label="Is Active" :value="item.structure.isCurrentActive" />
                                    </div>
                                </div>
                            </div>
                            <SalaryDetails v-if="!panelLoading" :salaryDetails="salaryDetails" />
                        </div>
                    </transition>
                </div>
            </div>
        </template>

        <UiSidebarModal width="640px" v-model="salaryUpdateModal" title="Salary Update For The Employee">
            <UpdateSalaryForm />
            <template #footer>
                <UiButton :disabled="loading" @click="closeSalaryUpdateModal" color="#fff" text="Cancel"
                    prepend-icon="ion:close-circle" />
                <UiButton :disabled="loading" @click="assignSalaryStructure" color="#4aff7a"
                    :text="!loading ? 'Save Employee Salary' : 'Saving please wait...'"
                    prepend-icon="ion:save-outline" />
            </template>
        </UiSidebarModal>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useSalaryStore } from "../../../../../../stores/employee/salary.store";
import PanelRow from "../../../../../../components/employee/salary/expandableRow.vue"
import UpdateSalaryForm from "../../../../../../components/employee/salary/updateSalaryForm.vue"
import { storeToRefs } from "pinia";
import SalaryDetails from "../../../../../../components/employee/salary/SalaryDetails.vue";

definePageMeta({ layout: "employee" });

const salaryStore = useSalaryStore();

const loading = computed(() => salaryStore.loading);
const revisions = computed(() => salaryStore.revisions);

// PANEL STATES
const expandedId = ref(null);
const panelLoading = ref(false);

const {
    salaryUpdateModal,
    template,
    grossAmount,
    effectiveFrom,
    status,
    isCurrentActive,
    deductFromInHand,
    salaryCalculated
} = storeToRefs(salaryStore)

const salaryDetails = computed(() => salaryStore.salaryCalculated)

const openSalaryModal = () => {
    closeSalaryUpdateModal()
    salaryUpdateModal.value = true
}

// FUNCTIONS
const toggle = async (id) => {
    panelLoading.value = true;
    if (expandedId.value === id) {
        expandedId.value = null;
        return;
    }

    expandedId.value = id;
    await salaryStore.fetchDetailedSalary(id)

    setTimeout(() => {
        panelLoading.value = false;
    }, 1000); // fake delay loader
};

const structureStatusColors = (status) => {
    switch (status) {
        case 'ACTIVE':
            return '#4aff7a'
        case 'INACTIVE':
            return '#fc3103'
        case 'SUPERSEDED':
            return '#fcba03'
        default:
            return '#fc3103'

    }
}

const closeSalaryUpdateModal = () => {
    salaryCalculated.value = null;
    salaryUpdateModal.value = false;
    template.value = null;
    grossAmount.value = null;
    effectiveFrom.value = null;
    status.value = { label: "ACTIVE", value: "ACTIVE" };
    isCurrentActive.value = true;
    deductFromInHand.value = true;
}

const assignSalaryStructure = async () => {
    await salaryStore.assignSalaryStructure()
}

const isExpanded = (id) => expandedId.value === id;

const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(val || 0));

const formatDate = (val) => {
    if (!val) return "---";
    return new Date(val).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatText = (t) => t?.replaceAll("_", " ") || "---";

// API
const fetchAllRevisions = async () => {
    await salaryStore.fetchAllSalaryRevisions();
};

onMounted(fetchAllRevisions);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
