<template>
    <div class="min-h-screen p-2">

        <!-- LOADING OVERLAY -->
        <div v-if="finance.loading"
            class="backdrop-blur-xl !h-full bg-white/5 border border-white/10 rounded-lg p-6 lg:p-8">
            <div class="flex flex-col items-center justify-between">
                <UiLoader />
                <p class="text-white/80 text-sm font-medium">Loading configuration...</p>
            </div>
        </div>

        <!-- CONTAINER -->
        <div v-else class="max-w-full mx-auto space-y-2">

            <!-- HEADER SECTION -->
            <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl -z-10"></div>
                <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6 lg:p-8">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <div
                                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                        </path>
                                    </svg>
                                </div>
                                <div>
                                    <h1 class="text-3xl font-bold text-white">Finance Configuration</h1>
                                    <p class="text-white/60 text-sm mt-1">
                                        Configure statutory components for payroll & compliance
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2 items-center justify-center">
                            <div
                                class="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <div :class="{
                                    'bg-green-500': finance.isFinanceEnabled(),
                                    'bg-red-500': !finance.isFinanceEnabled(),
                                }" class="w-2 h-2 rounded-full animate-pulse"></div>
                                <span class="text-white/80 text-sm font-medium">Active</span>
                            </div>
                            <!-- <div v-if="!finance.isFinanceEnabled()" @click="fetchFinanceDetails"
                                class="hidden cursor-pointer lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <icon name="heroicons:arrow-path-solid" />
                                <span class="text-white/80 text-sm font-medium">Reload</span>
                            </div> -->
                            <div @click="fetchFinanceDetails"
                                class="hidden cursor-pointer lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <icon name="heroicons:arrow-path-solid" />
                                <span class="text-white/80 text-sm font-medium">Reload</span>
                            </div>
                        </div>
                    </div>

                    <!-- ERROR -->
                    <div v-if="finance.error"
                        class="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <div>
                            <p class="text-red-400 font-medium text-sm">Configuration Error</p>
                            <p class="text-red-400/80 text-sm mt-1">{{ finance.error }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARDS GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">

                <!-- PF CARD -->
                <div class="group relative">
                    <!-- <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    </div> -->
                    <div
                        class="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-300">

                        <!-- CARD HEADER -->
                        <div class="flex items-start justify-between mb-6">
                            <div class="flex items-start gap-3">
                                <div
                                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                        </path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-white font-semibold text-lg">Provident Fund</h3>
                                    <p class="text-white/50 text-xs mt-0.5">Retirement benefit contribution</p>
                                </div>
                            </div>
                            <UiSwitch @change="enableDisablePf" v-model="pf_enabled" />
                        </div>

                        <!-- CARD CONTENT -->
                        <div v-if="pf_enabled" class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">PF Formula</label>
                                <FormInput v-model="pf_formula" placeholder="basic * 0.12" color="#fff" />
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">Registration Number</label>
                                <FormInput v-model="pf_registration_number" placeholder="Enter PF registration number"
                                    color="#fff" />
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">Organization Name</label>
                                <FormInput v-model="pf_registered_organization_name"
                                    placeholder="Registered organization name" color="#fff" />
                            </div>

                            <UiButton @click="savePf" class="w-full" color="#4aff7a">
                                Save PF Configuration
                            </UiButton>
                        </div>

                        <!-- DISABLED STATE -->
                        <div v-else class="text-center py-8">
                            <p class="text-white/40 text-sm">Enable to configure</p>
                        </div>
                    </div>
                </div>

                <!-- ESI CARD -->
                <div class="group relative">
                    <!-- <div
                        class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    </div> -->
                    <div
                        class="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-300">

                        <!-- CARD HEADER -->
                        <div class="flex items-start justify-between mb-6">
                            <div class="flex items-start gap-3">
                                <div
                                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                                        </path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-white font-semibold text-lg">ESI</h3>
                                    <p class="text-white/50 text-xs mt-0.5">Medical insurance scheme</p>
                                </div>
                            </div>
                            <UiSwitch @change="enableDisableEsi" v-model="esi_enabled" />
                        </div>

                        <!-- CARD CONTENT -->
                        <div v-if="esi_enabled" class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">ESI Formula</label>
                                <FormInput v-model="esi_formula" placeholder="gross * 0.0075" color="#fff" />
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">Registration Number</label>
                                <FormInput v-model="esi_registration_number" placeholder="Enter ESI registration number"
                                    color="#fff" />
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">Organization Name</label>
                                <FormInput v-model="esi_registered_organization_name"
                                    placeholder="Registered organization name" color="#fff" />
                            </div>

                            <UiButton @click="saveEsi" class="w-full" color="#4aff7a">
                                Save ESI Configuration
                            </UiButton>
                        </div>

                        <!-- DISABLED STATE -->
                        <div v-else class="text-center py-8">
                            <p class="text-white/40 text-sm">Enable to configure</p>
                        </div>
                    </div>
                </div>

                <!-- PTAX CARD -->
                <div class="group relative">
                    <!-- <div
                        class="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    </div> -->
                    <div
                        class="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-300">

                        <!-- CARD HEADER -->
                        <div class="flex items-start justify-between mb-6">
                            <div class="flex items-start gap-3">
                                <div
                                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                        </path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-white font-semibold text-lg">Professional Tax</h3>
                                    <p class="text-white/50 text-xs mt-0.5">State-based professional tax</p>
                                </div>
                            </div>
                            <UiSwitch @change="enableDisablePtax" v-model="ptax_enabled" />
                        </div>

                        <!-- CARD CONTENT -->
                        <div v-if="ptax_enabled" class="space-y-4">
                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">PTAX Formula</label>
                                <FormInput v-model="ptax_formula" placeholder="fixed" color="#fff" />
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">Registration Number</label>
                                <FormInput v-model="ptax_registration_number"
                                    placeholder="Enter PTAX registration number" color="#fff" />
                            </div>

                            <div>
                                <label class="block text-xs font-medium text-white/70 mb-2">Organization Name</label>
                                <FormInput v-model="ptax_registered_organization_name"
                                    placeholder="Registered organization name" color="#fff" />
                            </div>

                            <UiButton @click="savePtax" class="w-full" color="#4aff7a">
                                Save PTAX Configuration
                            </UiButton>
                        </div>

                        <!-- DISABLED STATE -->
                        <div v-else class="text-center py-8">
                            <p class="text-white/40 text-sm">Enable to configure</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFinanceStore } from '@/stores/super-admin/finance.store'
