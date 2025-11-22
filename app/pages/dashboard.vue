<template>
    <div v-if="!preloader" class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll grid grid-cols-12 gap-2">
        <!-- 🔹 Row 1 — Big KPI Cards -->
        <div class="col-span-6 lg:col-span-4  flex flex-col gap-2">
            <ChartsEmployeeTotalEmployees class="h-1/2 w-full" />
            <ChartsAttendanceLeaveUtilization class="h-1/2 w-full" />
        </div>
        <div class="col-span-4">
            <ClientOnly>
                <ChartsEmployeeActiveInactive class="h-full w-full" />
            </ClientOnly>
        </div>
        <div class="col-span-4">
            <ClientOnly>
                <ChartsEmployeeAverageTenure class="h-full w-full" />
            </ClientOnly>
        </div>
        <div class="col-span-12">
            <ClientOnly>
                <ChartsEmployeeTurnoverRate class="h-full w-full" />
            </ClientOnly>
        </div>

        <!-- 🔹 Row 2 — Key Visuals -->
        <div class="col-span-6">
            <ClientOnly>
                <ChartsEmployeeNewJoinees class="h-full w-full" />
            </ClientOnly>
        </div>
        <div class="col-span-6">
            <ClientOnly>
                <ChartsPayrollExpense class="h-full w-full" />
            </ClientOnly>
        </div>

        <!-- 🔹 Row 3 — Mixed Components -->
        <div class="col-span-4">
            <ClientOnly>
                <ChartsEmployeeGenderRatio class="h-full w-full" />
            </ClientOnly>
        </div>
        <div class="col-span-8">
            <ClientOnly>
                <ChartsAttendanceSummary class="h-full w-full" />
            </ClientOnly>
        </div>
        <div class="col-span-8">
            <ClientOnly>
                <ChartsEmployeeDeptHeadcount class="h-full w-full" />
            </ClientOnly>
        </div>

        <!-- 🔹 Row 4 — Tables and KPIs -->
        <div class="col-span-4">
            <ClientOnly>
                <ChartsRecruitmentOfferAcceptance class="h-full w-full" />
            </ClientOnly>
        </div>
        <div class="col-span-4 flex flex-col gap-2">
            <ChartsRecruitmentJobOpenings class="h-1/2 w-full" />
            <ChartsCompliancePendingApprovals class="h-1/2 w-full" />
        </div>
        <div class="col-span-8">
            <ClientOnly>
                <ChartsPayrollSalaryDistribution class="h-full w-full" />
            </ClientOnly>
        </div>
    </div>
    <div v-else class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme.store';

definePageMeta({
    layout: 'auth',
});

const themeStore = useThemeStore()
const preloader = computed(() => themeStore.preloader);
</script>