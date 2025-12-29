<template>
    <div class="component-group">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 rounded-t-xl border-b transition-all duration-300"
            :class="headerClass">
            <div class="flex items-center gap-3">
                <span class="text-2xl">{{ icon }}</span>
                <h3 class="text-lg font-bold text-white">{{ title }}</h3>
                <span class="text-sm text-white/60">({{ items.length }} items)</span>
            </div>
            <div class="text-xl font-bold text-white">
                {{ formatCurrency(total) }}
            </div>
        </div>

        <!-- Items List -->
        <div class="rounded-b-xl border border-t-0 overflow-hidden" :class="borderClass">
            <div v-if="items.length === 0" class="p-8 text-center text-white/40">
                No {{ title.toLowerCase() }} components
            </div>

            <div v-for="(item, index) in items" :key="item.id || index"
                class="component-item group flex items-center justify-between p-4 transition-all duration-200 hover:bg-white/5"
                :class="{
                    'border-t border-white/10': index > 0,
                    'rounded-b-xl': index + 1 == items.length
                }">
                <!-- Left: Component name and type -->
                <div class="flex items-center gap-4 flex-1">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
                        :class="iconBgClass">
                        {{ index + 1 }}
                    </div>

                    <div>
                        <div class="font-semibold text-white/90 mb-1">
                            {{ item.componentName }}
                        </div>
                        <div class="flex items-center gap-2 text-xs text-white/50">
                            <span class="px-2 py-1 uppercase rounded-md" :class="typeBadgeClass">
                                {{ item.value == 0 ? item.formula : 'Fixed Amount' }}
                            </span>
                            <span v-if="item.taxable" class="px-2 py-1 rounded-md bg-amber-500/20 text-amber-300">
                                Taxable
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Right: Amount -->
                <div class="text-right">
                    <div class="text-md font-bold text-white/50 transition-transform group-hover:scale-105">
                        {{ formatCurrency(item.annualAmount) }} / Year
                    </div>
                    <div class="text-lg font-bold text-white transition-transform group-hover:scale-105">
                        {{ formatCurrency(item.monthlyAmount) }} / Month
                    </div>
                    <div v-if="total > 0" class="text-xs text-white/40 mt-1">
                        {{ ((Number(item.annualAmount || 0) / Number(gross || 1)) * 100).toFixed(1) }}% of total
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: { type: String, required: true },
    color: { type: String, default: 'blue' },
    icon: { type: String, default: '📊' },
    items: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    gross: { type: Number, default: 0 },
});

const colorClasses = {
    emerald: {
        header: 'bg-emerald-500/20 border-emerald-500/30',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/30',
        typeBadge: 'bg-emerald-500/20 text-emerald-300'
    },
    blue: {
        header: 'bg-blue-500/20 border-blue-500/30',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/30',
        typeBadge: 'bg-blue-500/20 text-blue-300'
    },
    rose: {
        header: 'bg-rose-500/20 border-rose-500/30',
        border: 'border-rose-500/30',
        iconBg: 'bg-rose-500/30',
        typeBadge: 'bg-rose-500/20 text-rose-300'
    },
    green: {
        header: 'bg-emerald-500/20 border-emerald-500/30',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/30',
        typeBadge: 'bg-emerald-500/20 text-emerald-300'
    },
    red: {
        header: 'bg-rose-500/20 border-rose-500/30',
        border: 'border-rose-500/30',
        iconBg: 'bg-rose-500/30',
        typeBadge: 'bg-rose-500/20 text-rose-300'
    }
};

const headerClass = computed(() => colorClasses[props.color]?.header || colorClasses.blue.header);
const borderClass = computed(() => colorClasses[props.color]?.border || colorClasses.blue.border);
const iconBgClass = computed(() => colorClasses[props.color]?.iconBg || colorClasses.blue.iconBg);
const typeBadgeClass = computed(() => colorClasses[props.color]?.typeBadge || colorClasses.blue.typeBadge);

const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(val || 0));
</script>

<style scoped>
.component-item {
    backdrop-filter: blur(10px);
}
</style>