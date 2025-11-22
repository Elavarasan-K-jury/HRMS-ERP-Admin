<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ totalOrganizations }}
                Organization<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openOrganizationModal" color="#4aff7a" text="Add Organization"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchOrganizations" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <OrganizationDataTable :items="organizations" :loading="loading" :total="organizationStore.meta.total"
            :page="organizationStore.meta.page" :total-pages="organizationStore.meta.totalPages" @refresh="refresh"
            @next="next" @prev="prev" @view="view" @edit="edit" @delete="del" />
    </div>
    <UiSidebarModal v-model="open" title="Add New Organization">
        <template #default>
            <div class="grid grid-cols-12 gap-2">
                <span class="col-span-12 text-xl font-semibold text-white/80">Organization Details</span>
                <div class="col-span-12 w-full flex gap-1 flex-col items-start">
                    <label class="text-sm text-white/80" for="Organization Name">Organization Name:</label>
                    <FormInput class="w-full" v-model="create.name" prepend-icon="lucide:user" color="#fff" size="lg"
                        rounded="lg" placeholder="Organization Name" />
                </div>
                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="domain">Organization Domain:</label>
                    <FormInput id="domain" class="w-full" v-model="create.domain" prepend-icon="lucide:globe"
                        color="#fff" size="lg" rounded="lg" placeholder="Organization Domain" />
                </div>

                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="gst_number">Organization GST Number:</label>
                    <FormInput id="gst_number" class="w-full" v-model="create.gst_number" prepend-icon="lucide:key"
                        color="#fff" size="lg" rounded="lg" placeholder="Organization GST Number" />
                </div>

                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="email">Organization Email:</label>
                    <FormInput id="email" class="w-full" v-model="create.email" prepend-icon="lucide:mail" color="#fff"
                        size="lg" rounded="lg" placeholder="Organization Email" />
                </div>

                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="contact_person_name">Contact Person Name:</label>
                    <FormInput id="contact_person_name" class="w-full" v-model="create.contact_person_name"
                        prepend-icon="lucide:user" color="#fff" size="lg" rounded="lg"
                        placeholder="Organization Contact Person Name" />
                </div>

                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="contact_person_number">Contact Person Phone:</label>
                    <FormInput id="contact_person_number" class="w-full" v-model="create.contact_person_number"
                        prepend-icon="lucide:phone" color="#fff" size="lg" rounded="lg"
                        placeholder="Organization Contact Person Phone" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="size">Organization Size:</label>
                    <FormInput id="size" class="w-full" v-model="create.size" prepend-icon="lucide:building"
                        color="#fff" size="lg" rounded="lg" placeholder="Organization Size" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="industry">Industry:</label>
                    <FormSelect id="industry" class="w-full" color="#fff" v-model="industry" :options="industries"
                        placeholder="Select Industry" size="lg" rounded="lg" prepend-icon="lucide:briefcase"
                        searchable />
                </div>

                <!-- Address -->
                <span class="col-span-12 text-xl font-semibold text-white/80 mt-4">Organization Address</span>

                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="streetNumber">Street Number:</label>
                    <FormInput id="streetNumber" class="w-full" v-model="create.address.streetNumber"
                        prepend-icon="lucide:map" color="#fff" size="lg" rounded="lg"
                        placeholder="Organization Street Number" />
                </div>

                <div class="col-span-12 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="streetName">Street Name:</label>
                    <FormInput id="streetName" class="w-full" v-model="create.address.streetName"
                        prepend-icon="lucide:map-pin" color="#fff" size="lg" rounded="lg"
                        placeholder="Organization Street Name" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="area">Area:</label>
                    <FormInput id="area" class="w-full" v-model="create.address.area" prepend-icon="lucide:map-pinned"
                        color="#fff" size="lg" rounded="lg" placeholder="Organization Area" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="locality">Locality:</label>
                    <FormInput id="locality" class="w-full" v-model="create.address.locality"
                        prepend-icon="lucide:map-pin-house" color="#fff" size="lg" rounded="lg"
                        placeholder="Organization Locality" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="city">City:</label>
                    <FormInput id="city" class="w-full" v-model="create.address.city" prepend-icon="lucide:building-2"
                        color="#fff" size="lg" rounded="lg" placeholder="City" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="state">State:</label>
                    <FormInput id="state" class="w-full" v-model="create.address.state" prepend-icon="lucide:map-pinned"
                        color="#fff" size="lg" rounded="lg" placeholder="State" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="postalCode">Pincode:</label>
                    <FormInput id="postalCode" class="w-full" v-model="create.address.postalCode"
                        prepend-icon="lucide:navigation-2" color="#fff" size="lg" rounded="lg" placeholder="Pincode" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="country">Country:</label>
                    <FormSelect id="country" class="w-full" color="#fff" prepend-icon="lucide:globe" v-model="country"
                        :options="countries" searchable size="lg" rounded="lg" placeholder="Select Country" />
                </div>

                <!-- Limits -->
                <span class="col-span-12 text-xl font-semibold text-white/80 mt-4">Limits</span>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="maxEmployees">Max Employees:</label>
                    <FormInput id="maxEmployees" class="w-full" type="number"
                        v-model.number="create.limits.maxEmployees" prepend-icon="lucide:users" color="#fff" size="lg"
                        rounded="lg" placeholder="Max Employees" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="storageGb">Storage (GB):</label>
                    <FormInput id="storageGb" class="w-full" type="number" v-model.number="create.limits.storageGb"
                        prepend-icon="lucide:hard-drive" color="#fff" size="lg" rounded="lg"
                        placeholder="Storage (GB)" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="apiRatePerMinute">API Rate / Minute:</label>
                    <FormInput id="apiRatePerMinute" class="w-full" type="number"
                        v-model.number="create.limits.apiRatePerMinute" prepend-icon="lucide:activity" color="#fff"
                        size="lg" rounded="lg" placeholder="API Rate / Minute" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="payrollRunsPerMonth">Payroll Runs / Month:</label>
                    <FormInput id="payrollRunsPerMonth" class="w-full" type="number"
                        v-model.number="create.limits.payrollRunsPerMonth" prepend-icon="lucide:calendar-range"
                        color="#fff" size="lg" rounded="lg" placeholder="Payroll Runs / Month" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="maxLeavePolicies">Max Leave Policies:</label>
                    <FormInput id="maxLeavePolicies" class="w-full" type="number"
                        v-model.number="create.limits.maxLeavePolicies" prepend-icon="lucide:umbrella" color="#fff"
                        size="lg" rounded="lg" placeholder="Max Leave Policies" />
                </div>

                <div class="col-span-6 w-full flex flex-col gap-1 items-start">
                    <label class="text-sm text-white/80" for="maxAdmins">Max Admin Accounts:</label>
                    <FormInput id="maxAdmins" class="w-full" type="number" v-model.number="create.limits.maxAdmins"
                        prepend-icon="lucide:shield" color="#fff" size="lg" rounded="lg"
                        placeholder="Max Admin Accounts" />
                </div>
                <!-- Integrations & automations -->
                <!-- <FormInput class="col-span-6 w-full" type="number" v-model.number="create.limits.activeIntegrations"
                    prepend-icon="lucide:plug" color="#fff" size="lg" rounded="lg" placeholder="Active Integrations" /> -->
                <!-- <FormInput class="col-span-6 w-full" type="number" v-model.number="create.limits.webhooksPerDay"
                    prepend-icon="lucide:webhook" color="#fff" size="lg" rounded="lg" placeholder="Webhooks / Day" /> -->
            </div>

        </template>

        <template #footer>
            <UiButton @click="closeOrganizationModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="saveOrganization" color="#4aff7a" text="Save Organization"
                prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
    <UiModal v-model="deleteOpen" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Organization" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>



