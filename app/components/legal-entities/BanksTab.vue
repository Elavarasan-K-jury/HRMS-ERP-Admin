<template>
    <div class="flex flex-col gap-3 h-full">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mt-6">
            <div>
                <p class="eyebrow">Bank Details</p>
                <h3 class="mt-1 text-lg font-semibold text-white/90">Bank Accounts</h3>
                <p class="mt-0.5 text-sm text-white/50">Bank accounts registered under {{ entity?.name || 'this legal entity' }}.</p>
            </div>
            <UiButton size="xs" color="#4aff7a" text="Add Bank Detail" prepend-icon="ion:add-circle"
                @click="$emit('add-bank')" />
        </div>

        <div v-if="!entity" class="py-10 text-center text-sm text-white/50">No legal entity selected.</div>

        <div v-else-if="!entity.banks?.length" class="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon name="ion:card-outline" class="text-3xl text-white/35" />
            </div>
            <p class="text-sm text-white/60">No bank details yet</p>
            <p class="text-xs text-white/45">Add the first bank account for this legal entity.</p>
            <UiButton size="sm" color="#4aff7a" text="Add Bank Detail" prepend-icon="ion:add-circle"
                class="mt-1" @click="$emit('add-bank')" />
        </div>

        <div v-else class="flex flex-col gap-2.5 overflow-y-auto pr-1">
            <div v-for="b in entity.banks" :key="b.id"
                class="rounded-lg bg-black/20 border border-white/10 p-3 flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-emerald-400/15 border border-emerald-300/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="ion:business-outline" class="text-xl text-emerald-300" />
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-white/90">{{ b.bank_name }}</p>
                        <p class="text-xs text-white/55">{{ b.branch }}</p>
                        <p class="text-xs text-white/45 mt-0.5">Account ending •••• {{ lastFour(b.account_number) }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button @click="$emit('edit-bank', b)" class="p-1.5 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit">
                        <Icon name="ion:create-outline" class="text-lg" />
                    </button>
                    <button @click="viewBank(b)" class="p-1.5 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                        title="View">
                        <Icon name="ion:eye-outline" class="text-lg" />
                    </button>
                    <button @click="confirmRemove(b)" class="p-1.5 rounded-lg text-red-300/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Remove">
                        <Icon name="ion:trash-outline" class="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bank detail -->
    <UiModal v-model="detailModal" title="Bank Account Details" size="lg">
        <template #default>
            <div v-if="selected" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="f in bankFields" :key="f.label" class="rounded-lg bg-black/20 border border-white/10 px-3 py-2.5">
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
    <UiModal v-model="removeModal" title="Remove bank account?" size="sm">
        <template #default>
            <span>Remove the <b>{{ removeData?.bank_name }}</b> account (ending {{ lastFour(removeData?.account_number) }})?</span>
        </template>
        <template #footer>
            <UiButton @click="removeModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmRemoveBank" color="#750d0d" text="Remove" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLegalEntitiesStore } from '~/stores/legalEntities.store'

const props = defineProps({
    entity: { type: Object, default: null },
})

defineEmits(['add-bank', 'edit-bank'])

const store = useLegalEntitiesStore()

const detailModal = ref(false)
const removeModal = ref(false)
const removing = ref(false)
const selected = ref(null)
const removeData = ref(null)

const bankFields = computed(() => {
    const b = selected.value
    if (!b) return []
    return [
        { label: 'Bank Name', value: b.bank_name },
        { label: 'Account Number', value: b.account_number },
        { label: 'IFSC Code', value: b.ifsc_code },
        { label: 'Branch', value: b.branch },
        { label: 'Establishment ID / Corporate ID', value: b.establishment_id },
    ]
})

const lastFour = (num) => {
    const s = String(num || '')
    return s.length > 4 ? s.slice(-4) : (s || '—')
}

const viewBank = (b) => {
    selected.value = b
    detailModal.value = true
}

const confirmRemove = (b) => {
    removeData.value = b
    removeModal.value = true
}

const confirmRemoveBank = async () => {
    if (!props.entity || !removeData.value) return
    removing.value = true
    try {
        await store.removeBank(props.entity.id, removeData.value.id)
        useToast().success({ title: 'Success!', message: 'Bank account removed.', timeout: 1500 })
        removeModal.value = false
        removeData.value = null
    } catch (err) {
        console.error('[banks] remove error:', err)
        useToast().error({ title: 'Failed', message: 'Could not remove bank account.', timeout: 3000 })
    } finally {
        removing.value = false
    }
}
</script>

<style scoped>
.eyebrow { @apply text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/75; }
</style>