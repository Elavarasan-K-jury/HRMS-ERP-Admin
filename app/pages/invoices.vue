<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Invoices<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="invoiceLoading" />
                <FormSelect color="#fff" v-model="organization" placeholder="Select an Organization"
                    :options="organizations" @clear="organization = null" />
                <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" @click="fetchInvoices" />
            </div>
        </div>

        <!-- TABLE -->
        <InvoiceTable :items="invoices" :loading="invoiceLoading" :total="total" :page="page" :total_pages="total_pages"
            @prev="prevPage" @next="nextPage" @view="viewInvoice" @download="downloadInvoice"
            @regenerate="regenerate" />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useOrganizationSubscriptionStore } from '../stores/organizationSubscription.store';
import { useOrganizationStore } from '../stores/organization.store';
import InvoiceTable from "../components/invoices/DataTable.vue"
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';
const organizationSubscriptionStore = useOrganizationSubscriptionStore()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()
definePageMeta({ layout: 'auth' })

const invoices = computed(() => organizationSubscriptionStore.invoices)
const {
    total,
    total_pages,
    invoiceLoading,
    search,
} = storeToRefs(organizationSubscriptionStore)

const regenerate = async (data) => {
    await organizationSubscriptionStore.reGeneratePaymentLink(data.id)
}

const organizations = computed(() => organizationStore.organizations_select)

const organization = ref(null)

watch(organization, async () => {
    if (organization.value) {
        authStore.organization = organization.value.value
    } else {
        authStore.organization = null
    }
    await fetchInvoices()
})

const searchTimer = ref(null)
watch(search, async () => {
    clearTimeout(searchTimer.value)
    searchTimer.value = setTimeout(() => {
        fetchInvoices()
    }, 350);
})

const fetchInvoices = async () => {
    await organizationSubscriptionStore.fetchInvoices()
}

onMounted(async () => {
    await fetchInvoices()
    await organizationStore.fetchOrganizationsForSelect()
});
</script>