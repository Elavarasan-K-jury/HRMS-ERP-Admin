<template>
    <!-- Empty state -->
    <div v-if="!items?.length"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-12 flex flex-col items-center justify-center gap-3 text-center">
        <Icon name="ion:globe-outline" class="w-10 h-10 opacity-60" />
        <div>
            <p class="text-white/85 font-medium">No IP networks configured.</p>
            <p class="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                {{ searched
                    ? 'Try changing your search.'
                    : 'Add a trusted network for this organization to get started.' }}
            </p>
        </div>
        <UiButton v-if="!searched" size="sm" color="#4aff7a" text="Add IP Address" prepend-icon="ion:add-circle"
            data-testid="ip-empty-add-button" @click="$emit('create')" />
    </div>

    <!-- Table -->
    <div v-else data-testid="ip-network-table"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Name of Network</th>
                        <th class="th">IP Network</th>
                        <th class="th">Whitelist Enabled</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in items" :key="row.id" data-testid="ip-network-row"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="td align-top">
                            <span class="font-semibold text-white" data-testid="ip-network-name">{{ row.name }}</span>
                        </td>
                        <td class="td align-top">
                            <span class="font-mono text-white/90" data-testid="ip-network-address">{{ addressOf(row)
                                }}</span>
                        </td>
                        <td class="td align-top">
                            <div class="inline-flex items-center gap-2">
                                <UiSwitch :model-value="row.isEnabled" data-testid="ip-network-toggle" size="sm"
                                    :aria-label="`Whitelist enabled for ${row.name}`"
                                    @update:model-value="onToggle(row, $event)" />
                                <span class="text-xs font-semibold" :class="row.isEnabled ? 'text-emerald-300' : 'text-white/50'"
                                    data-testid="ip-network-toggle-state">
                                    {{ row.isEnabled ? 'ON' : 'OFF' }}
                                </span>
                            </div>
                        </td>
                        <td class="td align-top text-right" data-testid="ip-network-actions">
                            <div class="inline-flex items-center justify-end gap-1.5">
                                <button class="btn-icon" title="Edit" data-testid="ip-network-edit"
                                    aria-label="Edit IP network" @click="$emit('edit', row)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon-danger" title="Delete" data-testid="ip-network-delete"
                                    aria-label="Delete IP network" @click="$emit('delete', row)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ipNetworkAddress } from '~/data/ipNetwork'

const props = defineProps({
    items: { type: Array, default: () => [] },
    searched: { type: Boolean, default: false },
})

const emit = defineEmits(['create', 'edit', 'delete', 'toggle'])

const addressOf = (row) => ipNetworkAddress(row)

const onToggle = (row, value) => {
    // UI state only in Phase 1 — no restriction/enforcement is applied.
    emit('toggle', row, value)
}
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}
</style>
