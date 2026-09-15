<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">Locations</h2>
                <p class="text-xs text-white/55">Map &amp; manage addresses for the organization and its branches.</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openAddLocation" color="#4aff7a" text="Add Location"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="loadAll" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <div class="grid grid-cols-12 gap-2">
            <!-- Sidebar: Main Organization + Branches -->
            <aside class="col-span-12 md:col-span-3 flex flex-col gap-2">
                <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl p-3 overflow-hidden">
                    <p class="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">Organization &amp; Branches</p>
                    <div class="max-h-[60vh] overflow-y-auto flex flex-col gap-1 pr-1">
                        <button v-for="item in sidebarItems" :key="item.key" @click="selectItem(item)"
                            class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition"
                            :class="selected === item.key
                                ? 'bg-emerald-400/15 text-white ring-1 ring-emerald-300/40'
                                : 'hover:bg-white/10 text-white/80'">
                            <Icon :name="item.type === 'organization' ? 'ion:business' : 'lucide:building-2'"
                                class="text-lg text-white/50" />
                            <span class="flex-1 truncate font-medium">{{ item.label }}</span>
                            <Icon v-if="item.hq" name="ion:star" title="Headquarters"
                                class="text-sm text-amber-300" />
                            <span v-if="item.count"
                                class="rounded-full bg-emerald-300/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                {{ item.count }}
                            </span>
                            <Icon v-else name="ion:location-outline" class="text-sm text-white/25" />
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Map view + location details -->
            <section class="col-span-12 md:col-span-9 flex flex-col gap-2">
                <LocationMapView :location="selectedLocation" />

                <!-- Details -->
                <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-4">
                    <template v-if="selectedLocation">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-lg font-semibold text-white/90">
                                        {{ selectedLocation.formatted_address || selectedLabel }}
                                    </h3>
                                    <span v-if="selectedLocation.is_headquarters"
                                        class="inline-flex items-center gap-1 rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                        <Icon name="ion:star" class="text-xs" /> Headquarters
                                    </span>
                                </div>
                                <p class="mt-0.5 text-xs text-white/50">{{ selectedLabel }}</p>
                            </div>                            <div class="flex items-center gap-2">
                                <UiButton size="xs" color="#4aff7a" text="Edit" prepend-icon="ion:create-outline"
                                    @click="openEditLocation(selectedLocation)" />
                                <UiButton size="xs" color="#750d0d" text="Delete" prepend-icon="ion:trash"
                                    @click="openDelete(selectedLocation)" />
                            </div>
                        </div>

                        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div v-for="field in detailFields" :key="field.label" class="rounded-lg bg-black/20 border border-white/10 px-3 py-2">
                                <p class="text-[10px] uppercase tracking-wider text-white/45">{{ field.label }}</p>
                                <p class="mt-0.5 text-sm text-white/90 break-words">{{ field.value || '—' }}</p>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex flex-col items-center justify-center gap-2 py-8 text-center">
                            <Icon name="ion:location-outline" class="text-5xl text-white/35" />
                            <p class="text-sm text-white/60">No location added for {{ selectedLabel }}</p>
                            <p class="text-xs text-white/45">Click “Add Location” to set an address for this {{ selected.type === 'organization' ? 'organization' : 'branch' }}.</p>
                            <UiButton size="sm" color="#4aff7a" text="Add Location" prepend-icon="ion:add-circle"
                                class="mt-1" @click="openAddLocation" />
                        </div>
                    </template>
                </div>
            </section>
        </div>
    </div>

    <UiSidebarModal v-model="locationModal" :title="formTitle">
        <template #default>
            <LocationForm ref="formRef" :organization-id="orgId" :organization-name="organizationName"
                :branches="branchesList" :item="editingItem" @submit="persistLocation" />
        </template>
        <template #footer>
            <UiButton @click="closeLocationModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="saveLocation" color="#4aff7a" text="Save Location" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete the location for “{{ deleteData?.formatted_address || selectedLabel }}”?</span>
        </template>
        <template #footer>
            <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Location" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBranchStore } from '~/stores/organization/branch.store'
import { useLocationStore } from '~/stores/organization/location.store'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const orgId = route.params.organization

