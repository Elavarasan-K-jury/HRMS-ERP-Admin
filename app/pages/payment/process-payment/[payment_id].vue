<template>
    <div
        class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-1/4 -left-48 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
                style="animation-delay: 1s"></div>
        </div>

        <!-- Main Content Card -->
        <div class="relative z-10 w-full max-w-2xl">
            <div class="rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">

                <!-- Loading State -->
                <div v-if="loading" class="p-12">
                    <div class="flex flex-col items-center gap-6">
                        <!-- Animated Icon -->
                        <div class="relative">
                            <div
                                class="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center">
                                <Icon name="lucide:clock" class="w-12 h-12 text-sky-400 animate-pulse" />
                            </div>
                            <div
                                class="absolute inset-0 w-24 h-24 border-4 border-sky-500/30 border-t-sky-500 rounded-2xl animate-spin">
                            </div>
                        </div>

                        <!-- Loading Text -->
                        <div class="text-center space-y-2">
                            <h2 class="text-2xl font-bold text-white">Processing Payment</h2>
                            <p class="text-white/60">Please wait while we verify your transaction...</p>
                        </div>

                        <!-- Animated Progress Bar -->
                        <div class="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-pulse"
                                style="width: 70%"></div>
                        </div>
                    </div>
                </div>

                <!-- Success State -->
                <div v-else-if="success && !error" class="p-12">
                    <div class="flex flex-col items-center gap-6">
                        <!-- Success Icon with Animation -->
                        <div class="relative">
                            <div
                                class="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center animate-scale-in">
                                <Icon name="lucide:check-circle" class="w-12 h-12 text-green-400" />
                            </div>
                            <!-- Success Ring Animation -->
                            <div
                                class="absolute inset-0 w-24 h-24 border-4 border-green-500/30 rounded-2xl animate-ping">
                            </div>
                        </div>

                        <!-- Success Text -->
                        <div class="text-center space-y-3">
                            <h2 class="text-3xl font-bold text-white">Payment Successful!</h2>
                            <p class="text-white/70 text-lg">{{ success }}</p>
                        </div>

                        <!-- Payment Details Card -->
                        <div class="w-full max-w-md mt-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div
                                class="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                                <h3 class="text-white/80 font-semibold text-sm uppercase tracking-wider">Transaction
                                    Details</h3>
                            </div>

                            <div class="p-6 space-y-4">
                                <!-- Payment ID -->
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                                            <Icon name="lucide:hash" class="w-5 h-5 text-sky-400" />
                                        </div>
                                        <div>
                                            <p class="text-white/40 text-xs">Payment ID</p>
                                            <p class="text-white font-mono text-sm">{{ payment_id || 'N/A' }}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Payment Status -->
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                            <Icon name="lucide:check-circle-2" class="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p class="text-white/40 text-xs">Status</p>
                                            <p class="text-green-400 font-semibold text-sm capitalize">{{ payment_status
                                                || 'Completed' }}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Payment Reference -->
                                <div v-if="payment_reference" class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                            <Icon name="lucide:receipt" class="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p class="text-white/40 text-xs">Reference</p>
                                            <p class="text-white font-mono text-sm truncate max-w-[200px]">{{
                                                payment_reference }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <!-- <button @click="goToDashboard"
                            class="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2">
                            <span>Go to Dashboard</span>
                            <Icon name="lucide:arrow-right" class="w-4 h-4" />
                        </button> -->
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="p-12">
                    <div class="flex flex-col items-center gap-6">
                        <!-- Error Icon -->
                        <div class="relative">
                            <div
                                class="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center animate-scale-in">
                                <Icon name="lucide:x-circle" class="w-12 h-12 text-red-400" />
                            </div>
                        </div>

                        <!-- Error Text -->
                        <div class="text-center space-y-3">
                            <h2 class="text-3xl font-bold text-white">Payment Failed</h2>
                            <p class="text-white/70 text-lg max-w-md">{{ error }}</p>
                        </div>

                        <!-- Error Details Card -->
                        <div
                            class="w-full max-w-md mt-4 rounded-xl bg-white/5 border border-red-500/20 overflow-hidden">
                            <div
                                class="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-pink-500/10">
                                <h3 class="text-white/80 font-semibold text-sm uppercase tracking-wider">Transaction
                                    Information</h3>
                            </div>

                            <div class="p-6 space-y-4">
                                <!-- Payment ID -->
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                        <Icon name="lucide:hash" class="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p class="text-white/40 text-xs">Payment ID</p>
                                        <p class="text-white font-mono text-sm">{{ payment_id || 'N/A' }}</p>
                                    </div>
                                </div>

                                <!-- Status -->
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                        <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p class="text-white/40 text-xs">Status</p>
                                        <p class="text-red-400 font-semibold text-sm">Failed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 mt-4">
                            <button @click="retryPayment"
                                class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all flex items-center gap-2">
                                <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                                <span>Try Again</span>
                            </button>
                            <button @click="contactSupport"
                                class="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2">
                                <Icon name="lucide:help-circle" class="w-4 h-4" />
                                <span>Contact Support</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Info -->
            <div class="mt-6 text-center">
                <p class="text-white/40 text-sm">
                    <Icon name="lucide:shield-check" class="w-4 h-4 inline mr-1" />
                    Your payment is secured with industry-standard encryption
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
    layout: 'default',
    key: route => route.fullPath,
})

const router = useRouter()
const loading = ref(true)
const error = ref(null)
const success = ref(null)
const payment_id = ref(null)
const payment_status = ref(null)
const payment_reference = ref(null)

onMounted(async () => {
    try {
        loading.value = true
        const route = useRoute()
        payment_id.value = route.params.payment_id
        payment_status.value = route.query.razorpay_payment_link_status || null
        payment_reference.value = route.query.razorpay_payment_id || null

        const payload = {
            payment_id: route.params.payment_id,
            razorpay_payment_link_status: route.query.razorpay_payment_link_status || null,
            razorpay_payment_id: route.query.razorpay_payment_id || null,
        }

        const { $api } = useNuxtApp()

        const { data } = await $api.post(`/payment/process-payment/${payload.payment_id}`, {
            razorpay_payment_id: payload.razorpay_payment_id,
            razorpay_payment_link_status: payload.razorpay_payment_link_status
        })

        console.log('Payment processed successfully:', data)
        if (data && data.success) {
            success.value = 'Payment processed successfully.'
        } else {
            error.value = 'Failed to process payment. Please try again.'
        }
    } catch (err) {
        const response = err.response
        if (response && response.data && response.data.message) {
            if (response.data.message.includes('Invoice not found')) {
                error.value = 'This invoice does not exist.'
            } else if (response.data.message.includes('Invoice already paid')) {
                error.value = 'This invoice has already been paid.'
            } else if (response.data.message.includes('Cancelled invoice cannot be paid')) {
                error.value = 'This invoice has been cancelled.'
            } else if (response.data.message.includes('Failed invoice cannot be paid')) {
                error.value = 'This invoice payment has failed. Please try again.'
            } else {
                error.value = response.data.message
            }
        } else {
            error.value = 'An unexpected error occurred while processing the payment.'
        }
    } finally {
        setTimeout(() => {
            loading.value = false
        }, 2000)
    }
})

// function goToDashboard() {
//     router.push('/dashboard')
// }

function retryPayment() {
    router.push('/payments')
}

function contactSupport() {
    // Navigate to support page or open support modal
    router.push('/support')
}
</script>

<style scoped>
@keyframes scale-in {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-scale-in {
    animation: scale-in 0.5s ease-out;
}
</style>