<template>
    <div class="space-y-2 p-2">

        <!-- Asset Identification Section -->
        <div class="relative">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                <h3 class="text-white font-semibold text-base">Asset Identification</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <!-- Category -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:package" size="16" class="text-cyan-400" />
                        Asset Category
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="category_id" :options="categoryOptions"
                        placeholder="Select category" class="transition-transform hover:scale-[1.01]"
                        @update:modelValue="onCategoryChange" />
                </div>

                <!-- Model -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:cpu" size="16" class="text-cyan-400" />
                        Asset Model
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="model_id" :options="modelOptions"
                        placeholder="Select model" class="transition-transform hover:scale-[1.01]"
                        @update:modelValue="onModelChange" />
                </div>

                <!-- ID Source Toggle -->
                <div class="flex flex-col gap-2 group md:col-span-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:settings" size="16" class="text-cyan-400" />
                        Asset ID Source
                    </label>
                    <div class="flex items-center gap-2">
                        <UButton
                            :variant="idSource === 'series' ? 'solid' : 'outline'"
                            :color="idSource === 'series' ? 'primary' : 'gray'"
                            size="sm"
                            @click="idSource = 'series'"
                        >
                            Generate from Series
                        </UButton>
                        <UButton
                            :variant="idSource === 'manual' ? 'solid' : 'outline'"
                            :color="idSource === 'manual' ? 'primary' : 'gray'"
                            size="sm"
                            @click="idSource = 'manual'"
                        >
                            Manual Entry
                        </UButton>
                    </div>
                </div>

                <!-- Series Selector (when source is 'series') -->
                <div v-if="idSource === 'series'" class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:list-ordered" size="16" class="text-cyan-400" />
                        ID Series
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="selectedSeriesId" :options="seriesOptions"
                        placeholder="Select series" class="transition-transform hover:scale-[1.01]"
                        @update:modelValue="onSeriesChange" />
                </div>

                <!-- Generated/Manual Asset ID -->
                <div class="flex flex-col gap-2 group" :class="{ 'md:col-span-2': idSource === 'manual' }">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:hash" size="16" class="text-cyan-400" />
                        Asset ID
                        <span v-if="idSource === 'series' && generatedAssetId" class="text-xs text-emerald-400 ml-auto">Auto-generated</span>
                    </label>
                    <FormInput
                        v-if="idSource === 'manual'"
                        rounded="lg" color="#fff" v-model="manualAssetId"
                        placeholder="Enter asset ID manually"
                        class="transition-transform hover:scale-[1.01] font-mono"
                    />
                    <FormInput
                        v-else
                        rounded="lg" color="#fff" :model-value="generatedAssetId || ''"
                        placeholder="Select series to generate"
                        :disabled="true"
                        class="transition-transform hover:scale-[1.01] font-mono"
                    />
                </div>

                <!-- Serial Number -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:barcode" size="16" class="text-cyan-400" />
                        Serial Number
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="serial_number" placeholder="Enter serial number"
                        class="transition-transform hover:scale-[1.01]" />
                </div>
            </div>
        </div>

        <!-- Custom Attributes Section -->
        <div v-if="customAttributeDefinitions.length > 0" class="relative">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                <h3 class="text-white font-semibold text-base">Custom Attributes</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <div
                    v-for="attr in customAttributeDefinitions"
                    :key="attr.key"
                    class="flex flex-col gap-2 group"
                    :class="{ 'md:col-span-2': attr.field_type === 'TEXTAREA' }"
                >
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        {{ attr.label }}
                        <span v-if="attr.is_mandatory" class="text-red-400 text-xs">*</span>
                        <span v-if="attr.is_unique" class="text-xs text-white/40 ml-auto">(unique)</span>
                    </label>

                    <FormInput
                        v-if="attr.field_type === 'TEXTBOX' || attr.field_type === 'NUMBER'"
                        :type="attr.field_type === 'NUMBER' ? 'number' : 'text'"
                        rounded="lg" color="#fff"
                        :model-value="customAttributeValues[attr.key] || ''"
                        :placeholder="`Enter ${attr.label.toLowerCase()}`"
                        @update:model-value="val => onCustomAttrChange(attr.key, val)"
                    />

                    <FormInput
                        v-else-if="attr.field_type === 'DATE'"
                        type="date"
                        rounded="lg" color="#fff"
                        :model-value="customAttributeValues[attr.key] || ''"
                        @update:model-value="val => onCustomAttrChange(attr.key, val)"
                    />

                    <FormTextArea
                        v-else-if="attr.field_type === 'TEXTAREA'"
                        rounded="lg" color="#fff"
                        :model-value="customAttributeValues[attr.key] || ''"
                        :placeholder="`Enter ${attr.label.toLowerCase()}`"
                        :rows="3"
                        @update:model-value="val => onCustomAttrChange(attr.key, val)"
                    />

                    <FormSelect
                        v-else-if="attr.field_type === 'DROPDOWN'"
                        rounded="lg" color="#fff"
                        :model-value="customAttributeValues[attr.key] || null"
                        :options="parseOptions(attr.options)"
                        :placeholder="`Select ${attr.label.toLowerCase()}`"
                        @update:model-value="val => onCustomAttrChange(attr.key, val)"
                    />

                    <FormSelect
                        v-else-if="attr.field_type === 'MULTI_SELECT'"
                        rounded="lg" color="#fff"
                        :model-value="customAttributeValues[attr.key] || []"
                        :options="parseOptions(attr.options)"
                        :placeholder="`Select ${attr.label.toLowerCase()}`"
                        multiple
                        @update:model-value="val => onCustomAttrChange(attr.key, val)"
                    />
                </div>
            </div>
        </div>

        <!-- Assignment Details Section -->
        <div class="relative">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
                <h3 class="text-white font-semibold text-base">Assignment Details</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <!-- Assigned User -->
                <div class="flex flex-col gap-2 group md:col-span-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:user" size="16" class="text-purple-400" />
                        Assigned User
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="user_name" placeholder="Employee name / email"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Location -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:map-pin" size="16" class="text-purple-400" />
                        Location
                    </label>
                    <FormInput rounded="lg" color="#fff" v-model="location" placeholder="Office / Branch / Remote"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Status -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:activity" size="16" class="text-purple-400" />
                        Status
                    </label>
                    <FormSelect rounded="lg" color="#fff" v-model="status" :options="statusOptions"
                        placeholder="Select status" class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Password (Optional) -->
                <div class="flex flex-col gap-2 group md:col-span-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                <!-- Purchase Date -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
                        <Icon name="lucide:calendar" size="16" class="text-green-400" />
                        Purchase Date
                    </label>
                    <FormInput type="date" rounded="lg" color="#fff" v-model="purchase_date"
                        class="transition-transform hover:scale-[1.01]" />
                </div>

                <!-- Warranty Expiry -->
                <div class="flex flex-col gap-2 group">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2 group-hover:text-white/90 transition-colors">
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
import { computed, ref, watch, onMounted } from 'vue'
import { useAssetsStore } from '../../stores/organization/assets.store'
import { useAssetsModelStore } from '../../stores/organization/assetModel.store'
import { useAssetIdSeriesStore } from '../../stores/organization/assetIdSeries.store'
import { useAuthStore } from '../../stores/shared/auth.store'

