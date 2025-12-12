<script>
export default {
    name: "ComponentGroup",
    props: ["title", "items", "color"],
    methods: {
        formatCurrency: (val) =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(Number(val || 0))
    }
};
</script>

<template #ComponentGroup="{ title, items, color }">
    <div>
        <h3 :class="`text-${color}-400 font-semibold mb-2 text-lg`">{{ title }}</h3>

        <div class="rounded-lg overflow-hidden border border-white/10">
            <table class="w-full text-white/80 text-sm">
                <thead class="bg-white/10">
                    <tr>
                        <th class="p-2 text-left">Component</th>
                        <th class="p-2 text-left">Formula</th>
                        <th class="p-2 text-right">Annual</th>
                        <th class="p-2 text-right">Monthly</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items" :key="item.componentId"
                        class="border-t border-white/5 hover:bg-white/5 transition">
                        <td class="p-2 font-medium">{{ item.componentName }}</td>
                        <td class="p-2 text-white/60">{{ item.formula || "-" }}</td>
                        <td class="p-2 text-right">{{ formatCurrency(item.annualAmount) }}</td>
                        <td class="p-2 text-right">{{ formatCurrency(item.monthlyAmount) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
