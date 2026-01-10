<template>
    <div class="rounded-lg bg-white/10 border border-white/20 overflow-hidden backdrop-blur-sm shadow-2xl">
        <!-- TABLE HEADER -->
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.03] border-b border-white/10">
            <div class="col-span-3 text-sm font-bold text-white/90 uppercase tracking-wider">Plan Details</div>
            <div class="col-span-2 text-sm font-bold text-white/90 uppercase tracking-wider">Pricing</div>
            <div class="col-span-2 text-sm font-bold text-white/90 uppercase tracking-wider">Trial Period</div>
            <div class="col-span-2 text-sm font-bold text-white/90 uppercase tracking-wider">Tax</div>
            <div class="col-span-1 text-sm font-bold text-white/90 uppercase tracking-wider">Status</div>
            <div class="col-span-2 text-sm font-bold text-white/90 uppercase tracking-wider text-right">Actions</div>
        </div>

        <!-- LOADING STATE -->
        <div v-if="loading" class="p-12 text-center">
            <div class="inline-flex items-center gap-3 text-white/60">
                <div class="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
                <span class="text-sm font-medium">Loading subscription plans...</span>
            </div>
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="!items.length" class="p-12 py-10 text-center">
            <div class="inline-flex flex-col items-center gap-3">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <span class="text-3xl">📋</span>
                </div>
                <div class="text-white/60 font-medium">No subscription plans found</div>
                <div class="text-white/40 text-sm">Create your first plan to get started</div>
            </div>
        </div>

        <!-- TABLE ROWS -->
        <div v-else class="divide-y divide-white/[0.06]">
            <div v-for="plan in items" :key="plan.id"
                class="px-6 py-4 hover:bg-white/[0.03] transition-all duration-200 group">

                <!-- MAIN ROW -->
                <div class="grid grid-cols-12 gap-4 items-center">
                    <!-- NAME & DESCRIPTION -->
                    <div class="col-span-3">
                        <div class="font-bold text-white text-base mb-1">{{ plan.name }}</div>
                        <div class="text-xs text-white/50 line-clamp-2">
                            {{ plan.description || 'No description provided' }}
                        </div>
                    </div>

                    <!-- PRICING -->
                    <div class="col-span-2">
                        <div class="flex items-baseline gap-1.5">
                            <span class="text-white/90 font-bold text-lg">₹{{ plan.yearly_price }}</span>
                            <span class="text-white/40 text-xs font-medium">/year</span>
                        </div>
                        <div class="flex items-baseline gap-1.5 mt-1">
                            <span class="text-white/60 font-semibold text-sm">₹{{ plan.monthly_price }}</span>
                            <span class="text-white/30 text-xs">/month</span>
                        </div>
                    </div>

                    <!-- TRIAL -->
                    <div class="col-span-2">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <span class="text-blue-400 font-bold text-sm">{{ plan.trial_days }}</span>
                            <span class="text-blue-300/70 text-xs font-medium">days</span>
                        </div>
                    </div>

                    <!-- GST -->
                    <div class="col-span-2">
                        <div
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <span class="text-amber-400 font-bold text-sm">{{ plan.gst }}%</span>
                            <span class="text-amber-300/70 text-xs font-medium">GST</span>
                        </div>
                    </div>

                    <!-- STATUS -->
                    <div class="col-span-1">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            :class="plan.is_active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'">
                            <span class="w-1.5 h-1.5 rounded-full"
                                :class="plan.is_active ? 'bg-emerald-400' : 'bg-red-400'"></span>
                            {{ plan.is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <!-- ACTIONS -->
                    <div class="col-span-2 flex justify-end gap-2">
                        <UiButton size="xs" color="#4aff7a" prepend-icon="ion:create-outline"
                            @click="$emit('edit', plan)" />
                        <UiButton size="xs" color="#ff0000" prepend-icon="ion:trash-outline"
                            @click="$emit('delete', plan)" />
                    </div>
                </div>

                <!-- FEATURE TOGGLE -->
                <div v-if="plan.features?.length"
                    class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 cursor-pointer hover:bg-sky-500/15 transition-all duration-200"
                    @click="toggle(plan.id)">
                    <span class="text-sky-400 text-xs font-semibold">
                        {{ plan.features.length }} feature{{ plan.features.length !== 1 ? 's' : '' }}
                    </span>
                    <span class="text-sky-300/60 text-xs transition-transform duration-200"
                        :class="expanded[plan.id] ? 'rotate-180' : ''">
                        ▼
                    </span>
                </div>

                <!-- FEATURE LIST (EXPANDED) -->
                <transition enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-96"
                    leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 max-h-96"
                    leave-to-class="opacity-0 max-h-0">
                    <div v-if="expanded[plan.id]"
                        class="mt-3 rounded-lg bg-white/[0.03] border border-white/10 overflow-hidden">
                        <div class="grid grid-cols-3 gap-4 px-4 py-2 bg-white/[0.02] border-b border-white/10">
                            <div class="text-xs font-bold text-white/60 uppercase tracking-wider">Feature</div>
                            <div class="text-xs font-bold text-white/60 uppercase tracking-wider">Limit</div>
                            <div class="text-xs font-bold text-white/60 uppercase tracking-wider text-right">Type</div>
                        </div>
                        <div v-for="f in plan.features" :key="f.id"
                            class="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] last:border-0">
                            <div class="text-sm font-semibold text-white/90">
                                {{ f.key }}
                            </div>
                            <div class="text-sm text-white/70">
                                <span v-if="f.is_unlimited"
                                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
                                    ∞ Unlimited
                                </span>
                                <span v-else class="font-medium">
                                    {{ f.value }} <span class="text-white/40">{{ f.unit }}</span>
                                </span>
                            </div>
                            <div class="text-xs text-white/40 text-right font-medium">
                                Feature
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <!-- PAGINATION FOOTER -->
        <div v-if="totalPages > 1"
            class="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
            <div class="text-sm text-white/60 font-medium">
                Page <span class="text-white/90 font-bold">{{ page }}</span> of <span class="text-white/90 font-bold">{{
                    totalPages }}</span>
            </div>

            <div class="flex items-center gap-2">
                <UiButton size="sm" text="Previous" color="#fff" :disabled="page <= 1" @click="$emit('prev')" />
                <UiButton size="sm" text="Next" color="#fff" :disabled="page >= totalPages" @click="$emit('next')" />
                <UiButton size="sm" text="Refresh" color="#fff" prepend-icon="ion:refresh" @click="$emit('refresh')" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
    items: Array,
    loading: Boolean,
    total: Number,
    page: Number,
    totalPages: Number,
})

const expanded = reactive({})

function toggle(id) {
    expanded[id] = !expanded[id]
}
</script>