const { $api } = useNuxtApp()

const assetsStore = useAssetsStore()
const modelStore = useAssetsModelStore()
const seriesStore = useAssetIdSeriesStore()
const authStore = useAuthStore()

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

const generatedAssetId = ref(null)
const idSource = ref('series')
const selectedSeriesId = ref(null)
const manualAssetId = ref('')
const customAttributeDefinitions = ref([])
const customAttributeValues = ref({})

async function onCategoryChange(catValue) {
    if (!catValue?.value) {
        generatedAssetId.value = null
        return
    }
}

async function onModelChange(modelValue) {
    customAttributeDefinitions.value = []
    customAttributeValues.value = {}
    if (!modelValue?.value) return
    await loadCustomAttributeDefinitions(modelValue.value)
}

async function onSeriesChange(seriesValue) {
    if (!seriesValue?.value) {
        generatedAssetId.value = null
        return
    }
    const id = await seriesStore.generateAssetId(seriesValue.value, true)
    generatedAssetId.value = id || null
}

watch(idSource, (newVal) => {
    if (newVal === 'manual') {
        generatedAssetId.value = null
        selectedSeriesId.value = null
    } else {
        manualAssetId.value = ''
    }
})

watch(category_id, (newVal) => {
    if (!newVal?.value) {
        generatedAssetId.value = null
    }
})

const categoryOptions = computed(() => modelStore.category_list)
const modelOptions = computed(() => modelStore.models_select)
const seriesOptions = computed(() => {
    return (seriesStore.seriesList || []).map(s => ({
        value: s.id,
        label: `${s.name} (${s.prefix}...${s.suffix})`,
    }))
})

const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_REPAIR', label: 'In Repair' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'LOST', label: 'Lost' },
    { value: 'RETIRED', label: 'Retired' },
    { value: 'DISPOSED', label: 'Disposed' },
]

function parseOptions(options) {
    if (!options) return []
    try {
        const parsed = typeof options === 'string' ? JSON.parse(options) : options
        if (Array.isArray(parsed)) {
            return parsed.map(o => typeof o === 'string' ? { value: o, label: o } : o)
        }
    } catch { /* ignore */ }
    return []
}

function onCustomAttrChange(key, value) {
    customAttributeValues.value = { ...customAttributeValues.value, [key]: value }
}

async function loadCustomAttributeDefinitions(modelId) {
    try {
        const res = await $api.get('/asset-attribute-definitions', {
            params: { asset_model_id: modelId, organization_id: authStore.organization },
        })
        if (res.data?.definitions) {
            customAttributeDefinitions.value = res.data.definitions
            const defaults = {}
            for (const def of res.data.definitions) {
                if (!customAttributeValues.value[def.key]) {
                    defaults[def.key] = def.field_type === 'MULTI_SELECT' ? [] : ''
                }
            }
            customAttributeValues.value = { ...defaults, ...customAttributeValues.value }
        }
    } catch (err) {
        console.error('[AssetForm] Failed to load attribute definitions:', err)
    }
}

async function previewGenerateId() {
    if (idSource.value !== 'series' || !selectedSeriesId.value) return null
    return await seriesStore.generateAssetId(selectedSeriesId.value, true)
}

async function confirmGenerateId() {
    if (idSource.value !== 'series' || !selectedSeriesId.value) return null
    return await seriesStore.generateAssetId(selectedSeriesId.value, false)
}

function getAssetTagValue() {
    if (idSource.value === 'manual') {
        return manualAssetId.value
    }
    return generatedAssetId.value
}

function getCustomAttributeValues() {
    return { ...customAttributeValues.value }
}

defineExpose({
    generatedAssetId,
    idSource,
    selectedSeriesId,
    manualAssetId,
    customAttributeValues,
    previewGenerateId,
    confirmGenerateId,
    getAssetTagValue,
    getCustomAttributeValues,
})
</script>
