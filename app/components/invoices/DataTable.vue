<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-6 py-16 flex flex-col items-center justify-center w-full gap-3 text-white/70">
        <div class="p-4 rounded-full bg-white/10 backdrop-blur-sm">
            <Icon name="lucide:file-text" class="w-8 h-8 opacity-80" />
        </div>
        <span class="text-lg font-medium">No invoices found</span>
        <span class="text-sm text-white/50">Your invoices will appear here once issued</span>
    </div>

    <!-- 🔄 Loading Grid -->
    <div v-else-if="loading" class="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        <div v-for="i in 6" :key="i"
            class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-6 animate-pulse">
            <div class="skeleton w-32 h-4 mb-4" />
            <div class="skeleton w-full h-4 mb-2" />
            <div class="skeleton w-3/4 h-4 mb-4" />
            <div class="skeleton w-24 h-6" />
        </div>
    </div>

    <!-- 🎨 Invoice Grid -->
    <div v-else class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            <div v-for="inv in items" :key="inv.id"
                class="group rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">

                <!-- Header Bar -->
                <div class="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-white/10">
                            <Icon name="lucide:receipt" class="w-5 h-5 text-white/90" />
                        </div>
                        <div>
                            <div class="text-sm font-bold text-white">{{ inv.invoice_number }}</div>
                            <div class="text-xs text-white/50">{{ formatDate(inv.issued_at) }}</div>
                        </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-full text-xs font-bold" :class="statusClass(inv.status)">
                        {{ inv.status }}
                    </span>
                </div>

                <!-- Content -->
                <div class="p-6 space-y-4">
                    <!-- Organization -->
                    <div class="space-y-1">
                        <div class="text-xs text-white/50 uppercase tracking-wide font-semibold">Organization</div>
                        <div class="text-white font-semibold truncate">{{ inv.organization?.name || '—' }}</div>
                        <div class="text-xs text-white/60 truncate">{{ inv.organization?.email || '—' }}</div>
                    </div>

                    <!-- Plan & Period -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <div class="text-xs text-white/50 uppercase tracking-wide font-semibold">Plan</div>
                            <div class="text-sm text-white font-medium">{{ inv.subscription?.plan?.name || '—' }}</div>
                        </div>
                        <div class="space-y-1">
                            <div class="text-xs text-white/50 uppercase tracking-wide font-semibold">Payment</div>
                            <span class="inline-block px-2 py-1 rounded-lg text-xs font-medium"
                                :class="paymentClass(inv.payment?.status)">
                                {{ inv.payment?.status || '—' }}
                            </span>
                        </div>
                    </div>

                    <!-- Billing Period -->
                    <div class="space-y-1">
                        <div class="text-xs text-white/50 uppercase tracking-wide font-semibold">Billing Period</div>
                        <div class="text-sm text-white/80 flex items-center gap-2">
                            <span>{{ formatDate(inv.billing_period_start) }}</span>
                            <Icon name="lucide:arrow-right" class="w-3 h-3 text-white/40" />
                            <span>{{ formatDate(inv.billing_period_end) }}</span>
                        </div>
                    </div>

                    <!-- Payment Link Expiration Timer -->
                    <div v-if="inv.payment?.expires_at && inv.status !== 'PAID'" class="p-3 rounded-lg border" :class="getExpirationState(inv).expired
                        ? 'bg-red-500/10 border-red-500/30'
                        : getExpirationState(inv).urgent
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                                <Icon :name="getExpirationState(inv).expired ? 'lucide:clock-off' : 'lucide:timer'"
                                    class="w-4 h-4" :class="getExpirationState(inv).expired ? 'text-red-400' :
                                        getExpirationState(inv).urgent ? 'text-amber-400' : 'text-blue-400'" />
                                <span class="text-xs font-semibold" :class="getExpirationState(inv).expired ? 'text-red-300' :
                                    getExpirationState(inv).urgent ? 'text-amber-300' : 'text-blue-300'">
                                    {{ getExpirationState(inv).expired ? 'Payment Link Expired' : 'Link Expires In' }}
                                </span>
                            </div>
                            <div v-if="!getExpirationState(inv).expired" class="font-mono text-sm font-bold"
                                :class="getExpirationState(inv).urgent ? 'text-amber-300' : 'text-blue-300'">
                                {{ getCountdown(inv.payment.expires_at) }}
                            </div>
                            <div v-else class="text-xs text-red-400 font-medium">
                                {{ formatExpiryDate(inv.payment.expires_at) }}
                            </div>
                        </div>
                    </div>

                    <!-- Amount -->
                    <div class="pt-2 mt-2 border-t border-white/10">
                        <div class="grid grid-cols-[1fr_auto] gap-3 items-end">
                            <!-- Left: Breakdown -->
                            <div class="space-y-1">
                                <div class="flex flex-col items-baseline">
                                    <span
                                        class="text-[10px] text-white/40 uppercase tracking-wider w-16">Subtotal</span>
                                    <span class="text-sm font-semibold text-white/90">₹{{ formatCurrency(inv.amount)
                                        }}</span>
                                </div>
                                <div class="flex flex-col items-baseline">
                                    <span class="text-[10px] text-white/40 uppercase tracking-wider w-16">Tax</span>
                                    <span class="text-xs font-medium text-white/70">₹{{ formatCurrency(inv.tax)
                                        }}</span>
                                </div>
                            </div>

                            <!-- Right: Total with accent -->
                            <div class="relative">
                                <div
                                    class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg blur-xl">
                                </div>
                                <div
                                    class="relative px-3 py-2 rounded-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/20">
                                    <div class="text-[9px] text-white/50 uppercase tracking-widest">Total</div>
                                    <div class="flex items-baseline gap-1.5">
                                        <span class="text-2xl font-black text-white">₹{{ formatCurrency(inv.total)
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions Footer -->
                <div class="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-end gap-2">
                    <!-- Pay Button (Active) -->
                    <a v-if="inv.payment?.link && inv.status !== 'PAID' && !getExpirationState(inv).expired"
                        :href="inv.payment.link" target="_blank" class="flex-1">
                        <button class="btn-primary w-full">
                            <Icon name="lucide:credit-card" class="w-4 h-4" />
                            Pay Now
                        </button>
                    </a>

                    <!-- Regenerate Button (Expired) -->
                    <button v-if="inv.status !== 'PAID'" @click="$emit('regenerate', inv)" class="btn-regenerate">
                        <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                    </button>

                    <!-- Action Buttons -->
                    <NuxtLink class="btn-icon" title="Download" :to="`${apiBaseUrl}${inv.invoice_url}`" target="_blank">
                        <Icon name="lucide:download" class="w-4 h-4" />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- 📄 Pagination -->
        <div v-if="showPagination"
            class="rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
            <div class="text-sm text-white/70">
                Page <span class="font-bold text-white">{{ page }}</span> of
                <span class="font-bold text-white">{{ total_pages }}</span>
                <span class="text-white/50 ml-2">•</span>
                <span class="font-bold text-white ml-2">{{ total }}</span> total invoices
            </div>

            <div class="flex items-center gap-2">
                <button class="btn-nav" :disabled="page <= 1 || loading" @click="$emit('prev')">
                    <Icon name="lucide:chevron-left" class="w-4 h-4" />
                    Previous
                </button>
                <button class="btn-nav" :disabled="page >= total_pages || loading" @click="$emit('next')">
                    Next
                    <Icon name="lucide:chevron-right" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    total_pages: { type: Number, default: 1 },
});

