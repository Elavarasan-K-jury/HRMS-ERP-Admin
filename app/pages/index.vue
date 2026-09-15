<template>
    <div v-if="!preloader" class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll grid grid-cols-12 gap-2">
        <!-- 🔹 Row 1 — Platform overview + service health -->
        <div class="col-span-12 xl:col-span-8 flex flex-col gap-2">
            <div class="grid grid-col-12 gap-2">
                <div class="col-span-12">
                    <SuperAdminChartsPlatformSummaryKpis class="h-full w-full" />
                </div>
                <div class="col-span-12 lg:col-span-6">
                    <SuperAdminChartsPlatformOrgGrowth class="h-full w-full" />
                </div>
                <div class="col-span-12 lg:col-span-6">
                    <SuperAdminChartsPlatformRevenueTrends class="h-full w-full" />
                </div>
                <div class="col-span-12 lg:col-span-7">
                    <SuperAdminChartsPlatformUsageByModule class="h-full w-full" />
                </div>
                <div class="col-span-12 lg:col-span-5">
                    <SuperAdminChartsPlatformTopOrgs class="h-full w-full" />
                </div>
                <div class="col-span-12">
                    <SuperAdminChartsPlatformSubscriptionRisk class="h-full w-full" />
                </div>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-4">
            <SuperAdminChartsPlatformServiceHealth class="h-full w-full" />
        </div>
    </div>

    <div v-else class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../stores/shared/theme.store';

definePageMeta({
    layout: 'auth',
});

const themeStore = useThemeStore();
const preloader = computed(() => themeStore.preloader);
</script>
