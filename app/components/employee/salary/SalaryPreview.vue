<template>
    <div class="rounded-lg p-2 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg text-white/90">

        <!-- HEADER -->
        <h2 class="text-xl font-bold mb-4">Salary Structure Preview</h2>

        <!-- SUMMARY GRID -->
        <div class="grid grid-cols-6 gap-2 mb-6">

            <SummaryBox label="Gross Annual" :value="formatCurrency(data.grossAnnual)" />

            <SummaryBox label="Total Earnings" :value="formatCurrency(data.totalEarnings)" />

            <SummaryBox label="Total Benefits" :value="formatCurrency(data.totalBenefits)" />

            <SummaryBox label="Total Deductions" :value="formatCurrency(data.totalDeductions)" />

            <SummaryBox label="In-Hand Annual" :value="formatCurrency(data.inHandAnnual)" highlight />

            <SummaryBox label="In-Hand Monthly" :value="formatCurrency(data.inHandMonthly)" highlight />
        </div>

        <!-- COMPONENT LIST -->
        <div class="space-y-6">

            <!-- Earnings -->
            <ComponentGroup title="Earnings" color="green" :items="earnings" />

            <!-- Benefits -->
            <ComponentGroup title="Benefits" color="blue" :items="benefits" />

            <!-- Deductions -->
            <ComponentGroup title="Deductions" color="red" :items="deductions" />

        </div>

    </div>
</template>

<script setup>
import SummaryBox from "./SummaryBox.vue";
import ComponentGroup from "./ComponentGroup.vue";
import { computed } from "vue";

const props = defineProps({
    data: { type: Object, required: true }
});

// FILTER COMPONENTS
const earnings = computed(() =>
    props.data.components.filter(c => c.componentType === "EARNING")
);

const benefits = computed(() =>
    props.data.components.filter(c => c.componentType === "BENEFIT")
);

const deductions = computed(() =>
    props.data.components.filter(c => c.componentType === "DEDUCTION")
);

// CURRENCY FORMATTER
const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(val || 0));
</script>