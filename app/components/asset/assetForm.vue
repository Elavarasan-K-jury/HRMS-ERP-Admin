<template>
    <div class="space-y-2 p-2">

        <!-- Asset Identification Section -->
        <div class="relative">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                <h3 class="text-white font-semibold text-base">Asset Identification</h3>
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <!-- Category -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:package" size="16" class="text-cyan-400" />
                        Asset Category
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="category_id" :options="categoryOptions"
                        placeholder="Select category" class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Model -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:cpu" size="16" class="text-cyan-400" />
                        Asset Model
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="model_id" :options="modelOptions"
                        placeholder="Select model" class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Serial Number -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:hash" size="16" class="text-cyan-400" />
                        Serial Number
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="serial_number" placeholder="Enter serial number"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Asset Tag -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:tag" size="16" class="text-cyan-400" />
                        Asset Tag
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="asset_tag" placeholder="Company asset tag"
                        class="transition-transform hover:scale-[1.01]" />
                </div>
            </div>
        </div>

        <!-- Assignment Details Section -->
        <div class="relative">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
                <h3 class="text-white font-semibold text-base">Assignment Details</h3>
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <!-- Assigned User -->
                <div class="flex flex-col gap-2 group md:col-span-2">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:user" size="16" class="text-purple-400" />
                        Assigned User
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="user_name" placeholder="Employee name / email"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Location -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:map-pin" size="16" class="text-purple-400" />
                        Location
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="location" placeholder="Office / Branch / Remote"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Status -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:activity" size="16" class="text-purple-400" />
                        Status
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="status" :options="statusOptions"
                        placeholder="Select status" class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Password (Optional) -->
                <div class="flex flex-col gap-2 group md:col-span-2">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:lock" size="16" class="text-purple-400" />
                        Password
                        <span class="text-xs text-white/40 ml-auto">(if applicable)</span>
                    </label>
                    <FormInput type="password" rounded="lg" color="#fff" v-model="password"
                        placeholder="Device password" class="transition-transform hover:scale-[1.01]" />
                </div>
            </div>
        </div>

        <!-- Procurement & Warranty Section -->
        <div class="relative">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                <h3 class="text-white font-semibold text-base">Procurement & Warranty</h3>
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <!-- Purchase Date -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:calendar" size="16" class="text-green-400" />
                        Purchase Date
                    </label>
                    <FormInput type="date" rounded="lg" color="#fff" v-model="purchase_date"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Warranty Expiry -->
                <div class="flex flex-col gap-2 group">
                    <label
                        class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:shield-check" size="16" class="text-green-400" />
                        Warranty Expiry
                    </label>
                    <FormInput type="date" rounded="lg" color="#fff" v-model="warranty_expire"
                        class="transition-transform hover:scale-[1.01]" />
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useAssetsStore } from '../../stores/assets.store'
import { useAssetsModelStore } from '../../stores/assetModel.store'

const assetsStore = useAssetsStore()
const modelStore = useAssetsModelStore()

const {
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
    loading,
} = storeToRefs(assetsStore)

/* ================= OPTIONS ================= */

const categoryOptions = computed(() => modelStore.category_list)

const modelOptions = computed(() => modelStore.models_select)

const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned', disabled: true },
    { value: 'IN_REPAIR', label: 'In Repair' },
    { value: 'RETIRED', label: 'Retired' },
];
</script>