const branchStore = useBranchStore()
const locationStore = useLocationStore()

const organizationName = ref('Main Organization')
const branchesList = ref([])

const locationModal = ref(false)
const formRef = ref(null)
const formTitle = ref('Add Location')
const editingItem = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)

const selected = ref(`org:${orgId}`)

const loadAll = async () => {
    locationStore.organization_id = orgId
    branchStore.organization_id = orgId
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get(`/organizations/${orgId}`)
        organizationName.value = data?.organization?.name || 'Main Organization'
    } catch {
        // fall back to default label
    }
    await Promise.all([
        branchStore.fetchAllBranches(),
        locationStore.fetchLocations(),
    ])
    branchesList.value = branchStore.branch_select.map(b => ({ id: b.value, name: b.label, is_active: true }))
    if (selected.value !== `org:${orgId}`) selected.value = `org:${orgId}`
}

const sidebarItems = computed(() => {
    const orgLoc = locationStore.locations.find(l => l.entity_type === 'organization'
        && (!l.entity_id || String(l.entity_id) === String(orgId)))
    const org = {
        key: `org:${orgId}`,
        label: organizationName.value,
        type: 'organization',
        count: orgLoc ? 1 : 0,
        hq: !!orgLoc?.is_headquarters,
    }
    const branches = branchesList.value.map(b => {
        const loc = locationStore.locations.find(l => l.entity_type === 'branch' && String(l.entity_id) === String(b.id))
        return {
            key: `branch:${b.id}`,
            label: b.name,
            type: 'branch',
            count: loc ? 1 : 0,
            hq: !!loc?.is_headquarters,
        }
    })
    return [org, ...branches]
})

const selectedItem = computed(() =>
    sidebarItems.value.find(item => item.key === selected.value) || sidebarItems.value[0])

const selectedLabel = computed(() => selectedItem.value?.label || 'This entity')

const locationOf = (key) => {
    const [type, id] = String(key).split(':')
    if (type === 'org') {
        return locationStore.locations.find(l => l.entity_type === 'organization'
            && (!l.entity_id || String(l.entity_id) === String(id)))
    }
    return locationStore.locations.find(l => l.entity_type === 'branch' && String(l.entity_id) === String(id))
}

const selectedLocation = computed(() => locationOf(selected.value))

const detailFields = computed(() => {
    const l = selectedLocation.value
    if (!l) return []
    return [
        { label: 'Headquarters', value: l.is_headquarters ? 'Yes' : 'No' },
        { label: 'Timezone', value: l.timezone || '—' },
        { label: 'Address 1', value: l.address1 },
        { label: 'Address 2', value: l.address2 },
        { label: 'City', value: l.city },
        { label: 'State', value: l.state },
        { label: 'Country', value: l.country },
        { label: 'Pincode', value: l.pincode },
        { label: 'Coordinates', value: l.latitude && l.longitude
            ? `${Number(l.latitude).toFixed(5)}, ${Number(l.longitude).toFixed(5)}` : '—' },
        { label: 'Place ID', value: l.place_id || '—' },
        { label: 'Description', value: l.description },
    ]
})

const selectItem = (item) => { selected.value = item.key }

const openAddLocation = () => {
    formTitle.value = 'Add Location'
    editingItem.value = null
    locationStore.resetForm()
    locationModal.value = true
}

const openEditLocation = (location) => {
    formTitle.value = 'Edit Location'
    editingItem.value = location
    locationStore.location_id = location.id
    locationModal.value = true
}

const closeLocationModal = () => { locationModal.value = false }

const saveLocation = async () => {
    await formRef.value?.submit()
}

const persistLocation = async (payload) => {
    await locationStore.saveLocation(payload)
    if (payload.entity_type === 'branch' && payload.entity_id) {
        selected.value = `branch:${payload.entity_id}`
    }
    closeLocationModal()
}

const openDelete = (location) => {
    deleteData.value = location
    deleteModal.value = true
}

const confirmDelete = async () => {
    await locationStore.deleteLocation(deleteData.value?.id)
    deleteModal.value = false
    deleteData.value = null
}

onMounted(loadAll)
</script>