<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { industries } from '../../../../constants/industries'
import { countries } from '../../../../constants/countries'
import { useOrganizationStore } from '../../../../stores/organization.store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

definePageMeta({
    layout: 'auth',
    key: route => route.fullPath
})

const organizationStore = useOrganizationStore()

// ─── UI State ────────────────────────────────
const open = ref(false)
const deleteOpen = ref(false)
const title = ref('Add New Organization')
const industry = ref(null)
const country = ref(null)
const search = ref('')
const timer = ref(null)

// ─── Store Refs ──────────────────────────────
const { create, editId, editData, deleteId, deleteData, meta, loading } = storeToRefs(organizationStore)
const organizations = computed(() => organizationStore.organizations)
const totalOrganizations = computed(() => organizationStore.meta.total)

// ─── Watchers ────────────────────────────────
watch(search, (val) => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        meta.value.page = 1
        meta.value.search = val || null
        organizationStore.fetchOrganizations()
    }, 500)
})

// ─── Modal Helpers ───────────────────────────
function resetCreate() {
    create.value = {
        name: null,
        domain: null,
        gst_number: null,
        email: null,
        contact_person_name: null,
        contact_person_number: null,
        industry: null,
        size: null,
        address: {
            streetNumber: null,
            streetName: null,
            area: null,
            landmark: null,
            locality: null,
            city: null,
            state: null,
            country: null,
            postalCode: null,
        },
        limits: {
            maxEmployees: null,
            storageGb: null,
            apiRatePerMinute: null,
            payrollRunsPerMonth: null,
            maxLeavePolicies: null,
            maxAdmins: null,
        }
    }
    industry.value = null
    country.value = null
}

