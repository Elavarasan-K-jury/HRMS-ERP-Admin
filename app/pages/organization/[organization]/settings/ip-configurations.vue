<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2" data-testid="ip-configurations-page">
        <!-- Header -->
        <div
            class="rounded-lg p-5 bg-white/10 border min-h-16 border-white/15 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">IP Configurations</h2>
                <p class="text-xs text-white/55">Configure trusted organization networks.</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <UiSearch v-model="search" :color="search ? '#4aff7a' : '#fff'" width="280px"
                    placeholder="Search IP networks..." aria-label="Search IP networks" />
                <UiButton @click="openAdd" color="#4aff7a" text="Add IP Address" prepend-icon="ion:add-circle"
                    data-testid="ip-add-button" />
            </div>
        </div>

        <div class="grid grid-cols-12 gap-2">
            <!-- IP network table -->
            <section class="col-span-12 lg:col-span-9 flex flex-col gap-2">
                <SettingsIpNetworkTable :items="filteredNetworks" :searched="isSearching" @create="openAdd" @edit="openEdit"
                    @delete="openDelete" @toggle="onToggle" />
            </section>

            <!-- Information panel -->
            <aside class="col-span-12 lg:col-span-3">
                <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl p-4 flex flex-col gap-3">
                    <div class="flex items-center gap-2">
                        <Icon name="ion:shield-checkmark-outline" class="text-lg text-emerald-300" />
                        <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">IP Whitelist</p>
                    </div>
                    <p class="text-xs leading-relaxed text-white/70">
                        Configured IP networks represent trusted organization networks.
                    </p>
                    <p class="text-xs leading-relaxed text-white/55">
                        Add the public/WAN IP addresses used by your organization&rsquo;s network so they can be
                        recognized as trusted organization IP configurations.
                    </p>
                    <p class="text-xs leading-relaxed text-white/45">
                        This configuration belongs to the organization. Enforcement will be handled separately in a
                        future phase.
                    </p>
                </div>
            </aside>
        </div>

        <!-- Add / Edit drawer -->
        <UiSidebarModal v-model="drawer" :title="isEditing ? 'Edit IP Address' : 'Add IP Address'"
            width="min(580px, 100vw)">
            <template #default>
                <SettingsIpNetworkForm :key="formKey" :initial="editingItem" :rows="networks"
                    :organization-id="orgId" ref="formRef" @submit="onFormSubmit" />
            </template>
            <template #footer>
                <UiButton @click="closeDrawer" color="#fff" text="Cancel" prepend-icon="ion:close-circle"
                    data-testid="ip-cancel-button" />
                <UiButton @click="submitForm" color="#4aff7a" text="Save" prepend-icon="ion:save-outline"
                    data-testid="ip-save-button" />
            </template>
        </UiSidebarModal>

        <!-- Delete confirmation -->
        <UiModal v-model="deleteModal" title="Delete IP Network?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm leading-relaxed">
                    Are you sure you want to delete the IP network
                    <span class="font-semibold text-white">&ldquo;{{ deleteData?.name }}&rdquo;</span>?
                </p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="confirmDelete" color="#750d0d" text="Delete IP Network"
                    prepend-icon="ion:trash" data-testid="ip-delete-confirm" />
            </template>
        </UiModal>

        <!-- Whitelist activation warning (self-lockout) -->
        <UiModal v-model="warningModal" title="Enable IP whitelist enforcement?" size="sm" :showClose="false"
            :zIndex="140">
            <template #default>
                <div data-testid="ip-activation-warning" class="space-y-3 text-sm text-white/80">
                    <p>
                        Once this whitelist is enabled, only the IP networks listed here will be allowed
                        to access this organization.
                    </p>
                    <p class="text-white/60">
                        If your current IP address is not included in the whitelist, you and every other
                        user of this organization may be locked out immediately. Confirm your own IP is
                        listed before enabling.
                    </p>
                </div>
            </template>
            <template #footer>
                <UiButton @click="cancelActivation" color="#fff" text="Cancel" prepend-icon="ion:close-circle"
                    data-testid="ip-activation-cancel" />
                <UiButton @click="confirmActivation" color="#750d0d" text="Enable Anyway"
                    prepend-icon="ion:shield-checkmark" data-testid="ip-activation-confirm" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ipNetworkAddress, mapNetwork, toNetworkPayload, toNetworkPayloadFromRow } from '~/data/ipNetwork'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const orgId = computed(() => route.params.organization)

const search = ref('')
const drawer = ref(false)
const formRef = ref(null)
const formKey = ref(0)
const editingItem = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)
const networks = ref([])
const saving = ref(false)

const isEditing = computed(() => !!editingItem.value)
const isSearching = computed(() => !!search.value?.trim())

