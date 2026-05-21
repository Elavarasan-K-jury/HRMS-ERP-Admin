<template>
    <div class="rounded-lg mt-2 border border-white/20 p-2 text-white/90 space-y-2">

        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">Salary Structure Details</h2>

            <span :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                salaryDetails.isCurrentActive
                    ? 'bg-green-500/30 text-green-300'
                    : 'bg-yellow-500/30 text-yellow-200'
            ]">
                {{ salaryDetails.status }}
            </span>
        </div>

        <!-- SUMMARY INFO GRID -->
        <div class="grid grid-cols-8 gap-2">

            <InfoBox label="Gross Annual" :value="formatCurrency(salaryDetails.grossAnnual)" />

            <InfoBox label="Total Earnings" :value="formatCurrency(salaryDetails.totalEarnings)" />

            <InfoBox label="Total Benefits" :value="formatCurrency(salaryDetails.totalBenefits)" />

            <InfoBox label="Total Deductions" :value="formatCurrency(salaryDetails.totalDeductions)" />

            <InfoBox label="In-Hand Annual" :value="formatCurrency(salaryDetails.inHandAnnual)" highlight />

            <InfoBox label="In-Hand Monthly" :value="formatCurrency(salaryDetails.inHandMonthly)" highlight />

            <InfoBox label="Effective From" :value="formatDate(salaryDetails.effectiveFrom)" />
            <InfoBox label="Effective To"
                :value="salaryDetails.effectiveTo ? formatDate(salaryDetails.effectiveTo) : '---'" />

            <!-- <InfoBox label="Deduct From In-Hand" :value="salaryDetails.deductFromInHand ? 'Yes' : 'No'" /> -->
        </div>

        <!-- COMPONENT BREAKDOWN -->
        <div class="space-y-2">

            <ComponentGroup :total="salaryDetails.totalEarnings" title="Earnings" color="green"
                :items="filterByType('EARNING')" />

            <ComponentGroup title="Benefits" color="blue" :items="filterByType('BENEFIT')" />

            <ComponentGroup title="Deductions" color="red" :items="filterByType('DEDUCTION')" />

        </div>
    </div>
</template>

<script setup>
import InfoBox from './SummaryBox.vue'
import ComponentGroup from './ComponentGroup.vue';

const props = defineProps({
    salaryDetails: { type: Object, required: true }
});

// FILTER COMPONENTS
const filterByType = (type) =>
    props.salaryDetails.components.filter(c => c.componentType === type);

// FORMATTERS
const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(val || 0));

const formatDate = (val) =>
    new Date(val).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
</script>