function openOrganizationModal() {
    resetCreate()
    title.value = 'Add New Organization'
    open.value = true
}

function closeOrganizationModal() {
    resetCreate()
    editId.value = null
    editData.value = null
    open.value = false
}

// ─── CRUD Actions ────────────────────────────
async function saveOrganization() {
    if (!industry.value || !country.value) return

    create.value.industry = industry.value.label
    create.value.address.country = country.value.label
    create.value.size = Number(create.value.size || 0)

    let resp
    if (editId.value) {
        resp = await organizationStore.updateOrganization()
    } else {
        resp = await organizationStore.createOrganization()
    }

    if (resp) closeOrganizationModal()
}

const structuredClone = (obj) => JSON.parse(JSON.stringify(obj))

function edit(org) {
    console.log('list.vue @ Line 220:', org);
    editId.value = org.id
    editData.value = structuredClone(org)

    create.value = structuredClone(org)
    industry.value = industries.find(i => i.label.toUpperCase() === org.industry?.toUpperCase())
    country.value = countries.find(c => c.label.toUpperCase() === org.address?.country?.toUpperCase())
    create.value.limits = {
        maxEmployees: org.max_employees,
        storageGb: org.max_storage_in_gb,
        apiRatePerMinute: org.max_api_rate_per_minute,
        payrollRunsPerMonth: org.max_payroll_runs_per_month,
        maxLeavePolicies: org.max_leave_policies,
        maxAdmins: org.max_admin_accounts
    }

    title.value = 'Edit Organization'
    open.value = true
}

function del(org) {
    deleteId.value = org.id
    deleteData.value = org
    deleteOpen.value = true
}

async function confirmDelete() {
    await organizationStore.deleteOrganization()
    cancelDelete()
}

function cancelDelete() {
    deleteId.value = null
    deleteData.value = null
    deleteOpen.value = false
}

// ─── Pagination ──────────────────────────────
const next = () => organizationStore.nextPage()
const prev = () => organizationStore.prevPage()
const refresh = () => organizationStore.refresh()

const fetchOrganizations = () => organizationStore.fetchOrganizations()

// ─── Lifecycle ───────────────────────────────
onMounted(async () => {
    await organizationStore.fetchOrganizations()
});
</script>
