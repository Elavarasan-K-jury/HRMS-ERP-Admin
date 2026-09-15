<template>
    <div class="flex flex-col gap-3 h-full">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mt-6">
            <div>
                <p class="eyebrow">Authorized Signatories</p>
                <h3 class="mt-1 text-lg font-semibold text-white/90">Signatories</h3>
                <p class="mt-0.5 text-sm text-white/50">People authorized to sign on behalf of {{ entity?.name || 'this legal entity' }}.</p>
            </div>
            <UiButton size="xs" color="#4aff7a" text="Add Signatory" prepend-icon="ion:person-add-outline"
                @click="$emit('add-signatory')" />
        </div>

        <div v-if="!entity" class="py-10 text-center text-sm text-white/50">No legal entity selected.</div>

        <div v-else-if="!entity.signatories?.length" class="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon name="ion:people-outline" class="text-3xl text-white/35" />
            </div>
            <p class="text-sm text-white/60">No authorized signatories yet</p>
            <p class="text-xs text-white/45">Add the first authorized signatory for this legal entity.</p>
            <UiButton size="sm" color="#4aff7a" text="Add Signatory" prepend-icon="ion:person-add-outline"
                class="mt-1" @click="$emit('add-signatory')" />
        </div>

        <div v-else class="flex flex-col gap-2.5 overflow-y-auto pr-1">
            <div v-for="s in entity.signatories" :key="s.id"
                class="rounded-lg bg-black/20 border border-white/10 p-3 flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-emerald-400/15 border border-emerald-300/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="ion:person" class="text-xl text-emerald-300" />
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-white/90 truncate">{{ s.full_name }}</p>
                        <p class="text-xs text-white/55">{{ s.designation }}</p>
                        <p class="text-xs text-white/45 mt-0.5">{{ s.email }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button @click="$emit('edit-signatory', s)" class="p-1.5 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit">
                        <Icon name="ion:create-outline" class="text-lg" />
                    </button>
                    <button @click="viewSignatory(s)" class="p-1.5 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                        title="View">
                        <Icon name="ion:eye-outline" class="text-lg" />
                    </button>
                    <button @click="confirmRemove(s)" class="p-1.5 rounded-lg text-red-300/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Remove">
                        <Icon name="ion:trash-outline" class="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Signatory detail -->
    <UiModal v-model="detailModal" title="Signatory Details" size="lg">
        <template #default>
            <div v-if="selected" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="f in signatoryFields" :key="f.label" class="rounded-lg bg-black/20 border border-white/10 px-3 py-2.5">
                    <p class="text-[10px] uppercase tracking-wider text-white/45">{{ f.label }}</p>
                    <p class="mt-1 text-sm text-white/90 break-words">{{ f.value || '—' }}</p>
                </div>
            </div>
        </template>
        <template #footer>
            <UiButton color="#fff" text="Close" @click="detailModal = false" />
        </template>
    </UiModal>

    <!-- Remove confirm -->
    <UiModal v-model="removeModal" title="Remove signatory?" size="sm">
        <template #default>
            <span>Remove <b>{{ removeData?.full_name }}</b> as an authorized signatory?</span>
        </template>
        <template #footer>
            <UiButton @click="removeModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmRemoveSignatory" color="#750d0d" text="Remove" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLegalEntitiesStore } from '~/stores/organization/legalEntities.store'

const props = defineProps({
    entity: { type: Object, default: null },
})

defineEmits(['add-signatory', 'edit-signatory'])

const store = useLegalEntitiesStore()

const detailModal = ref(false)
const removeModal = ref(false)
const removing = ref(false)
const selected = ref(null)
const removeData = ref(null)

const signatoryFields = computed(() => {
    const s = selected.value
    if (!s) return []
    return [
        { label: 'Full Name', value: s.full_name },
        { label: 'Email', value: s.email },
        { label: 'Designation', value: s.designation },
        { label: "Signatory's Father Name", value: s.father_name },
        { label: 'Address Line 1', value: s.address1 },
        { label: 'Address Line 2', value: s.address2 },
        { label: 'City', value: s.city },
        { label: 'State', value: s.state },
        { label: 'Zip Code', value: s.zip },
        { label: 'Country', value: s.country },
    ]
})

const viewSignatory = (s) => {
    selected.value = s
    detailModal.value = true
}

const confirmRemove = (s) => {
    removeData.value = s
    removeModal.value = true
}

const confirmRemoveSignatory = async () => {
    if (!props.entity || !removeData.value) return
    removing.value = true
    try {
        await store.removeSignatory(props.entity.id, removeData.value.id)
        useToast().success({ title: 'Success!', message: 'Signatory removed.', timeout: 1500 })
        removeModal.value = false
        removeData.value = null
    } catch (err) {
        console.error('[signatories] remove error:', err)
        useToast().error({ title: 'Failed', message: 'Could not remove signatory.', timeout: 3000 })
    } finally {
        removing.value = false
    }
}
</script>

<style scoped>
.eyebrow { @apply text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/75; }
</style>