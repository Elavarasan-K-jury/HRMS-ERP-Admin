<template>
    <div class="p-6 h-[calc(100vh-4rem)] overflow-hidden">
        <!-- Loading State -->
        <div v-if="organizationSubscriptionLoading" class="flex items-center justify-center h-full">
            <div class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-4 border-white/20 border-t-sky-500 rounded-full animate-spin"></div>
                <p class="text-white/60 font-medium">Loading subscription details...</p>
            </div>
        </div>

        <!-- No Subscription Section -->
        <div v-else-if="!organizationSubscription" class="h-full flex items-center justify-center">
            <div class="max-w-xl w-full rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03]
               border border-white/20 p-8 backdrop-blur-xl text-center">
                <!-- Icon -->
                <div class="mx-auto mb-5 w-14 h-14 rounded-xl
                   bg-gradient-to-br from-sky-500 to-blue-600
                   flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Icon name="lucide:package" class="w-7 h-7 text-white" />
                </div>

                <!-- Title -->
                <h2 class="text-2xl font-black text-white mb-2">
                    No Active Subscription
                </h2>

                <!-- Subtitle -->
                <p class="text-white/60 text-sm mb-6">
                    Your organization does not have an active plan.
                    Choose a subscription to unlock all features.
                </p>

                <!-- Highlights -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="rounded-lg bg-white/5 border border-white/10 p-3 text-left">
                        <div class="flex items-center gap-2 mb-1">
                            <Icon name="lucide:zap" class="w-4 h-4 text-sky-400" />
                            <span class="text-white font-semibold text-xs">
                                Full Access
                            </span>
                        </div>
                        <p class="text-white/40 text-[11px]">
                            Unlock HRMS, payroll, leave & reports
                        </p>
                    </div>

                    <div class="rounded-lg bg-white/5 border border-white/10 p-3 text-left">
                        <div class="flex items-center gap-2 mb-1">
                            <Icon name="lucide:shield-check" class="w-4 h-4 text-emerald-400" />
                            <span class="text-white font-semibold text-xs">
                                Secure & Scalable
                            </span>
                        </div>
                        <p class="text-white/40 text-[11px]">
                            Built for growing organizations
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-center gap-3">
                    <!-- <button class="px-5 py-2.5 rounded-lg
                       bg-gradient-to-r from-sky-500 to-blue-600
                       hover:from-sky-600 hover:to-blue-700
                       text-white font-bold text-sm
                       transition-all duration-200
                       shadow-lg shadow-sky-500/30">
                        Choose a Plan
                    </button> -->

                    <button class="px-5 py-2.5 rounded-lg
                       bg-white/10 hover:bg-white/20
                       border border-white/20
                       text-white text-sm font-semibold
                       transition-all duration-200">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>


        <!-- Main Content - Single Screen Layout -->
        <div v-else class="h-full flex flex-col gap-4">
            <!-- Header + Status - Compact -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-white">Current Subscription</h1>
                    <p class="text-white/50 text-sm">Manage your plan & features</p>
                </div>

                <span v-if="organizationSubscription.status === 'TRIAL'"
                    class="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span class="text-amber-400 font-bold text-lg">TRIAL</span>
                </span>
                <span v-else-if="organizationSubscription.status === 'ACTIVE'"
                    class="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span class="text-emerald-400 font-bold text-lg">ACTIVE</span>
                </span>
            </div>

            <!-- Main Grid - 2 Column Layout -->
            <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
                <!-- Left Column: Plan Details -->
                <div class="col-span-5 flex flex-col gap-4">
                    <!-- Plan Card -->
                    <div
                        class="rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-5 backdrop-blur-xl">
                        <div class="flex items-center gap-3 mb-4">
                            <div
                                class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                                <Icon name="lucide:crown" class="w-5 h-5 text-white" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <h2 class="text-lg font-bold text-white truncate">{{ organizationSubscription.plan_name
                                    }}</h2>
                                <p class="text-white/50 text-xs truncate">{{ organizationSubscription.plan?.description
                                    }}</p>
                            </div>
                        </div>

                        <!-- Pricing Grid -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <div class="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-1">Monthly
                                </div>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-xl font-bold text-white">₹{{
                                        organizationSubscription.plan?.monthly_price }}</span>
                                    <span class="text-white/70 text-[16px]">/ Month</span>
                                </div>
                            </div>
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <div class="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-1">Yearly
                                </div>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-xl font-bold text-white">₹{{
                                        organizationSubscription.plan?.yearly_price }}</span>
                                    <span class="text-white/70 text-[16px]">/ Year</span>
                                    <div class="text-emerald-400 text-xs mt-1 font-semibold">Save ₹{{
                                        calculateYearlySavings() }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between text-xs">
                            <span class="text-white/50">Billing: <span class="text-blue-400 font-bold">{{
                                organizationSubscription.billing_interval }}</span></span>
                            <span class="text-white/40">GST: {{ organizationSubscription.plan?.gst }}%</span>
                        </div>
                    </div>

                    <!-- Trial/Date Card -->
                    <div
                        class="flex-1 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5">
                        <div v-if="organizationSubscription.status === 'TRIAL'"
                            class="h-full flex flex-col justify-center items-center rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
                            <div class="text-amber-400/70 text-[40px] font-bold uppercase tracking-wider mb-2">Trial
                                Ends In</div>
                            <div class="text-9xl font-black text-amber-400 mb-1">
                                <div class="flex gap-3 text-center">
                                    <div>
                                        <div class="text-4xl font-black text-amber-400">
                                            {{ trialTimeLeft.days }}
                                        </div>
                                        <div class="text-xs text-amber-400/60">Days</div>
                                    </div>

                                    <span class="text-3xl text-amber-400/40">:</span>

                                    <div>
                                        <div class="text-4xl font-black text-amber-400">
                                            {{ trialTimeLeft.hours }}
                                        </div>
                                        <div class="text-xs text-amber-400/60">Hours</div>
                                    </div>

                                    <span class="text-3xl text-amber-400/40">:</span>

                                    <div>
                                        <div class="text-4xl font-black text-amber-400">
                                            {{ trialTimeLeft.minutes }}
                                        </div>
                                        <div class="text-xs text-amber-400/60">Minutes</div>
                                    </div>

                                    <span class="text-3xl text-amber-400/40">:</span>

                                    <div>
                                        <div class="text-4xl font-black text-amber-400">
                                            {{ trialTimeLeft.seconds }}
                                        </div>
                                        <div class="text-xs text-amber-400/60">Seconds</div>
                                    </div>
                                </div>
                            </div>
                            <div class="text-amber-400/50 text-lg capitalize font-medium mb-3">days remaining</div>
                            <div class="text-white/40 text-[20px]">Expires: <span class="text-white/60">{{
                                formatDate(organizationSubscription.trial_ends_at) }}</span></div>
                        </div>

                        <div v-else class="space-y-2">
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <div class="text-white/40 text-[10px] mb-1">Start Date</div>
                                <div class="text-white/80 text-sm font-semibold">{{
                                    formatDate(organizationSubscription.start_date) }}</div>
                            </div>
                            <div v-if="organizationSubscription.end_date"
                                class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <div class="text-white/40 text-[10px] mb-1">End Date</div>
                                <div class="text-white/80 text-sm font-semibold">{{
                                    formatDate(organizationSubscription.end_date) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Features -->
                <div
                    class="col-span-7 flex flex-col rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden">
                    <div class="px-5 py-3 bg-white/5 border-b border-white/10">
                        <h3 class="text-sm font-bold text-white">Plan Features</h3>
                    </div>

                    <div class="flex-1 p-4 overflow-y-auto">
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="feature in organizationSubscription.plan?.features" :key="feature.id"
                                class="group flex justify-between rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-3 hover:border-sky-500/50 hover:bg-white/10 transition-all duration-200">
                                <div class="flex flex-col items-start justify-between mb-2">
                                    <div class="flex items-start justify-between mb-2">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-sky-500/30 group-hover:to-blue-600/30 transition-all">
                                            <Icon :name="getFeatureIcon(feature.key)"
                                                class="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors" />
                                        </div>
                                        <span v-if="feature.is_unlimited"
                                            class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                                            ∞
                                        </span>
                                    </div>

                                    <h4 class="text-white font-bold text-sm capitalize leading-tight">
                                        {{ formatFeatureName(feature.key) }}
                                    </h4>
                                </div>

                                <div class="flex flex-col items-end gap-1.5 mb-2">
                                    <span class="text-3xl font-black text-white/90">
                                        {{ feature.is_unlimited ? '∞' : feature.value }}
                                    </span>
                                    <span class="text-white/40 uppercase text-sm font-medium">
                                        {{ feature.is_unlimited ? 'unlimited' : feature.unit }}
                                    </span>
                                </div>

                                <!-- <div v-if="!feature.is_unlimited" class="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500"
                                        :style="{ width: getUsagePercentage(feature) + '%' }"></div>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Actions - Compact -->
            <div
                class="flex items-center justify-between rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 px-5 py-3">
                <div>
                    <h4 class="text-white font-bold text-sm">Need changes?</h4>
                    <p class="text-white/50 text-xs">Upgrade or manage settings</p>
                </div>
                <div class="flex gap-2">
                    <button
                        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all duration-200">
                        Contact Sales
                    </button>
                    <!-- <button
                        class="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-sky-500/20">
                        Upgrade
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useOrganizationSubscriptionStore } from '../../../../stores/shared/organizationSubscription.store'

definePageMeta({
    layout: 'organization',
});

const organizationSubscriptionStore = useOrganizationSubscriptionStore()
const organizationSubscription = computed(() => organizationSubscriptionStore.organizationSubscriptions)
const organizationSubscriptionLoading = computed(() => organizationSubscriptionStore.loading)


function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

const trialTimeLeft = ref({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
});

let timer;

function calculateTrialTimeLeft() {
    if (!organizationSubscription.value?.trial_ends_at) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date();
    const end = new Date(organizationSubscription.value.trial_ends_at);

    let diff = Math.max(0, end - now); // ms

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 24 * 60 * 60 * 1000;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 60 * 60 * 1000;

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 60 * 1000;

    const seconds = Math.floor(diff / 1000);

    return { days, hours, minutes, seconds };
}

function calculateYearlySavings() {
    const monthly = organizationSubscription.value?.plan?.monthly_price || 0;
    const yearly = organizationSubscription.value?.plan?.yearly_price || 0;
    return (monthly * 12) - yearly;
}

function formatFeatureName(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getFeatureIcon(key) {
    const icons = {
        max_employees: 'lucide:users',
        storage_gb: 'lucide:hard-drive',
        api_rate_per_minute: 'lucide:zap',
        payroll_runs_per_month: 'lucide:wallet',
        max_leave_policies: 'lucide:calendar-check',
        max_admin_accounts: 'lucide:shield-check'
    };
    return icons[key] || 'lucide:sparkles';
}

function getUsagePercentage(feature) {
    return Math.random() * 70 + 10;
}
onMounted(async () => {
    await organizationSubscriptionStore.fetchOrganizationSubscriptionByOrganization()
    timer = setInterval(() => {
        trialTimeLeft.value = calculateTrialTimeLeft();
    }, 1000);
});
onUnmounted(() => {
    clearInterval(timer);
});
</script>