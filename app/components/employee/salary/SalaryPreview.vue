<template>
    <div
        class="salary-structure-container rounded-lg p-4 border border-white/20 shadow-2xl text-white/90 backdrop-blur-sm relative overflow-hidden">

        <!-- Animated Background Gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 animate-gradient"></div>

        <div class="relative z-10">
            <!-- HEADER with Copy Button -->
            <div class="flex justify-between items-center mb-3">
                <h2 class="text-2xl font-bold text-white">
                    Salary Structure Preview
                </h2>

                <button v-if="copyAvailable" @click="copyToClipboard" :disabled="copying"
                    class="copy-btn group relative px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50">
                    <div class="flex items-center gap-2">
                        <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg v-else class="w-4 h-4 text-green-400" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="text-sm font-medium">{{ copied ? 'Copied!' : 'Copy Table' }}</span>
                    </div>

                    <!-- Tooltip -->
                    <div
                        class="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap z-50">
                        Copy for Docs/Word
                    </div>
                </button>
            </div>

            <!-- SUMMARY GRID with enhanced cards -->
            <div class="grid grid-cols-3 gap-3 mb-3">
                <SummaryBox label="Gross Annual" :value="formatCurrency(data.grossAnnual)" icon="💰" />

                <SummaryBox label="Total Earnings" :value="formatCurrency(data.totalEarnings)" icon="📈"
                    color="emerald" />

                <SummaryBox label="Total Benefits" :value="formatCurrency(data.totalBenefits)" icon="🎁" color="blue" />

                <SummaryBox label="Total Deductions" :value="formatCurrency(data.totalDeductions)" icon="📉"
                    color="rose" />

                <SummaryBox label="In-Hand Annual" :value="formatCurrency(data.inHandAnnual)" icon="💵" highlight
                    color="purple" />

                <SummaryBox label="In-Hand Monthly" :value="formatCurrency(data.inHandMonthly)" icon="💸" highlight
                    color="pink" />
            </div>

            <!-- Visual Breakdown Chart -->
            <div class="mb-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 class="text-sm font-semibold text-white/70 mb-3">Salary Distribution</h3>
                <div class="flex items-center gap-2 h-8 rounded-full overflow-hidden bg-slate-900/50">
                    <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700 flex items-center justify-center text-xs font-semibold text-white"
                        :style="{ width: earningsPercentage + '%' }">
                        <span v-if="earningsPercentage > 15">{{ earningsPercentage }}%</span>
                    </div>
                    <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 flex items-center justify-center text-xs font-semibold text-white"
                        :style="{ width: benefitsPercentage + '%' }">
                        <span v-if="benefitsPercentage > 15">{{ benefitsPercentage }}%</span>
                    </div>
                    <div class="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-700 flex items-center justify-center text-xs font-semibold text-white"
                        :style="{ width: deductionsPercentage + '%' }">
                        <span v-if="deductionsPercentage > 15">{{ deductionsPercentage }}%</span>
                    </div>
                </div>
                <div class="flex justify-between mt-3 text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="text-white/60">Earnings {{ earningsPercentage }}%</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-white/60">Benefits {{ benefitsPercentage }}%</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span class="text-white/60">Deductions {{ deductionsPercentage }}%</span>
                    </div>
                </div>
            </div>

            <!-- COMPONENT LIST with staggered animation -->
            <div class="space-y-3">
                <!-- Earnings -->
                <ComponentGroup title="Earnings" color="emerald" icon="📈" :items="earnings"
                    :total="data.totalEarnings" />

                <!-- Benefits -->
                <ComponentGroup title="Benefits" color="blue" icon="🎁" :items="benefits" :total="data.totalBenefits" />

                <!-- Deductions -->
                <ComponentGroup title="Deductions" color="rose" icon="📉" :items="deductions"
                    :total="data.totalDeductions" />
            </div>
        </div>
    </div>
</template>

<script setup>
import SummaryBox from "./SummaryBox.vue";
import ComponentGroup from "./ComponentGroup.vue";
import { computed, ref } from "vue";

const props = defineProps({
    data: { type: Object, required: true },
    copyAvailable: { type: Boolean, default: false }
});

const copying = ref(false);
const copied = ref(false);

// FILTER COMPONENTS
const earnings = computed(() =>
    props.data.components?.filter(c => c.componentType === "EARNING") || []
);

const benefits = computed(() =>
    props.data.components?.filter(c => c.componentType === "BENEFIT") || []
);

const deductions = computed(() =>
    props.data.components?.filter(c => c.componentType === "DEDUCTION") || []
);

// PERCENTAGE CALCULATIONS for visual breakdown
const earningsPercentage = computed(() => {
    const total = props.data.grossAnnual;
    return total ? Math.round((props.data.totalEarnings / total) * 100) : 0;
});

