<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ totalPlans }} Subscription Plan<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading" />
                <UiButton color="#4aff7a" text="Add Plan" prepend-icon="ion:add-circle" @click="openPlanModal" />
                <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" @click="fetchPlans" />
            </div>
        </div>

        <!-- TABLE -->
        <SubscriptionPlansDataTable :items="plans" :loading="loading" :total="meta.total" :page="meta.page"
            :total-pages="meta.totalPages" @edit="edit" @delete="del" @next="next" @prev="prev" @refresh="refresh" />
    </div>

    <!-- CREATE / EDIT MODAL -->
    <UiSidebarModal v-model="open" :title="title">
        <template #default>
            <div class="grid grid-cols-12 gap-3">

                <!-- PLAN DETAILS -->
                <span class="col-span-12 text-xl font-semibold text-white/80">
                    Plan Details
                </span>

                <div class="col-span-12">
                    <FormInput label="Plan Name" color="#fff" v-model="create.name" prepend-icon="lucide:package" />
                </div>

                <div class="col-span-12">
                    <FormInputArea label="Description" color="#fff" v-model="create.description"
                        prepend-icon="lucide:file-text" />
                </div>

                <div class="col-span-6">
                    <FormInput label="Monthly Price" color="#fff" type="number" v-model.number="create.monthly_price"
                        prepend-icon="lucide:calendar" />
                </div>

                <div class="col-span-6">
                    <FormInput label="Yearly Price" color="#fff" type="number" v-model.number="create.yearly_price"
                        prepend-icon="lucide:calendar-range" />
                </div>

                <div class="col-span-6">
                    <FormInput label="Trial Days" color="#fff" type="number" v-model.number="create.trial_days"
                        prepend-icon="lucide:clock" />
                </div>

                <div class="col-span-6">
                    <FormInput label="GST (%)" color="#fff" type="number" v-model.number="create.gst"
                        prepend-icon="lucide:percent" />
                </div>

                <div class="col-span-12 flex items-center gap-2 mt-1">
                    <UiSwitch v-model="create.is_active" />
                    <span class="text-white/80 text-sm">Active Plan</span>
                </div>

                <!-- FEATURES (EDIT MODE ONLY) -->
                <div v-if="editId" class="col-span-12 mt-6">
                    <span class="text-xl font-semibold text-white/80 mb-3 block">
                        Plan Features
                    </span>

                    <div class="rounded-lg bg-white/5 border border-white/10">
                        <div v-if="featuresLoading" class="p-3 text-white/60">
                            Loading features...
                        </div>

                        <div v-else class="divide-y divide-white/10">
                            <div v-for="f in features" :key="f.id" class="p-3 grid grid-cols-12 gap-3 items-center">
                                <!-- FEATURE NAME -->
                                <div class="col-span-6">
                                    <div class="font-medium text-white/90">
                                        {{ f.key }}
                                    </div>
                                    <div class="text-xs text-white/50">
                                        {{ f.unit || '—' }}
                                    </div>
                                </div>

                                <!-- VALUE -->
                                <div class="col-span-6">
                                    <FormInput v-if="!f.is_unlimited" color="#fff" type="number"
                                        v-model.number="f.value" />
                                    <span v-else class="text-sm text-white/60 italic">
                                        Unlimited
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </template>

        <template #footer>
            <UiButton color="#fff" text="Cancel" @click="closePlanModal" />
            <UiButton color="#4aff7a" text="Save Plan" @click="savePlan" />
        </template>
    </UiSidebarModal>

    <!-- DELETE MODAL -->
    <UiModal v-model="deleteOpen" title="Are you sure?" size="sm">
        <template #default>
            Delete plan <b>{{ deleteData?.name }}</b>?
        </template>
        <template #footer>
            <UiButton color="#fff" text="Cancel" @click="cancelDelete" />
            <UiButton color="#750d0d" text="Delete" @click="confirmDelete" />
        </template>
    </UiModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSubscriptionPlanStore } from '../stores/subscription-plan.store'
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'auth' })

const store = useSubscriptionPlanStore()

const {
    create,
    editId,
    deleteId,
    deleteData,
    meta,
    loading,
    features,
    featuresLoading,
} = storeToRefs(store)

const plans = computed(() => store.plans)
const totalPlans = computed(() => meta.value.total)

const open = ref(false)
const deleteOpen = ref(false)
const title = ref('Add Subscription Plan')
const search = ref('')
let timer = null

watch(search, (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        meta.value.page = 1
        meta.value.search = val || ''
        store.fetchPlans()
    }, 500)
})

function resetCreate() {
    create.value = {
        name: null,
        description: null,
        monthly_price: null,
        yearly_price: null,
        trial_days: null,
        gst: null,
        is_active: true,
    }
}

function openPlanModal() {
    resetCreate()
    editId.value = null
    title.value = 'Add Subscription Plan'
    open.value = true
}

function closePlanModal() {
    resetCreate()
    editId.value = null
    open.value = false
}

async function savePlan() {
    try {
        // 1️⃣ Save plan
        const resp = editId.value
            ? await store.updatePlan()
            : await store.createPlan()

        if (!resp?.success) return

        // 2️⃣ Save all features (edit mode only)
        if (editId.value && features.value.length) {
            await Promise.all(
                features.value.map(f =>
                    store.updateFeature(f.id, {
                        value: f.is_unlimited ? null : f.value,
                        unit: f.unit,
                        is_unlimited: f.is_unlimited,
                    })
                )
            )
        }

        closePlanModal()
        await store.fetchPlans()
    } catch (e) {
        console.error('❌ Failed to save plan and features:', e)
    }
}

async function edit(plan) {
    editId.value = plan.id
    create.value = JSON.parse(JSON.stringify(plan))
    title.value = 'Edit Subscription Plan'
    open.value = true
    await store.fetchFeatures(plan.id)
}

function del(plan) {
    deleteId.value = plan.id
    deleteData.value = plan
    deleteOpen.value = true
}

async function confirmDelete() {
    await store.deletePlan()
    cancelDelete()
}

function cancelDelete() {
    deleteId.value = null
    deleteData.value = null
    deleteOpen.value = false
}

const next = () => store.nextPage()
const prev = () => store.prevPage()
const refresh = () => store.refresh()
const fetchPlans = () => store.fetchPlans()

onMounted(fetchPlans);
</script>
