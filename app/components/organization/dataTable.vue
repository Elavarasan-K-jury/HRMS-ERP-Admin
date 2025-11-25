<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center !w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No organizations found.</span>
    </div>

    <!-- 🧠 Table Wrapper -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">

        <!-- Header / Controls -->
        <!-- <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-white/10">
            <h3 class="text-white/90 font-semibold tracking-wide">Organizations</h3>

            <div class="flex items-center gap-2">
                <slot name="left-actions" />
                <button class="px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
                    @click="$emit('refresh')" :disabled="loading" title="Refresh">
                    <Icon :name="loading ? 'ion:sync-outline' : 'lucide:refresh-ccw'"
                        :class="loading ? 'animate-spin' : ''" class="w-4 h-4 inline-block align-[-2px]" />
                    <span class="ml-1 hidden sm:inline">Refresh</span>
                </button>
            </div>
        </div> -->

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <!-- Sticky Header -->
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Name / Domain</th>
                        <th class="th">Contact</th>
                        <th class="th">Email</th>
                        <th class="th">GST</th>
                        <th class="th">Industry</th>
                        <th class="th text-right">Size</th>
                        <th class="th w-[18%]">Address</th>
                        <th class="th">Created</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- 🔄 Skeleton Loading Rows -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td">
                                <div class="flex flex-col gap-1">
                                    <div class="skeleton h-3 w-36" />
                                    <div class="skeleton h-2.5 w-28" />
                                </div>
                            </td>
                            <td class="td">
                                <div class="flex flex-col gap-1">
                                    <div class="skeleton h-3 w-28" />
                                    <div class="skeleton h-2.5 w-20" />
                                </div>
                            </td>
                            <td class="td">
                                <div class="skeleton h-3 w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton h-3 w-20" />
                            </td>
                            <td class="td">
                                <div class="skeleton h-3 w-28" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton h-3 w-10 ml-auto" />
                            </td>
                            <td class="td">
                                <div class="skeleton h-3 w-full" />
                            </td>
                            <td class="td">
                                <div class="skeleton h-3 w-28" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton h-3 w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Data Rows -->
                    <template v-else>
                        <tr v-for="org in items" :key="org.id"
                            class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <!-- Name / Domain -->
                            <td class="td align-top">
                                <div class="font-semibold text-white">{{ org.name }}</div>
                                <a v-if="org.domain" class="text-xs text-white/70 hover:text-white break-all"
                                    :href="org.domain" target="_blank" rel="noopener">
                                    {{ org.domain }}
                                </a>
                            </td>

                            <!-- Contact -->
                            <td class="td align-top">
                                <div class="text-white/90">{{ org.contact_person_name || '—' }}</div>
                                <div class="text-xs text-white/70">{{ org.contact_person_number || '—' }}</div>
                            </td>

                            <!-- Email -->
                            <td class="td align-top">
                                <a v-if="org.email" class="text-white/90 hover:text-white break-all"
                                    :href="`mailto:${org.email}`">
                                    {{ org.email }}
                                </a>
                                <span v-else>—</span>
                            </td>

                            <!-- GST -->
                            <td class="td align-top">
                                <span class="font-mono text-xs bg-white/10 px-2 py-1 rounded-lg">
                                    {{ org.gst_number || '—' }}
                                </span>
                            </td>

                            <!-- Industry -->
                            <td class="td align-top">
                                <span class="inline-flex items-center gap-1">
                                    <Icon name="lucide:briefcase" class="w-4 h-4 opacity-80" />
                                    <span>{{ org.industry || '—' }}</span>
                                </span>
                            </td>

                            <!-- Size -->
                            <td class="td align-top text-right">
                                <span class="inline-flex items-center gap-1">
                                    <Icon name="lucide:users" class="w-4 h-4 opacity-80" />
                                    <span>{{ org.size ?? '—' }}</span>
                                </span>
                            </td>

                            <!-- Address -->
                            <td class="td align-top">
                                <p class="whitespace-pre-line leading-snug text-white/90">
                                    {{ formatAddress(org.address) }}
                                </p>
                            </td>

                            <!-- Created -->
                            <td class="td align-top">
                                <span class="text-white/80">{{ org.created_at || '—' }}</span>
                            </td>

                            <!-- Actions -->
                            <td class="td align-top text-center">
                                <div class="inline-flex flex-col items-center gap-1.5">
                                    <NuxtLink class="btn-icon" title="View" :to="`/organization/${org.id}/dashboard`"
                                        :target="`_blank`">
                                        <Icon name="lucide:eye" class="w-4 h-4" />
                                    </NuxtLink>
                                    <button class="btn-icon" title="Edit" @click="$emit('edit', org)">
                                        <Icon name="lucide:pencil" class="w-4 h-4" />
                                    </button>
                                    <button class="btn-icon-danger" title="Delete" @click="$emit('delete', org)">
                                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- 📄 Footer / Pagination -->
        <div v-if="showPagination"
            class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-white/5">
            <div class="text-xs text-white/70">
                Page <span class="text-white">{{ page }}</span> of
                <span class="text-white">{{ totalPages }}</span> —
                <span class="text-white">{{ total }}</span> results
            </div>

            <div class="flex items-center gap-1.5">
                <button class="btn-lite" :disabled="page <= 1 || loading" @click="$emit('prev')">
                    <Icon name="lucide:chevron-left" class="w-4 h-4" /> Prev
                </button>
                <button class="btn-lite" :disabled="page >= totalPages || loading" @click="$emit('next')">
                    Next
                    <Icon name="lucide:chevron-right" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
})

defineEmits(['refresh', 'view', 'edit', 'delete', 'prev', 'next'])

const showPagination = computed(() => props.totalPages > 1)

function formatAddress(addr) {
    if (!addr) return '—'
    const a = typeof addr === 'string' ? safeParse(addr) : addr
    const parts = [
        [a?.street_number, a?.street_name].filter(Boolean).join(' '),
        a?.landmark,
        [a?.area, a?.locality].filter(Boolean).join(', '),
        [a?.city, a?.state].filter(Boolean).join(', '),
        [a?.postal_code, a?.country].filter(Boolean).join(' ')
    ].filter(Boolean)
    return parts.join('\n')
}
function safeParse(v) {
    try { return JSON.parse(v) } catch { return null }
}
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

/* Buttons */
.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}

.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

/* ✨ Smooth Skeleton Shimmer */
.skeleton {
    @apply rounded-full bg-gradient-to-r from-white/10 via-white/20 to-white/10;
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>
