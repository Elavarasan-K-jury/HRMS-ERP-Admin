<template>
    <div class="relative flex-1 max-w-[500px] h-[400px] group">
        <!-- Animated gradient border -->
        <div
            class="absolute inset-0 bg-gradient-to-br from-[#4aff7a]/40 via-purple-500/30 to-blue-500/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500">
        </div>

        <!-- Main card -->
        <div
            class="relative h-full backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center px-8 text-center space-y-6 overflow-hidden">

            <!-- Subtle grid pattern overlay -->
            <div class="absolute inset-0 opacity-[0.02]"
                style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;">
            </div>

            <!-- Floating orbs for depth -->
            <div class="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl animate-pulse"
                :class="employee ? 'bg-indigo-500/20' : 'bg-[#4aff7a]/20'">
            </div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
                style="animation-delay: 700ms;">
            </div>

            <!-- Content -->
            <div class="relative z-10 space-y-6">
                <!-- Icon with glow effect -->
                <div class="relative inline-flex">
                    <div class="absolute inset-0 rounded-full blur-xl animate-pulse"
                        :class="employee ? 'bg-indigo-500/30' : 'bg-[#4aff7a]/30'">
                    </div>
                    <div
                        class="relative bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                        <Icon :name="employee ? 'lucide:user-circle' : 'lucide:credit-card'" class="w-10 h-10"
                            :class="employee ? 'text-indigo-400' : 'text-[#4aff7a]'" />
                    </div>
                </div>

                <!-- Text content -->
                <div class="space-y-3">
                    <h2 class="text-2xl font-bold text-white tracking-tight">
                        {{ employee ? 'Payment Required' : 'Unlock Full Access' }}
                    </h2>
                    <p class="text-sm text-white/60 leading-relaxed max-w-[320px] mx-auto">
                        <template v-if="employee">
                            Your organization's subscription needs renewal. Please contact your
                            <span class="text-white/90 font-medium">administrator</span>
                            to restore access to {{ title }}.
                        </template>
                        <template v-else>
                            Complete your payment to unlock all premium features of
                            <span class="text-white/90 font-medium">{{ title }}</span>
                        </template>
                    </p>
                </div>

                <!-- CTA Button with enhanced styling -->
                <div class="pt-2">
                    <UiButton v-if="employee" size="sm" color="#00f2ff"
                        class="relative overflow-hidden group/button px-6 py-3" prepend-icon="heroicons:envelope"
                        text="Contact Administrator" />
                    <UiButton v-else size="sm" @click="routeToPayment" color="#4aff7a" :loading="loader"
                        class="relative overflow-hidden group/button px-6 py-3" prepend-icon="heroicons:credit-card"
                        text="Proceed to Payment" />
                </div>

                <!-- Trust badges -->
                <div class="flex items-center justify-center gap-4 pt-4 text-xs text-white/40">
                    <div class="flex items-center gap-1.5">
                        <Icon name="heroicons:lock-closed-solid" class="w-3.5 h-3.5" />
                        <span>{{ employee ? 'Private & Secure' : 'Secure Payment' }}</span>
                    </div>
                    <div class="w-1 h-1 rounded-full bg-white/30"></div>
                    <div class="flex items-center gap-1.5">
                        <Icon name="heroicons:shield-check-solid" class="w-3.5 h-3.5" />
                        <span>{{ employee ? '24/7 Support' : 'SSL Protected' }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/shared/auth.store';
import { useRouter } from 'vue-router';
const props = defineProps({
    title: { type: String, default: 'JURY-HRMS' },
    employee: { type: Boolean, default: false },
    paymentUrl: { type: String, required: true },
});
const router = useRouter();
const authStore = useAuthStore();

const loader = ref(false);

const routeToPayment = async () => {
    loader.value = true;
    await authStore.toggleView('ORGANIZATION')
    setTimeout(() => {
        loader.value = false;
        router.push(props.paymentUrl, { replace: true });
    }, 1000);
};
</script>