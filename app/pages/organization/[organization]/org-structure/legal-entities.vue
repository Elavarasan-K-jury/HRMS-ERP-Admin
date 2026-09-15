<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- Page header -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">Legal Entities</h2>
                <p class="text-xs text-white/55">Register and manage legal entities, signatories and bank details.</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openEditRegistration" color="#4aff7a" text="Edit Details"
                    prepend-icon="ion:create-outline" />
                <UiButton @click="loadAll" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <div class="grid grid-cols-12 gap-2 flex-1 min-h-0">
            <!-- Left: entity selection -->
            <aside class="col-span-12 md:col-span-3 flex flex-col min-h-0">
                <LegalEntitySidebar :items="sidebarItems" :selected-id="store.selectedId" :loading="store.loading"
                    @select="select" @add="openEditRegistration" />
            </aside>

            <!-- Right: selected entity details -->
            <section class="col-span-12 md:col-span-9 flex flex-col gap-2 min-h-0">
                <LegalEntityHeader :entity="store.selectedEntity" @edit="openEditRegistration" />

                <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-2 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <UiTabs v-model="activeTab" :tabs="tabs">
                        <RegistrationTab v-if="activeTab === 0" :entity="store.selectedEntity"
                            @add-entity="openEditRegistration" />
                        <SignatoriesTab v-else-if="activeTab === 1" :entity="store.selectedEntity"
                            @add-signatory="openAddSignatory" @edit-signatory="openEditSignatory" />
                        <BanksTab v-else :entity="store.selectedEntity" @add-bank="openAddBank" @edit-bank="openEditBank" />
                    </UiTabs>
                </div>
            </section>
        </div>
    </div>

    <!-- Edit Registration Details -->
    <UiSidebarModal v-model="entityModal" :title="'Edit Registration Details'" width="760px">
        <template #default>
            <LegalEntityForm ref="entityFormRef" :initial="store.selectedEntity" @submit="saveEntity" />
        </template>
        <template #footer>
            <UiButton @click="entityModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="submitEntityForm" color="#4aff7a" text="Save Details" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- Add / Edit Signatory -->
    <UiSidebarModal v-model="signatoryModal" :title="editingSignatory ? 'Edit Signatory' : 'Add Signatory'" width="760px">
        <template #default>
            <SignatoryForm ref="signatoryFormRef" :initial="editingSignatory" @submit="saveSignatory" />
        </template>
        <template #footer>
            <UiButton @click="signatoryModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="submitSignatoryForm" color="#4aff7a" :text="editingSignatory ? 'Save Changes' : 'Add Signatory'"
                :prepend-icon="editingSignatory ? 'ion:save-outline' : 'ion:person-add-outline'" />
        </template>
    </UiSidebarModal>

    <!-- Add / Edit Bank Detail -->
    <UiSidebarModal v-model="bankModal" :title="editingBank ? 'Edit Bank Account' : 'Add Bank Account'" width="760px">
        <template #default>
            <BankForm ref="bankFormRef" :initial="editingBank" @submit="saveBank" />
        </template>
        <template #footer>
            <UiButton @click="bankModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="submitBankForm" color="#4aff7a" text="Save" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLegalEntitiesStore } from '~/stores/organization/legalEntities.store'
import LegalEntitySidebar from '~/components/legal-entities/LegalEntitySidebar.vue'
import LegalEntityHeader from '~/components/legal-entities/LegalEntityHeader.vue'
import RegistrationTab from '~/components/legal-entities/RegistrationTab.vue'
import SignatoriesTab from '~/components/legal-entities/SignatoriesTab.vue'
import BanksTab from '~/components/legal-entities/BanksTab.vue'
import LegalEntityForm from '~/components/legal-entities/LegalEntityForm.vue'
import SignatoryForm from '~/components/legal-entities/SignatoryForm.vue'
import BankForm from '~/components/legal-entities/BankForm.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const orgId = route.params.organization

const store = useLegalEntitiesStore()
const activeTab = ref(0)

const entityModal = ref(false)
const signatoryModal = ref(false)
const bankModal = ref(false)

const entityFormRef = ref(null)
const signatoryFormRef = ref(null)
const bankFormRef = ref(null)

const editingSignatory = ref(null)
const editingBank = ref(null)

const tabs = computed(() => {
    const e = store.selectedEntity
    return [
        { label: 'Registration Information', icon: 'ion:document-text-outline' },
        { label: 'Authorized Signatories', icon: 'ion:people-outline', badge: e?.signatories?.length || 0 },
        { label: 'Bank Details', icon: 'ion:business-outline', badge: e?.banks?.length || 0 },
    ]
})

const sidebarItems = computed(() => {
    return (store.legalEntities || []).map(e => ({
        id: e.id,
        name: e.name,
        employee_count: e.employee_count || 0,
        is_main: !!e.is_main,
    }))
})

const select = (id) => {
    store.selectLegalEntity(id)
}

const loadAll = async () => {
    await store.fetchLegalEntities(orgId)
}

const openEditRegistration = () => {
    entityModal.value = true
}

const submitEntityForm = async () => {
    await entityFormRef.value?.submit()
}

const saveEntity = async (payload) => {
    try {
        const entity = await store.updateLegalEntityRegistration(payload)
        useToast().success({ title: 'Success!', message: `Registration details saved for "${entity?.name}".`, timeout: 1500 })
        entityModal.value = false
    } catch (err) {
        console.error('[legal-entities] save registration error:', err)
        useToast().error({ title: 'Failed', message: 'Could not save registration details.', timeout: 3000 })
    }
}

const openAddSignatory = () => {
    editingSignatory.value = null
    signatoryModal.value = true
}

const openEditSignatory = (signatory) => {
    editingSignatory.value = signatory
    signatoryModal.value = true
}

const submitSignatoryForm = async () => {
    await signatoryFormRef.value?.submit()
}

const saveSignatory = async (payload) => {
    try {
        if (editingSignatory.value) {
            await store.updateSignatory(store.selectedId, editingSignatory.value.id, payload)
            useToast().success({ title: 'Success!', message: 'Signatory updated.', timeout: 1500 })
        } else {
            await store.addSignatory(store.selectedId, payload)
            useToast().success({ title: 'Success!', message: 'Signatory added.', timeout: 1500 })
        }
        signatoryModal.value = false
        editingSignatory.value = null
    } catch (err) {
        console.error('[legal-entities] save signatory error:', err)
        useToast().error({ title: 'Failed', message: 'Could not save signatory.', timeout: 3000 })
    }
}

const openAddBank = () => {
    editingBank.value = null
    bankModal.value = true
}

const openEditBank = (bank) => {
    editingBank.value = bank
    bankModal.value = true
}

const submitBankForm = async () => {
    await bankFormRef.value?.submit()
}

const saveBank = async (payload) => {
    try {
        if (editingBank.value) {
            await store.updateBankDetail(store.selectedId, editingBank.value.id, payload)
            useToast().success({ title: 'Success!', message: 'Bank account updated.', timeout: 1500 })
        } else {
            await store.addBank(store.selectedId, payload)
            useToast().success({ title: 'Success!', message: 'Bank account added.', timeout: 1500 })
        }
        bankModal.value = false
        editingBank.value = null
    } catch (err) {
        console.error('[legal-entities] save bank error:', err)
        useToast().error({ title: 'Failed', message: 'Could not save bank account.', timeout: 3000 })
    }
}

onMounted(loadAll)
</script>