import { storeToRefs } from 'pinia';

const finance = useFinanceStore()

definePageMeta({
    layout: "organization",
});

const {
    pf_enabled,
    pf_formula,
    pf_registration_number,
    pf_registered_organization_name,
    esi_enabled,
    esi_formula,
    esi_registration_number,
    esi_registered_organization_name,
    ptax_enabled,
    ptax_formula,
    ptax_registration_number,
    ptax_registered_organization_name,
} = storeToRefs(finance)

const pf_timer = ref(null)
const enableDisablePf = async () => {
    clearTimeout(pf_timer)
    pf_timer.value = setTimeout(async () => {
        await finance.enableDisablePf()
    }, 300);
}
const esi_timer = ref(null)
const enableDisableEsi = async () => {
    clearTimeout(esi_timer)
    esi_timer.value = setTimeout(async () => {
        await finance.enableDisableEsi()
    }, 300);
}
const ptax_timer = ref(null)
const enableDisablePtax = async () => {
    clearTimeout(ptax_timer)
    ptax_timer.value = setTimeout(async () => {
        await finance.enableDisablePtax()
    }, 300);
}

const savePf = async () => {
    await finance.enablePf()
}
const saveEsi = async () => {
    await finance.enableEsi()
}
const savePtax = async () => {
    await finance.enablePtax()
}

const fetchFinanceDetails = async () => {
    await finance.fetchFinanceDetails()
}

onMounted(async () => {
    await fetchFinanceDetails();
});
</script>