const benefitsPercentage = computed(() => {
    const total = props.data.grossAnnual;
    return total ? Math.round((props.data.totalBenefits / total) * 100) : 0;
});

const deductionsPercentage = computed(() => {
    const total = props.data.grossAnnual;
    return total ? Math.round((props.data.totalDeductions / total) * 100) : 0;
});

// CURRENCY FORMATTER
const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(val || 0));

// COPY TO CLIPBOARD FUNCTION - Works with rich formatting!
const copyToClipboard = async () => {
    if (typeof window === "undefined") return;

    copying.value = true;

    try {
        // Create a temporary container with our HTML table
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.innerHTML = generateHTMLTable();
        document.body.appendChild(container);

        // Select the content
        const range = document.createRange();
        range.selectNodeContents(container);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Copy with formatting using execCommand (most reliable method)
        const successful = document.execCommand('copy');

        // Clean up
        selection.removeAllRanges();
        document.body.removeChild(container);

        if (successful) {
            copied.value = true;
        } else {
            throw new Error('Copy command failed');
        }

    } catch (err) {
        console.error("Copy failed:", err);

        // Ultimate fallback - plain text only
        try {
            const textarea = document.createElement("textarea");
            textarea.value = generatePlainText();
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "0";

            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);

            copied.value = true;
        } catch (e) {
            console.error("Fallback also failed:", e);
        }
    } finally {
        copying.value = false;
        setTimeout(() => (copied.value = false), 2000);
    }
};

// Generate HTML table for Word/Google Docs - Optimized for copy/paste
const generateHTMLTable = () => {
    return `
<meta charset="utf-8">
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 900px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1f2937;">
    <thead>
        <tr>
            <th colspan="4" style="padding: 16px; text-align: left; font-size: 18px; font-weight: bold; background-color: #6366f1; color: white; border: 1px solid #4f46e5;">
                💰 Salary Structure Preview
            </th>
        </tr>
    </thead>
    <tbody>
        <tr style="background-color: #fef3c7;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #d1d5db; width: 35%;">Gross Annual</td>
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border: 1px solid #d1d5db;">${formatCurrency(props.data.grossAnnual)}</td>
        </tr>
        
        <!-- EARNINGS SECTION -->
        <tr>
            <td colspan="4" style="padding: 12px; font-weight: bold; background-color: #10b981; color: white; border: 1px solid #059669;">
                📈 EARNINGS — ${formatCurrency(props.data.totalEarnings)}
            </td>
        </tr>
        <tr style="background-color: #d1fae5;">
            <th style="padding: 10px; text-align: left; border: 1px solid #059669; font-size: 12px;">Component</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #059669; font-size: 12px; width: 25%;">Formula</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #059669; font-size: 12px; width: 20%;">Annual</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #059669; font-size: 12px; width: 20%;">Monthly</th>
        </tr>
        ${earnings.value.length ? earnings.value.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#f0fdf4' : '#ffffff'};">
            <td style="padding: 10px 10px 10px 24px; border: 1px solid #d1d5db;">${item.componentName}</td>
            <td style="padding: 10px; text-align: center; font-style: italic; color: #6b7280; border: 1px solid #d1d5db; text-transform: uppercase; font-size: 11px;">${item.value == 0 ? item.formula : 'Fixed Amount'}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600; border: 1px solid #d1d5db;">${formatCurrency(item.annualAmount)}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600; border: 1px solid #d1d5db;">${formatCurrency(item.monthlyAmount)}</td>
        </tr>
        `).join('') : '<tr><td colspan="4" style="padding: 10px; text-align: center; color: #9ca3af; border: 1px solid #d1d5db;">No earnings components</td></tr>'}
        
        <!-- BENEFITS SECTION -->
        <tr>
            <td colspan="4" style="padding: 12px; font-weight: bold; background-color: #3b82f6; color: white; border: 1px solid #2563eb;">
                🎁 BENEFITS — ${formatCurrency(props.data.totalBenefits)}
            </td>
        </tr>
        <tr style="background-color: #dbeafe;">
            <th style="padding: 10px; text-align: left; border: 1px solid #2563eb; font-size: 12px;">Component</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #2563eb; font-size: 12px;">Formula</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #2563eb; font-size: 12px;">Annual</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #2563eb; font-size: 12px;">Monthly</th>
        </tr>
        ${benefits.value.length ? benefits.value.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#eff6ff' : '#ffffff'};">
            <td style="padding: 10px 10px 10px 24px; border: 1px solid #d1d5db;">${item.componentName}</td>
            <td style="padding: 10px; text-align: center; font-style: italic; color: #6b7280; border: 1px solid #d1d5db; text-transform: uppercase; font-size: 11px;">${item.value == 0 ? item.formula : 'Fixed Amount'}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600; border: 1px solid #d1d5db;">${formatCurrency(item.annualAmount)}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600; border: 1px solid #d1d5db;">${formatCurrency(item.monthlyAmount)}</td>
        </tr>
        `).join('') : '<tr><td colspan="4" style="padding: 10px; text-align: center; color: #9ca3af; border: 1px solid #d1d5db;">No benefits components</td></tr>'}
        
        <!-- DEDUCTIONS SECTION -->
        <tr>
            <td colspan="4" style="padding: 12px; font-weight: bold; background-color: #ef4444; color: white; border: 1px solid #dc2626;">
                📉 DEDUCTIONS — ${formatCurrency(props.data.totalDeductions)}
            </td>
        </tr>
        <tr style="background-color: #fee2e2;">
            <th style="padding: 10px; text-align: left; border: 1px solid #dc2626; font-size: 12px;">Component</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #dc2626; font-size: 12px;">Formula</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #dc2626; font-size: 12px;">Annual</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #dc2626; font-size: 12px;">Monthly</th>
        </tr>
        ${deductions.value.length ? deductions.value.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#fef2f2' : '#ffffff'};">
            <td style="padding: 10px 10px 10px 24px; border: 1px solid #d1d5db;">${item.componentName}</td>
            <td style="padding: 10px; text-align: center; font-style: italic; color: #6b7280; border: 1px solid #d1d5db; text-transform: uppercase; font-size: 11px;">${item.value == 0 ? item.formula : 'Fixed Amount'}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600; border: 1px solid #d1d5db;">${formatCurrency(item.annualAmount)}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600; border: 1px solid #d1d5db;">${formatCurrency(item.monthlyAmount)}</td>
        </tr>
        `).join('') : '<tr><td colspan="4" style="padding: 10px; text-align: center; color: #9ca3af; border: 1px solid #d1d5db;">No deductions components</td></tr>'}
        
        <!-- SUMMARY -->
        <tr style="background-color: #f9fafb;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #d1d5db;">💵 In-Hand Annual</td>
            <td colspan="3" style="padding: 12px; text-align: right; color: #10b981; font-size: 15px; font-weight: bold; border: 1px solid #d1d5db;">${formatCurrency(props.data.inHandAnnual)}</td>
        </tr>
        <tr style="background-color: #fef3c7;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #d1d5db;">💸 In-Hand Monthly</td>
            <td colspan="3" style="padding: 12px; text-align: right; color: #ec4899; font-size: 15px; font-weight: bold; border: 1px solid #d1d5db;">${formatCurrency(props.data.inHandMonthly)}</td>
        </tr>
    </tbody>