const config = useRuntimeConfig()

const apiBaseUrl = config.public.apiBase

defineEmits(["view", "download", "prev", "next", "regenerate"]);

const currentTime = ref(Date.now());
let intervalId = null;

// Update current time every second for countdown
onMounted(() => {
    intervalId = setInterval(() => {
        currentTime.value = Date.now();
    }, 1000);
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});

function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return "0.00";
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

const showPagination = computed(() => props.total_pages > 1);

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function formatExpiryDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getExpirationState(invoice) {
    if (!invoice.payment?.expires_at) return { expired: false, urgent: false };

    const expiresAt = new Date(invoice.payment.expires_at).getTime();
    const now = currentTime.value;
    const timeLeft = expiresAt - now;

    const expired = timeLeft <= 0;
    const urgent = timeLeft > 0 && timeLeft < 5 * 60 * 1000; // Less than 5 minutes

    return { expired, urgent, timeLeft };
}

function getCountdown(expiresAt) {
    if (!expiresAt) return "—";

    const expires = new Date(expiresAt).getTime();
    const now = currentTime.value;
    const diff = expires - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

function statusClass(status) {
    return {
        ISSUED: "bg-blue-500/25 text-blue-300 border border-blue-400/30",
        PAID: "bg-emerald-500/25 text-emerald-300 border border-emerald-400/30",
        FAILED: "bg-red-500/25 text-red-300 border border-red-400/30",
        CANCELLED: "bg-gray-500/25 text-gray-300 border border-gray-400/30",
    }[status] || "bg-white/15 text-white/70 border border-white/20";
}

function paymentClass(status) {
    return {
        PENDING: "bg-amber-500/20 text-amber-300 border border-amber-400/20",
        SUCCESS: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/20",
        FAILED: "bg-red-500/20 text-red-300 border border-red-400/20",
    }[status] || "bg-white/10 text-white/60 border border-white/10";
}
</script>

<style scoped>
.btn-primary {
    @apply px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl;
}

.btn-regenerate {
    @apply p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl;
}

.btn-icon {
    @apply p-2.5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110;
}

.btn-nav {
    @apply px-4 py-2.5 text-sm rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 hover:scale-105 disabled:hover:scale-100;
}

.skeleton {
    border-radius: 0.5rem;
    background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.18),
            rgba(255, 255, 255, 0.08));
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
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