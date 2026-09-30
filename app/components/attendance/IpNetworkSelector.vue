<template>
    <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 flex flex-col gap-3"
        data-testid="ttp-ip-section">
        <div>
            <h4 class="text-sm font-semibold text-white/90">Allowed IP networks</h4>
            <p class="text-xs text-white/55 mt-1">Select the IP networks from which employees can mark attendance
                through Web Clock-in.</p>
        </div>

        <!-- Empty: no networks configured at all -->
        <div v-if="!networks.length" data-testid="ttp-ip-empty-configured"
            class="rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center">
            <p class="text-sm font-semibold text-white/85">No IP networks configured</p>
            <p class="text-xs text-white/55 mt-1">Configure IP networks in Organization Settings before enabling IP
                restriction for Web Clock-in.</p>
        </div>

        <!-- Empty: networks exist but none are enabled -->
        <div v-else-if="!enabledNetworks.length" data-testid="ttp-ip-empty-enabled"
            class="rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center">
            <p class="text-sm font-semibold text-white/85">No enabled IP networks available</p>
            <p class="text-xs text-white/55 mt-1">Enable at least one IP network in Organization Settings before
                selecting it for Web Clock-in.</p>
        </div>

        <template v-else>
            <!-- Search spans the full width of the section -->
            <UiSearch v-model="search" color="#fff" placeholder="Search IP networks..." data-testid="ttp-ip-search"
                full-width />

            <!-- Summary row: enabled available + selected count + select all -->
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0 flex-wrap">
                    <span class="text-xs text-white/45" data-testid="ttp-ip-available">{{ enabledNetworks.length }}
                        enabled network{{ enabledNetworks.length === 1 ? '' : 's' }} available</span>
                    <span class="text-white/20" aria-hidden="true">·</span>
                    <span class="text-xs font-medium text-white/75" data-testid="ttp-ip-count">{{ modelValue.length }}
                        IP network{{ modelValue.length === 1 ? '' : 's' }} selected</span>
                </div>
                <button type="button" data-testid="ttp-ip-select-all"
                    class="shrink-0 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                    @click="toggleSelectAll">
                    {{ allSelected ? 'Deselect all' : 'Select all' }}
                </button>
            </div>

            <!-- Network cards: two-column grid on desktop, single column on mobile -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2" data-testid="ttp-ip-list">
                <label v-for="n in filteredNetworks" :key="n.id" data-testid="ttp-ip-row" :data-network-id="n.id"
                    class="flex items-start gap-3 rounded-lg border px-3.5 py-3 cursor-pointer transition-colors"
                    :class="rowClass(n)">
                    <input type="checkbox"
                        class="shrink-0 mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50 disabled:opacity-40"
                        :checked="modelValue.includes(n.id)" :disabled="!n.isEnabled" @change="toggle(n)" />
                    <span class="min-w-0 flex-1">
                        <span class="block text-sm font-medium text-white/90 truncate">{{ n.name }}</span>
                        <span class="block text-xs text-white/50 mt-1 break-all">{{ address(n) }}</span>
                    </span>
                    <span v-if="!n.isEnabled"
                        class="shrink-0 self-end rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/45"
                        data-testid="ttp-ip-disabled-badge">Disabled</span>
                </label>

                <div v-if="!filteredNetworks.length" data-testid="ttp-ip-empty-search"
                    class="md:col-span-2 px-3 py-6 text-center text-sm text-white/50">
                    No IP networks found
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { timeTrackingIpNetworks } from '~/data/timeTrackingIpNetworks'
import { ipNetworkAddress } from '~/data/ipNetwork'

const props = defineProps({
    modelValue: { type: Array, default: () => [] }, // selectedIpNetworkIds — IDs only, never IP strings
})
const emit = defineEmits(['update:modelValue'])

// TEMPORARY local mock — replaced by Organization IP Configuration API later
const networks = timeTrackingIpNetworks
const enabledNetworks = computed(() => networks.filter(n => n.isEnabled))

const search = ref('')

const filteredNetworks = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return networks
    return networks.filter(n =>
        n.name.toLowerCase().includes(q)
        || (n.fromIp || '').toLowerCase().includes(q)
        || (n.toIp || '').toLowerCase().includes(q)
        || ipNetworkAddress(n).toLowerCase().includes(q),
    )
})

const address = (n) => ipNetworkAddress(n)
const isSelected = (n) => props.modelValue.includes(n.id)

const rowClass = (n) => {
    if (!n.isEnabled) return 'border-transparent bg-white/[0.02] opacity-50 cursor-not-allowed'
    if (isSelected(n)) return 'border-emerald-400/30 bg-emerald-500/10'
    return 'border-white/10 hover:bg-white/5'
}

const toggle = (n) => {
    if (!n.isEnabled) return
    const next = isSelected(n)
        ? props.modelValue.filter(id => id !== n.id)
        : [...props.modelValue, n.id]
    emit('update:modelValue', next)
}

const allSelected = computed(() =>
    enabledNetworks.value.length > 0
    && enabledNetworks.value.every(n => props.modelValue.includes(n.id)),
)

const toggleSelectAll = () => {
    const enabledIds = enabledNetworks.value.map(n => n.id)
    if (allSelected.value) {
        emit('update:modelValue', props.modelValue.filter(id => !enabledIds.includes(id)))
    } else {
        emit('update:modelValue', [...new Set([...props.modelValue, ...enabledIds])])
    }
}
</script>