</table>
    `.trim();
};

// Generate plain text fallback
const generatePlainText = () => {
    let text = 'SALARY STRUCTURE PREVIEW\n\n';
    text += `Gross Annual: ${formatCurrency(props.data.grossAnnual)}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📈 EARNINGS (${formatCurrency(props.data.totalEarnings)})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    earnings.value.forEach(item => {
        text += `  ${item.componentName}\n`;
        text += `    Formula: ${item.value == 0 ? item.formula : 'Fixed Amount'}\n`;
        text += `    Annual: ${formatCurrency(item.annualAmount)} | Monthly: ${formatCurrency(item.monthlyAmount)}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎁 BENEFITS (${formatCurrency(props.data.totalBenefits)})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    benefits.value.forEach(item => {
        text += `  ${item.componentName}\n`;
        text += `    Formula: ${item.value == 0 ? item.formula : 'Fixed Amount'}\n`;
        text += `    Annual: ${formatCurrency(item.annualAmount)} | Monthly: ${formatCurrency(item.monthlyAmount)}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📉 DEDUCTIONS (${formatCurrency(props.data.totalDeductions)})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    deductions.value.forEach(item => {
        text += `  ${item.componentName}\n`;
        text += `    Formula: ${item.value == 0 ? item.formula : 'Fixed Amount'}\n`;
        text += `    Annual: ${formatCurrency(item.annualAmount)} | Monthly: ${formatCurrency(item.monthlyAmount)}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💵 In-Hand Annual: ${formatCurrency(props.data.inHandAnnual)}\n`;
    text += `💸 In-Hand Monthly: ${formatCurrency(props.data.inHandMonthly)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    return text;
};
</script>

<style scoped>
@keyframes gradient {
    0% {
        opacity: 0.5;
    }

    50% {
        opacity: 0.8;
    }

    100% {
        opacity: 0.5;
    }
}

.animate-gradient {
    animation: gradient 8s ease-in-out infinite;
}

.copy-btn {
    font-variant-numeric: tabular-nums;
}

.salary-structure-container {
    transition: all 0.3s ease;
}
</style>