const filteredNetworks = computed(() => {
    const term = search.value.trim().toLowerCase()
    if (!term) return networks.value
    return networks.value.filter((row) =>
        String(row.name || '').toLowerCase().includes(term)
        || ipNetworkAddress(row).toLowerCase().includes(term))
})

const apiErrorMessage = (err, fallback) =>
    err?.response?.data?.details?.map(d => d.message).join(' ')
    || err?.response?.data?.error
    || fallback

const fetchNetworks = async () => {
    const { $api } = useNuxtApp()
    try {
        const { data } = await $api.get('/ip-networks', { params: { organization_id: orgId.value } })
        networks.value = (data?.networks || []).map(mapNetwork)
    } catch (err) {
        console.error('[ip-configurations] fetchNetworks:', err)
        networks.value = []
        useToast().error({ title: 'Error', message: apiErrorMessage(err, 'Failed to load IP networks') })
    }
}

const openAdd = () => {
    editingItem.value = null
    formKey.value += 1
    drawer.value = true
}

const openEdit = (row) => {
    editingItem.value = row
    formKey.value += 1
    drawer.value = true
}

const closeDrawer = () => {
    drawer.value = false
    editingItem.value = null
}

const submitForm = () => {
    formRef.value?.submit()
}

const onFormSubmit = async (payload) => {
    if (saving.value) return
    const enabling = !!payload?.isEnabled && (!editingItem.value || !editingItem.value.isEnabled)
    if (enabling) {
        openActivationWarning(() => saveForm(payload))
        return
    }
    await saveForm(payload)
}

const saveForm = async (payload) => {
    if (saving.value) return
    saving.value = true
    const { $api } = useNuxtApp()
    const body = toNetworkPayload(payload)
    try {
        if (editingItem.value) {
            const { data } = await $api.put(`/ip-networks/${editingItem.value.id}`, body, { params: { organization_id: orgId.value } })
            const updated = mapNetwork(data?.network)
            const index = networks.value.findIndex((row) => row.id === updated?.id)
            if (index !== -1 && updated) networks.value.splice(index, 1, updated)
            useToast().success({ title: 'Updated!', message: 'IP network updated', timeout: 1500 })
        } else {
            const { data } = await $api.post('/ip-networks', body, { params: { organization_id: orgId.value } })
            networks.value.push(mapNetwork(data?.network))
            useToast().success({ title: 'Success!', message: 'IP network added', timeout: 1500 })
        }
        closeDrawer()
    } catch (err) {
        console.error('[ip-configurations] save:', err)
        useToast().error({ title: 'Error', message: apiErrorMessage(err, 'Failed to save IP network') })
    } finally {
        saving.value = false
    }
}

const onToggle = (row, value) => {
    if (value) {
        openActivationWarning(() => toggleNetwork(row, value))
        return
    }
    return toggleNetwork(row, value)
}

const toggleNetwork = async (row, value) => {
    const previous = row.isEnabled
    row.isEnabled = value
    const { $api } = useNuxtApp()
    try {
        const { data } = await $api.put(`/ip-networks/${row.id}`, toNetworkPayloadFromRow(row, { isEnabled: value }), { params: { organization_id: orgId.value } })
        row.isEnabled = !!data?.network?.is_enabled
    } catch (err) {
        console.error('[ip-configurations] toggle:', err)
        row.isEnabled = previous
        useToast().error({ title: 'Error', message: apiErrorMessage(err, 'Failed to update IP network') })
    }
}

const warningModal = ref(false)
let pendingActivation = null

const openActivationWarning = (action) => {
    pendingActivation = action
    warningModal.value = true
}

const confirmActivation = async () => {
    warningModal.value = false
    const action = pendingActivation
    pendingActivation = null
    if (action) await action()
}

const cancelActivation = () => {
    warningModal.value = false
    pendingActivation = null
}

const openDelete = (row) => {
    deleteData.value = row
    deleteModal.value = true
}

const confirmDelete = async () => {
    const { $api } = useNuxtApp()
    try {
        await $api.delete(`/ip-networks/${deleteData.value.id}`, { params: { organization_id: orgId.value } })
        const index = networks.value.findIndex((row) => row.id === deleteData.value?.id)
        if (index !== -1) networks.value.splice(index, 1)
        deleteModal.value = false
        deleteData.value = null
        useToast().success({ title: 'Deleted!', message: 'IP network deleted', timeout: 1500 })
    } catch (err) {
        console.error('[ip-configurations] delete:', err)
        useToast().error({ title: 'Error', message: apiErrorMessage(err, 'Failed to delete IP network') })
    }
}

onMounted(() => {
    fetchNetworks()
})
</script>
